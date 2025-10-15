import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, Suspense, lazy } from "react";
import { useDispatch } from "react-redux";
import { setAuthFromStorage } from "./features/authSlice";
import { Spinner, Container } from "react-bootstrap";

// Lazy load components for better performance
const ProductListing = lazy(() => import("./pages/ProductListing"));
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Orders = lazy(() => import("./pages/Orders"));
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));
const AdminRoute = lazy(() => import("./components/AdminRoute"));
const AdminDashboard = lazy(() => import("./components/admin/dashboard"));
const UsersList = lazy(() => import("./components/users/users"));
const ProductList = lazy(() => import("./components/products/products"));
const AddProduct = lazy(() => import("./components/products/addProduct"));
const AdminOrders = lazy(() => import("./components/orders/Orders"));
const CategoryManagement = lazy(() => import("./components/categories/CategoryManagement"));
const IdleTimeoutManager = lazy(() => import("./components/IdleTimeoutManager"));

// Loading fallback component
const LoadingFallback = ({ message = "Loading..." }) => (
  <Container 
    className="d-flex flex-column justify-content-center align-items-center" 
    style={{ minHeight: "50vh" }}
  >
    <Spinner 
      animation="border" 
      role="status" 
      style={{
        width: "3rem",
        height: "3rem",
        color: "#3b82f6"
      }}
    />
    <p className="mt-3 text-muted">{message}</p>
  </Container>
);

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Check for existing token and user data on app load
    const token = localStorage.getItem("token");
    if (token) {
      // You might want to validate the token with the server here
      // For now, we'll just set it in the state
      try {
        // Decode the token or fetch user data if needed
        // This is a simplified approach - in production, you should validate the token
        dispatch(setAuthFromStorage({ token, user: null }));
      } catch (error) {
        console.error("Invalid token found:", error);
        localStorage.removeItem("token");
      }
    }
  }, [dispatch]);

  return (
    <div className="App">
      <Router>
        <Suspense fallback={<LoadingFallback message="Loading application..." />}>
          {/* Idle Timeout Manager - Active globally for all authenticated users */}
          <IdleTimeoutManager />
          
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/" 
              element={
                <Suspense fallback={<LoadingFallback message="Loading products..." />}>
                  <ProductListing />
                </Suspense>
              } 
            />
            <Route 
              path="/login" 
              element={
                <Suspense fallback={<LoadingFallback message="Loading login..." />}>
                  <Login />
                </Suspense>
              } 
            />
            <Route 
              path="/register" 
              element={
                <Suspense fallback={<LoadingFallback message="Loading registration..." />}>
                  <Register />
                </Suspense>
              } 
            />
            
            {/* Protected Routes */}
            <Route 
              path="/home" 
              element={
                <Suspense fallback={<LoadingFallback message="Loading home..." />}>
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                </Suspense>
              } 
            />
            <Route 
              path="/checkout" 
              element={
                <Suspense fallback={<LoadingFallback message="Loading checkout..." />}>
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                </Suspense>
              } 
            />
            <Route 
              path="/orders" 
              element={
                <Suspense fallback={<LoadingFallback message="Loading orders..." />}>
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                </Suspense>
              } 
            />
            
            {/* Admin Routes */}
            <Route 
              path="/admin/dashboard" 
              element={
                <Suspense fallback={<LoadingFallback message="Loading admin dashboard..." />}>
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                </Suspense>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <Suspense fallback={<LoadingFallback message="Loading users..." />}>
                  <AdminRoute>
                    <UsersList />
                  </AdminRoute>
                </Suspense>
              } 
            />
            <Route 
              path="/admin/products" 
              element={
                <Suspense fallback={<LoadingFallback message="Loading products..." />}>
                  <AdminRoute>
                    <ProductList />
                  </AdminRoute>
                </Suspense>
              } 
            />
            <Route 
              path="/admin/addProduct" 
              element={
                <Suspense fallback={<LoadingFallback message="Loading product form..." />}>
                  <AdminRoute>
                    <AddProduct />
                  </AdminRoute>
                </Suspense>
              } 
            />
            <Route 
              path="/admin/addProduct/:id" 
              element={
                <Suspense fallback={<LoadingFallback message="Loading product form..." />}>
                  <AdminRoute>
                    <AddProduct />
                  </AdminRoute>
                </Suspense>
              } 
            />
            <Route 
              path="/admin/orders" 
              element={
                <Suspense fallback={<LoadingFallback message="Loading admin orders..." />}>
                  <AdminRoute>
                    <AdminOrders />
                  </AdminRoute>
                </Suspense>
              } 
            />
            <Route 
              path="/admin/categories" 
              element={
                <Suspense fallback={<LoadingFallback message="Loading categories..." />}>
                  <AdminRoute>
                    <CategoryManagement />
                  </AdminRoute>
                </Suspense>
              } 
            />
          </Routes>
        </Suspense>
      </Router>
    </div>
  );
}

export default App;
