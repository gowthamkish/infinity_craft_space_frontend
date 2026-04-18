import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
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
  confirmed:       "✅",
  processing:      "⏳",
  shipped:         "🚚",
  out_for_delivery:"🛵",
  delivered:       "🏠",
  cancelled:       "❌",
  returned:        "🔄",
  pending:         "🕐",
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

  const [order, setOrder]       = useState(null);
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]       = useState(null);
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
            "Failed to fetch tracking information. Please try again."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [orderId]
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
        <Container className="mt-4">
          <div className="to-card">
            <div className="to-card-body">
              <div className="to-skeleton" style={{ height: 100, marginBottom: 16 }} />
              <div className="to-skeleton" style={{ height: 200 }} />
            </div>
          </div>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className="to-page">
        <Header />
        <Container className="mt-5">
          <div
            style={{
              textAlign: "center",
              padding: "3rem 1rem",
              background: "white",
              borderRadius: 16,
              boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>😕</div>
            <h4 style={{ color: "#1e293b" }}>Could not load tracking</h4>
            <p style={{ color: "#64748b", marginBottom: "1.5rem" }}>{error}</p>
            <button
              className="to-refresh-btn"
              onClick={() => fetchTracking()}
              style={{ margin: "0 auto" }}
            >
              <FiRefreshCw size={15} /> Try again
            </button>
            <br />
            <button
              className="to-refresh-btn"
              onClick={() => navigate("/orders")}
              style={{ margin: "1rem auto 0" }}
            >
              <FiArrowLeft size={15} /> Back to Orders
            </button>
          </div>
        </Container>
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

      <Container className="mt-4 mb-5">
        {/* ── Action row ── */}
        <div
          className="d-flex justify-content-between align-items-center mb-3 flex-wrap"
          style={{ gap: "0.5rem" }}
        >
          <button
            className="to-refresh-btn"
            onClick={() => navigate("/orders")}
          >
            <FiArrowLeft size={15} /> My Orders
          </button>

          <div className="d-flex align-items-center gap-2">
            {lastUpdated && (
              <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                Updated {lastUpdated.toLocaleTimeString("en-IN")}
              </span>
            )}
            <button
              className="to-refresh-btn"
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

        <Row className="g-3">
          {/* ── Left: Tracking ── */}
          <Col lg={8}>
            {/* Order status card */}
            <div className="to-card mb-3">
              <div
                className="to-card-header"
                style={{
                  background: "linear-gradient(135deg, #0f172a, #1e293b)",
                }}
              >
                <FiPackage size={16} />
                Shipment Status
              </div>
              <div className="to-card-body">
                <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
                  <div className={badgeClass}>
                    {STATUS_ICON[status] || "📦"}{" "}
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </div>
                  {order?.estimatedDelivery && (
                    <span style={{ fontSize: "0.85rem", color: "#475569" }}>
                      Est. delivery:{" "}
                      <strong>{fmtDate(order.estimatedDelivery)}</strong>
                    </span>
                  )}
                </div>
                <TrackingTimeline order={order} tracking={tracking} />
              </div>
            </div>
          </Col>

          {/* ── Right: Order Summary ── */}
          <Col lg={4}>
            {/* Shipping address */}
            <div className="to-card mb-3">
              <div
                className="to-card-header"
                style={{
                  background: "linear-gradient(135deg, #f59e0b, #d97706)",
                }}
              >
                <FiMapPin size={16} />
                Delivery Address
              </div>
              <div className="to-card-body">
                {order?.shippingAddress ? (
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.875rem",
                      lineHeight: 1.7,
                      color: "#475569",
                    }}
                  >
                    {order.shippingAddress.street}
                    <br />
                    {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                    {order.shippingAddress.zipCode}
                    <br />
                    {order.shippingAddress.country}
                    <br />
                    <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>
                      📞 {order.shippingAddress.phone || "Phone not provided"}
                    </span>
                  </p>
                ) : (
                  <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.875rem" }}>
                    Address details not available.
                  </p>
                )}
              </div>
            </div>

            {/* Order items summary */}
            <div className="to-card">
              <div
                className="to-card-header"
                style={{
                  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                }}
              >
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
                    <span className="to-meta-value" style={{ color: "#059669" }}>
                      {fmtCurrency(order?.totalAmount)}
                    </span>
                  </div>
                  {order?.shiprocket?.courierName && (
                    <div className="to-meta-item">
                      <span className="to-meta-label">Courier</span>
                      <span className="to-meta-value">
                        {order.shiprocket.courierName}
                      </span>
                    </div>
                  )}
                  {order?.shiprocket?.awbCode && (
                    <div className="to-meta-item">
                      <span className="to-meta-label">AWB / Tracking #</span>
                      <span
                        className="to-meta-value"
                        style={{
                          fontFamily: "monospace",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {order.shiprocket.awbCode}
                      </span>
                    </div>
                  )}
                </div>

                {order?.shiprocket?.trackingUrl && (
                  <a
                    href={order.shiprocket.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "block",
                      marginTop: "1rem",
                      padding: "0.6rem 1rem",
                      background:
                        "linear-gradient(135deg, #10b981, #059669)",
                      color: "white",
                      borderRadius: 10,
                      textAlign: "center",
                      textDecoration: "none",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                    }}
                  >
                    Track on Shiprocket ↗
                  </a>
                )}

                <button
                  onClick={() => navigate("/orders")}
                  style={{
                    display: "block",
                    width: "100%",
                    marginTop: "0.75rem",
                    padding: "0.6rem 1rem",
                    background: "transparent",
                    border: "1.5px solid #e2e8f0",
                    color: "#475569",
                    borderRadius: 10,
                    fontWeight: 500,
                    fontSize: "0.875rem",
                    cursor: "pointer",
                  }}
                >
                  ← View All Orders
                </button>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
