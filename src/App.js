import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setAuthFromStorage } from "./features/authSlice";
import ProductListing from "./pages/ProductListing";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import AdminDashboard from "./components/admin/dashboard";
import UsersList from "./components/users/users";
import ProductList from "./components/products/products";
import AddProduct from "./components/products/addProduct";
import AdminOrders from "./components/orders/Orders";
import IdleTimeoutManager from "./components/IdleTimeoutManager";

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
        {/* Idle Timeout Manager - Active globally for all authenticated users */}
        <IdleTimeoutManager />
        
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<ProductListing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route path="/home" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/checkout" element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          <Route path="/admin/users" element={
            <AdminRoute>
              <UsersList />
            </AdminRoute>
          } />
          <Route path="/admin/products" element={
            <AdminRoute>
              <ProductList />
            </AdminRoute>
          } />
          <Route path="/admin/addProduct" element={
            <AdminRoute>
              <AddProduct />
            </AdminRoute>
          } />
          <Route path="/admin/addProduct/:id" element={
            <AdminRoute>
              <AddProduct />
            </AdminRoute>
          } />
          <Route path="/admin/orders" element={
            <AdminRoute>
              <AdminOrders />
            </AdminRoute>
          } />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
