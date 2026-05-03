import { useEffect, useRef } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";
import { Check, Package, MapPin, CreditCard } from "react-feather";

// Simple CSS confetti via JS-injected elements
function Confetti({ container }) {
  useEffect(() => {
    if (!container.current) return;
    const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6", "#ef4444"];
    const pieces = [];
    for (let i = 0; i < 48; i++) {
      const el = document.createElement("div");
      el.className = "co-confetti-piece";
      el.style.left = `${Math.random() * 100}%`;
      el.style.top = `-${Math.random() * 20 + 10}px`;
      el.style.background = COLORS[Math.floor(Math.random() * COLORS.length)];
      el.style.width = `${Math.random() * 8 + 6}px`;
      el.style.height = `${Math.random() * 8 + 6}px`;
      el.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
      el.style.animationDuration = `${Math.random() * 2 + 1.5}s`;
      el.style.animationDelay = `${Math.random() * 0.8}s`;
      container.current.appendChild(el);
      pieces.push(el);
    }
    const timer = setTimeout(() => {
      pieces.forEach((p) => p.remove());
    }, 4000);
    return () => { clearTimeout(timer); pieces.forEach((p) => p.remove()); };
  }, [container]);
  return null;
}

function estimatedDelivery(backendOrder, orderData) {
  const shipping = backendOrder?.shippingDetails || orderData?.shippingDetails;
  const days = shipping?.estimatedDays;
  if (!days) return null;
  const parts = String(days).split("–").map(Number);
  const minDays = (parts[0] || 5) + 2; // +2 for processing
  const maxDays = (parts[1] || minDays + 3) + 2;
  const fmt = (d) => d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
  const from = new Date(); from.setDate(from.getDate() + minDays);
  const to = new Date(); to.setDate(to.getDate() + maxDays);
  return `${fmt(from)} – ${fmt(to)}`;
}

