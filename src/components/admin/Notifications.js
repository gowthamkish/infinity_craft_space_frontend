import React, { useEffect, useState, useMemo } from "react";
import {
  FiBell, FiCheck, FiCheckCircle, FiPackage, FiRefreshCw,
  FiFilter, FiInbox, FiChevronRight, FiAlertCircle, FiTruck,
  FiRotateCcw, FiXCircle,
} from "react-icons/fi";
import AdminLayout from "./AdminLayout";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import "./admin.css";
import "./Notifications.css";

// ── Notification type config ──────────────────────────────────────────────────
const TYPE_CONFIG = {
  order:    { icon: FiPackage,     color: "var(--adm-primary)",  bg: "var(--adm-primary-glow)", label: "Order" },
  shipped:  { icon: FiTruck,      color: "var(--adm-info)",     bg: "var(--adm-info-bg)",      label: "Shipped" },
  returned: { icon: FiRotateCcw,  color: "var(--adm-warning)",  bg: "var(--adm-warning-bg)",   label: "Return" },
  cancelled:{ icon: FiXCircle,    color: "var(--adm-danger)",   bg: "var(--adm-danger-bg)",    label: "Cancelled" },
  delivered:{ icon: FiCheckCircle,color: "var(--adm-success)",  bg: "var(--adm-success-bg)",   label: "Delivered" },
  default:  { icon: FiBell,       color: "var(--adm-text-secondary)", bg: "#f1f5f9",            label: "System" },
};

function getTypeConfig(n) {
  if (!n) return TYPE_CONFIG.default;
  const msg = (n.message || "").toLowerCase();
  if (msg.includes("delivered")) return TYPE_CONFIG.delivered;
  if (msg.includes("shipped") || msg.includes("out_for_delivery")) return TYPE_CONFIG.shipped;
  if (msg.includes("return")) return TYPE_CONFIG.returned;
  if (msg.includes("cancel")) return TYPE_CONFIG.cancelled;
  return TYPE_CONFIG[n.type] || TYPE_CONFIG.default;
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

// ── Filter tabs ───────────────────────────────────────────────────────────────
const FILTERS = [
  { key: "all",    label: "All" },
  { key: "unread", label: "Unread" },
  { key: "order",  label: "Orders" },
];

// ── Single notification row ───────────────────────────────────────────────────
function NotificationRow({ n, onMarkRead, onViewOrder }) {
  const cfg = getTypeConfig(n);
  const Icon = cfg.icon;

  return (
    <div className={`ntf-row ${!n.read ? "ntf-row--unread" : ""}`}>
      <div className="ntf-row__icon-wrap" style={{ background: cfg.bg, color: cfg.color }}>
        <Icon size={18} />
      </div>

      <div className="ntf-row__body">
        <p className="ntf-row__msg">{n.message}</p>
        <span className="ntf-row__time">{timeAgo(n.createdAt)}</span>
      </div>

      <div className="ntf-row__actions">
        {n.orderId && (
          <button className="ntf-btn ntf-btn--view" onClick={() => onViewOrder(n.orderId)}>
            View <FiChevronRight size={14} />
          </button>
        )}
        {!n.read && (
          <button className="ntf-btn ntf-btn--read" onClick={() => onMarkRead(n._id)} title="Mark as read">
            <FiCheck size={15} />
          </button>
        )}
      </div>

      {!n.read && <span className="ntf-row__dot" aria-label="Unread" />}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/admin/notifications");
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markRead = async (id) => {
    try {
      await api.put(`/api/admin/notifications/${id}/read`, {});
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error("Failed to mark read", err);
    }
  };

  const markAllRead = async () => {
    setMarkingAllRead(true);
    try {
      const unread = notifications.filter((n) => !n.read);
      await Promise.all(unread.map((n) => api.put(`/api/admin/notifications/${n._id}/read`, {})));
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to mark all read", err);
    } finally {
      setMarkingAllRead(false);
    }
  };

  const handleViewOrder = (orderId) => {
    navigate("/admin/orders", { state: { openOrderId: orderId } });
  };

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const filtered = useMemo(() => {
    if (filter === "unread") return notifications.filter((n) => !n.read);
    if (filter === "order") return notifications.filter((n) => n.type === "order" || n.orderId);
    return notifications;
  }, [notifications, filter]);

  return (
    <AdminLayout>
      <div className="ntf-page">
        {/* ── Header ── */}
        <div className="ntf-header">
          <div className="ntf-header__left">
            <div className="ntf-header__icon-wrap">
              <FiBell size={22} />
              {unreadCount > 0 && (
                <span className="ntf-header__badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
              )}
            </div>
            <div>
              <h1 className="ntf-header__title">Notifications</h1>
              <p className="ntf-header__sub">
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}` : "All caught up!"}
              </p>
            </div>
          </div>

          <div className="ntf-header__right">
            <button className="ntf-action-btn ntf-action-btn--ghost" onClick={fetchNotifications} disabled={loading}>
              <FiRefreshCw size={15} className={loading ? "ntf-spin" : ""} />
              Refresh
            </button>
            {unreadCount > 0 && (
              <button className="ntf-action-btn ntf-action-btn--primary" onClick={markAllRead} disabled={markingAllRead}>
                <FiCheckCircle size={15} />
                {markingAllRead ? "Marking…" : "Mark all read"}
              </button>
            )}
          </div>
        </div>

        {/* ── Filter tabs ── */}
        <div className="ntf-filters">
          {FILTERS.map((f) => {
            const count = f.key === "unread"
              ? unreadCount
              : f.key === "order"
              ? notifications.filter((n) => n.type === "order" || n.orderId).length
              : notifications.length;
            return (
              <button
                key={f.key}
                className={`ntf-filter-tab ${filter === f.key ? "ntf-filter-tab--active" : ""}`}
                onClick={() => setFilter(f.key)}
              >
                <FiFilter size={13} />
                {f.label}
                <span className="ntf-filter-tab__count">{count}</span>
              </button>
            );
          })}
        </div>

        {/* ── List ── */}
        <div className="ntf-list-card">
          {loading ? (
            <div className="ntf-state">
              <div className="ntf-skeleton-wrap">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="ntf-skeleton">
                    <div className="ntf-skeleton__icon" />
                    <div className="ntf-skeleton__body">
                      <div className="ntf-skeleton__line ntf-skeleton__line--wide" />
                      <div className="ntf-skeleton__line ntf-skeleton__line--narrow" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="ntf-state ntf-state--empty">
              <div className="ntf-empty-icon">
                <FiInbox size={40} />
              </div>
              <p className="ntf-empty-title">
                {filter === "unread" ? "No unread notifications" : "No notifications yet"}
              </p>
              <p className="ntf-empty-sub">
                {filter === "unread"
                  ? "You're all caught up."
                  : "New activity will appear here."}
              </p>
            </div>
          ) : (
            <div className="ntf-list">
              {filtered.map((n) => (
                <NotificationRow
                  key={n._id}
                  n={n}
                  onMarkRead={markRead}
                  onViewOrder={handleViewOrder}
                />
              ))}
            </div>
          )}
        </div>

        {filtered.length > 0 && (
          <p className="ntf-footer-hint">
            <FiAlertCircle size={13} /> Notifications are retained for 30 days.
          </p>
        )}
      </div>
    </AdminLayout>
  );
}
