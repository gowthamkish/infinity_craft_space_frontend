import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useRef, Suspense, lazy, useContext } from "react";
import { useSelector } from "react-redux";
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
  confirmed:       { emoji: "✅", label: "Order Confirmed",   type: "success" },
  processing:      { emoji: "⏳", label: "Being Processed",   type: "info"    },
  shipped:         { emoji: "🚚", label: "Shipped",           type: "success" },
  out_for_delivery:{ emoji: "🛵", label: "Out for Delivery!", type: "success" },
  delivered:       { emoji: "🎉", label: "Delivered!",        type: "success" },
  cancelled:       { emoji: "❌", label: "Order Cancelled",   type: "error"   },
  returned:        { emoji: "🔄", label: "Return Initiated",  type: "warning" },
};

function App() {
  const { toasts, removeToast, addToast } = useContext(ToastContext);
  // Use _id as a stable scalar so the effect only re-runs on actual user change
  const userId = useSelector((state) => state.auth.user?._id ?? null);

  // Keep a stable ref to addToast so polling interval doesn't restart on every toast
  const addToastRef = useRef(addToast);
  useEffect(() => { addToastRef.current = addToast; }, [addToast]);

  // In-memory snapshot for live diffing during this session
  const liveMapRef = useRef(null);

  // index.jsx dispatches fetchCurrentUser before React mounts — no need to repeat it here.

  // ── Helpers ────────────────────────────────────────────────────────────────
  const lsKey = (uid) => `order_status_snapshot_${uid}`;

  const loadSnapshot = (uid) => {
    try {
      const raw = localStorage.getItem(lsKey(uid));
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  };

  const saveSnapshot = (uid, map) => {
    try { localStorage.setItem(lsKey(uid), JSON.stringify(map)); } catch {}
  };

  const fireToasts = (prevMap, orders) => {
    orders.forEach((order) => {
      const key  = String(order._id);
      const prev = prevMap[key];
      const curr = order.status;
      if (prev && prev !== curr) {
        const cfg = STATUS_TOAST_CONFIG[curr];
        if (cfg) {
          const shortId   = key.slice(-6).toUpperCase();
          const prevLabel = prev.charAt(0).toUpperCase() + prev.slice(1);
          const currLabel = curr.charAt(0).toUpperCase() + curr.slice(1);
          addToastRef.current(
            `Your order #${shortId} status changed: ${prevLabel} → ${currLabel}`,
            { type: cfg.type, title: `${cfg.emoji} ${cfg.label}`, duration: 7000 },
          );
        }
      }
    });
  };

  useEffect(() => {
    if (!userId) {
      liveMapRef.current = null;
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
        orders.forEach((o) => { currentMap[String(o._id)] = o.status; });

        if (isFirstRun) {
          // On first run: compare against localStorage snapshot (catches offline changes)
          const persisted = loadSnapshot(userId);
          if (persisted) {
            fireToasts(persisted, orders);
          }
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

    // Run immediately on login, then every 15 s
    poll(true);
    const id = setInterval(() => poll(false), 15_000);

    return () => {
      cancelled = true;
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
                        <ProtectedRoute>
                          <Home />
                        </ProtectedRoute>
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
