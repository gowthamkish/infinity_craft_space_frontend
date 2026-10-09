import "./styles/designTokens.css";
import "./App.css";
import "./styles/buttons.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import muiTheme from "./theme/muiTheme";
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
import { PageLoader } from "./components/Loader";
import { HelmetProvider } from "react-helmet-async";
import ErrorBoundary, { RouteErrorBoundary } from "./components/ErrorBoundary";
import { ToastContext } from "./context/ToastContext";
import { useStreamOrderEventsQuery, useGetMyOrdersQuery } from "./services/ordersApi";
import { Analytics } from "@vercel/analytics/react";

// Lazy-load everything that is NOT needed to render the first visible frame.
// Each of these defers JS parse cost until after the page is interactive.
const ChatWidget      = lazy(() => import("./features/chat/ChatWidget"));
const Footer          = lazy(() => import("./components/Footer"));
const OrderStatusModal = lazy(() => import("./components/OrderStatusModal"));
const OfflineIndicator = lazy(() => import("./components/OfflineIndicator"));
const ToastContainer  = lazy(() => import("./components/ToastContainer"));

// Lazy load components for better performance
const ProductListing = lazy(() => import("./pages/ProductListing"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Orders = lazy(() => import("./pages/Orders"));
const Account = lazy(() => import("./pages/Account"));
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
const AdminDashboard = lazy(() => import("./components/admin/Dashboard"));
const UsersList = lazy(() => import("./components/users/users"));
const ProductList = lazy(() => import("./components/products/products"));
const AddProduct = lazy(() => import("./components/products/addProduct"));
const BulkImport = lazy(() => import("./components/products/BulkImport"));
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
const ModerationQueue = lazy(
  () => import("./components/admin/ModerationQueue"),
);
// const IdleTimeoutManager = lazy(
//   () => import("./components/IdleTimeoutManager"),
// );
const PWAInstallPrompt = lazy(() => import("./components/PWAInstallPrompt"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const SecurityVerification = lazy(() => import("./pages/SecurityVerification"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const SetupSecurityQuestions = lazy(
  () => import("./pages/SetupSecurityQuestions"),
);
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
      const raw = sessionStorage.getItem(lsKey(uid));
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const saveSnapshot = (uid, map) => {
    try {
      sessionStorage.setItem(lsKey(uid), JSON.stringify(map));
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

  // ── Live order status (RTK Query) ──────────────────────────────────────────
  // 1) STREAMING: an SSE connection (opened/closed/retried inside the endpoint) writes every
  //    ORDER_UPDATE into the cached order list and exposes the latest event here.
  const { data: orderStream } = useStreamOrderEventsQuery(undefined, { skip: !userId });
  const lastOrderEvent = orderStream?.lastEvent;

  useEffect(() => {
    if (!lastOrderEvent) return;
    const { order, previousStatus } = lastOrderEvent;
    const key = String(order._id);
    const notifKey = `${key}:${order.status}`;

    if (liveMapRef.current) {
      liveMapRef.current[key] = order.status;
    }

    if (order.status !== previousStatus && !shownRef.current.has(notifKey)) {
      shownRef.current.add(notifKey);
      setOrderStatusEventRef.current({
        order,
        previousStatus: previousStatus || null,
      });
    }
  }, [lastOrderEvent]);

  // 2) POLLING fallback (if the stream is down or events were missed while offline).
  //    The Orders page reads the SAME cache entry, so this is one shared request. Polls every 30s,
  //    pauses while the tab is hidden, and refetches when the window regains focus.
  //    First poll waits 4s after a fresh login so iOS Safari ITP can settle cookies.
  const [ordersWatchReady, setOrdersWatchReady] = useState(false);
  useEffect(() => {
    if (!userId) {
      setOrdersWatchReady(false);
      return;
    }
    const loginTime = Number(sessionStorage.getItem("authLoginTime") || 0);
    const msSinceLogin = loginTime ? Date.now() - loginTime : Infinity;
    const timer = setTimeout(() => setOrdersWatchReady(true), msSinceLogin < 10_000 ? 4_000 : 0);
    return () => clearTimeout(timer);
  }, [userId]);

  const { data: watchedOrders } = useGetMyOrdersQuery(undefined, {
    skip: !userId || !ordersWatchReady,
    pollingInterval: 30_000,
    skipPollingIfUnfocused: true,
    refetchOnFocus: true,
  });

  const isFirstOrdersRun = useRef(true);
  useEffect(() => {
    if (!userId) {
      liveMapRef.current = null;
      shownRef.current = new Set();
      isFirstOrdersRun.current = true;
    }
  }, [userId]);

  // Runs only when the order list actually changes (RTK Query keeps the same reference otherwise)
  useEffect(() => {
    if (!userId || !watchedOrders) return;

    const currentMap = {};
    watchedOrders.forEach((o) => {
      currentMap[String(o._id)] = o.status;
    });

    if (isFirstOrdersRun.current) {
      // First data after login: compare with the persisted snapshot (catches offline changes and
      // freshly placed orders; {} when no snapshot exists so recent orders (<10 min) still notify).
      isFirstOrdersRun.current = false;
      fireToasts(loadSnapshot(userId) || {}, watchedOrders);
    } else if (liveMapRef.current) {
      // Later changes: compare with the in-memory map (SSE events keep it current, and
      // shownRef de-duplicates anything both channels report).
      fireToasts(liveMapRef.current, watchedOrders);
    }
    liveMapRef.current = currentMap;
    saveSnapshot(userId, currentMap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedOrders, userId]);

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline enableColorScheme={false} />
      <Analytics />
      <div className="App">
        <ErrorBoundary>
          <HelmetProvider>
            <Router>
              <Suspense
                fallback={<LoadingFallback message="Loading application..." />}
              >
                {/* Each global overlay gets its own null-fallback Suspense so
                    a loading chunk never blocks the rest of the UI. */}
                <Suspense fallback={null}>
                  <OfflineIndicator />
                </Suspense>

                <Suspense fallback={null}>
                  <ToastContainer
                    toasts={toasts}
                    onClose={removeToast}
                    position="top-right"
                  />
                </Suspense>

                {orderStatusEvent && (
                  <Suspense fallback={null}>
                    <OrderStatusModal
                      event={orderStatusEvent}
                      onClose={closeOrderModal}
                    />
                  </Suspense>
                )}

                {/* "Install app" banner (Android prompt / iOS Add to Home Screen guide) */}
                <Suspense fallback={null}>
                  <PWAInstallPrompt />
                </Suspense>

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
                    path="/forgot-password"
                    element={
                      <RouteErrorBoundary>
                        <Suspense
                          fallback={<LoadingFallback message="Loading..." />}
                        >
                          <ForgotPassword />
                        </Suspense>
                      </RouteErrorBoundary>
                    }
                  />
                  <Route
                    path="/verify-security"
                    element={
                      <RouteErrorBoundary>
                        <Suspense
                          fallback={<LoadingFallback message="Loading..." />}
                        >
                          <SecurityVerification />
                        </Suspense>
                      </RouteErrorBoundary>
                    }
                  />
                  <Route
                    path="/reset-password"
                    element={
                      <RouteErrorBoundary>
                        <Suspense
                          fallback={<LoadingFallback message="Loading..." />}
                        >
                          <ResetPassword />
                        </Suspense>
                      </RouteErrorBoundary>
                    }
                  />
                  <Route
                    path="/setup-security-questions"
                    element={
                      <RouteErrorBoundary>
                        <Suspense
                          fallback={<LoadingFallback message="Loading..." />}
                        >
                          <SetupSecurityQuestions />
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
                          fallback={
                            <LoadingFallback message="Loading home..." />
                          }
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
                    path="/admin/bulkImport"
                    element={
                      <RouteErrorBoundary>
                        <Suspense fallback={<LoadingFallback message="Loading bulk import..." />}>
                          <AdminRoute>
                            <BulkImport />
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

                  <Route
                    path="/admin/moderation"
                    element={
                      <RouteErrorBoundary>
                        <Suspense
                          fallback={
                            <LoadingFallback message="Loading moderation queue..." />
                          }
                        >
                          <AdminRoute>
                            <ModerationQueue />
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

                <Suspense fallback={null}>
                  <Footer />
                </Suspense>
                {/* AI chat assistant — loads after page is interactive */}
                <Suspense fallback={null}>
                  <ChatWidget />
                </Suspense>
              </Suspense>
            </Router>
          </HelmetProvider>
        </ErrorBoundary>
      </div>
    </ThemeProvider>
  );
}

export default App;