export const ConfirmationStep = ({
  orderData,
  paymentData,
  shippingAddress,
  total,
  navigate,
  backendOrder,
}) => {
  const wrapRef = useRef(null);
  const orderId = backendOrder?._id || orderData?.orderId || orderData?.id || orderData?._id;
  const orderTotal = (backendOrder?.totalAmount ?? orderData?.total ?? total ?? 0).toFixed(2);
  const items = backendOrder?.items || orderData?.items || [];
  const deliveryRange = estimatedDelivery(backendOrder, orderData);

  return (
    <Row className="justify-content-center">
      <Col md={10} lg={8}>
        {/* Main success card */}
        <div
          ref={wrapRef}
          className="co-confirm-wrap"
          style={{ borderRadius: 24, overflow: "hidden", boxShadow: "0 20px 60px rgba(16, 185, 129, 0.2)", marginBottom: "1.5rem" }}
        >
          <Confetti container={wrapRef} />

          {/* Hero banner */}
          <div style={{ background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 60%, #6ee7b7 100%)", padding: "2.5rem 2rem 2rem", textAlign: "center" }}>
            <div className="co-check-circle">
              <Check size={48} color="white" strokeWidth={3} />
            </div>

            <h1 style={{ color: "#065f46", fontWeight: 800, fontSize: "clamp(1.75rem, 6vw, 2.5rem)", letterSpacing: "-0.03em", margin: "0 0 0.5rem" }}>
              Order Confirmed! 🎉
            </h1>
            <p style={{ color: "#047857", fontSize: "clamp(0.9rem, 2.5vw, 1.05rem)", margin: 0, lineHeight: 1.6 }}>
              Thank you for your order! We've received your payment and will start processing right away.
            </p>
          </div>

          {/* Details card */}
          {orderData && (
            <div style={{ background: "white", padding: "1.5rem" }}>
              <Row className="g-3">
                {/* Order info */}
                <Col md={4} xs={12}>
                  <div style={{ background: "#f8fafc", borderRadius: 14, padding: "1.1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                      <Package size={16} style={{ color: "#10b981" }} />
                      <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "#374151" }}>Order Details</span>
                    </div>
                    <p style={{ margin: "0 0 0.3rem", fontSize: "0.8rem", color: "#6b7280" }}>
                      <span style={{ fontWeight: 600, color: "#1f2937" }}>ID:</span>{" "}
                      <span style={{ wordBreak: "break-all", fontSize: "0.72rem" }}>{orderId}</span>
                    </p>
                    <p style={{ margin: "0 0 0.3rem", fontSize: "0.8rem", color: "#6b7280" }}>
                      <span style={{ fontWeight: 600, color: "#1f2937" }}>Total:</span> ₹{orderTotal}
                    </p>
                    <p style={{ margin: "0 0 0.75rem", fontSize: "0.8rem", color: "#6b7280" }}>
                      <span style={{ fontWeight: 600, color: "#1f2937" }}>Items:</span> {items.length}
                    </p>
                    {items.length > 0 && (
                      <div>
                        {items.map((it, idx) => (
                          <div key={idx} style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: "0.25rem" }}>
                            {it.productName || it.name || it.product?.name} × {it.quantity}
                            <span style={{ float: "right", fontWeight: 600, color: "#374151" }}>
                              ₹{(it.totalPrice ?? it.unitPrice * it.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Col>

                {/* Payment info */}
                <Col md={4} xs={12}>
                  <div style={{ background: "#f8fafc", borderRadius: 14, padding: "1.1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                      <CreditCard size={16} style={{ color: "#7c3aed" }} />
                      <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "#374151" }}>Payment</span>
                    </div>
                    <p style={{ margin: "0 0 0.3rem", fontSize: "0.75rem", color: "#6b7280", wordBreak: "break-all" }}>
                      <span style={{ fontWeight: 600, color: "#1f2937", display: "block" }}>Payment ID</span>
                      {paymentData?.razorpay_payment_id || paymentData?.payment_id || "N/A"}
                    </p>
                    <div style={{ marginTop: "0.6rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontSize: "0.8rem", color: "#6b7280", fontWeight: 600 }}>Status:</span>
                      <Badge bg="success" style={{ fontSize: "0.72rem" }}>
                        {orderData.paymentDetails?.payment_status || "Completed"}
                      </Badge>
                    </div>
                    <p style={{ margin: "0.4rem 0 0", fontSize: "0.78rem", color: "#6b7280" }}>
                      <span style={{ fontWeight: 600, color: "#1f2937" }}>Method:</span>{" "}
                      {orderData.paymentDetails?.method || "Online Payment"}
                    </p>
                  </div>
                </Col>

                {/* Shipping address */}
                <Col md={4} xs={12}>
                  <div style={{ background: "#f8fafc", borderRadius: 14, padding: "1.1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                      <MapPin size={16} style={{ color: "#f59e0b" }} />
                      <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "#374151" }}>Shipping To</span>
                    </div>
                    <p style={{ margin: 0, fontSize: "0.8rem", color: "#6b7280", lineHeight: 1.55 }}>
                      {shippingAddress.street || orderData.shippingAddress?.street}
                      <br />
                      {shippingAddress.city || orderData.shippingAddress?.city},{" "}
                      {shippingAddress.state || orderData.shippingAddress?.state}{" "}
                      {shippingAddress.zipCode || orderData.shippingAddress?.zipCode}
                      <br />
                      {shippingAddress.country || orderData.shippingAddress?.country || "India"}
                    </p>
                  </div>
                </Col>
              </Row>

              {/* Delivery estimate */}
              {deliveryRange && (
                <div style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 14, padding: "0.9rem 1.2rem", marginTop: "1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{ fontSize: "1.5rem" }}>🚚</span>
                  <div>
                    <p style={{ margin: 0, fontSize: "0.78rem", color: "#166534", fontWeight: 700 }}>Estimated Delivery</p>
                    <p style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#15803d" }}>{deliveryRange}</p>
                    <p style={{ margin: 0, fontSize: "0.72rem", color: "#16a34a" }}>You'll get tracking updates via WhatsApp & email</p>
                  </div>
                </div>
              )}

              {/* CTA buttons */}
              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap", marginTop: "1.5rem" }}>
                {orderId && (
                  <button
                    className="co-cta-btn"
                    style={{ flex: "0 0 auto", width: "auto", padding: "13px 22px", fontSize: "0.95rem", background: "linear-gradient(135deg, #3b82f6, #1d4ed8)", boxShadow: "0 8px 20px rgba(59,130,246,0.35)" }}
                    onClick={() => navigate(`/track/${orderId}`)}
                  >
                    🚚 Track Order
                  </button>
                )}
                <button
                  className="co-cta-btn"
                  style={{ flex: "0 0 auto", width: "auto", padding: "13px 22px", fontSize: "0.95rem" }}
                  onClick={() => navigate("/orders")}
                >
                  View Order History
                </button>
                <button
                  style={{ flex: "0 0 auto", padding: "13px 22px", borderRadius: 14, fontWeight: 600, fontSize: "0.95rem", border: "1.5px solid #10b981", background: "white", color: "#10b981", cursor: "pointer" }}
                  onClick={() => navigate("/products")}
                >
                  Continue Shopping
                </button>
              </div>

              {/* WhatsApp opt-in + share */}
              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap", marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #e5e7eb" }}>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`I just ordered from InfinityCraftSpace! 🎁 Order ID: ${orderId ?? ""}\nTrack my order: ${window.location.origin}/track/${orderId ?? ""}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "10px 18px", borderRadius: 12, fontWeight: 600, fontSize: "0.875rem", background: "#25d366", color: "#fff", textDecoration: "none", transition: "all 0.15s ease" }}
                >
                  <span>💬</span> Share on WhatsApp
                </a>
                <button
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "10px 18px", borderRadius: 12, fontWeight: 600, fontSize: "0.875rem", background: "#f1f5f9", color: "#374151", border: "1.5px solid #e2e8f0", cursor: "pointer" }}
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: "My order from InfinityCraftSpace", text: `Just ordered a handcrafted gift! 🎁`, url: window.location.origin });
                    } else {
                      navigator.clipboard.writeText(`${window.location.origin}/track/${orderId ?? ""}`);
                      alert("Order link copied!");
                    }
                  }}
                >
                  🔗 Share Order
                </button>
              </div>
            </div>
          )}
        </div>
      </Col>
    </Row>
  );
};
