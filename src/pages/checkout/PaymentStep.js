import { useState } from "react";
import { Lock, CreditCard, Check, ArrowLeft } from "react-feather";
import { DotsLoader } from "../../components/Loader";
import CheckoutDeliveryPanel from "../../components/CheckoutDeliveryPanel";
import { ProductThumb } from "./CartReviewStep";

const PAYMENT_METHODS = [
  {
    id: "razorpay",
    icon: <CreditCard size={20} color="white" />,
    iconBg: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
    title: "Card / UPI / NetBanking",
    subtitle: "Powered by Razorpay · Instant & Secure",
    badge: "Recommended",
  },
];

const SECURITY_FEATURES = [
  "256-bit SSL Encryption",
  "PCI DSS Compliant",
  "No Card Details Stored",
  "Bank-Level Security",
];

const ACCEPTED_PAYMENTS = ["Visa", "Mastercard", "UPI", "Paytm", "GPay", "PhonePe"];

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
    <>
      <div className="co-grid">
        {/* ── Left: payment method ── */}
        <div className="co-main">
          <section className="co-section" aria-label="Payment method">
            <header className="co-section-head co-section-head--pay">
              <div className="co-section-icon co-section-icon--purple">
                <Lock size={18} />
              </div>
              <div>
                <h2 className="co-section-title">Secure Payment</h2>
                <p className="co-section-sub">Bank-level encryption · No card details stored</p>
              </div>
            </header>

            <div className="co-section-body">
              <p className="co-method-heading">Choose Payment Method</p>

              <div className="co-method-cards">
                {PAYMENT_METHODS.map((method) => (
                  <div
                    key={method.id}
                    role="radio"
                    aria-checked={selectedMethod === method.id}
                    tabIndex={0}
                    className={`co-method-card${selectedMethod === method.id ? " co-method-card--selected" : ""}`}
                    onClick={() => setSelectedMethod(method.id)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedMethod(method.id); }}
                  >
                    <div className={`co-method-radio${selectedMethod === method.id ? " co-method-radio--on" : ""}`} aria-hidden="true">
                      {selectedMethod === method.id && <Check size={11} strokeWidth={3.5} />}
                    </div>
                    <div className="co-method-icon" style={{ background: method.iconBg }}>
                      {method.icon}
                    </div>
                    <div className="co-method-info">
                      <p className="co-method-title">{method.title}</p>
                      <p className="co-method-sub">{method.subtitle}</p>
                    </div>
                    {method.badge && (
                      <span className="co-method-badge">{method.badge}</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Security box */}
              <div className="co-security">
                <p className="co-security-title">🔒 Your Payment is Protected</p>
                <div className="co-security-grid">
                  {SECURITY_FEATURES.map((item) => (
                    <div key={item} className="co-security-item">
                      <div className="co-security-check" aria-hidden="true">
                        <Check size={9} strokeWidth={3.5} />
                      </div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Accepted payments */}
              <div className="co-pay-chips">
                <span className="co-pay-chips-label">Accepted:</span>
                {ACCEPTED_PAYMENTS.map((p) => (
                  <span key={p} className="co-pay-chip">{p}</span>
                ))}
              </div>

              {error && (
                <div className="co-error" role="alert">⚠ {error}</div>
              )}

              <div className="co-actions">
                <button className="co-back" onClick={() => setCurrentStep(2)} disabled={loading}>
                  <ArrowLeft size={15} /> Back
                </button>
                <button
                  className="co-cta co-cta--pay"
                  onClick={handlePay}
                  disabled={loading}
                  aria-label={`Pay ₹${total.toFixed(2)} securely`}
                >
                  {loading ? (
                    <><DotsLoader size="sm" /> Processing…</>
                  ) : (
                    <><Lock size={15} /> Pay ₹{total.toFixed(2)} Securely</>
                  )}
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* ── Right: payment summary ── */}
        <aside className="co-sidebar" aria-label="Payment summary">
          <div className="co-summary">
            <div className="co-summary-head">
              <p className="co-summary-head-title">Payment Summary</p>
              <p className="co-summary-head-sub">Final order review</p>
            </div>

            <div className="co-summary-body">
              <p className="co-summary-items-label">Order Items ({cartItems.length})</p>
              {cartItems.slice(0, 3).map((item) => (
                <div key={item.product._id} className="co-summary-item">
                  <ProductThumb product={item.product} size="xs" />
                  <div className="co-summary-item-info">
                    <p className="co-summary-item-name">{item.product.name}</p>
                    <p className="co-summary-item-qty">Qty {item.quantity} × ₹{item.product.price}</p>
                  </div>
                  <span className="co-summary-item-price">₹{item.totalPrice}</span>
                </div>
              ))}
              {cartItems.length > 3 && (
                <p className="co-summary-more">+{cartItems.length - 3} more items</p>
              )}

              {/* Shipping address preview */}
              <div className="co-addr-preview">
                <p className="co-addr-preview-label">📍 Shipping to</p>
                <p className="co-addr-preview-text">
                  {shippingAddress.street}<br />
                  {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}
                </p>
              </div>

              <CheckoutDeliveryPanel cartItems={cartItems} pincode={shippingAddress.zipCode} />

              <hr className="co-divider" />

              <div className="co-price-row">
                <span className="co-price-label">Subtotal</span>
                <span className="co-price-val">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="co-price-row">
                <span className="co-price-label">
                  Shipping
                  {shipping === 0 && <span className="co-free-badge">FREE</span>}
                </span>
                <span className="co-price-val">₹{shipping.toFixed(2)}</span>
              </div>
              {tax > 0 && (
                <div className="co-price-row">
                  <span className="co-price-label">Tax (18% GST)</span>
                  <span className="co-price-val">₹{tax.toFixed(2)}</span>
                </div>
              )}
              <div className="co-price-row co-price-row--total">
                <span className="co-total-label">Total to Pay</span>
                <span className="co-total-val">₹{total.toFixed(2)}</span>
              </div>
            </div>

            <div className="co-trust" aria-label="Trust indicators">
              <div className="co-trust-item"><span className="co-trust-icon">🔒</span>Encrypted</div>
              <div className="co-trust-item"><span className="co-trust-icon">🏦</span>PCI-DSS</div>
              <div className="co-trust-item"><span className="co-trust-icon">✅</span>Verified</div>
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile sticky pay bar */}
      <div className="co-sticky-bar">
        <div className="co-sticky-total">
          <p className="co-sticky-lbl">Total to Pay</p>
          <p className="co-sticky-amount">₹{total.toFixed(2)}</p>
        </div>
        <button
          className="co-cta co-cta--pay"
          onClick={handlePay}
          disabled={loading}
        >
          {loading ? <DotsLoader size="sm" /> : <><Lock size={15} /> Pay Now</>}
        </button>
      </div>
    </>
  );
};
