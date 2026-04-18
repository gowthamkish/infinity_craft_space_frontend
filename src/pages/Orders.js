import { useEffect, useState, useMemo, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { Alert, Pagination } from "react-bootstrap";
import { OrbitLoader } from "../components/Loader";
import { FiPackage, FiSearch, FiShoppingBag, FiTruck, FiRotateCcw, FiX, FiUploadCloud, FiImage } from "react-icons/fi";
import api from "../api/axios";
import SEOHead, { SEO_CONFIG } from "../components/SEOHead";
import { ToastContext } from "../context/ToastContext";
import { getStatusBadgeVariant } from "../utils/statusHelpers";
import { formatDate, formatOrderId } from "../utils/formatters";
import "./Orders.css";

// Statuses where Track Order button is shown
const TRACKABLE_STATUSES = ["confirmed", "processing", "shipped", "delivered"];

// Return window: 3 days after delivery
const RETURN_WINDOW_DAYS = 3;

const RETURN_REASONS = [
  { value: "defective",        label: "Defective / Damaged product" },
  { value: "wrong_item",       label: "Wrong item received" },
  { value: "not_as_described", label: "Not as described" },
  { value: "size_mismatch",    label: "Size mismatch" },
  { value: "quality_issue",    label: "Quality issue" },
  { value: "changed_mind",     label: "Changed my mind" },
  { value: "duplicate_order",  label: "Duplicate order" },
  { value: "other",            label: "Other" },
];

function isReturnEligible(order) {
  if (order.status !== "delivered") return false;
  if (order.hasReturnRequest) return false;
  const deliveredAt = order.deliveredAt || order.updatedAt;
  const daysSince = (Date.now() - new Date(deliveredAt)) / (1000 * 60 * 60 * 24);
  return daysSince <= RETURN_WINDOW_DAYS;
}

function daysLeftToReturn(order) {
  const deliveredAt = order.deliveredAt || order.updatedAt;
  const daysSince = (Date.now() - new Date(deliveredAt)) / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.ceil(RETURN_WINDOW_DAYS - daysSince));
}

// Map Bootstrap badge variants → semantic CSS classes
const STATUS_CLASS_MAP = {
  success:   "delivered",
  primary:   "confirmed",
  warning:   "pending",
  info:      "processing",
  secondary: "shipped",
  danger:    "cancelled",
};

function toLabel(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "Unknown";
}

function StatusBadge({ status }) {
  const variant = getStatusBadgeVariant(status);
  const cls = STATUS_CLASS_MAP[variant] || "unknown";
  return <span className={`status-badge status-badge--${cls}`}>{toLabel(status)}</span>;
}

function TrackButton({ status, onClick }) {
  const isTrackable = TRACKABLE_STATUSES.includes(status);
  const isDelivered = status === "delivered";

  if (!isTrackable) return null;

  return (
    <button
      onClick={!isDelivered ? onClick : undefined}
      disabled={isDelivered}
      title={isDelivered ? "Order already delivered" : "Track your order"}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.35rem",
        padding: "0.4rem 0.85rem",
        background: isDelivered
          ? "linear-gradient(135deg, #94a3b8, #64748b)"
          : "linear-gradient(135deg, #3b82f6, #2563eb)",
        color: "white",
        border: "none",
        borderRadius: "8px",
        fontSize: "0.8rem",
        fontWeight: 600,
        cursor: isDelivered ? "not-allowed" : "pointer",
        opacity: isDelivered ? 0.65 : 1,
        whiteSpace: "nowrap",
        width: "100%",
      }}
    >
      <FiTruck size={13} />
      {isDelivered ? "Delivered" : "Track Order"}
    </button>
  );
}

