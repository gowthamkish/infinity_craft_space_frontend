import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/authSlice";
import { clearCart } from "../features/cartSlice";
import { clearProducts } from "../features/productsSlice";
import { clearAdminData } from "../features/adminSlice";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";
import Offcanvas from "react-bootstrap/Offcanvas";
import {
  FiLogOut,
  FiShoppingCart,
  FiUser,
  FiHome,
  FiPackage,
  FiMenu,
  FiX,
  FiBell,
} from "react-icons/fi";
import { useEffect } from "react";
import api from "../api/axios";
import { useState } from "react";

function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.token);
  const cartItems = useSelector((state) => state.cart.items);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Calculate total items in cart
  const totalCartItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCart()); // Clear cart items on logout
    dispatch(clearProducts()); // Clear cached products
    dispatch(clearAdminData()); // Clear cached admin data
    localStorage.removeItem("token");
    localStorage.removeItem("redirectAfterLogin");
    navigate("/");
  };

  const handleCartClick = () => {
    if (!isAuthenticated) {
      localStorage.setItem("redirectAfterLogin", "/checkout");
      navigate("/login");
    } else {
      navigate("/checkout");
    }
  };

  const handleBrandClick = () => {
    if (user?.isAdmin) {
      navigate("/admin/dashboard");
    } else if (isAuthenticated) {
      navigate("/");
    } else {
      navigate("/");
    }
  };

  useEffect(() => {
    let mounted = true;
    const fetchUnread = async () => {
      if (!user?.isAdmin) return;
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/api/admin/notifications/unread-count", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (mounted) setUnreadCount(res.data.unreadCount || 0);
      } catch (err) {
        // ignore
      }
    };

    fetchUnread();
    const t = setInterval(fetchUnread, 30000); // poll every 30s
    return () => {
      mounted = false;
      clearInterval(t);
    };
  }, [user]);

  return (
    <>
      {/* Main Navbar */}
      <Navbar
        fixed="top"
        style={{
          background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
          minHeight: "70px",
          padding: "0.75rem 0",
          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
          zIndex: 1030,
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
        variant="dark"
      >
        <Container fluid>
          {/* Desktop Layout */}
          <div className="d-none d-lg-flex w-100 align-items-center">
            {/* Brand */}
            <Navbar.Brand
              style={{
                cursor: "pointer",
                fontSize: "1.5rem",
                fontWeight: "700",
                color: "#22d3ee",
                marginRight: "2rem",
              }}
              onClick={handleBrandClick}
            >
              Infinity Craft Space
            </Navbar.Brand>

            {/* Navigation Links */}
            <Nav className="me-auto">
              {!user?.isAdmin && (
                <Nav.Link
                  onClick={() => navigate("/")}
                  className={`${location.pathname === "/" ? "active" : ""} d-flex align-items-center`}
                  style={{
                    fontWeight: "500",
                    padding: "0.5rem 1rem",
                    borderRadius: "8px",
                    margin: "0 0.25rem",
                    color: location.pathname === "/" ? "#22d3ee" : "#e2e8f0",
                  }}
                >
                  <FiHome size={16} className="me-2" />
                  Products
                </Nav.Link>
              )}

              {isAuthenticated && !user?.isAdmin && (
                <Nav.Link
                  onClick={() => navigate("/orders")}
                  className={`${location.pathname === "/orders" ? "active" : ""} d-flex align-items-center`}
                  style={{
                    fontWeight: "500",
                    padding: "0.5rem 1rem",
                    borderRadius: "8px",
                    margin: "0 0.25rem",
                    color:
                      location.pathname === "/orders" ? "#22d3ee" : "#e2e8f0",
                  }}
                >
                  <FiPackage size={16} className="me-2" />
                  My Orders
                </Nav.Link>
              )}
              {isAuthenticated && !user?.isAdmin && (
                <Nav.Link
                  onClick={() => navigate("/account")}
                  className={`${location.pathname === "/account" ? "active" : ""} d-flex align-items-center`}
                  style={{
                    fontWeight: "500",
                    padding: "0.5rem 1rem",
                    borderRadius: "8px",
                    margin: "0 0.25rem",
                    color:
                      location.pathname === "/account" ? "#22d3ee" : "#e2e8f0",
                  }}
                >
                  <FiUser size={16} className="me-2" />
                  My Account
                </Nav.Link>
              )}
            </Nav>

            {/* Right Side Actions */}
            <div className="d-flex align-items-center gap-3">
              {/* Cart Button */}
              {!user?.isAdmin && (
                <Button
                  variant="outline-light"
                  className="position-relative"
                  onClick={handleCartClick}
                  style={{
                    border: "2px solid rgba(255,255,255,0.2)",
                    borderRadius: "10px",
                    padding: "8px 12px",
                    transition: "all 0.3s ease",
                  }}
                >
                  <FiShoppingCart size={20} />
                  {totalCartItems > 0 && (
                    <Badge
                      bg="danger"
                      pill
                      className="position-absolute top-0 start-100 translate-middle"
                      style={{
                        fontSize: "0.65rem",
                        minWidth: "20px",
                        height: "20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {totalCartItems}
                    </Badge>
                  )}
                </Button>
              )}

              {/* Admin Notification Bell */}
              {user?.isAdmin && (
                <Button
                  variant="outline-light"
                  title="Notifications"
                  onClick={() => navigate("/admin/notifications")}
                  style={{
                    border: "2px solid rgba(255,255,255,0.2)",
                    position: "relative",
                    borderRadius: "10px",
                    padding: "8px 12px",
                    transition: "all 0.3s ease",
                  }}
                >
                  <FiBell size={18} />
                  {unreadCount > 0 && (
                    <Badge
                      bg="danger"
                      pill
                      className="position-absolute top-0 start-100 translate-middle"
                      style={{
                        fontSize: "0.65rem",
                        minWidth: "20px",
                        height: "20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              )}

              {/* User Info & Auth */}
              {isAuthenticated ? (
                <div className="d-flex align-items-center gap-3">
                  <div className="text-light d-flex align-items-center">
                    {/* <FiUser size={16} className="me-2" /> */}
                    <span style={{ fontWeight: "500", fontSize: "0.9rem" }}>
                      {user?.username || user?.email?.split("@")[0]}
                    </span>
                  </div>
                  <Button
                    variant="outline-light"
                    onClick={handleLogout}
                    style={{
                      border: "2px solid rgba(255,255,255,0.2)",
                      borderRadius: "8px",
                      padding: "8px 16px",
                      fontWeight: "500",
                    }}
                  >
                    <FiLogOut size={16} className="me-2" />
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="d-flex gap-2">
                  <Button
                    variant="outline-light"
                    onClick={() => navigate("/login")}
                    style={{
                      border: "2px solid rgba(255,255,255,0.2)",
                      borderRadius: "8px",
                      fontWeight: "500",
                      padding: "8px 16px",
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    onClick={() => navigate("/register")}
                    style={{
                      borderRadius: "8px",
                      fontWeight: "600",
                      background: "linear-gradient(45deg, #3b82f6, #10b981)",
                      border: "none",
                      color: "white",
                      padding: "8px 16px",
                    }}
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="d-flex d-lg-none w-100 align-items-center justify-content-between">
            {/* Mobile Hamburger Menu */}
            <Button
              variant="link"
              onClick={() => setShowMobileMenu(true)}
              style={{
                color: "white",
                border: "none",
                padding: "8px",
                fontSize: "1.5rem",
              }}
            >
              <FiMenu size={24} />
            </Button>

            {/* Mobile Brand */}
            <Navbar.Brand
              style={{
                cursor: "pointer",
                fontSize: "1.2rem",
                fontWeight: "700",
                color: "#22d3ee",
                margin: "0",
              }}
              onClick={handleBrandClick}
            >
              Infinity Craft Space
            </Navbar.Brand>

            {/* Mobile Cart */}
            {!user?.isAdmin && (
              <Button
                variant="link"
                className="position-relative"
                onClick={handleCartClick}
                style={{
                  color: "white",
                  border: "none",
                  padding: "8px",
                  fontSize: "1.3rem",
                }}
              >
                <FiShoppingCart size={24} />
                {totalCartItems > 0 && (
                  <Badge
                    bg="danger"
                    pill
                    className="position-absolute top-0 start-100 translate-middle"
                    style={{
                      fontSize: "0.7rem",
                      minWidth: "20px",
                      height: "20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {totalCartItems}
                  </Badge>
                )}
              </Button>
            )}
          </div>
        </Container>
      </Navbar>

      {/* Mobile Menu Offcanvas */}
      <Offcanvas
        show={showMobileMenu}
        onHide={() => setShowMobileMenu(false)}
        placement="start"
        style={{
          background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
          color: "white",
          width: "280px",
        }}
      >
        <Offcanvas.Header
          style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
        >
          {/* <Offcanvas.Title style={{ color: "#22d3ee", fontWeight: "700" }}>
            Menu
          </Offcanvas.Title> */}
          <Button
            variant="link"
            onClick={() => setShowMobileMenu(false)}
            style={{
              color: "white",
              border: "none",
              padding: "0.25rem",
              fontSize: "1.5rem",
            }}
          >
            <FiX size={24} />
          </Button>
        </Offcanvas.Header>
        <Offcanvas.Body style={{ padding: "1.5rem" }}>
          {/* Mobile Navigation */}
          <Nav className="flex-column">
            {!user?.isAdmin && (
              <Nav.Link
                onClick={() => {
                  navigate("/");
                  setShowMobileMenu(false);
                }}
                className="d-flex align-items-center mb-3"
                style={{
                  fontWeight: "500",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  color: location.pathname === "/" ? "#22d3ee" : "#e2e8f0",
                  backgroundColor:
                    location.pathname === "/"
                      ? "rgba(34, 211, 238, 0.1)"
                      : "transparent",
                }}
              >
                <FiHome size={20} className="me-3" />
                Products
              </Nav.Link>
            )}

            {isAuthenticated && !user?.isAdmin && (
              <Nav.Link
                onClick={() => {
                  navigate("/orders");
                  setShowMobileMenu(false);
                }}
                className="d-flex align-items-center mb-3"
                style={{
                  fontWeight: "500",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  color:
                    location.pathname === "/orders" ? "#22d3ee" : "#e2e8f0",
                  backgroundColor:
                    location.pathname === "/orders"
                      ? "rgba(34, 211, 238, 0.1)"
                      : "transparent",
                }}
              >
                <FiPackage size={20} className="me-3" />
                My Orders
              </Nav.Link>
            )}
            {isAuthenticated && !user?.isAdmin && (
              <Nav.Link
                onClick={() => {
                  navigate("/account");
                  setShowMobileMenu(false);
                }}
                className="d-flex align-items-center mb-3"
                style={{
                  fontWeight: "500",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  color:
                    location.pathname === "/account" ? "#22d3ee" : "#e2e8f0",
                  backgroundColor:
                    location.pathname === "/account"
                      ? "rgba(34, 211, 238, 0.1)"
                      : "transparent",
                }}
              >
                <FiUser size={20} className="me-3" />
                My Account
              </Nav.Link>
            )}
          </Nav>

          <hr
            style={{ borderColor: "rgba(255,255,255,0.2)", margin: "1.5rem 0" }}
          />

          {/* Mobile User Actions */}
          {isAuthenticated ? (
            <div>
              <div
                className="d-flex align-items-center mb-3 p-3"
                style={{
                  backgroundColor: "rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                }}
              >
                <FiUser size={20} className="me-3" />
                <span style={{ fontWeight: "500" }}>
                  {user?.username || user?.email?.split("@")[0]}
                </span>
              </div>
              <Button
                variant="outline-light"
                onClick={() => {
                  handleLogout();
                  setShowMobileMenu(false);
                }}
                className="w-100"
                style={{
                  border: "2px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                  padding: "12px",
                  fontWeight: "500",
                }}
              >
                <FiLogOut size={18} className="me-2" />
                Logout
              </Button>
            </div>
          ) : (
            <div className="d-grid gap-3">
              <Button
                variant="outline-light"
                onClick={() => {
                  navigate("/login");
                  setShowMobileMenu(false);
                }}
                style={{
                  border: "2px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                  fontWeight: "500",
                  padding: "12px",
                }}
              >
                Login
              </Button>
              <Button
                onClick={() => {
                  navigate("/register");
                  setShowMobileMenu(false);
                }}
                style={{
                  borderRadius: "8px",
                  fontWeight: "600",
                  background: "linear-gradient(45deg, #3b82f6, #10b981)",
                  border: "none",
                  color: "white",
                  padding: "12px",
                }}
              >
                Sign Up
              </Button>
            </div>
          )}
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default Header;
