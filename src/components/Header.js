import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/authSlice";
import { clearCart, syncCartToBackend } from "../features/cartSlice";
import { useGetUnreadCountQuery } from "../services/adminApi";
import { useNavigate, useLocation } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Drawer from "@mui/material/Drawer";
import Divider from "@mui/material/Divider";
import Badge from "@mui/material/Badge";
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
import { useEffect, useRef, useState } from "react";
import api from "../api/axios";

const NAV_LINKS = [
  { path: "/", label: "Home", icon: FiHome, showWhen: "always" },
  { path: "/products", label: "Products", icon: FiShoppingCart, showWhen: "always" },
  { path: "/orders", label: "My Orders", icon: FiPackage, showWhen: "auth" },
  { path: "/account", label: "My Account", icon: FiUser, showWhen: "auth" },
];

// Ember & Teal theme (tokens live in styles/ember.css)
const NAV_BG = "rgba(247, 244, 238, 0.82)";
const ACCENT = "#d24e33";                       // active link text
const ACCENT_BG = "rgba(232, 98, 61, 0.10)";
const TEXT = "#232420";
const TEXT_2 = "#5b5d58";
const BORDER = "rgba(20, 24, 30, 0.10)";
const BORDER_STRONG = "rgba(20, 24, 30, 0.18)";
const EMBER_GRAD = "linear-gradient(135deg, #e8623d, #d24e33)";
const HEAD_FONT = '"Space Grotesk", "Inter", system-ui, sans-serif';

