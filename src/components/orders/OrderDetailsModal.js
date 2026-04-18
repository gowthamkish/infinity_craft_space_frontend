import React, { useState, useEffect } from "react";
import { Modal, Card, Row, Col } from "react-bootstrap";
import {
  FiShoppingBag,
  FiUser,
  FiMapPin,
  FiPackage,
  FiCreditCard,
  FiTruck,
  FiRotateCcw,
  FiCheck,
  FiX,
  FiImage,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import TrackingTimeline from "../TrackingTimeline";
import api from "../../api/axios";

const REASON_LABELS = {
  defective:        "Defective / Damaged product",
  wrong_item:       "Wrong item received",
  not_as_described: "Not as described",
  size_mismatch:    "Size mismatch",
  quality_issue:    "Quality issue",
  changed_mind:     "Changed my mind",
  duplicate_order:  "Duplicate order",
  other:            "Other",
};

const RETURN_STATUS_STYLE = {
  requested:  { bg: "#fef3c7", color: "#92400e", label: "Pending Review" },
  approved:   { bg: "#d1fae5", color: "#065f46", label: "Approved"       },
  rejected:   { bg: "#fee2e2", color: "#991b1b", label: "Rejected"       },
  in_transit: { bg: "#dbeafe", color: "#1e40af", label: "In Transit"     },
  received:   { bg: "#ede9fe", color: "#5b21b6", label: "Received"       },
  refunded:   { bg: "#d1fae5", color: "#065f46", label: "Refunded"       },
  completed:  { bg: "#d1fae5", color: "#065f46", label: "Completed"      },
};

function ImageLightbox({ images, startIndex, onClose }) {
  const [idx, setIdx] = useState(startIndex);
  if (!images || images.length === 0) return null;
  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh" }}>
        <img src={images[idx].url} alt={`return-${idx}`} style={{ maxWidth: "100%", maxHeight: "85vh", borderRadius: "8px", objectFit: "contain" }} />
        <div style={{ position: "absolute", bottom: "-2.5rem", left: 0, right: 0, textAlign: "center", color: "white", fontSize: "0.9rem" }}>
          {idx + 1} / {images.length}
        </div>
        {images.length > 1 && (
          <>
            <button onClick={() => setIdx((i) => (i - 1 + images.length) % images.length)}
              style={{ position: "absolute", left: "-3rem", top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.15)", border: "none", color: "white", borderRadius: "50%", width: "40px", height: "40px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FiChevronLeft size={20} />
            </button>
            <button onClick={() => setIdx((i) => (i + 1) % images.length)}
              style={{ position: "absolute", right: "-3rem", top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.15)", border: "none", color: "white", borderRadius: "50%", width: "40px", height: "40px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FiChevronRight size={20} />
            </button>
          </>
        )}
        <button onClick={onClose}
          style={{ position: "absolute", top: "-2.5rem", right: 0, background: "none", border: "none", color: "white", cursor: "pointer" }}>
          <FiX size={24} />
        </button>
      </div>
    </div>
  );
}

function ReturnRequestPanel({ returnRequestId, onStatusChanged }) {
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [lightbox, setLightbox]   = useState(null); // { index }
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError]     = useState(null);

  useEffect(() => {
    if (!returnRequestId) return;
    setLoading(true);
    api.get(`/api/returns/${returnRequestId}`)
      .then((res) => setData(res.data.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [returnRequestId]);

  const handleApprove = async () => {
    if (!data?._id) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await api.put(`/api/returns/${data._id}/approve`, {
        refundAmount: data.orderId?.totalAmount || 0,
        refundMethod: "original_payment",
      });
      setData(res.data.data);
      onStatusChanged?.();
    } catch (err) {
      setActionError(err.response?.data?.error || "Failed to approve. Try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    const reason = window.prompt("Enter rejection reason (shown to customer):");
    if (reason === null) return; // cancelled
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await api.put(`/api/returns/${data._id}/reject`, { reason });
      setData(res.data.data);
      onStatusChanged?.();
    } catch (err) {
      setActionError(err.response?.data?.error || "Failed to reject. Try again.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: "1rem", textAlign: "center", color: "#94a3b8", fontSize: "0.9rem" }}>Loading return request…</div>;
  }
  if (!data) {
    return <div style={{ padding: "1rem", textAlign: "center", color: "#94a3b8", fontSize: "0.9rem" }}>Return request details unavailable.</div>;
  }

  const statusStyle = RETURN_STATUS_STYLE[data.status] || { bg: "#f1f5f9", color: "#64748b", label: data.status };
  const isPending = data.status === "requested";

  return (
    <div style={{ padding: "1rem" }}>
      {lightbox !== null && (
        <ImageLightbox
          images={data.images || []}
          startIndex={lightbox}
          onClose={() => setLightbox(null)}
        />
      )}

      {/* Status + meta row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
        <div>
          <span style={{ background: statusStyle.bg, color: statusStyle.color, padding: "0.3rem 0.85rem", borderRadius: "20px", fontWeight: 700, fontSize: "0.82rem" }}>
            {statusStyle.label}
          </span>
          <span style={{ marginLeft: "0.75rem", fontSize: "0.82rem", color: "#64748b" }}>
            {data.returnType?.toUpperCase() || "RETURN"} request
          </span>
        </div>
        <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
          Submitted: {new Date(data.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </div>
      </div>

      {/* Reason */}
      <div style={{ marginBottom: "1rem", background: "#f8fafc", borderRadius: "8px", padding: "0.75rem 1rem", borderLeft: "4px solid #f59e0b" }}>
        <div style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 600, marginBottom: "0.25rem" }}>REASON</div>
        <div style={{ fontWeight: 700, color: "#1e293b", fontSize: "0.9rem" }}>{REASON_LABELS[data.reason] || data.reason}</div>
        {data.reasonDetails && (
          <div style={{ marginTop: "0.35rem", fontSize: "0.85rem", color: "#475569" }}>{data.reasonDetails}</div>
        )}
      </div>

      {/* Items */}
      {data.items?.length > 0 && (
        <div style={{ marginBottom: "1rem" }}>
          <div style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 600, marginBottom: "0.5rem" }}>ITEMS FOR RETURN</div>
          {data.items.map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid #f1f5f9", fontSize: "0.85rem" }}>
              <span style={{ fontWeight: 600, color: "#1e293b" }}>{item.productName || "Product"}</span>
              <span style={{ color: "#64748b" }}>Qty: {item.quantity}</span>
            </div>
          ))}
        </div>
      )}

      {/* Images */}
      <div style={{ marginBottom: "1rem" }}>
        <div style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 600, marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <FiImage size={13} /> PRODUCT IMAGES ({data.images?.length || 0})
        </div>
        {data.images?.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: "0.5rem" }}>
            {data.images.map((img, i) => (
              <div
                key={i}
                onClick={() => setLightbox(i)}
                style={{ aspectRatio: "1", borderRadius: "8px", overflow: "hidden", border: "2px solid #e2e8f0", cursor: "pointer", position: "relative" }}
              >
                <img src={img.url} alt={`return-img-${i}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: "#94a3b8", fontSize: "0.85rem", fontStyle: "italic" }}>No images attached</div>
        )}
      </div>

      {/* Admin action error */}
      {actionError && (
        <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "8px", padding: "0.6rem 0.85rem", marginBottom: "0.75rem", color: "#dc2626", fontSize: "0.82rem" }}>
          {actionError}
        </div>
      )}

      {/* Approve / Reject buttons (only for pending) */}
      {isPending && (
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            onClick={handleApprove}
            disabled={actionLoading}
            style={{
              flex: 1, padding: "0.6rem", borderRadius: "8px", border: "none",
              background: "linear-gradient(135deg, #10b981, #059669)", color: "white",
              fontWeight: 700, fontSize: "0.88rem", cursor: actionLoading ? "not-allowed" : "pointer",
              opacity: actionLoading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem",
            }}
          >
            <FiCheck size={15} /> {actionLoading ? "Processing…" : "Approve Return"}
          </button>
          <button
            onClick={handleReject}
            disabled={actionLoading}
            style={{
              flex: 1, padding: "0.6rem", borderRadius: "8px", border: "none",
              background: "linear-gradient(135deg, #ef4444, #dc2626)", color: "white",
              fontWeight: 700, fontSize: "0.88rem", cursor: actionLoading ? "not-allowed" : "pointer",
              opacity: actionLoading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem",
            }}
          >
            <FiX size={15} /> {actionLoading ? "Processing…" : "Reject Return"}
          </button>
        </div>
      )}
    </div>
  );
}

const OrderDetailsModal = ({
  show,
  onHide,
  selectedOrder,
  getStatusBadge,
  formatDate,
  formatCurrency,
}) => {
  const navigate = useNavigate();
  const [tracking, setTracking] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

  // Fetch live tracking when a shipped/processing order modal opens
  useEffect(() => {
    if (!show || !selectedOrder?._id) { setTracking(null); return; }
    const hasShipment = selectedOrder?.shiprocket?.shipmentId || selectedOrder?.shiprocket?.awbCode;
    if (!hasShipment) return;

    setTrackingLoading(true);
    api.get(`/api/shipping/track/${selectedOrder._id}`)
      .then((res) => setTracking(res.data.tracking))
      .catch(() => setTracking(null))
      .finally(() => setTrackingLoading(false));
  }, [show, selectedOrder?._id]);

  const orderId = selectedOrder?._id;
  const hasShipment =
    selectedOrder?.shiprocket?.awbCode ||
    selectedOrder?.shiprocket?.shipmentId;

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="xl"
      centered
      className="order-details-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 8, padding: 8, display: "flex", alignItems: "center" }}>
            <FiShoppingBag size={20} />
          </div>
          Order #{selectedOrder?.orderNumber || selectedOrder?._id?.slice(-6)}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ padding: 0, background: "#f8fafc" }}>
        {selectedOrder && (
          <div>
            <div
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)",
                padding: "1.25rem",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "0.75rem",
              }}
            >
              <div>
                <h6
                  style={{
                    margin: "0 0 0.35rem 0",
                    color: "#1e293b",
                    fontWeight: "600",
                    fontSize: "1rem",
                  }}
                >
                  Order Status
                </h6>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  {getStatusBadge(selectedOrder.status)}
                  <span style={{ color: "#64748b", fontSize: "0.85rem" }}>
                    Placed on{" "}
                    {formatDate(
                      selectedOrder.createdAt || selectedOrder.orderDate,
                    )}
                  </span>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "#64748b",
                    marginBottom: "0.2rem",
                  }}
                >
                  Total Amount
                </div>
                <div
                  style={{
                    fontSize: "1.6rem",
                    fontWeight: "700",
                    color: "#059669",
                    textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                  }}
                >
                  {formatCurrency(
                    selectedOrder.totalAmount || selectedOrder.total,
                  )}
                </div>
              </div>
            </div>

            <div style={{ padding: "1.25rem" }}>
              <Row className="g-3">
                <Col lg={6}>
                  <Card
                    className="h-100 border-0 shadow-sm"
                    style={{ borderRadius: "12px", overflow: "hidden" }}
                  >
                    <div
                      style={{
                        background:
                          "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                        color: "white",
                        padding: "0.875rem 1rem",
                      }}
                    >
                      <h6
                        style={{
                          margin: 0,
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          fontSize: "0.9rem",
                        }}
                      >
                        <FiUser size={16} className="me-2" />
                        Customer Information
                      </h6>
                    </div>
                    <Card.Body style={{ padding: "1rem" }}>
                      <div className="mb-2">
                        <label
                          style={{
                            fontSize: "0.8rem",
                            color: "#64748b",
                            fontWeight: 500,
                          }}
                        >
                          Full Name
                        </label>
                        <p
                          style={{
                            margin: "0.15rem 0 0 0",
                            fontSize: "0.9rem",
                            fontWeight: 600,
                            color: "#1e293b",
                          }}
                        >
                          {typeof selectedOrder.userId === "object"
                            ? selectedOrder.userId?.username ||
                              selectedOrder.customerName ||
                              "Unknown Customer"
                            : selectedOrder.customerName || "Unknown Customer"}
                        </p>
                      </div>
                      <div className="mb-2">
                        <label
                          style={{
                            fontSize: "0.8rem",
                            color: "#64748b",
                            fontWeight: 500,
                          }}
                        >
                          Email Address
                        </label>
                        <p
                          style={{
                            margin: "0.15rem 0 0 0",
                            fontSize: "0.85rem",
                            color: "#475569",
                          }}
                        >
                          {typeof selectedOrder.userId === "object"
                            ? selectedOrder.userId?.email ||
                              selectedOrder.customerEmail ||
                              "N/A"
                            : selectedOrder.customerEmail || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label
                          style={{
                            fontSize: "0.8rem",
                            color: "#64748b",
                            fontWeight: 500,
                          }}
                        >
                          Phone Number
                        </label>
                        <p
                          style={{
                            margin: "0.15rem 0 0 0",
                            fontSize: "0.85rem",
                            color: "#475569",
                          }}
                        >
                          {selectedOrder.shippingAddress?.phone ||
                            selectedOrder.phone ||
                            "N/A"}
                        </p>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col lg={6}>
                  <Card
                    className="h-100 border-0 shadow-sm"
                    style={{ borderRadius: "12px", overflow: "hidden" }}
                  >
                    <div
                      style={{
                        background:
                          "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                        color: "white",
                        padding: "0.875rem 1rem",
                      }}
                    >
                      <h6
                        style={{
                          margin: 0,
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          fontSize: "0.9rem",
                        }}
                      >
                        <FiMapPin size={16} className="me-2" />
                        Shipping Address
                      </h6>
                    </div>
                    <Card.Body style={{ padding: "1rem" }}>
                      {selectedOrder.shippingAddress ? (
                        <div
                          style={{
                            background: "#f8fafc",
                            borderRadius: 8,
                            padding: "0.875rem",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <p
                            style={{
                              margin: 0,
                              lineHeight: "1.5",
                              color: "#475569",
                              fontSize: "0.85rem",
                            }}
                          >
                            {selectedOrder.shippingAddress?.street}
                            <br />
                            {selectedOrder.shippingAddress?.city},{" "}
                            {selectedOrder.shippingAddress?.state}
                            <br />
                            <strong>
                              {selectedOrder.shippingAddress?.zipCode}
                            </strong>
                          </p>
                        </div>
                      ) : (
                        <div className="text-center py-2">
                          <FiMapPin
                            size={36}
                            style={{ color: "#cbd5e1", margin: "0 0 0.5rem 0" }}
                          />
                          <p
                            style={{
                              color: "#64748b",
                              margin: 0,
                              fontSize: "0.85rem",
                            }}
                          >
                            No shipping address provided
                          </p>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Card
                className="mt-3 border-0 shadow-sm"
                style={{ borderRadius: "12px", overflow: "hidden" }}
              >
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, #0f172a, #1e293b)",
                    color: "white",
                    padding: "0.875rem 1rem",
                  }}
                >
                  <h6
                    style={{
                      margin: 0,
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      fontSize: "0.9rem",
                    }}
                  >
                    <FiPackage size={16} className="me-2" />
                    Order Items ({selectedOrder.items?.length || 0} items)
                  </h6>
                </div>
                <div style={{ padding: 0 }}>
                  {selectedOrder.items?.length > 0 ? (
                    <div>
                      {selectedOrder.items.map((item, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: "1rem",
                            borderBottom:
                              idx < selectedOrder.items.length - 1
                                ? "1px solid #f1f5f9"
                                : "none",
                            background: idx % 2 === 0 ? "white" : "#fafbfc",
                          }}
                        >
                          <div className="d-flex justify-content-between align-items-start">
                            <div style={{ flex: 1 }}>
                              <h6
                                style={{
                                  margin: "0 0 0.35rem 0",
                                  color: "#1e293b",
                                  fontWeight: 600,
                                  fontSize: "0.95rem",
                                }}
                              >
                                {item.product?.name ||
                                  item.productName ||
                                  item.name ||
                                  "Unknown Product"}
                              </h6>
                              <div
                                style={{
                                  display: "flex",
                                  gap: "1rem",
                                  alignItems: "center",
                                }}
                              >
                                <div>
                                  <span
                                    style={{
                                      fontSize: "0.8rem",
                                      color: "#64748b",
                                      fontWeight: 500,
                                    }}
                                  >
                                    Quantity:
                                  </span>
                                  <span
                                    style={{
                                      marginLeft: 6,
                                      fontSize: "0.85rem",
                                      color: "#475569",
                                      fontWeight: 600,
                                    }}
                                  >
                                    {item.quantity}
                                  </span>
                                </div>
                                <div>
                                  <span
                                    style={{
                                      fontSize: "0.8rem",
                                      color: "#64748b",
                                      fontWeight: 500,
                                    }}
                                  >
                                    Unit Price:
                                  </span>
                                  <span
                                    style={{
                                      marginLeft: 6,
                                      fontSize: "0.85rem",
                                      color: "#475569",
                                      fontWeight: 600,
                                    }}
                                  >
                                    {formatCurrency(
                                      item.product?.price || item.price || 0,
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <div
                                style={{
                                  fontSize: "1.1rem",
                                  fontWeight: 700,
                                  color: "#059669",
                                }}
                              >
                                {formatCurrency(
                                  (item.product?.price || item.price || 0) *
                                    item.quantity,
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center">
                      <FiPackage
                        size={48}
                        style={{ color: "#cbd5e1", margin: "0 0 0.75rem 0" }}
                      />
                      <p
                        style={{
                          color: "#64748b",
                          margin: 0,
                          fontSize: "0.9rem",
                        }}
                      >
                        No items found in this order
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              {/* ── Tracking Section ── */}
              {hasShipment && (
                <Card
                  className="mt-3 border-0 shadow-sm"
                  style={{ borderRadius: "12px", overflow: "hidden" }}
                >
                  <div
                    style={{
                      background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                      color: "white",
                      padding: "0.875rem 1rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <h6
                      style={{
                        margin: 0,
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        fontSize: "0.9rem",
                      }}
                    >
                      <FiTruck size={16} className="me-2" />
                      Shipment & Tracking
                    </h6>
                    {orderId && hasShipment && (
                      <button
                        onClick={() => { onHide(); navigate(`/track/${orderId}`); }}
                        style={{
                          background: "rgba(255,255,255,0.2)",
                          border: "none",
                          color: "white",
                          padding: "0.25rem 0.75rem",
                          borderRadius: 6,
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Full Tracking →
                      </button>
                    )}
                  </div>
                  <div style={{ padding: "1rem", background: "white" }}>
                    {trackingLoading ? (
                      <div style={{ textAlign: "center", padding: "1rem", color: "#94a3b8" }}>
                        Loading tracking…
                      </div>
                    ) : (
                      <TrackingTimeline
                        order={selectedOrder}
                        tracking={tracking}
                      />
                    )}
                  </div>
                </Card>
              )}

              {/* ── Return Request Section (admin view) ── */}
              {selectedOrder.hasReturnRequest && selectedOrder.returnRequestId && (
                <Card className="mt-3 border-0 shadow-sm" style={{ borderRadius: "12px", overflow: "hidden" }}>
                  <div style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "white", padding: "0.875rem 1rem" }}>
                    <h6 style={{ margin: 0, fontWeight: 600, display: "flex", alignItems: "center", fontSize: "0.9rem" }}>
                      <FiRotateCcw size={16} className="me-2" />
                      Return Request
                    </h6>
                  </div>
                  <ReturnRequestPanel
                    returnRequestId={selectedOrder.returnRequestId}
                    onStatusChanged={() => {}}
                  />
                </Card>
              )}

              <Card
                className="mt-3 border-0 shadow-sm"
                style={{
                  borderRadius: "12px",
                  overflow: "hidden",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, #059669 0%, #047857 100%)",
                    color: "white",
                    padding: "0.875rem 1rem",
                  }}
                >
                  <h6
                    style={{
                      margin: 0,
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      fontSize: "0.9rem",
                    }}
                  >
                    <FiCreditCard size={16} className="me-2" />
                    Payment Summary
                  </h6>
                </div>
                <div style={{ padding: "1rem", background: "white" }}>
                  <div style={{ marginBottom: "0.75rem" }}>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span style={{ color: "#64748b", fontSize: "0.85rem" }}>
                        Subtotal:
                      </span>
                      <span
                        style={{
                          color: "#475569",
                          fontWeight: 600,
                          fontSize: "0.9rem",
                        }}
                      >
                        {formatCurrency(
                          (selectedOrder.totalAmount || selectedOrder.total) -
                            (selectedOrder.shippingCost || 0),
                        )}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span style={{ color: "#64748b", fontSize: "0.85rem" }}>
                        Shipping:
                      </span>
                      <span
                        style={{
                          color: "#475569",
                          fontWeight: 600,
                          fontSize: "0.9rem",
                        }}
                      >
                        {formatCurrency(selectedOrder.shippingCost || 0)}
                      </span>
                    </div>
                    {selectedOrder.tax && (
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span style={{ color: "#64748b", fontSize: "0.85rem" }}>
                          Tax:
                        </span>
                        <span
                          style={{
                            color: "#475569",
                            fontWeight: 600,
                            fontSize: "0.9rem",
                          }}
                        >
                          {formatCurrency(selectedOrder.tax)}
                        </span>
                      </div>
                    )}
                  </div>
                  <hr
                    style={{ margin: "0.75rem 0", border: "1px solid #e2e8f0" }}
                  />
                  <div
                    className="d-flex justify-content-between align-items-center"
                    style={{
                      background:
                        "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
                      padding: "0.75rem",
                      borderRadius: 8,
                      border: "1px solid #bbf7d0",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "1rem",
                        fontWeight: 700,
                        color: "#166534",
                      }}
                    >
                      Total Amount:
                    </span>
                    <span
                      style={{
                        fontSize: "1.3rem",
                        fontWeight: 800,
                        color: "#059669",
                        textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                      }}
                    >
                      {formatCurrency(
                        selectedOrder.totalAmount || selectedOrder.total,
                      )}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer
        style={{
          background: "#f8fafc",
          border: "none",
          borderRadius: "0 0 12px 12px",
          padding: "1rem 1.5rem",
        }}
      >
        <div className="d-flex w-100" style={{ gap: 8 }}>
          <button
            className="btn btn-outline-secondary flex-fill"
            onClick={onHide}
            style={{
              borderRadius: 8,
              padding: "0.6rem 1.5rem",
              fontWeight: 500,
              border: "1px solid #e2e8f0",
              fontSize: "0.9rem",
            }}
          >
            Close
          </button>
          {orderId && hasShipment && (
            <button
              className="btn flex-fill"
              onClick={() => { onHide(); navigate(`/track/${orderId}`); }}
              style={{
                borderRadius: 8,
                padding: "0.6rem 1.5rem",
                fontWeight: 600,
                fontSize: "0.9rem",
                background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                color: "white",
                border: "none",
              }}
            >
              🚚 Track Order
            </button>
          )}
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default OrderDetailsModal;
