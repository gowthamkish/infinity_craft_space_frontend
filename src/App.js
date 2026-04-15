import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, Suspense, lazy, useContext } from "react";
import { useDispatch } from "react-redux";
import { fetchCurrentUser } from "./features/authSlice";
import { PageLoader } from "./components/Loader";
import { HelmetProvider } from "react-helmet-async";
import OfflineIndicator from "./components/OfflineIndicator";
import Footer from "./components/Footer";
import ErrorBoundary, { RouteErrorBoundary } from "./components/ErrorBoundary";
import ToastContainer from "./components/ToastContainer";
import { ToastContext } from "./context/ToastContext";
import RecentlyViewed from "./components/RecentlyViewed";

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

const LoadingFallback = ({ message }) => (
  <PageLoader label={message || "Loading…"} variant="section" />
);

function App() {
  const dispatch = useDispatch();
  const { toasts, removeToast } = useContext(ToastContext);

  useEffect(() => {
    // Restore session from httpOnly cookie (no localStorage needed)
    dispatch(fetchCurrentUser());
  }, [dispatch]);

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
