import React, { useMemo } from "react";
import "./TrackingTimeline.css";

const STAGES = [
  {
    key: "confirmed",
    label: "Order\nConfirmed",
    icon: "✅",
    microcopy: "Your order has been placed and confirmed.",
  },
  {
    key: "processing",
    label: "Processing",
    icon: "📦",
    microcopy: "Your order is being packed and prepared.",
  },
  {
    key: "shipped",
    label: "Shipped",
    icon: "🚚",
    microcopy: "Your order is on its way!",
  },
  {
    key: "out_for_delivery",
    label: "Out for\nDelivery",
    icon: "🛵",
    microcopy: "Out for delivery today — keep your phone handy!",
  },
  {
    key: "delivered",
    label: "Delivered",
    icon: "🏠",
    microcopy: "Your order has been delivered. Enjoy!",
  },
];

const STAGE_RANK = {
  confirmed: 0,
  processing: 1,
  shipped: 2,
  out_for_delivery: 3,
  delivered: 4,
};

function fmtDate(raw) {
  if (!raw) return "—";
  try {
    return new Date(raw).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return raw;
  }
}

function fmtDateShort(raw) {
  if (!raw) return "—";
  try {
    return new Date(raw).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return raw;
  }
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) return "today";
  if (days === 1) return "tomorrow";
  return `in ${days} days`;
}

export default function TrackingTimeline({ order, tracking }) {
  const isCancelled = order?.status === "cancelled";
  const isReturned  = order?.status === "returned";

  const currentRank = useMemo(() => {
    if (isCancelled || isReturned) return -1;
    return STAGE_RANK[order?.status] ?? -1;
  }, [order?.status, isCancelled, isReturned]);

  const fillPct = useMemo(() => {
    if (currentRank < 0) return 0;
    return (currentRank / (STAGES.length - 1)) * 100;
  }, [currentRank]);

  function stepState(stage) {
    if (isCancelled) return "cancelled";
    const rank = STAGE_RANK[stage.key] ?? 99;
    if (rank < currentRank) return "done";
    if (rank === currentRank) return "active";
    return "pending";
  }

  const currentStage = STAGES.find((s) => s.key === order?.status);

  const activities = useMemo(() => {
    if (tracking?.activities?.length) return tracking.activities;
    if (order?.timeline?.length) {
      return [...order.timeline]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .map((t) => ({
          activity: t.title || t.status,
          location: t.metadata?.location || "",
          date: t.timestamp,
          statusLabel: t.description || "",
        }));
    }
    return [];
  }, [tracking, order]);

  const sr = order?.shiprocket || {};
  const awb = sr.awbCode || tracking?.awbCode;
  const courier = sr.courierName || tracking?.courierName;
  const etd = sr.etd || tracking?.etd || order?.estimatedDelivery;
  const trackUrl = sr.trackingUrl;
  const status = tracking?.currentStatus || order?.status || "—";
  const etdCountdown = daysUntil(etd);

  const infoBarClass = useMemo(() => {
    if (isCancelled) return "tt-info-bar tt-info-bar--cancelled";
    if (order?.status === "delivered") return "tt-info-bar tt-info-bar--delivered";
    if (order?.status === "out_for_delivery") return "tt-info-bar tt-info-bar--ofd";
    if (order?.status === "shipped") return "tt-info-bar tt-info-bar--shipped";
    return "tt-info-bar";
  }, [order?.status, isCancelled]);

  return (
    <div>
      {/* ── Progress bar ── */}
      {!isCancelled && !isReturned && (
        <>
          <div className="tt-progress-wrap">
            <div className="tt-progress-track">
              <div className="tt-progress-fill" style={{ width: `${fillPct}%` }} />
            </div>
            {STAGES.map((stage) => {
              const state = stepState(stage);
              return (
                <div key={stage.key} className="tt-step">
                  <div className={`tt-step-dot tt-step-dot--${state}`}>
                    {stage.icon}
                  </div>
                  <span
                    className={`tt-step-label tt-step-label--${state}`}
                    style={{ whiteSpace: "pre-line" }}
                  >
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* ── Microcopy for current status ── */}
          {currentStage && (
            <div className="tt-microcopy">
              <span className="tt-microcopy-icon">{currentStage.icon}</span>
              <span>{currentStage.microcopy}</span>
              {etd && order?.status !== "delivered" && (
                <span className="tt-microcopy-eta">
                  {" "}
                  Estimated delivery: <strong>{fmtDateShort(etd)}</strong>
                  {etdCountdown && ` (${etdCountdown})`}
                </span>
              )}
            </div>
          )}
        </>
      )}

      {isCancelled && (
        <div className="tt-alert tt-alert--cancelled">
          ❌ This order has been cancelled
        </div>
      )}

      {isReturned && (
        <div className="tt-alert tt-alert--returned">
          🔄 Return pickup has been scheduled
        </div>
      )}

      {/* ── Info bar (AWB, courier, ETA) ── */}
      {(awb || courier || etd) && (
        <div className={infoBarClass}>
          {awb && (
            <div className="tt-info-item">
              <span className="tt-info-label">Tracking ID (AWB)</span>
              <span className="tt-info-value tt-info-mono">
                {awb}
                <button
                  className="tt-copy-btn"
                  onClick={() => navigator.clipboard?.writeText(awb)}
                  title="Copy AWB"
                >
                  📋
                </button>
              </span>
            </div>
          )}
          {courier && (
            <div className="tt-info-item">
              <span className="tt-info-label">Courier Partner</span>
              <span className="tt-info-value">{courier}</span>
            </div>
          )}
          {etd && (
            <div className="tt-info-item">
              <span className="tt-info-label">Estimated Delivery</span>
              <span className="tt-info-value">
                {fmtDateShort(etd)}
                {etdCountdown && order?.status !== "delivered" && (
                  <span className="tt-info-eta"> ({etdCountdown})</span>
                )}
              </span>
            </div>
          )}
          {status && (
            <div className="tt-info-item">
              <span className="tt-info-label">Current Status</span>
              <span className="tt-info-value">{status}</span>
            </div>
          )}
          {trackUrl && (
            <div className="tt-info-item">
              <span className="tt-info-label">Track on Shiprocket</span>
              <span className="tt-info-value">
                <a href={trackUrl} target="_blank" rel="noopener noreferrer">
                  Open tracking ↗
                </a>
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Activity timeline ── */}
      {activities.length > 0 ? (
        <div className="tt-activities">
          {activities.map((act, idx) => (
            <div key={idx} className="tt-activity">
              <div className="tt-activity-left">
                <div
                  className={`tt-activity-dot ${
                    idx === 0 ? "tt-activity-dot--first" : ""
                  }`}
                />
                {idx < activities.length - 1 && (
                  <div className="tt-activity-line" />
                )}
              </div>
              <div className="tt-activity-right">
                <div className="tt-activity-status">
                  {act.statusLabel || act.activity}
                </div>
                {act.location && (
                  <div className="tt-activity-location">📍 {act.location}</div>
                )}
                <div className="tt-activity-date">{fmtDate(act.date)}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="tt-empty">
          <div className="tt-empty-icon">📦</div>
          <p style={{ margin: 0, fontSize: "0.9rem" }}>
            {order?.shiprocket?.shipmentId
              ? "Tracking updates will appear here once the shipment is in transit."
              : "Shipment details will be available once your order is dispatched."}
          </p>
        </div>
      )}
    </div>
  );
}
