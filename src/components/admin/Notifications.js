import React, { useEffect, useState, useMemo } from "react";
import {
  FiBell, FiCheck, FiCheckCircle, FiPackage, FiRefreshCw,
  FiInbox, FiChevronRight, FiAlertCircle, FiTruck,
  FiRotateCcw, FiXCircle,
} from "react-icons/fi";
import {
  Box, Typography, Stack, Button, IconButton, Chip,
  Paper, Divider, Skeleton, Tooltip, CircularProgress,
} from "@mui/material";
import AdminLayout from "./AdminLayout";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { BRAND } from "../../theme/muiTheme";

const P      = BRAND.rose[800];
const BORDER = "#e7e5e4";

const TYPE_CONFIG = {
  order:    { icon: FiPackage,      color: "#8B1A4A", bg: "rgba(139,26,74,0.10)",  label: "Order"     },
  shipped:  { icon: FiTruck,        color: "#0284c7", bg: "rgba(2,132,199,0.10)",  label: "Shipped"   },
  returned: { icon: FiRotateCcw,    color: "#b45309", bg: "rgba(180,83,9,0.10)",   label: "Return"    },
  cancelled:{ icon: FiXCircle,      color: "#dc2626", bg: "rgba(220,38,38,0.10)",  label: "Cancelled" },
  delivered:{ icon: FiCheckCircle,  color: "#16a34a", bg: "rgba(22,163,74,0.10)",  label: "Delivered" },
  default:  { icon: FiBell,         color: "#64748b", bg: "#f1f5f9",               label: "System"    },
};

function getTypeConfig(n) {
  if (!n) return TYPE_CONFIG.default;
  const msg = (n.message || "").toLowerCase();
  if (msg.includes("delivered"))                            return TYPE_CONFIG.delivered;
  if (msg.includes("shipped") || msg.includes("out_for_delivery")) return TYPE_CONFIG.shipped;
  if (msg.includes("return"))                               return TYPE_CONFIG.returned;
  if (msg.includes("cancel"))                               return TYPE_CONFIG.cancelled;
  return TYPE_CONFIG[n.type] || TYPE_CONFIG.default;
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7)  return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

const FILTERS = [
  { key: "all",    label: "All" },
  { key: "unread", label: "Unread" },
  { key: "order",  label: "Orders" },
];

