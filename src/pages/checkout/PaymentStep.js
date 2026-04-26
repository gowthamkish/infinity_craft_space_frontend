import { useState } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import { Lock, CreditCard, Check, ArrowLeft, Smartphone } from "react-feather";
import { DotsLoader } from "../../components/Loader";
import CheckoutDeliveryPanel from "../../components/CheckoutDeliveryPanel";
import { ProductThumb } from "./CartReviewStep";

const PAYMENT_METHODS = [
  {
    id: "razorpay",
    icon: <CreditCard size={22} color="white" />,
    iconBg: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
    title: "Card / UPI / NetBanking",
    subtitle: "Powered by Razorpay · Instant & Secure",
    badge: "Recommended",
  },
];

export const PaymentStep = ({
  cartItems,
  shippingAddress,
  subtotal,
  shipping,
  tax,
  total,
  error,
  loading,
  handlePayment,
  setCurrentStep,
}) => {
  const [selectedMethod, setSelectedMethod] = useState("razorpay");

  const handlePay = () => {
    if (selectedMethod === "razorpay") handlePayment();
  };

  return (
    <Row className="justify-content-center">
      {/* ── Left: payment method ────────────────────────────── */}
      <Col lg={8} xs={12}>
        <Card className="co-card" style={{ marginBottom: "1.5rem" }}>
          <Card.Header
            className="co-card-header"
            style={{ background: "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)" }}
          >
            <div className="d-flex align-items-center gap-2">
              <Lock size={20} color="white" />
              <div>
                <h4 className="mb-0" style={{ color: "white", fontWeight: 700, fontSize: "clamp(1rem, 4vw, 1.4rem)", letterSpacing: "-0.02em" }}>
                  Secure Payment
                </h4>
                <p className="mb-0 mt-1" style={{ fontSize: "clamp(0.75rem, 2vw, 0.85rem)", color: "rgba(255,255,255,0.88)" }}>
                  Bank-level encryption · No card details stored
                </p>
              </div>
            </div>
          </Card.Header>

          <Card.Body className="co-card-body">
            {/* Payment methods */}
            <h5 style={{ fontWeight: 700, color: "#1f2937", fontSize: "1rem", marginBottom: "1rem" }}>
              Choose Payment Method
            </h5>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
              {PAYMENT_METHODS.map((method) => (
                <div
                  key={method.id}
                  role="button"
                  tabIndex={0}
                  className={`co-payment-card ${selectedMethod === method.id ? "selected" : ""}`}
                  style={{ padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "1rem", userSelect: "none" }}
                  onClick={() => setSelectedMethod(method.id)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedMethod(method.id); }}
                >
                  {/* Radio indicator */}
                  <div style={{ width: 22, height: 22, borderRadius: "50%", border: `2.5px solid ${selectedMethod === method.id ? "#7c3aed" : "#d1d5db"}`, background: selectedMethod === method.id ? "#7c3aed" : "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s ease" }}>
                    {selectedMethod === method.id && <Check size={12} color="white" strokeWidth={3} />}
                  </div>

                  {/* Icon */}
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: method.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {method.icon}
                  </div>

                  {/* Text */}
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: "0.95rem", color: "#1f2937" }}>{method.title}</p>
                    <p style={{ margin: 0, fontSize: "0.78rem", color: "#6b7280" }}>{method.subtitle}</p>
                  </div>

                  {method.badge && (
                    <span style={{ background: "#d1fae5", color: "#065f46", fontSize: "0.72rem", fontWeight: 700, padding: "0.25rem 0.65rem", borderRadius: "20px", flexShrink: 0 }}>
                      {method.badge}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Security features */}
            <div className="co-security-box">
              <h6 style={{ fontWeight: 700, color: "#1f2937", fontSize: "0.88rem", marginBottom: "0.875rem" }}>
                🔒 Your Payment is Protected
              </h6>
              <Row>
                {["256-bit SSL Encryption", "PCI DSS Compliant", "No Card Details Stored", "Bank-Level Security"].map((item) => (
                  <Col sm={6} xs={12} key={item} style={{ marginBottom: "0.5rem" }}>
                    <div className="co-security-item">
                      <div className="co-security-check"><Check size={10} color="white" strokeWidth={3} /></div>
                      <span>{item}</span>
                    </div>
                  </Col>
                ))}
              </Row>
            </div>

            {/* Payment icons */}
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.5rem", alignItems: "center" }}>
              <span style={{ fontSize: "0.72rem", color: "#94a3b8", marginRight: "0.25rem" }}>Accepted:</span>
              {["Visa", "Mastercard", "UPI", "Paytm", "GPay", "PhonePe"].map((p) => (
                <span key={p} style={{ fontSize: "0.72rem", background: "#f1f5f9", color: "#475569", padding: "0.2rem 0.55rem", borderRadius: "6px", fontWeight: 600 }}>{p}</span>
              ))}
            </div>

            {error && (
              <div style={{ background: "#fef2f2", border: "1.5px solid #fee2e2", borderRadius: 12, padding: "0.75rem 1rem", marginBottom: "1rem", fontSize: "0.875rem", color: "#dc2626", fontWeight: 600 }}>
                {error}
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: "flex", gap: "0.875rem", alignItems: "center" }}>
              <button
                className="co-back-btn"
                onClick={() => setCurrentStep(2)}
                disabled={loading}
              >
                <ArrowLeft size={15} /> Back
              </button>
              <button
                className="co-cta-btn co-cta-btn--pay"
                style={{ flex: 1 }}
                onClick={handlePay}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <DotsLoader size="sm" />
                    Processing…
                  </>
                ) : (
                  <>
                    <Lock size={16} />
                    Pay ₹{total.toFixed(2)} Securely
                  </>
                )}
              </button>
            </div>
          </Card.Body>
        </Card>
      </Col>

      {/* ── Right: payment summary ─────────────────────────── */}
      <Col lg={4} xs={12} className="mt-3 mt-lg-0">
        <Card className="co-summary-card">
          <Card.Header
            className="co-card-header"
            style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}
          >
            <div className="d-flex align-items-center gap-2">
              <Lock size={18} color="white" />
              <h5 className="mb-0" style={{ color: "white", fontWeight: 800, fontSize: "1.05rem" }}>
                Payment Summary
              </h5>
            </div>
            <p className="mb-0 mt-1" style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.9)" }}>
              Final order review
            </p>
          </Card.Header>

          <Card.Body className="co-summary-body">
            {/* Items */}
            <h6 style={{ fontWeight: 700, fontSize: "0.85rem", marginBottom: "0.75rem", color: "#374151" }}>
              Order Items ({cartItems.length})
            </h6>
            {cartItems.slice(0, 3).map((item) => (
              <div key={item.product._id} style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.65rem" }}>
                <ProductThumb product={item.product} size="xs" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: "0.78rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.product.name}</p>
                  <p style={{ margin: 0, fontSize: "0.68rem", color: "#6b7280" }}>Qty {item.quantity} × ₹{item.product.price}</p>
                </div>
              </div>
            ))}
            {cartItems.length > 3 && (
              <p style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "0.5rem" }}>+{cartItems.length - 3} more items</p>
            )}

            {/* Shipping address */}
            <div style={{ background: "#f8fafc", borderRadius: 12, padding: "0.75rem", marginBottom: "0.875rem", marginTop: "0.25rem" }}>
              <p style={{ margin: "0 0 0.35rem", fontSize: "0.78rem", fontWeight: 700, color: "#374151" }}>📍 Shipping to</p>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "#6b7280", lineHeight: 1.45 }}>
                {shippingAddress.street}<br />
                {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}
              </p>
            </div>

            {/* Delivery panel */}
            <CheckoutDeliveryPanel cartItems={cartItems} pincode={shippingAddress.zipCode} />

            <hr style={{ borderColor: "#e5e7eb", margin: "0.875rem 0" }} />

            {/* Price breakdown */}
            <div className="co-summary-row">
              <span style={{ color: "#6b7280" }}>Subtotal</span>
              <span style={{ fontWeight: 600 }}>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="co-summary-row">
              <span style={{ color: "#6b7280" }}>
                Shipping{shipping === 0 && <span style={{ marginLeft: "0.4rem", background: "#d1fae5", color: "#065f46", fontSize: "0.68rem", fontWeight: 700, padding: "0.1rem 0.45rem", borderRadius: "20px" }}>FREE</span>}
              </span>
              <span style={{ fontWeight: 600 }}>₹{shipping.toFixed(2)}</span>
            </div>
            <div className="co-summary-row">
              <span style={{ color: "#6b7280" }}>Tax (18% GST)</span>
              <span style={{ fontWeight: 600 }}>₹{tax.toFixed(2)}</span>
            </div>
            <div className="co-summary-row co-summary-row--total">
              <span className="co-summary-total-label">Total to Pay</span>
              <span className="co-summary-total-val">₹{total.toFixed(2)}</span>
            </div>
          </Card.Body>

          <div className="co-trust-row">
            <span className="co-trust-badge">🔒 Encrypted</span>
            <span className="co-trust-badge">🏦 PCI-DSS</span>
            <span className="co-trust-badge">✅ Verified</span>
          </div>
        </Card>
      </Col>

      {/* Mobile sticky pay bar */}
      <div className="co-sticky-bar">
        <div className="co-sticky-total">
          <p className="co-sticky-total-label">Total to Pay</p>
          <p className="co-sticky-total-amount">₹{total.toFixed(2)}</p>
        </div>
        <button
          className="co-cta-btn co-cta-btn--pay"
          style={{ flex: "0 0 auto", width: "auto", padding: "13px 20px", fontSize: "0.95rem" }}
          onClick={handlePay}
          disabled={loading}
        >
          {loading ? <DotsLoader size="sm" /> : <><Lock size={15} /> Pay Now</>}
        </button>
      </div>
    </Row>
  );
};