function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => !!state.auth.user);
  const cartItems = useSelector((state) => state.cart.items);
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Admin notification badge: polled every 30s (paused while the tab is hidden),
  // refreshed on window focus, and updated optimistically when a notification is read.
  const { data: unreadCount = 0 } = useGetUnreadCountQuery(undefined, {
    skip: !user?.isAdmin,
    pollingInterval: 30000,
    skipPollingIfUnfocused: true,
    refetchOnFocus: true,
  });

  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = async () => {
    try { await dispatch(syncCartToBackend()); } catch { /* ignore */ }
    try { await api.post("/api/auth/logout"); } catch { /* proceed */ }
    dispatch(logout()); // also wipes the RTK Query cache (store listener)
    dispatch(clearCart());
    localStorage.removeItem("redirectAfterLogin");
    navigate("/login");
  };

  const handleCartClick = () => {
    if (!isAuthenticated) {
      localStorage.setItem("redirectAfterLogin", "/checkout");
      navigate("/login");
    } else {
      navigate("/checkout");
    }
  };

  const handleBrandClick = () => navigate(user?.isAdmin ? "/admin/dashboard" : "/");

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const visibleLinks = NAV_LINKS.filter((link) => {
    if (user?.isAdmin) return false;
    if (link.showWhen === "auth" && !isAuthenticated) return false;
    return true;
  });

  const isActive = (path) => location.pathname === path;

  const navLinkSx = (path) => ({
    color: isActive(path) ? ACCENT : TEXT_2,
    fontWeight: isActive(path) ? 600 : 500,
    fontSize: "0.9rem",
    gap: 0.75,
    px: 1.75,
    py: 1,
    borderRadius: "10px",
    background: isActive(path) ? ACCENT_BG : "transparent",
    textTransform: "none",
    minWidth: 0,
    "&:hover": {
      background: ACCENT_BG,
      color: ACCENT,
    },
    transition: "all 0.2s ease",
  });

  const iconBtnSx = {
    color: TEXT_2,
    background: "#fffdf9",
    border: `1px solid ${BORDER}`,
    borderRadius: "10px",
    p: "9px",
    "&:hover": {
      background: "#fffdf9",
      color: ACCENT,
      borderColor: "#e8623d",
      transform: "translateY(-1px)",
    },
    transition: "all 0.2s ease",
  };

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: NAV_BG,
          color: TEXT,
          backdropFilter: "blur(16px) saturate(160%)",
          WebkitBackdropFilter: "blur(16px) saturate(160%)",
          borderRadius: 0,
          borderBottom: `1px solid ${BORDER}`,
          boxShadow: "0 8px 30px rgba(35, 36, 32, 0.06)",
          zIndex: 1200,
        }}
      >
        <Toolbar disableGutters sx={{ width: "100%", maxWidth: 1280, mx: "auto", px: { xs: 2, sm: 3, md: 4 }, minHeight: { xs: 60, md: 68 }, gap: 1 }}>

          {/* Hamburger — mobile only */}
          <IconButton
            sx={{ ...iconBtnSx, display: { xs: "flex", lg: "none" }, mr: 1 }}
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation menu"
          >
            <FiMenu size={20} />
          </IconButton>

          {/* Brand */}
          <Box
            component="button"
            onClick={handleBrandClick}
            aria-label="Go to homepage"
            sx={{
              display: "flex", alignItems: "center", gap: 1,
              background: "none", border: "none", cursor: "pointer", p: 0,
              flexShrink: 0, mr: { xs: "auto", lg: 3 },
            }}
          >
            <img src="/ICS_Logo.jpeg" alt="Infinity Craft Space"
              style={{ height: 38, width: "auto", objectFit: "contain", borderRadius: 8 }} />
            <Box component="span"
              sx={{
                display: { xs: "none", sm: "block" },
                fontWeight: 700, fontSize: { sm: "1rem", md: "1.1rem" },
                fontFamily: HEAD_FONT, letterSpacing: "-0.02em",
                background: "linear-gradient(135deg, #ff7a50, #d24e33)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                whiteSpace: "nowrap",
              }}
            >
              InfinityCraftSpace
            </Box>
          </Box>

          {/* Desktop nav links */}
          <Box component="nav" aria-label="Main navigation"
            sx={{ display: { xs: "none", lg: "flex" }, alignItems: "center", gap: 0.5, flex: 1 }}
          >
            {visibleLinks.map(({ path, label, icon: Icon }) => (
              <Button key={path} onClick={() => navigate(path)} sx={navLinkSx(path)}
                startIcon={<Icon size={15} />}>
                {label}
              </Button>
            ))}
          </Box>

          {/* Spacer on desktop if no links (admin) */}
          {visibleLinks.length === 0 && <Box sx={{ flex: 1, display: { xs: "none", lg: "block" } }} />}

          {/* Actions */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: { xs: 0, lg: "auto" } }}>

            {/* Cart */}
            {!user?.isAdmin && (
              <IconButton sx={iconBtnSx} onClick={handleCartClick}
                aria-label={`Cart${totalCartItems > 0 ? `, ${totalCartItems} items` : ""}`}>
                <Badge badgeContent={totalCartItems || null} color="error"
                  sx={{ "& .MuiBadge-badge": { fontSize: "0.65rem", minWidth: 16, height: 16, p: 0 } }}>
                  <FiShoppingCart size={20} />
                </Badge>
              </IconButton>
            )}

            {/* Notifications (admin) */}
            {user?.isAdmin && (
              <IconButton sx={iconBtnSx} onClick={() => navigate("/admin/notifications")}
                aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}>
                <Badge badgeContent={unreadCount || null} color="error"
                  sx={{ "& .MuiBadge-badge": { fontSize: "0.65rem", minWidth: 16, height: 16, p: 0 } }}>
                  <FiBell size={18} />
                </Badge>
              </IconButton>
            )}

            {/* Auth buttons — desktop */}
            {isAuthenticated ? (
              <Button
                onClick={handleLogout}
                startIcon={<FiLogOut size={15} />}
                sx={{
                  ...iconBtnSx, display: { xs: "none", lg: "inline-flex" },
                  gap: 0.75, px: 1.75, py: 1, fontSize: "0.875rem",
                  textTransform: "none", fontWeight: 600,
                }}
              >
                Logout
              </Button>
            ) : (
              <Box sx={{ display: { xs: "none", lg: "flex" }, gap: 1 }}>
                <Button onClick={() => navigate("/login")}
                  sx={{
                    color: TEXT, border: `1px solid ${BORDER_STRONG}`, background: "#fffdf9",
                    borderRadius: "10px", textTransform: "none", fontWeight: 600,
                    fontSize: "0.875rem", px: 2.25,
                    "&:hover": { borderColor: "#e8623d", color: ACCENT, background: "#fffdf9" },
                  }}>
                  Login
                </Button>
                <Button onClick={() => navigate("/register")}
                  sx={{
                    background: EMBER_GRAD,
                    color: "#fff", borderRadius: "10px", textTransform: "none",
                    fontWeight: 600, fontSize: "0.875rem", px: 2.25, border: "none",
                    boxShadow: "0 8px 22px rgba(232,98,61,0.32)",
                    "&:hover": { background: EMBER_GRAD, boxShadow: "0 12px 28px rgba(232,98,61,0.45)", transform: "translateY(-1px)" },
                  }}>
                  Sign Up
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 300 },
            background: "#f7f4ee",
            color: TEXT,
          },
        }}
      >
        {/* Drawer header */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, py: 1.5, borderBottom: `1px solid ${BORDER}` }}>
          <Box component="button" onClick={() => { handleBrandClick(); setDrawerOpen(false); }}
            sx={{ display: "flex", alignItems: "center", gap: 1, background: "none", border: "none", cursor: "pointer", p: 0 }}>
            <img src="/ICS_Logo.jpeg" alt="Infinity Craft Space"
              style={{ height: 36, width: "auto", objectFit: "contain", borderRadius: 8 }} />
            <Box component="span"
              sx={{ fontWeight: 700, fontSize: "1rem", fontFamily: HEAD_FONT, letterSpacing: "-0.02em", background: "linear-gradient(135deg, #ff7a50, #d24e33)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              InfinityCraftSpace
            </Box>
          </Box>
          <IconButton onClick={() => setDrawerOpen(false)} aria-label="Close menu"
            sx={{ color: TEXT, "&:hover": { background: ACCENT_BG } }}>
            <FiX size={22} />
          </IconButton>
        </Box>

        {/* Drawer nav links */}
        <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 0.5 }}>
          {visibleLinks.map(({ path, label, icon: Icon }) => (
            <Box key={path} component="button"
              onClick={() => { navigate(path); setDrawerOpen(false); }}
              sx={{
                display: "flex", alignItems: "center", gap: 1.5,
                background: isActive(path) ? ACCENT_BG : "transparent",
                color: isActive(path) ? ACCENT : TEXT_2,
                border: "none", borderRadius: "8px", px: 2, py: 1.5,
                cursor: "pointer", fontWeight: isActive(path) ? 600 : 500,
                fontSize: "1rem", width: "100%", textAlign: "left",
                transition: "all 0.15s ease",
                "&:hover": { background: ACCENT_BG, color: ACCENT },
              }}
            >
              <Icon size={19} />
              {label}
            </Box>
          ))}
        </Box>

        <Divider sx={{ borderColor: BORDER, mx: 2 }} />

        {/* Drawer auth */}
        <Box sx={{ p: 2, mt: "auto", display: "flex", flexDirection: "column", gap: 1 }}>
          {isAuthenticated ? (
            <Box component="button"
              onClick={() => { handleLogout(); setDrawerOpen(false); }}
              sx={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 1,
                border: `1px solid ${BORDER_STRONG}`, borderRadius: "10px",
                background: "#fffdf9", color: TEXT, px: 2, py: 1.5,
                cursor: "pointer", fontWeight: 500, fontSize: "1rem", width: "100%",
                "&:hover": { borderColor: "#e8623d", color: ACCENT },
                transition: "all 0.15s ease",
              }}
            >
              <FiLogOut size={16} /> Logout
            </Box>
          ) : (
            <>
              <Box component="button" onClick={() => { navigate("/login"); setDrawerOpen(false); }}
                sx={{ border: `1px solid ${BORDER_STRONG}`, borderRadius: "10px", background: "#fffdf9", color: TEXT, px: 2, py: 1.5, cursor: "pointer", fontWeight: 600, fontSize: "1rem", width: "100%", transition: "all 0.15s ease", "&:hover": { borderColor: "#e8623d", color: ACCENT } }}>
                Login
              </Box>
              <Box component="button" onClick={() => { navigate("/register"); setDrawerOpen(false); }}
                sx={{ background: EMBER_GRAD, borderRadius: "10px", border: "none", color: "white", px: 2, py: 1.5, cursor: "pointer", fontWeight: 600, fontSize: "1rem", width: "100%", boxShadow: "0 8px 22px rgba(232,98,61,0.32)", transition: "all 0.15s ease", "&:hover": { boxShadow: "0 12px 28px rgba(232,98,61,0.45)" } }}>
                Sign Up
              </Box>
            </>
          )}
        </Box>
      </Drawer>
    </>
  );
}

export default Header;