function NotificationRow({ n, onMarkRead, onViewOrder }) {
  const cfg  = getTypeConfig(n);
  const Icon = cfg.icon;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 2,
        px: 2.5,
        py: 2,
        position: "relative",
        bgcolor: n.read ? "transparent" : "rgba(139,26,74,0.025)",
        transition: "background 150ms ease",
        "&:hover": { bgcolor: "#fafaf9" },
      }}
    >
      {/* Icon */}
      <Box
        sx={{
          width: 40, height: 40, borderRadius: "10px", flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          bgcolor: cfg.bg, color: cfg.color,
        }}
      >
        <Icon size={18} />
      </Box>

      {/* Body */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: "0.875rem", color: "#1c1917", lineHeight: 1.5, mb: 0.5 }}>
          {n.message}
        </Typography>
        <Typography sx={{ fontSize: "0.75rem", color: "#a8a29e" }}>
          {timeAgo(n.createdAt)}
        </Typography>
      </Box>

      {/* Actions */}
      <Stack direction="row" alignItems="center" gap={0.75} sx={{ flexShrink: 0 }}>
        {n.orderId && (
          <Button
            size="small"
            onClick={() => onViewOrder(n.orderId)}
            endIcon={<FiChevronRight size={13} />}
            sx={{
              fontSize: "0.75rem", fontWeight: 600, textTransform: "none",
              color: P, borderRadius: "8px", px: 1.25, py: 0.5,
              "&:hover": { bgcolor: "rgba(139,26,74,0.08)" },
            }}
          >
            View
          </Button>
        )}
        {!n.read && (
          <Tooltip title="Mark as read" arrow>
            <IconButton
              size="small"
              onClick={() => onMarkRead(n._id)}
              sx={{
                width: 30, height: 30, borderRadius: "8px",
                color: "#64748b", border: `1px solid ${BORDER}`,
                "&:hover": { bgcolor: "rgba(22,163,74,0.08)", color: "#16a34a", borderColor: "#86efac" },
              }}
            >
              <FiCheck size={14} />
            </IconButton>
          </Tooltip>
        )}
      </Stack>

      {/* Unread dot */}
      {!n.read && (
        <Box
          aria-label="Unread"
          sx={{
            position: "absolute", top: 16, left: 8,
            width: 6, height: 6, borderRadius: "50%", bgcolor: P,
          }}
        />
      )}
    </Box>
  );
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [markingAll,    setMarkingAll]    = useState(false);
  const [filter,        setFilter]        = useState("all");
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/admin/notifications");
      setNotifications(res.data.notifications || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markRead = async (id) => {
    try {
      await api.put(`/api/admin/notifications/${id}/read`, {});
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, read: true } : n));
    } catch { /* ignore */ }
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    try {
      const unread = notifications.filter((n) => !n.read);
      await Promise.all(unread.map((n) => api.put(`/api/admin/notifications/${n._id}/read`, {})));
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch { /* ignore */ }
    finally { setMarkingAll(false); }
  };

  const handleViewOrder = (orderId) => {
    navigate("/admin/orders", { state: { openOrderId: orderId } });
  };

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const filtered = useMemo(() => {
    if (filter === "unread") return notifications.filter((n) => !n.read);
    if (filter === "order")  return notifications.filter((n) => n.type === "order" || n.orderId);
    return notifications;
  }, [notifications, filter]);

  const countFor = (key) => {
    if (key === "unread") return unreadCount;
    if (key === "order")  return notifications.filter((n) => n.type === "order" || n.orderId).length;
    return notifications.length;
  };

  return (
    <AdminLayout>
      {/* ── Page header ─────────────────────────────────────────────── */}
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between"
        flexWrap="wrap" gap={2} sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" gap={1.5}>
          <Box sx={{
            width: 44, height: 44, borderRadius: "12px",
            bgcolor: "rgba(139,26,74,0.10)", color: P,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, position: "relative",
          }}>
            <FiBell size={20} />
            {unreadCount > 0 && (
              <Chip
                label={unreadCount > 99 ? "99+" : unreadCount}
                size="small"
                sx={{
                  position: "absolute", top: -6, right: -6,
                  height: 18, fontSize: "0.6rem", fontWeight: 800,
                  bgcolor: P, color: "#fff", px: 0.25,
                  "& .MuiChip-label": { px: 0.5 },
                }}
              />
            )}
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#1c1917", lineHeight: 1.2 }}>
              Notifications
            </Typography>
            <Typography variant="body2" sx={{ color: "#57534e", mt: 0.25 }}>
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
                : "All caught up!"}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" gap={1}>
          <Button
            size="small"
            startIcon={loading ? <CircularProgress size={13} color="inherit" /> : <FiRefreshCw size={14} />}
            onClick={fetchNotifications}
            disabled={loading}
            sx={{
              textTransform: "none", fontWeight: 600, fontSize: "0.8125rem",
              color: "#57534e", borderRadius: "10px", px: 1.75, py: 0.875,
              border: `1px solid ${BORDER}`,
              "&:hover": { bgcolor: "#f5f5f5", borderColor: "#d4d4d4" },
            }}
          >
            Refresh
          </Button>
          {unreadCount > 0 && (
            <Button
              size="small"
              variant="contained"
              startIcon={markingAll ? <CircularProgress size={13} color="inherit" /> : <FiCheckCircle size={14} />}
              onClick={markAllRead}
              disabled={markingAll}
              sx={{
                textTransform: "none", fontWeight: 600, fontSize: "0.8125rem",
                borderRadius: "10px", px: 1.75, py: 0.875,
                bgcolor: P, "&:hover": { bgcolor: BRAND.rose[900] },
                boxShadow: "none",
              }}
            >
              {markingAll ? "Marking…" : "Mark all read"}
            </Button>
          )}
        </Stack>
      </Stack>

      {/* ── Filter tabs ─────────────────────────────────────────────── */}
      <Stack direction="row" gap={0.75} sx={{ mb: 2.5 }}>
        {FILTERS.map((f) => {
          const active = filter === f.key;
          const count  = countFor(f.key);
          return (
            <Box
              key={f.key}
              component="button"
              onClick={() => setFilter(f.key)}
              sx={{
                display: "inline-flex", alignItems: "center", gap: 0.75,
                px: 1.5, py: 0.625, borderRadius: "20px",
                border: `1.5px solid ${active ? P : BORDER}`,
                bgcolor: active ? P : "#fff",
                color: active ? "#fff" : "#57534e",
                cursor: "pointer", fontFamily: "inherit",
                fontSize: "0.8125rem", fontWeight: active ? 700 : 500,
                transition: "all 140ms",
                "&:hover": { borderColor: P, color: active ? "#fff" : P },
              }}
            >
              {f.label}
              {count > 0 && (
                <Box component="span" sx={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  minWidth: 18, height: 18, borderRadius: "9px", px: 0.5,
                  bgcolor: active ? "rgba(255,255,255,0.25)" : "rgba(139,26,74,0.10)",
                  color: active ? "#fff" : P,
                  fontSize: "0.65rem", fontWeight: 800,
                }}>
                  {count}
                </Box>
              )}
            </Box>
          );
        })}
      </Stack>

      {/* ── List card ───────────────────────────────────────────────── */}
      <Paper elevation={0} sx={{ border: `1px solid ${BORDER}`, borderRadius: "14px", overflow: "hidden" }}>
        {loading ? (
          <Box sx={{ p: 2.5 }}>
            {[1, 2, 3, 4].map((i) => (
              <Stack key={i} direction="row" gap={2} sx={{ mb: i < 4 ? 2.5 : 0 }}>
                <Skeleton variant="rounded" width={40} height={40} sx={{ borderRadius: "10px", flexShrink: 0 }} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton width="75%" height={16} sx={{ mb: 1 }} />
                  <Skeleton width="30%" height={12} />
                </Box>
              </Stack>
            ))}
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8, px: 3 }}>
            <Box sx={{
              width: 64, height: 64, borderRadius: "50%", mx: "auto", mb: 2,
              bgcolor: "rgba(139,26,74,0.06)",
              display: "flex", alignItems: "center", justifyContent: "center", color: P,
            }}>
              <FiInbox size={28} />
            </Box>
            <Typography sx={{ fontWeight: 700, color: "#1c1917", mb: 0.5 }}>
              {filter === "unread" ? "No unread notifications" : "No notifications yet"}
            </Typography>
            <Typography variant="body2" sx={{ color: "#a8a29e" }}>
              {filter === "unread" ? "You're all caught up." : "New activity will appear here."}
            </Typography>
          </Box>
        ) : (
          filtered.map((n, idx) => (
            <React.Fragment key={n._id}>
              <NotificationRow n={n} onMarkRead={markRead} onViewOrder={handleViewOrder} />
              {idx < filtered.length - 1 && <Divider sx={{ borderColor: BORDER }} />}
            </React.Fragment>
          ))
        )}
      </Paper>

      {filtered.length > 0 && (
        <Stack direction="row" alignItems="center" gap={0.75} sx={{ mt: 2 }}>
          <FiAlertCircle size={13} color="#a8a29e" />
          <Typography sx={{ fontSize: "0.75rem", color: "#a8a29e" }}>
            Notifications are retained for 30 days.
          </Typography>
        </Stack>
      )}
    </AdminLayout>
  );
}
