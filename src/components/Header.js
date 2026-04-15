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
import { useEffect, useState } from "react";
import api from "../api/axios";
import "./Header.css";

const NAV_LINKS = [
  { path: "/", label: "Products", icon: FiHome, showWhen: "always" },
  { path: "/orders", label: "My Orders", icon: FiPackage, showWhen: "auth" },
  { path: "/account", label: "My Account", icon: FiUser, showWhen: "auth" },
];

function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => !!state.auth.user);
  const cartItems = useSelector((state) => state.cart.items);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const totalCartItems = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  const closeMobile = () => setShowMobileMenu(false);

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch {
      /* proceed anyway */
    }
    dispatch(logout());
    dispatch(clearCart());
    dispatch(clearProducts());
    dispatch(clearAdminData());
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

  const handleBrandClick = () =>
    navigate(user?.isAdmin ? "/admin/dashboard" : "/");

  useEffect(() => {
    if (!user?.isAdmin) return;
    let mounted = true;
    const fetchUnread = async () => {
      try {
        const res = await api.get("/api/admin/notifications/unread-count");
        if (mounted) setUnreadCount(res.data.unreadCount || 0);
      } catch {
        /* ignore */
      }
    };
    fetchUnread();
    const t = setInterval(fetchUnread, 30000);
    return () => {
      mounted = false;
      clearInterval(t);
    };
  }, [user]);

  const visibleLinks = NAV_LINKS.filter((link) => {
    if (user?.isAdmin) return false;
    if (link.showWhen === "auth" && !isAuthenticated) return false;
    return true;
  });

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <Navbar fixed="top" className="navbar-main" variant="dark">
        <Container fluid>
          {/* ── Desktop ── */}
          <div className="d-none d-lg-flex w-100 align-items-center">
            <Navbar.Brand className="nav-brand" onClick={handleBrandClick}>
              Infinity Craft Space
            </Navbar.Brand>

            <Nav className="me-auto">
              {visibleLinks.map(({ path, label, icon: Icon }) => (
                <Nav.Link
                  key={path}
                  className={`nav-link-item ${isActive(path) ? "nav-link-item--active" : ""}`}
                  onClick={() => navigate(path)}
                >
                  <Icon size={15} />
                  {label}
                </Nav.Link>
              ))}
            </Nav>

            <div className="d-flex align-items-center gap-2">
              {!user?.isAdmin && (
                <Button
                  className="nav-icon-btn"
                  onClick={handleCartClick}
                  aria-label="Cart"
                >
                  <FiShoppingCart size={20} />
                  {totalCartItems > 0 && (
                    <Badge
                      bg="danger"
                      pill
                      className="position-absolute top-0 start-100 translate-middle nav-cart-badge"
                    >
                      {totalCartItems}
                    </Badge>
                  )}
                </Button>
              )}

              {user?.isAdmin && (
                <Button
                  className="nav-icon-btn"
                  onClick={() => navigate("/admin/notifications")}
                  aria-label="Notifications"
                >
                  <FiBell size={18} />
                  {unreadCount > 0 && (
                    <Badge
                      bg="danger"
                      pill
                      className="position-absolute top-0 start-100 translate-middle nav-cart-badge"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              )}

              {isAuthenticated ? (
                <Button className="nav-icon-btn" onClick={handleLogout}>
                  <FiLogOut size={16} />
                  <span
                    className="ms-2"
                    style={{ fontWeight: 500, fontSize: "0.9rem" }}
                  >
                    Logout
                  </span>
                </Button>
              ) : (
                <div className="d-flex gap-2">
                  <Button
                    className="nav-btn-login"
                    onClick={() => navigate("/login")}
                  >
                    Login
                  </Button>
                  <Button
                    className="nav-btn-signup"
                    onClick={() => navigate("/register")}
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* ── Mobile ── */}
          <div className="d-flex d-lg-none w-100 align-items-center justify-content-between">
            <Button
              variant="link"
              className="nav-mobile-close p-2"
              onClick={() => setShowMobileMenu(true)}
            >
              <FiMenu size={24} />
            </Button>

            <Navbar.Brand
              className="nav-brand m-0"
              style={{ fontSize: "1.1rem" }}
              onClick={handleBrandClick}
            >
              Infinity Craft Space
            </Navbar.Brand>

            {!user?.isAdmin && (
              <Button
                variant="link"
                className="nav-mobile-close p-2 position-relative"
                onClick={handleCartClick}
                aria-label="Cart"
              >
                <FiShoppingCart size={22} />
                {totalCartItems > 0 && (
                  <Badge
                    bg="danger"
                    pill
                    className="position-absolute top-0 start-100 translate-middle nav-cart-badge"
                  >
                    {totalCartItems}
                  </Badge>
                )}
              </Button>
            )}
          </div>
        </Container>
      </Navbar>

      {/* ── Mobile Offcanvas ── */}
      <Offcanvas
        show={showMobileMenu}
        onHide={closeMobile}
        placement="start"
        className="nav-mobile-menu"
      >
        <Offcanvas.Header className="nav-mobile-header">
          <Button
            className="nav-mobile-close"
            onClick={closeMobile}
            aria-label="Close menu"
          >
            <FiX size={22} />
          </Button>
        </Offcanvas.Header>
        <Offcanvas.Body className="nav-mobile-body">
          <Nav className="flex-column">
            {visibleLinks.map(({ path, label, icon: Icon }) => (
              <Nav.Link
                key={path}
                className={`nav-mobile-link ${isActive(path) ? "nav-mobile-link--active" : ""}`}
                onClick={() => {
                  navigate(path);
                  closeMobile();
                }}
              >
                <Icon size={19} />
                {label}
              </Nav.Link>
            ))}
          </Nav>

          <hr className="nav-mobile-divider" />

          {isAuthenticated ? (
            <Button
              className="nav-mobile-btn-logout"
              onClick={() => {
                handleLogout();
                closeMobile();
              }}
            >
              <FiLogOut size={16} className="me-2" />
              Logout
            </Button>
          ) : (
            <div className="d-grid gap-2">
              <Button
                className="nav-btn-login"
                onClick={() => {
                  navigate("/login");
                  closeMobile();
                }}
              >
                Login
              </Button>
              <Button
                className="nav-btn-signup"
                onClick={() => {
                  navigate("/register");
                  closeMobile();
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
