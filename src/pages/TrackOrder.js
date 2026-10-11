import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";
import { useSelector } from "react-redux";
import {
  FiRefreshCw,
  FiArrowLeft,
  FiPackage,
  FiMapPin,
  FiShoppingBag,
} from "react-icons/fi";
import Header from "../components/Header";
import TrackingTimeline from "../components/TrackingTimeline";
import api from "../api/axios";
import "./TrackOrder.css";

const STATUS_ICON = {
  confirmed: "✅",
  processing: "⏳",
  shipped: "🚚",
  out_for_delivery: "🛵",
  delivered: "🏠",
  cancelled: "❌",
  returned: "🔄",
  pending: "🕐",
};

function fmtCurrency(n) {
  return `₹${Number(n || 0).toFixed(2)}`;
}

function fmtDate(raw) {
  if (!raw) return "—";
  return new Date(raw).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function TrackOrder() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);

  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchTracking = useCallback(
    async (isRefresh = false) => {
      if (!orderId) return;
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const res = await api.get(`/api/shipping/track/${orderId}`);
        setOrder(res.data.order);
        setTracking(res.data.tracking);
        setLastUpdated(new Date());
      } catch (err) {
        setError(
          err.response?.data?.error ||
            "Failed to fetch tracking information. Please try again.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [orderId],
  );

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchTracking();
  }, [orderId, user, fetchTracking, navigate]);

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="to-page">
        <Header />
        <div className="to-hero">
          <div className="to-hero-icon">🚚</div>
          <h1>Track Your Order</h1>
          <p>Loading shipment details…</p>
        </div>
        <div className="to-container">
          <div className="to-card">
            <div className="to-card-body">
              <div className="to-skeleton" style={{ height: 100, marginBottom: 24 }} />
              <div className="to-skeleton" style={{ height: 200 }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="to-page">
        <Header />
        <div className="to-container to-container--narrow">
          <div className="to-card to-error">
            <div className="to-error-emoji">😕</div>
            <h2>Could not load tracking</h2>
            <p>{error}</p>
            <div className="to-error-actions">
              <button className="to-btn to-btn--primary" onClick={() => fetchTracking()}>
                <FiRefreshCw size={15} /> Try again
              </button>
              <button className="to-btn" onClick={() => navigate("/orders")}>
                <FiArrowLeft size={15} /> Back to Orders
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const status = order?.status || "pending";
  const badgeClass = `to-status-badge to-status-badge--${status}`;

  return (
    <div className="to-page">
      <Header />

      <div className="to-hero">
        <div className="to-hero-icon">🚚</div>
        <h1>Track Your Order</h1>
        <p>Order #{String(orderId).slice(-8).toUpperCase()}</p>
      </div>

      <div className="to-container">
        {/* ── Action row ── */}
        <div className="to-actions">
          <button
            className="to-btn"
            onClick={() => navigate("/orders")}
          >
            <FiArrowLeft size={15} /> My Orders
          </button>

          <div className="to-actions-right">
            {lastUpdated && (
              <span className="to-updated">Updated {lastUpdated.toLocaleTimeString("en-IN")}</span>
            )}
            <button
              className="to-btn"
              onClick={() => fetchTracking(true)}
              disabled={refreshing}
            >
              <FiRefreshCw
                size={14}
                className={refreshing ? "to-refresh-btn--loading" : ""}
              />
              {refreshing ? "Refreshing…" : "Refresh"}
            </button>
          </div>
        </div>

        <Grid container spacing={3}>
          {/* ── Left: Tracking ── */}
          <Grid size={{ xs: 12, lg: 8 }}>
            {/* Order status card */}
            <div className="to-card">
              <div className="to-card-header to-card-header--dark">
                <FiPackage size={16} />
                Shipment Status
              </div>
              <div className="to-card-body">
                <div className="to-status-row">
                  <div className={badgeClass}>
                    {STATUS_ICON[status] || "📦"}{" "}
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </div>
                  {order?.estimatedDelivery && (
                    <span className="to-eta">
                      Est. delivery: <strong>{fmtDate(order.estimatedDelivery)}</strong>
                    </span>
                  )}
                </div>
                <TrackingTimeline order={order} tracking={tracking} />
              </div>
            </div>
          </Grid>

          {/* ── Right: Order Summary ── */}
          <Grid size={{ xs: 12, lg: 4 }}>
            {/* Shipping address */}
            <div className="to-card">
              <div className="to-card-header to-card-header--ember">
                <FiMapPin size={16} />
                Delivery Address
              </div>
              <div className="to-card-body">
                {order?.shippingAddress ? (
                  <address className="to-address">
                    <span>{order.shippingAddress.street}</span>
                    <span>
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                    </span>
                    <span>{order.shippingAddress.country}</span>
                    <span className="to-address-phone">📞 {order.shippingAddress.phone || "Phone not provided"}</span>
                  </address>
                ) : (
                  <p className="to-muted">Address details not available.</p>
                )}
              </div>
            </div>

            {/* Order items summary */}
            <div className="to-card">
              <div className="to-card-header to-card-header--teal">
                <FiShoppingBag size={16} />
                Order Summary
              </div>
              <div className="to-card-body">
                <div className="to-order-meta">
                  <div className="to-meta-item">
                    <span className="to-meta-label">Order placed</span>
                    <span className="to-meta-value">
                      {fmtDate(order?.createdAt)}
                    </span>
                  </div>
                  <div className="to-meta-item">
                    <span className="to-meta-label">Total amount</span>
                    <span className="to-meta-value to-meta-value--total">
                      {fmtCurrency(order?.totalAmount)}
                    </span>
                  </div>
                  {/* Shiprocket courier/AWB display — re-enable when integrated */}
                </div>

                <button className="to-btn to-btn--block" onClick={() => navigate("/orders")}>
                  <FiArrowLeft size={15} /> View all orders
                </button>
              </div>
            </div>
          </Grid>
        </Grid>
      </div>
    </div>
  );
}
