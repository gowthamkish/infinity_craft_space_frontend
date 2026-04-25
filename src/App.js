import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {
  useEffect,
  useRef,
  Suspense,
  lazy,
  useContext,
  useState,
  useCallback,
} from "react";
import { useSelector } from "react-redux";
import OrderStatusModal from "./components/OrderStatusModal";
import { PageLoader } from "./components/Loader";
import { HelmetProvider } from "react-helmet-async";
import OfflineIndicator from "./components/OfflineIndicator";
import Footer from "./components/Footer";
import ErrorBoundary, { RouteErrorBoundary } from "./components/ErrorBoundary";
import ToastContainer from "./components/ToastContainer";
import { ToastContext } from "./context/ToastContext";
import RecentlyViewed from "./components/RecentlyViewed";
import api from "./api/axios";

// Lazy load components for better performance
const ProductListing = lazy(() => import("./pages/ProductListing"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Orders = lazy(() => import("./pages/Orders"));
const Account = lazy(() => import("./pages/Account"));
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));
const AdminRoute = lazy(() => import("./components/AdminRoute"));
const AdminDashboard = lazy(() => import("./components/admin/Dashboard"));
const UsersList = lazy(() => import("./components/users/users"));
const ProductList = lazy(() => import("./components/products/products"));
const AddProduct = lazy(() => import("./components/products/addProduct"));
const AdminOrders = lazy(() => import("./components/orders/Orders"));
const CategoryManagement = lazy(
  () => import("./components/categories/CategoryManagement"),
);
const AdminNotifications = lazy(
  () => import("./components/admin/Notifications"),
);
const AnalyticsDashboard = lazy(
  () => import("./components/admin/AnalyticsDashboard"),
);
// const IdleTimeoutManager = lazy(
//   () => import("./components/IdleTimeoutManager"),
// );
const PWAInstallPrompt = lazy(() => import("./components/PWAInstallPrompt"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ReturnPolicy = lazy(() => import("./pages/ReturnPolicy"));
const ContactUs = lazy(() => import("./pages/ContactUs"));
const TermsAndConditions = lazy(() => import("./pages/TermsAndConditions"));
const TrackOrder = lazy(() => import("./pages/TrackOrder"));

const LoadingFallback = ({ message }) => (
  <PageLoader label={message || "Loading…"} variant="section" />
);

const STATUS_TOAST_CONFIG = {
  confirmed: { emoji: "✅", label: "Order Confirmed", type: "success" },
  processing: { emoji: "⏳", label: "Being Processed", type: "info" },
  shipped: { emoji: "🚚", label: "Shipped", type: "success" },
  out_for_delivery: {
    emoji: "🛵",
    label: "Out for Delivery!",
    type: "success",
  },
  delivered: { emoji: "🎉", label: "Delivered!", type: "success" },
  cancelled: { emoji: "❌", label: "Order Cancelled", type: "error" },
  returned: { emoji: "🔄", label: "Return Initiated", type: "warning" },
};

function App() {
  const { toasts, removeToast, addToast } = useContext(ToastContext);
  // Use _id as a stable scalar so the effect only re-runs on actual user change
  const userId = useSelector((state) => state.auth.user?._id ?? null);

  // Keep a stable ref to addToast so polling interval doesn't restart on every toast
  const addToastRef = useRef(addToast);
  useEffect(() => {
    addToastRef.current = addToast;
  }, [addToast]);

  // In-memory snapshot for live diffing during this session
  const liveMapRef = useRef(null);

  // Order status modal — shown when admin pushes a status change via SSE
  const [orderStatusEvent, setOrderStatusEvent] = useState(null);
  const closeOrderModal = useCallback(() => setOrderStatusEvent(null), []);

  // index.jsx dispatches fetchCurrentUser before React mounts — no need to repeat it here.

  // ── Helpers ────────────────────────────────────────────────────────────────
  const lsKey = (uid) => `order_status_snapshot_${uid}`;

  const loadSnapshot = (uid) => {
    try {
      const raw = localStorage.getItem(lsKey(uid));
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const saveSnapshot = (uid, map) => {
    try {
      localStorage.setItem(lsKey(uid), JSON.stringify(map));
    } catch {}
  };

  // Stable ref so the polling closure always calls the latest setter
  const setOrderStatusEventRef = useRef(setOrderStatusEvent);

  // Guard: track which (orderId + status) combos we've already notified this session
  const shownRef = useRef(new Set());

  const fireToasts = (prevMap, orders) => {
    // Collect all changes, pick the most recent one to show as modal
    let latestChange = null;

    orders.forEach((order) => {
      const key = String(order._id);
      const prev = prevMap[key];
      const curr = order.status;
      const notifKey = `${key}:${curr}`;

      if (shownRef.current.has(notifKey)) return; // already shown this session

      if (prev && prev !== curr && STATUS_TOAST_CONFIG[curr]) {
        // Existing order whose status changed
        shownRef.current.add(notifKey);
        const changeTime = new Date(
          order.updatedAt || order.createdAt,
        ).getTime();
        if (!latestChange || changeTime > latestChange.time) {
          latestChange = { order, previousStatus: prev, time: changeTime };
        }
      } else if (!prev && curr !== "pending" && STATUS_TOAST_CONFIG[curr]) {
        // Brand-new order just placed — only show if created within the last 10 minutes
        const orderAge = Date.now() - new Date(order.createdAt).getTime();
        if (orderAge < 10 * 60 * 1000) {
          shownRef.current.add(notifKey);
          const changeTime = new Date(order.createdAt).getTime();
          if (!latestChange || changeTime > latestChange.time) {
            latestChange = { order, previousStatus: null, time: changeTime };
          }
        }
      }
    });

    if (latestChange) {
      setOrderStatusEventRef.current({
        order: latestChange.order,
        previousStatus: latestChange.previousStatus,
      });
    }
  };

  // SSE connection for real-time order status updates
  useEffect(() => {
    if (!userId) return;

    const baseURL = import.meta.env.VITE_API_URL || "";
    let es;
    try {
      es = new EventSource(`${baseURL}/api/sse/stream`, {
        withCredentials: true,
      });

      es.addEventListener("ORDER_UPDATE", (e) => {
        try {
          const payload = JSON.parse(e.data);
          const { order, previousStatus } = payload;
          if (!order || !order.status) return;

          const key = String(order._id);
          const notifKey = `${key}:${order.status}`;

          // Update in-memory status map
          if (liveMapRef.current) {
            liveMapRef.current[key] = order.status;
          }

          // Show modal — SSE is the real-time path; deduplicate with shownRef
          if (
            order.status !== previousStatus &&
            !shownRef.current.has(notifKey)
          ) {
            shownRef.current.add(notifKey);
            setOrderStatusEventRef.current({
              order,
              previousStatus: previousStatus || null,
            });
          }
        } catch {}
      });

      es.onerror = () => {
        // SSE will auto-reconnect; silent failure is fine
      };
    } catch {}

    return () => {
      if (es) es.close();
    };
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      liveMapRef.current = null;
      shownRef.current = new Set();
      return;
    }

    let cancelled = false;

    const poll = async (isFirstRun) => {
      try {
        const res = await api.get("/api/orders");
        if (cancelled) return;

        const orders =
          res.data.success && Array.isArray(res.data.orders)
            ? res.data.orders
            : [];

        // Build current map
        const currentMap = {};
        orders.forEach((o) => {
          currentMap[String(o._id)] = o.status;
        });

        if (isFirstRun) {
          // On first run: compare against localStorage snapshot (catches offline + new-order cases).
          // Use {} when no snapshot exists so new recent orders (< 10 min) are still detected
          // without waiting for a hard reload to clear the snapshot.
          const persisted = loadSnapshot(userId) || {};
          fireToasts(persisted, orders);
          // Seed in-memory map with current data
          liveMapRef.current = currentMap;
        } else {
          // On subsequent polls: compare against in-memory map (catches live changes)
          if (liveMapRef.current) {
            fireToasts(liveMapRef.current, orders);
          }
          liveMapRef.current = currentMap;
        }

        // Always persist the latest snapshot to localStorage
        saveSnapshot(userId, currentMap);
      } catch (err) {
        console.warn("[Order polling] fetch failed:", err.message);
      }
    };

    // Delay first poll by 4 s after login to let iOS Safari ITP settle cookies.
    // Subsequent polls run every 15 s as before.
    const loginTime = Number(sessionStorage.getItem("authLoginTime") || 0);
    const msSinceLogin = loginTime ? Date.now() - loginTime : Infinity;
    const initialDelay = msSinceLogin < 10_000 ? 4_000 : 0;

    const firstPoll = setTimeout(() => poll(true), initialDelay);
    const id = setInterval(() => poll(false), 15_000);

    return () => {
      cancelled = true;
      clearTimeout(firstPoll);
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return (
    <div className="App">
      <ErrorBoundary>
        <HelmetProvider>
          <Router>
            <Suspense
              fallback={<LoadingFallback message="Loading application..." />}
            >
              {/* Offline Indicator - Shows connection status */}
              <OfflineIndicator />

              {/* Toast Notification Container - Global toast display */}
              <ToastContainer
                toasts={toasts}
                onClose={removeToast}
                position="top-right"
              />

              {/* Order status modal — shown when admin updates order status in real-time */}
              {orderStatusEvent && (
                <OrderStatusModal
                  event={orderStatusEvent}
                  onClose={closeOrderModal}
                />
              )}

              {/* Idle Timeout Manager - Active globally for all authenticated users */}
              {/* <IdleTimeoutManager /> */}

              <Routes>
                {/* Public Routes */}
                <Route
                  path="/"
                  element={
                    <RouteErrorBoundary>
                      <Suspense
                        fallback={
                          <LoadingFallback message="Loading products..." />
                        }
                      >
                        {/* PWA Install Prompt - Shows on mobile devices */}
                        {/* <PWAInstallPrompt /> */}
                        <Home />
                      </Suspense>
                    </RouteErrorBoundary>
                  }
                />

                <Route
                  path="/products"
                  element={
                    <RouteErrorBoundary>
                      <Suspense
                        fallback={
                          <LoadingFallback message="Loading products..." />
                        }
                      >
                        {/* PWA Install Prompt - Shows on mobile devices */}
                        {/* <PWAInstallPrompt /> */}
                        <ProductListing />
                      </Suspense>
                    </RouteErrorBoundary>
                  }
                />

                <Route
                  path="/product/:id"
                  element={
                    <RouteErrorBoundary>
                      <Suspense
                        fallback={
                          <LoadingFallback message="Loading product..." />
                        }
                      >
                        <ProductDetail />
                      </Suspense>
                    </RouteErrorBoundary>
                  }
                />
                <Route
                  path="/login"
                  element={
                    <RouteErrorBoundary>
                      <Suspense
                        fallback={
                          <LoadingFallback message="Loading login..." />
                        }
                      >
                        <Login />
                      </Suspense>
                    </RouteErrorBoundary>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <RouteErrorBoundary>
                      <Suspense
                        fallback={
                          <LoadingFallback message="Loading registration..." />
                        }
                      >
                        <Register />
                      </Suspense>
                    </RouteErrorBoundary>
                  }
                />
                <Route
                  path="/return-policy"
                  element={
                    <RouteErrorBoundary>
                      <Suspense
                        fallback={
                          <LoadingFallback message="Loading return policy..." />
                        }
                      >
                        <ReturnPolicy />
                      </Suspense>
                    </RouteErrorBoundary>
                  }
                />
                <Route
                  path="/contact-us"
                  element={
                    <RouteErrorBoundary>
                      <Suspense
                        fallback={
                          <LoadingFallback message="Loading contact..." />
                        }
                      >
                        <ContactUs />
                      </Suspense>
                    </RouteErrorBoundary>
                  }
                />
                <Route
                  path="/terms-and-conditions"
                  element={
                    <RouteErrorBoundary>
                      <Suspense
                        fallback={
                          <LoadingFallback message="Loading terms & conditions..." />
                        }
                      >
                        <TermsAndConditions />
                      </Suspense>
                    </RouteErrorBoundary>
                  }
                />

                {/* Track Order (protected) */}
                <Route
                  path="/track/:orderId"
                  element={
                    <RouteErrorBoundary>
                      <Suspense
                        fallback={
                          <LoadingFallback message="Loading tracking..." />
                        }
                      >
                        <ProtectedRoute>
                          <TrackOrder />
                        </ProtectedRoute>
                      </Suspense>
                    </RouteErrorBoundary>
                  }
                />

                {/* Protected Routes */}
                <Route
                  path="/home"
                  element={
                    <RouteErrorBoundary>
                      <Suspense
                        fallback={<LoadingFallback message="Loading home..." />}
                      >
                        <Home />
                      </Suspense>
                    </RouteErrorBoundary>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <RouteErrorBoundary>
                      <Suspense
                        fallback={
                          <LoadingFallback message="Loading checkout..." />
                        }
                      >
                        <ProtectedRoute>
                          <Checkout />
                        </ProtectedRoute>
                      </Suspense>
                    </RouteErrorBoundary>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <RouteErrorBoundary>
                      <Suspense
                        fallback={
                          <LoadingFallback message="Loading orders..." />
                        }
                      >
                        <ProtectedRoute>
                          <Orders />
                        </ProtectedRoute>
                      </Suspense>
                    </RouteErrorBoundary>
                  }
                />
                <Route
                  path="/account"
                  element={
                    <RouteErrorBoundary>
                      <Suspense
                        fallback={
                          <LoadingFallback message="Loading account..." />
                        }
                      >
                        <ProtectedRoute>
                          <Account />
                        </ProtectedRoute>
                      </Suspense>
                    </RouteErrorBoundary>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <RouteErrorBoundary>
                      <Suspense
                        fallback={
                          <LoadingFallback message="Loading admin dashboard..." />
                        }
                      >
                        <AdminRoute>
                          <AdminDashboard />
                        </AdminRoute>
                      </Suspense>
                    </RouteErrorBoundary>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <RouteErrorBoundary>
                      <Suspense
                        fallback={
                          <LoadingFallback message="Loading users..." />
                        }
                      >
                        <AdminRoute>
                          <UsersList />
                        </AdminRoute>
                      </Suspense>
                    </RouteErrorBoundary>
                  }
                />
                <Route
                  path="/admin/products"
                  element={
                    <RouteErrorBoundary>
                      <Suspense
                        fallback={
                          <LoadingFallback message="Loading products..." />
                        }
                      >
                        <AdminRoute>
                          <ProductList />
                        </AdminRoute>
                      </Suspense>
                    </RouteErrorBoundary>
                  }
                />
                <Route
                  path="/admin/addProduct"
                  element={
                    <RouteErrorBoundary>
                      <Suspense
                        fallback={
                          <LoadingFallback message="Loading product form..." />
                        }
                      >
                        <AdminRoute>
                          <AddProduct />
                        </AdminRoute>
                      </Suspense>
                    </RouteErrorBoundary>
                  }
                />
                <Route
                  path="/admin/addProduct/:id"
                  element={
                    <RouteErrorBoundary>
                      <Suspense
                        fallback={
                          <LoadingFallback message="Loading product form..." />
                        }
                      >
                        <AdminRoute>
                          <AddProduct />
                        </AdminRoute>
                      </Suspense>
                    </RouteErrorBoundary>
                  }
                />
                <Route
                  path="/admin/orders"
                  element={
                    <RouteErrorBoundary>
                      <Suspense
                        fallback={
                          <LoadingFallback message="Loading admin orders..." />
                        }
                      >
                        <AdminRoute>
                          <AdminOrders />
                        </AdminRoute>
                      </Suspense>
                    </RouteErrorBoundary>
                  }
                />
                <Route
                  path="/admin/categories"
                  element={
                    <RouteErrorBoundary>
                      <Suspense
                        fallback={
                          <LoadingFallback message="Loading categories..." />
                        }
                      >
                        <AdminRoute>
                          <CategoryManagement />
                        </AdminRoute>
                      </Suspense>
                    </RouteErrorBoundary>
                  }
                />
                <Route
                  path="/admin/notifications"
                  element={
                    <RouteErrorBoundary>
                      <Suspense
                        fallback={
                          <LoadingFallback message="Loading notifications..." />
                        }
                      >
                        <AdminRoute>
                          <AdminNotifications />
                        </AdminRoute>
                      </Suspense>
                    </RouteErrorBoundary>
                  }
                />
                <Route
                  path="/admin/analytics"
                  element={
                    <RouteErrorBoundary>
                      <Suspense
                        fallback={
                          <LoadingFallback message="Loading analytics..." />
                        }
                      >
                        <AdminRoute>
                          <AnalyticsDashboard />
                        </AdminRoute>
                      </Suspense>
                    </RouteErrorBoundary>
                  }
                />

                {/* 404 Not Found - Catch all unmatched routes */}
                <Route
                  path="*"
                  element={
                    <RouteErrorBoundary>
                      <Suspense
                        fallback={<LoadingFallback message="Loading..." />}
                      >
                        <NotFound />
                      </Suspense>
                    </RouteErrorBoundary>
                  }
                />
              </Routes>

              <Footer />
            </Suspense>
          </Router>
        </HelmetProvider>
      </ErrorBoundary>
    </div>
  );
}

export default App;