function ReturnButton({ order, onClick }) {
  if (order.status !== "delivered") return null;

  if (order.hasReturnRequest) {
    return (
      <button
        disabled
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: "0.35rem", padding: "0.4rem 0.85rem",
          background: "linear-gradient(135deg, #a78bfa, #7c3aed)",
          color: "white", border: "none", borderRadius: "8px",
          fontSize: "0.8rem", fontWeight: 600, cursor: "not-allowed",
          opacity: 0.7, whiteSpace: "nowrap", width: "100%", marginTop: "0.4rem",
        }}
        title="Return already requested"
      >
        <FiRotateCcw size={13} /> Return Requested
      </button>
    );
  }

  const eligible = isReturnEligible(order);
  const daysLeft = daysLeftToReturn(order);

  if (!eligible) {
    return (
      <button
        disabled
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: "0.35rem", padding: "0.4rem 0.85rem",
          background: "linear-gradient(135deg, #94a3b8, #64748b)",
          color: "white", border: "none", borderRadius: "8px",
          fontSize: "0.8rem", fontWeight: 600, cursor: "not-allowed",
          opacity: 0.55, whiteSpace: "nowrap", width: "100%", marginTop: "0.4rem",
        }}
        title="Return window has expired (3 days after delivery)"
      >
        <FiRotateCcw size={13} /> Return Expired
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: "0.35rem", padding: "0.4rem 0.85rem",
        background: "linear-gradient(135deg, #f59e0b, #d97706)",
        color: "white", border: "none", borderRadius: "8px",
        fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
        whiteSpace: "nowrap", width: "100%", marginTop: "0.4rem",
      }}
      title={`${daysLeft} day${daysLeft !== 1 ? "s" : ""} left to return`}
    >
      <FiRotateCcw size={13} /> Return ({daysLeft}d left)
    </button>
  );
}

