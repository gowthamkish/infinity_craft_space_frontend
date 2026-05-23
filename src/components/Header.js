import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/authSlice";
import { clearCart, syncCartToBackend } from "../features/cartSlice";
import { clearProducts } from "../features/productsSlice";
import { clearAdminData } from "../features/adminSlice";
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

const NAV_BG = "linear-gradient(135deg, #3D1A2A 0%, #5C2038 40%, #3D1A2A 100%)";
const ACCENT = "#C9A84C";

function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => !!state.auth.user);
  const cartItems = useSelector((state) => state.cart.items);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = async () => {
    try { await dispatch(syncCartToBackend()); } catch { /* ignore */ }
    try { await api.post("/api/auth/logout"); } catch { /* proceed */ }
    dispatch(logout());
    dispatch(clearCart());
    dispatch(clearProducts());
    dispatch(clearAdminData());
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
    if (!user?.isAdmin) return;
    let mounted = true;
    const fetchUnread = async () => {
      try {
        const res = await api.get("/api/admin/notifications/unread-count");
        if (mounted) setUnreadCount(res.data.unreadCount || 0);
      } catch { /* ignore */ }
    };
    fetchUnread();
    const t = setInterval(fetchUnread, 30000);
    return () => { mounted = false; clearInterval(t); };
  }, [user]);

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
    color: isActive(path) ? ACCENT : "#e2e8f0",
    fontWeight: isActive(path) ? 600 : 500,
    fontSize: "0.875rem",
    gap: 0.75,
    px: 1.5,
    py: 1,
    borderRadius: "8px",
    background: isActive(path) ? "rgba(34,211,238,0.12)" : "transparent",
    textTransform: "none",
    minWidth: 0,
    "&:hover": {
      background: "rgba(255,255,255,0.1)",
      color: "#fff",
      transform: "translateY(-1px)",
    },
    transition: "all 0.15s ease",
  });

  const iconBtnSx = {
    color: "#e2e8f0",
    background: "rgba(255,255,255,0.08)",
    border: "1.5px solid rgba(255,255,255,0.16)",
    borderRadius: "8px",
    p: "8px",
    "&:hover": {
      background: "rgba(255,255,255,0.15)",
      color: "#fff",
      transform: "translateY(-1px)",
    },
    transition: "all 0.15s ease",
  };

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: NAV_BG,
          borderRadius: 0,
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 1px 0 rgba(255,255,255,0.06), 0 8px 24px rgba(0,0,0,0.15)",
          zIndex: 1200,
        }}
      >
        <Toolbar sx={{ px: { xs: 2, sm: 3, md: 4 }, minHeight: { xs: 56, md: 64 }, gap: 1 }}>

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
                background: "linear-gradient(135deg, #C9A84C, #F4A7B9)",
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
                  gap: 0.75, px: 1.5, py: 1, fontSize: "0.875rem",
                  textTransform: "none", fontWeight: 500,
                }}
              >
                Logout
              </Button>
            ) : (
              <Box sx={{ display: { xs: "none", lg: "flex" }, gap: 1 }}>
                <Button onClick={() => navigate("/login")}
                  sx={{
                    color: "#e2e8f0", border: "1.5px solid rgba(255,255,255,0.2)",
                    borderRadius: "8px", textTransform: "none", fontWeight: 500,
                    fontSize: "0.875rem", px: 2,
                    "&:hover": { background: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.35)", color: "#fff" },
                  }}>
                  Login
                </Button>
                <Button onClick={() => navigate("/register")}
                  sx={{
                    background: "linear-gradient(135deg, #8B1A4A, #6b1238)",
                    color: "#fff", borderRadius: "8px", textTransform: "none",
                    fontWeight: 600, fontSize: "0.875rem", px: 2, border: "none",
                    boxShadow: "0 4px 12px rgba(139,26,74,0.3)",
                    "&:hover": { background: "linear-gradient(135deg, #6b1238, #4c0d28)", boxShadow: "0 6px 16px rgba(139,26,74,0.42)" },
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
            background: "linear-gradient(to bottom, #3D1A2A 0%, #5C2038 100%)",
            color: "white",
          },
        }}
      >
        {/* Drawer header */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, py: 1.5, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <Box component="button" onClick={() => { handleBrandClick(); setDrawerOpen(false); }}
            sx={{ display: "flex", alignItems: "center", gap: 1, background: "none", border: "none", cursor: "pointer", p: 0 }}>
            <img src="/ICS_Logo.jpeg" alt="Infinity Craft Space"
              style={{ height: 36, width: "auto", objectFit: "contain", borderRadius: 8 }} />
            <Box component="span"
              sx={{ fontWeight: 700, fontSize: "1rem", background: "linear-gradient(135deg, #C9A84C, #F4A7B9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              InfinityCraftSpace
            </Box>
          </Box>
          <IconButton onClick={() => setDrawerOpen(false)} aria-label="Close menu"
            sx={{ color: "white", "&:hover": { background: "rgba(255,255,255,0.1)" } }}>
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
                background: isActive(path) ? "rgba(34,211,238,0.12)" : "transparent",
                color: isActive(path) ? ACCENT : "#e2e8f0",
                border: "none", borderRadius: "8px", px: 2, py: 1.5,
                cursor: "pointer", fontWeight: isActive(path) ? 600 : 500,
                fontSize: "1rem", width: "100%", textAlign: "left",
                transition: "all 0.15s ease",
                "&:hover": { background: "rgba(255,255,255,0.08)", color: "white" },
              }}
            >
              <Icon size={19} />
              {label}
            </Box>
          ))}
        </Box>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.12)", mx: 2 }} />

        {/* Drawer auth */}
        <Box sx={{ p: 2, mt: "auto", display: "flex", flexDirection: "column", gap: 1 }}>
          {isAuthenticated ? (
            <Box component="button"
              onClick={() => { handleLogout(); setDrawerOpen(false); }}
              sx={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 1,
                border: "1.5px solid rgba(255,255,255,0.2)", borderRadius: "8px",
                background: "transparent", color: "#e2e8f0", px: 2, py: 1.5,
                cursor: "pointer", fontWeight: 500, fontSize: "1rem", width: "100%",
                "&:hover": { background: "rgba(255,255,255,0.1)", color: "white" },
                transition: "all 0.15s ease",
              }}
            >
              <FiLogOut size={16} /> Logout
            </Box>
          ) : (
            <>
              <Box component="button" onClick={() => { navigate("/login"); setDrawerOpen(false); }}
                sx={{ border: "1.5px solid rgba(255,255,255,0.2)", borderRadius: "8px", background: "transparent", color: "#e2e8f0", px: 2, py: 1.5, cursor: "pointer", fontWeight: 500, fontSize: "1rem", width: "100%", transition: "all 0.15s ease", "&:hover": { background: "rgba(255,255,255,0.1)", color: "white" } }}>
                Login
              </Box>
              <Box component="button" onClick={() => { navigate("/register"); setDrawerOpen(false); }}
                sx={{ background: "linear-gradient(135deg, #8B1A4A, #6b1238)", borderRadius: "8px", border: "none", color: "white", px: 2, py: 1.5, cursor: "pointer", fontWeight: 600, fontSize: "1rem", width: "100%", boxShadow: "0 4px 12px rgba(139,26,74,0.3)", transition: "all 0.15s ease", "&:hover": { background: "linear-gradient(135deg, #6b1238, #4c0d28)" } }}>
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
