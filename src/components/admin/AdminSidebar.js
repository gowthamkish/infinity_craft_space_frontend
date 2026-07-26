import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../features/authSlice";
import { clearCart, syncCartToBackend } from "../../features/cartSlice";
import { clearProducts } from "../../features/productsSlice";
import { clearAdminData } from "../../features/adminSlice";
import api from "../../api/axios";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Avatar from "@mui/material/Avatar";
import {
  FiGrid,
  FiPackage,
  FiPlusSquare,
  FiShoppingBag,
  FiUsers,
  FiTag,
  FiBarChart2,
  FiBell,
  FiShield,
  FiChevronLeft,
  FiChevronRight,
  FiLogOut,
  FiUploadCloud,
} from "react-icons/fi";

const PRIMARY = "#8B1A4A";
const PRIMARY_ALPHA = "rgba(139,26,74,0.12)";

const NAV_ITEMS = [
  {
    section: "Overview",
    links: [
      { label: "Dashboard",   icon: FiGrid,        to: "/admin/dashboard" },
      { label: "Analytics",   icon: FiBarChart2,    to: "/admin/analytics"  },
    ],
  },
  {
    section: "Catalog",
    links: [
      { label: "Products",    icon: FiPackage,     to: "/admin/products"    },
      { label: "Add Product", icon: FiPlusSquare,   to: "/admin/addProduct"  },
      { label: "Bulk Import", icon: FiUploadCloud,  to: "/admin/bulkImport"  },
      { label: "Categories",  icon: FiTag,          to: "/admin/categories"  },
    ],
  },
  {
    section: "Commerce",
    links: [
      { label: "Orders",        icon: FiShoppingBag, to: "/admin/orders"       },
      { label: "Users",         icon: FiUsers,       to: "/admin/users"        },
      { label: "Notifications", icon: FiBell,        to: "/admin/notifications"},
      { label: "Moderation",    icon: FiShield,      to: "/admin/moderation"   },
    ],
  },
];

export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

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

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "A";

  const sidebarWidth = collapsed ? 64 : 240;

  return (
    <Box
      sx={{
        width: sidebarWidth,
        minWidth: sidebarWidth,
        height: "100%",
        bgcolor: "#ffffff",
        borderRight: "1px solid #e7e5e4",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        transition: "width 280ms ease, min-width 280ms ease",
        flexShrink: 0,
      }}
    >
      {/* Logo + brand */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          px: collapsed ? 1 : 2,
          py: 1.5,
          borderBottom: "1px solid #e7e5e4",
          minHeight: 56,
        }}
      >
        {!collapsed && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, overflow: "hidden" }}>
            <img
              src="/ICS_Logo.jpeg"
              alt="ICS"
              style={{ height: 32, width: "auto", borderRadius: 6, flexShrink: 0 }}
            />
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                color: PRIMARY,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              Infinity Craft
            </Typography>
          </Box>
        )}
        {collapsed && (
          <img
            src="/ICS_Logo.jpeg"
            alt="ICS"
            style={{ height: 32, width: "auto", borderRadius: 6 }}
          />
        )}
        <IconButton
          size="small"
          onClick={() => setCollapsed((c) => !c)}
          sx={{
            ml: collapsed ? 0 : 0.5,
            color: "#57534e",
            flexShrink: 0,
            "&:hover": { bgcolor: PRIMARY_ALPHA, color: PRIMARY },
          }}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <FiChevronRight size={16} /> : <FiChevronLeft size={16} />}
        </IconButton>
      </Box>

      {/* Nav groups */}
      <Box sx={{ flex: 1, overflowY: "auto", overflowX: "hidden", py: 1, scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" } }}>
        {NAV_ITEMS.map(({ section, links }) => (
          <Box key={section} sx={{ mb: 0.5 }}>
            {!collapsed && (
              <Typography
                variant="overline"
                sx={{
                  display: "block",
                  px: 2,
                  pt: 1.5,
                  pb: 0.5,
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  color: "#a8a29e",
                  lineHeight: 1,
                }}
              >
                {section}
              </Typography>
            )}
            {collapsed && <Box sx={{ height: 8 }} />}
            <List dense disablePadding sx={{ px: 1 }}>
              {links.map(({ label, icon: Icon, to }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/admin/dashboard"}
                  style={{ textDecoration: "none" }}
                >
                  {({ isActive }) => (
                    <Tooltip title={collapsed ? label : ""} placement="right" arrow>
                      <ListItemButton
                        sx={{
                          borderRadius: "10px",
                          mb: 0.25,
                          px: collapsed ? 1 : 1.5,
                          py: 0.875,
                          justifyContent: collapsed ? "center" : "flex-start",
                          bgcolor: isActive ? PRIMARY_ALPHA : "transparent",
                          color: isActive ? PRIMARY : "#57534e",
                          "&:hover": {
                            bgcolor: PRIMARY_ALPHA,
                            color: PRIMARY,
                          },
                          transition: "background 150ms ease, color 150ms ease",
                          minHeight: 40,
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: collapsed ? 0 : 32,
                            color: "inherit",
                            justifyContent: "center",
                          }}
                        >
                          <Icon size={16} />
                        </ListItemIcon>
                        {!collapsed && (
                          <ListItemText
                            primary={label}
                            primaryTypographyProps={{
                              fontSize: "0.8125rem",
                              fontWeight: isActive ? 700 : 500,
                              color: "inherit",
                              noWrap: true,
                            }}
                          />
                        )}
                      </ListItemButton>
                    </Tooltip>
                  )}
                </NavLink>
              ))}
            </List>
          </Box>
        ))}
      </Box>

      {/* User info + logout */}
      <Divider sx={{ borderColor: "#e7e5e4" }} />
      <Box
        sx={{
          px: collapsed ? 1 : 2,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          gap: collapsed ? 0 : 1.5,
          justifyContent: collapsed ? "center" : "flex-start",
        }}
      >
        <Avatar
          sx={{
            width: 32,
            height: 32,
            background: "linear-gradient(135deg, #8B1A4A, #6b1238)",
            fontSize: "0.75rem",
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {initials}
        </Avatar>
        {!collapsed && (
          <Box sx={{ flex: 1, overflow: "hidden" }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "#1c1917", fontSize: "0.8rem", noWrap: true, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.name || "Admin"}
            </Typography>
            <Typography variant="caption" sx={{ color: "#a8a29e", fontSize: "0.7rem", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              Administrator
            </Typography>
          </Box>
        )}
        <Tooltip title="Logout" placement="right" arrow>
          <IconButton
            size="small"
            onClick={handleLogout}
            sx={{
              color: "#a8a29e",
              flexShrink: 0,
              "&:hover": { bgcolor: "rgba(220,38,38,0.08)", color: "#dc2626" },
            }}
            aria-label="Logout"
          >
            <FiLogOut size={15} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
