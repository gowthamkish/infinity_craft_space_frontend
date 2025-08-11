import logo from "./logo.svg";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import AdminDashboard from "./components/admin/dashboard";
import Header from "./components/header";
import UsersList from "./components/users/users";
import ProductList from "./components/products/products";
import AddProduct from "./components/products/addProduct";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<Home />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UsersList />} />
          <Route path="/admin/products" element={<ProductList />} />
          <Route path="/admin/addProduct" element={<AddProduct />} />
          <Route path="/admin/addProduct/:id" element={<AddProduct />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
