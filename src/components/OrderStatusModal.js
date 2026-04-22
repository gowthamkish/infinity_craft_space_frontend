import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./OrderStatusModal.css";

const STATUS_CONFIG = {
  confirmed:        { emoji: "✅", label: "Order Confirmed",     color: "#10b981", bg: "#ecfdf5", desc: "Your order has been confirmed and is being prepared." },
  processing:       { emoji: "⏳", label: "Order in Progress",   color: "#6366f1", bg: "#eef2ff", desc: "Our team is carefully packing your items." },
  shipped:          { emoji: "🚚", label: "Order Shipped",       color: "#3b82f6", bg: "#eff6ff", desc: "Your order is on its way to you!" },
  out_for_delivery: { emoji: "🛵", label: "Out for Delivery",    color: "#f59e0b", bg: "#fffbeb", desc: "Your order will be delivered today." },
  delivered:        { emoji: "🎉", label: "Order Delivered",     color: "#10b981", bg: "#ecfdf5", desc: "Your order has been delivered. Enjoy!" },
  cancelled:        { emoji: "❌", label: "Order Cancelled",     color: "#ef4444", bg: "#fef2f2", desc: "Your order has been cancelled." },
  returned:         { emoji: "🔄", label: "Return Initiated",    color: "#f59e0b", bg: "#fffbeb", desc: "Your return request is being processed." },
};

export default function OrderStatusModal({ event, onClose }) {
  const navigate = useNavigate();
  const timerRef = useRef(null);
  const progressRef = useRef(null);

  const { order, previousStatus } = event || {};
  const cfg = STATUS_CONFIG[order?.status];

  useEffect(() => {
    if (!cfg) return;
    // Auto-close after 10 seconds
    timerRef.current = setTimeout(onClose, 10_000);
    // Animate progress bar
    if (progressRef.current) {
      progressRef.current.style.transition = "width 10s linear";
      requestAnimationFrame(() => {
        if (progressRef.current) progressRef.current.style.width = "0%";
      });
    }
    return () => clearTimeout(timerRef.current);
  }, [cfg, onClose]);

  if (!order || !cfg) return null;

  const shortId = order._id?.toString().slice(-6).toUpperCase();
  const prevCfg = previousStatus ? STATUS_CONFIG[previousStatus] : null;

  return (
    <div className="osm-backdrop" onClick={onClose}>
      <div
        className="osm-panel"
        style={{ "--osm-color": cfg.color, "--osm-bg": cfg.bg }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress bar */}
        <div className="osm-progress-track">
          <div ref={progressRef} className="osm-progress-bar" style={{ width: "100%" }} />
        </div>

        {/* Close button */}
        <button className="osm-close" onClick={onClose} aria-label="Close">×</button>

        {/* Icon */}
        <div className="osm-emoji-wrap">
          <span className="osm-emoji">{cfg.emoji}</span>
        </div>

        {/* Content */}
        <div className="osm-body">
          <p className="osm-tag">Order Update</p>
          <h2 className="osm-title">{cfg.label}</h2>
          <p className="osm-desc">{cfg.desc}</p>

          {/* Status transition pill */}
          <div className="osm-transition">
            {prevCfg && (
              <>
                <span className="osm-status osm-status--prev">
                  {prevCfg.emoji} {previousStatus.replace(/_/g, " ")}
                </span>
                <span className="osm-arrow">→</span>
              </>
            )}
            <span className="osm-status osm-status--curr" style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.color }}>
              {cfg.emoji} {order.status.replace(/_/g, " ")}
            </span>
          </div>

          {/* Order ID */}
          <p className="osm-order-id">Order #{shortId}</p>

          {/* Actions */}
          <div className="osm-actions">
            <button
              className="osm-btn osm-btn--primary"
              style={{ background: cfg.color }}
              onClick={() => { navigate(`/orders`); onClose(); }}
            >
              View Order
            </button>
            <button className="osm-btn osm-btn--ghost" onClick={onClose}>
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
