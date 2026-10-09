import { useState } from "react";
import {
  FiLock, FiCreditCard, FiCheck, FiArrowLeft, FiMapPin, FiPackage, FiShield, FiCheckCircle, FiEdit2, FiSlash, FiKey, FiDatabase,
} from "react-icons/fi";
import CheckoutDeliveryPanel from "../../components/CheckoutDeliveryPanel";
import { Card, Alert, Thumb, SummaryItems, Row, Total, MiniTrust, HelpCard, Spinner, inr } from "./ui";

const PAYMENT_METHODS = [
  { id: "razorpay", title: "Card / UPI / NetBanking", subtitle: "Powered by Razorpay · instant & secure", badge: "Recommended" },
];

const ACCEPTED_PAYMENTS = ["Visa", "Mastercard", "UPI", "Paytm", "GPay", "PhonePe"];

const SECURITY_FEATURES = [
  { Icon: FiKey, label: "256-bit SSL encryption" },
  { Icon: FiShield, label: "PCI-DSS compliant" },
  { Icon: FiSlash, label: "No card details stored" },
  { Icon: FiDatabase, label: "Bank-level security" },
];

const PAY_TRUST = [
  { Icon: FiLock, label: "Encrypted" },
  { Icon: FiShield, label: "PCI-DSS" },
  { Icon: FiCheckCircle, label: "Verified" },
];

/* ══════════════════════════════════════════════════════════════════════════
   STEP 3 — Payment
   ══════════════════════════════════════════════════════════════════════════ */
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
  const handlePay = () => { if (selectedMethod === "razorpay") handlePayment(); };
  const count = cartItems.length;

  return (
    <div className="ck-grid">
      <div className="ck-main">
        {/* ── Review ──────────────────────────────────────────────────── */}
        <Card icon={FiPackage} tint="teal" title="Review your order" subtitle="Check the details before you pay">
          <div className="ck-shipto">
            <span className="ck-ico" aria-hidden="true"><FiMapPin /></span>
            <div className="ck-shipto-text">
              <strong>Shipping to{shippingAddress.label ? ` · ${shippingAddress.label}` : ""}</strong>
              {shippingAddress.street}
              <br />
              {shippingAddress.city}, {shippingAddress.state} – {shippingAddress.zipCode}
              {shippingAddress.phone && <><br />📞 {shippingAddress.phone}</>}
            </div>
            <button type="button" className="ck-link ck-link--ember" onClick={() => setCurrentStep(2)}>
              <FiEdit2 size={15} /> Change
            </button>
          </div>

          <div className="ck-review-items">
            {cartItems.map((item) => (
              <div key={item.product._id} className="ck-review-item">
                <Thumb product={item.product} size="sm" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="ck-item-name" style={{ fontSize: "1.02rem" }}>{item.product.name}</div>
                  <div className="ck-meta">Qty {item.quantity} × {inr(item.product.price)}</div>
                </div>
                <div className="ck-item-price">{inr(item.totalPrice)}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24 }}>
            <CheckoutDeliveryPanel cartItems={cartItems} pincode={shippingAddress.zipCode} />
          </div>
        </Card>

        {/* ── Payment method ─────────────────────────────────────────── */}
        <Card icon={FiLock} title="Payment method" subtitle="Bank-level encryption · no card details stored">
          <div className="ck-section-label">Choose how to pay</div>
          <div role="radiogroup" aria-label="Payment method" style={{ display: "grid", gap: 12 }}>
            {PAYMENT_METHODS.map((method) => {
              const selected = selectedMethod === method.id;
              return (
                <button
                  key={method.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  className={`ck-method ${selected ? "is-selected" : ""}`}
                  onClick={() => setSelectedMethod(method.id)}
                >
                  <span className="ck-radio" aria-hidden="true">{selected && <FiCheck size={14} />}</span>
                  <span className="ck-ico" aria-hidden="true"><FiCreditCard /></span>
                  <span className="ck-method-text">
                    <span className="ck-method-title" style={{ display: "block" }}>{method.title}</span>
                    <span className="ck-method-sub">{method.subtitle}</span>
                  </span>
                  {method.badge && <span className="ck-pill ck-pill--teal">{method.badge}</span>}
                </button>
              );
            })}
          </div>

          <div className="ck-accept">
            <span>Accepted:</span>
            {ACCEPTED_PAYMENTS.map((p) => <span key={p} className="ck-tag">{p}</span>)}
          </div>

          <div className="ck-secure-box">
            <h3><FiCheckCircle size={18} /> Your payment is protected</h3>
            <div className="ck-secure-grid">
              {SECURITY_FEATURES.map(({ Icon, label }) => (
                <span key={label}><Icon size={17} aria-hidden="true" />{label}</span>
              ))}
            </div>
          </div>

          {error && <div style={{ marginTop: 24 }}><Alert kind="error">{error}</Alert></div>}

          <div className="ck-actions" style={{ marginTop: 28 }}>
            <button type="button" className="ck-btn ck-btn--ghost" onClick={() => setCurrentStep(2)} disabled={loading}>
              <FiArrowLeft size={18} /> Back
            </button>
            <button type="button" className="ck-btn ck-btn--primary ck-btn--lg" onClick={handlePay} disabled={loading} aria-label={`Pay ${inr(total)} securely`}>
              {loading ? <><Spinner /> Processing payment…</> : <><FiLock size={18} /> Pay {inr(total)} securely</>}
            </button>
          </div>
        </Card>
      </div>

      {/* ── Payment summary ───────────────────────────────────────────── */}
      <aside className="ck-aside" aria-label="Payment summary">
        <Card dark title="Payment summary" subtitle={`${count} ${count === 1 ? "item" : "items"} · final review`} noBody footer={<MiniTrust items={PAY_TRUST} />}>
          <div className="ck-card-body">
            <SummaryItems cartItems={cartItems} />
            <hr className="ck-hr" />
            <div className="ck-rows">
              <Row label="Subtotal" value={inr(subtotal)} />
              <Row label="Shipping" value={shipping === 0 ? "FREE" : inr(shipping)} tone={shipping === 0 ? "ok" : undefined} />
              {tax > 0 && <Row label="Tax (18% GST)" value={inr(tax)} />}
            </div>
            <hr className="ck-hr" />
            <Total label="Total to pay" value={inr(total)} />
          </div>
        </Card>
        <HelpCard />
      </aside>
    </div>
  );
};
