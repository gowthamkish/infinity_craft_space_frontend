import { useEffect, useState, useMemo } from "react";
import Header from "../components/Header";
import { Spinner, Alert, Pagination, Badge } from "react-bootstrap";
import { FiPackage, FiSearch, FiShoppingBag } from "react-icons/fi";
import api from "../api/axios";
import SEOHead, { SEO_CONFIG } from "../components/SEOHead";
import { getStatusBadgeVariant } from "../utils/statusHelpers";
import { formatDate, formatOrderId } from "../utils/formatters";
import "./Orders.css";

// Map Bootstrap badge variants → semantic CSS classes
const STATUS_CLASS_MAP = {
  success: "delivered",
  primary: "confirmed",
  warning: "pending",
  info:    "processing",
  secondary: "shipped",
  danger:  "cancelled",
};

function StatusBadge({ status }) {
  const variant = getStatusBadgeVariant(status);
  const cls = STATUS_CLASS_MAP[variant] || "unknown";
  const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown";
  return <span className={`status-badge status-badge--${cls}`}>{label}</span>;
}

export default function Orders() {
  const [orders,      setOrders]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [search,      setSearch]      = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize,    setPageSize]    = useState(5);

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

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/api/orders");
        setOrders(res.data.success && Array.isArray(res.data.orders) ? res.data.orders : []);
      } catch {
        setError("Failed to load orders. Please try again later.");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <>
        <Header />
        <div className="orders-page">
          <div className="orders-container orders-loading">
            <Spinner animation="border" style={{ width: "3rem", height: "3rem", color: "var(--primary)" }} />
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