const MAX_IMAGES = 5;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function ReturnModal({ order, onClose, onSuccess }) {
  const [reason, setReason] = useState("");
  const [reasonDetails, setReasonDetails] = useState("");
  const [returnType, setReturnType] = useState("return");
  const [imageFiles, setImageFiles] = useState([]); // File[]
  const [previews, setPreviews] = useState([]);      // object URL strings
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Revoke object URLs on unmount to avoid memory leaks
  useEffect(() => {
    return () => previews.forEach((url) => URL.revokeObjectURL(url));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImageChange = (e) => {
    const selected = Array.from(e.target.files || []);
    const valid = selected.filter((f) => ACCEPTED_TYPES.includes(f.type));
    const combined = [...imageFiles, ...valid].slice(0, MAX_IMAGES);
    setImageFiles(combined);
    setPreviews((prev) => {
      prev.forEach((u) => URL.revokeObjectURL(u));
      return combined.map((f) => URL.createObjectURL(f));
    });
    // reset input so same file can be re-added after removal
    e.target.value = "";
  };

  const removeImage = (idx) => {
    URL.revokeObjectURL(previews[idx]);
    setImageFiles((f) => f.filter((_, i) => i !== idx));
    setPreviews((p) => p.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) { setError("Please select a reason."); return; }
    if (imageFiles.length === 0) { setError("Please upload at least one product image."); return; }
    setSubmitting(true);
    setError(null);
    try {
      const items = (order.items || []).map((item) => ({
        productId: item.product?._id,
        productName: item.product?.name || item.name || "Product",
        quantity: item.quantity,
        reason,
      }));

      const formData = new FormData();
      formData.append("orderId", order._id);
      formData.append("reason", reason);
      formData.append("reasonDetails", reasonDetails);
      formData.append("returnType", returnType);
      formData.append("items", JSON.stringify(items));
      imageFiles.forEach((file) => formData.append("images", file));

      await api.post("/api/returns", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit return request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const daysLeft = daysLeftToReturn(order);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
        zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg-card, #fff)", borderRadius: "16px",
          padding: "1.75rem", width: "100%", maxWidth: "520px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
          maxHeight: "92vh", overflowY: "auto",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <h5 style={{ margin: 0, fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <FiRotateCcw style={{ color: "#f59e0b" }} />
            Request Return / Refund
          </h5>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: "0.25rem", borderRadius: "6px" }}>
            <FiX size={20} />
          </button>
        </div>

        {/* Order summary strip */}
        <div style={{ fontSize: "0.85rem", color: "var(--text-secondary, #64748b)", marginBottom: "1.25rem", padding: "0.75rem 1rem", background: "var(--bg-soft, #f8fafc)", borderRadius: "10px", borderLeft: "4px solid #f59e0b" }}>
          <strong>Order:</strong> {formatOrderId(String(order._id))} &nbsp;·&nbsp;
          <strong>{(order.items || []).length}</strong> item{(order.items || []).length !== 1 ? "s" : ""} &nbsp;·&nbsp;
          <span style={{ color: daysLeft <= 1 ? "#ef4444" : "#16a34a", fontWeight: 600 }}>
            {daysLeft} day{daysLeft !== 1 ? "s" : ""} left to return
          </span>
        </div>

        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "8px", padding: "0.75rem", marginBottom: "1rem", color: "#dc2626", fontSize: "0.85rem" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Return type */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: "0.45rem", fontSize: "0.9rem" }}>
              Return Type <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {[["return", "↩ Return"], ["refund", "💳 Refund"], ["exchange", "🔁 Exchange"]].map(([val, lbl]) => (
                <label
                  key={val}
                  style={{
                    padding: "0.45rem 1rem", borderRadius: "8px", cursor: "pointer",
                    border: `2px solid ${returnType === val ? "#f59e0b" : "var(--border-color, #e2e8f0)"}`,
                    fontSize: "0.85rem", fontWeight: returnType === val ? 700 : 400,
                    background: returnType === val ? "#fef3c7" : "transparent",
                    transition: "all 0.15s",
                  }}
                >
                  <input type="radio" name="returnType" value={val} checked={returnType === val} onChange={() => setReturnType(val)} style={{ display: "none" }} />
                  {lbl}
                </label>
              ))}
            </div>
          </div>

          {/* Reason */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: "0.45rem", fontSize: "0.9rem" }}>
              Reason <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              style={{ width: "100%", padding: "0.6rem 0.85rem", borderRadius: "10px", border: "2px solid var(--border-color, #e2e8f0)", fontSize: "0.9rem", background: "var(--bg-card, #fff)" }}
            >
              <option value="">Select a reason…</option>
              {RETURN_REASONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          {/* Additional details */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: "0.45rem", fontSize: "0.9rem" }}>
              Additional Details <span style={{ color: "var(--text-muted, #94a3b8)", fontWeight: 400 }}>(optional)</span>
            </label>
            <textarea
              value={reasonDetails}
              onChange={(e) => setReasonDetails(e.target.value)}
              rows={2}
              placeholder="Describe the issue in more detail…"
              style={{ width: "100%", padding: "0.6rem 0.85rem", borderRadius: "10px", border: "2px solid var(--border-color, #e2e8f0)", fontSize: "0.9rem", resize: "vertical", fontFamily: "inherit", background: "var(--bg-card, #fff)" }}
            />
          </div>

          {/* Image upload */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: "0.45rem", fontSize: "0.9rem" }}>
              Product Images <span style={{ color: "#ef4444" }}>*</span>
              <span style={{ color: "var(--text-muted, #94a3b8)", fontWeight: 400, marginLeft: "0.4rem" }}>
                (all angles — up to {MAX_IMAGES})
              </span>
            </label>

            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "8px", padding: "0.6rem 0.85rem", marginBottom: "0.75rem", fontSize: "0.82rem", color: "#92400e" }}>
              📸 Please photograph the product from <strong>front, back, sides, and the damaged area</strong>. Our team uses these to validate your return.
            </div>

            {/* Preview grid */}
            {previews.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: "0.5rem", marginBottom: "0.75rem" }}>
                {previews.map((url, idx) => (
                  <div key={idx} style={{ position: "relative", borderRadius: "8px", overflow: "hidden", aspectRatio: "1", border: "2px solid #e2e8f0" }}>
                    <img src={url} alt={`preview-${idx}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      style={{
                        position: "absolute", top: "4px", right: "4px",
                        background: "rgba(0,0,0,0.65)", border: "none",
                        borderRadius: "50%", color: "white", width: "22px", height: "22px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", padding: 0,
                      }}
                    >
                      <FiX size={12} />
                    </button>
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.45)", color: "white", fontSize: "0.65rem", textAlign: "center", padding: "2px 0" }}>
                      {idx === 0 ? "Front" : idx === 1 ? "Back" : idx === 2 ? "Side" : idx === 3 ? "Detail" : "Extra"}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {imageFiles.length < MAX_IMAGES && (
              <label style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: "0.5rem", padding: "0.75rem", borderRadius: "10px",
                border: "2px dashed #d97706", background: "#fffbeb",
                color: "#d97706", fontWeight: 600, fontSize: "0.88rem",
                cursor: "pointer", transition: "all 0.15s",
              }}>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />
                <FiUploadCloud size={18} />
                {imageFiles.length === 0
                  ? "Upload product photos"
                  : `Add more (${imageFiles.length}/${MAX_IMAGES})`}
              </label>
            )}

            {imageFiles.length > 0 && (
              <div style={{ marginTop: "0.4rem", fontSize: "0.78rem", color: "var(--text-muted, #94a3b8)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <FiImage size={12} /> {imageFiles.length} image{imageFiles.length !== 1 ? "s" : ""} selected
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              type="button"
              onClick={onClose}
              style={{ flex: 1, padding: "0.7rem", borderRadius: "10px", border: "2px solid var(--border-color, #e2e8f0)", background: "transparent", fontWeight: 600, cursor: "pointer", fontSize: "0.9rem" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{ flex: 2, padding: "0.7rem", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "white", fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1, fontSize: "0.9rem" }}
            >
              {submitting ? "Submitting…" : "🔄 Submit Return Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Orders() {
  const navigate   = useNavigate();
  const { addToast } = useContext(ToastContext);

  const [orders,       setOrders]      = useState([]);
  const [loading,      setLoading]     = useState(true);
  const [error,        setError]       = useState(null);
  const [search,       setSearch]      = useState("");
  const [currentPage,  setCurrentPage] = useState(1);
  const [pageSize,     setPageSize]    = useState(5);
  const [returnOrder,  setReturnOrder] = useState(null); // order being returned

  // ── Fetch orders ──────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    try {
      const res = await api.get("/api/orders");
      const fetched = res.data.success && Array.isArray(res.data.orders)
        ? res.data.orders
        : [];
      setOrders(fetched);
    } catch {
      setError("Failed to load orders. Please try again later.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ── Derived data ──────────────────────────────────────────────────────────
  const filteredOrders = useMemo(() => {
    if (!search) return orders;
    const q = search.toLowerCase().trim();
    return orders.filter((order) => {
      if (!order) return false;
      if (String(order._id || "").toLowerCase().includes(q)) return true;
      if (String(order.status || "").toLowerCase().includes(q)) return true;
      if (String(order.totalAmount ?? "").includes(q)) return true;
      if (order.shippingAddress) {
        const addr = [
          order.shippingAddress.street, order.shippingAddress.city,
          order.shippingAddress.state,  order.shippingAddress.zipCode,
        ].filter(Boolean).join(" ").toLowerCase();
        if (addr.includes(q)) return true;
      }
      if (Array.isArray(order.items)) {
        for (const item of order.items) {
          if (String(item.product?.name || item.name || "").toLowerCase().includes(q)) return true;
        }
      }
      return false;
    });
  }, [orders, search]);

  const totalPages  = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const current     = Math.min(currentPage, totalPages);
  const pagedOrders = filteredOrders.slice((current - 1) * pageSize, current * pageSize);

  const paginationItems = useMemo(() => {
    const items = [];
    let s = Math.max(1, current - 2);
    let e = Math.min(totalPages, current + 2);
    if (e - s < 4) { s = Math.max(1, e - 4); e = Math.min(totalPages, s + 4); }
    if (s > 1) items.push(<Pagination.Ellipsis key="se" disabled />);
    for (let i = s; i <= e; i++) {
      items.push(
        <Pagination.Item key={i} active={i === current} onClick={() => setCurrentPage(i)}>{i}</Pagination.Item>
      );
    }
    if (e < totalPages) items.push(<Pagination.Ellipsis key="ee" disabled />);
    return items;
  }, [current, totalPages]);

  const handleReturnSuccess = () => {
    setReturnOrder(null);
    addToast("Return request submitted successfully! Our team will review it shortly.", {
      type: "success", title: "🔄 Return Requested", duration: 6000,
    });
    fetchOrders(); // refresh to update hasReturnRequest flag
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <Header />
        <div className="orders-page">
          <div className="orders-container orders-loading">
            <div className="orders-loading-spinner"><OrbitLoader size="lg" /></div>
            <h4>Loading your orders…</h4>
            <p>Please wait while we fetch your order history</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead
        title={`My Orders - ${SEO_CONFIG.SITE_NAME}`}
        description="View and track all your craft supply orders."
        noindex={true}
        canonical={`${SEO_CONFIG.SITE_URL}/orders`}
      />
      <Header />

      {returnOrder && (
        <ReturnModal
          order={returnOrder}
          onClose={() => setReturnOrder(null)}
          onSuccess={handleReturnSuccess}
        />
      )}

      <div className="orders-page">
        <div className="orders-container">
          {/* Hero */}
          <div className="orders-hero">
            <h1 className="orders-hero-title">
              <FiShoppingBag size={32} className="orders-hero-icon" />
              My Orders
            </h1>
            <p className="orders-hero-sub">Track and manage all your orders in one place</p>
          </div>

          {/* Search */}
          <div className="orders-search">
            <span className="orders-search-icon"><FiSearch size={16} /></span>
            <input
              className="orders-search-input form-control"
              placeholder="Search by order ID, status, item name, or address…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            />
            {search && (
              <button className="orders-search-clear" onClick={() => { setSearch(""); setCurrentPage(1); }}>
                Clear
              </button>
            )}
          </div>

          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-3">
              {error}
            </Alert>
          )}

          {orders.length === 0 && !error ? (
            <div className="orders-empty">
              <FiShoppingBag size={72} className="orders-empty-icon" />
              <h4>No orders found</h4>
              <p>You haven't placed any orders yet. Start shopping to see your orders here!</p>
              <button className="orders-empty-btn" onClick={() => (window.location.href = "/products")}>
                <FiPackage size={16} /> Start Shopping
              </button>
            </div>
          ) : (
            <div className="orders-card card">
              {/* Desktop Table */}
              <div className="d-none d-md-block">
                <table className="table orders-table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Placed</th>
                      <th>Items Ordered</th>
                      <th>Summary</th>
                      <th>Shipping Address</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedOrders.map((order) => {
                      const oid    = String(order._id || "");
                      const status = String(order.status || "unknown");
                      const total  = Number(order.totalAmount ?? 0).toFixed(2);
                      return (
                        <tr key={oid || Math.random()}>
                          <td>
                            <div className="order-id-short">{formatOrderId(oid)}</div>
                            <div className="order-id-full">{oid}</div>
                          </td>
                          <td>{order.createdAt ? formatDate(order.createdAt) : "—"}</td>
                          <td style={{ maxWidth: "280px" }}>
                            <div style={{ maxHeight: "120px", overflowY: "auto" }}>
                              <ul className="mb-0 ps-3">
                                {(order.items || []).map((item, idx) => {
                                  const qty   = Number(item.quantity || 1);
                                  const price = Number(item.totalPrice ?? (item.product?.price || 0) * qty).toFixed(2);
                                  return (
                                    <li key={idx} style={{ fontSize: "0.85rem" }}>
                                      <strong>{item.product?.name || item.name || "Product"}</strong> × {qty} — ₹{price}
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          </td>
                          <td>
                            <div className="order-total">₹{total}</div>
                            <div className="order-item-count">{(order.items || []).length} item{(order.items || []).length !== 1 ? "s" : ""}</div>
                          </td>
                          <td style={{ maxWidth: "200px" }}>
                            {order.shippingAddress ? (
                              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                                {order.shippingAddress.street}<br />
                                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                              </div>
                            ) : "—"}
                          </td>
                          <td><StatusBadge status={status} /></td>
                          <td style={{ minWidth: "130px" }}>
                            <TrackButton
                              status={status}
                              onClick={() => navigate(`/track/${oid}`)}
                            />
                            <ReturnButton
                              order={order}
                              onClick={() => setReturnOrder(order)}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="d-md-none p-3">
                {pagedOrders.map((order) => {
                  const oid    = String(order._id || "");
                  const status = String(order.status || "unknown");
                  return (
                    <div key={oid} className="order-mobile-card card">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <div className="order-id-short">{formatOrderId(oid)}</div>
                            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                              {order.createdAt ? formatDate(order.createdAt) : "—"}
                            </div>
                          </div>
                          <StatusBadge status={status} />
                        </div>
                        <div style={{ fontSize: "0.875rem" }}>
                          <div className="order-total">₹{Number(order.totalAmount ?? 0).toFixed(2)}</div>
                          <div className="order-item-count">{(order.items || []).length} item{(order.items || []).length !== 1 ? "s" : ""}</div>
                          {order.shippingAddress && (
                            <div style={{ marginTop: "0.375rem", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                              {order.shippingAddress.street}{order.shippingAddress.city ? `, ${order.shippingAddress.city}` : ""}
                            </div>
                          )}
                          <div style={{ marginTop: "0.75rem" }}>
                            <TrackButton
                              status={status}
                              onClick={() => navigate(`/track/${oid}`)}
                            />
                            <ReturnButton
                              order={order}
                              onClick={() => setReturnOrder(order)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pagination */}
          {orders.length > 0 && (
            <div className="orders-pagination-bar">
              <div className="d-flex align-items-center gap-2">
                <span className="orders-rows-label">Rows:</span>
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(parseInt(e.target.value, 10)); setCurrentPage(1); }}
                  className="form-select form-select-sm"
                  style={{ width: 80 }}
                >
                  {[5, 10, 25, 50].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <span className="orders-page-info">Page {current} of {totalPages}</span>
              <Pagination size="sm" className="mb-0">
                <Pagination.First  onClick={() => setCurrentPage(1)} disabled={current === 1} />
                <Pagination.Prev   onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={current === 1} />
                {paginationItems}
                <Pagination.Next   onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={current === totalPages} />
                <Pagination.Last   onClick={() => setCurrentPage(totalPages)} disabled={current === totalPages} />
              </Pagination>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
