import { useEffect, useRef, useState } from "react";
import {
  FiCheck, FiTruck, FiPackage, FiCreditCard, FiMapPin, FiShoppingBag, FiMail, FiClock, FiShare2, FiCopy, FiMessageCircle, FiArrowRight, FiBox, FiDownload,
} from "react-icons/fi";
import { Card, inr } from "./ui";
import { downloadInvoice } from "../../utils/downloadInvoice";

/* ── Confetti ────────────────────────────────────────────────────────── */
function Confetti({ container }) {
  useEffect(() => {
    if (!container.current) return;
    const COLORS = ["#d24e33", "#0f9488", "#2dd4bf", "#f59e0b", "#e8623d", "#ff7a50"];
    const pieces = [];
    for (let i = 0; i < 60; i++) {
      const el = document.createElement("div");
      el.style.cssText = `
        position: absolute;
        left: ${Math.random() * 100}%;
        top: -${Math.random() * 20 + 10}px;
        background: ${COLORS[Math.floor(Math.random() * COLORS.length)]};
        width: ${Math.random() * 8 + 5}px;
        height: ${Math.random() * 8 + 5}px;
        border-radius: ${Math.random() > 0.5 ? "50%" : "2px"};
        animation: confettiFall ${Math.random() * 2 + 1.5}s ease-in ${Math.random() * 1}s forwards;
        pointer-events: none;
        opacity: 0.85;
      `;
      container.current.appendChild(el);
      pieces.push(el);
    }
    const styleId = "confetti-keyframes";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `@keyframes confettiFall { to { transform: translateY(500px) rotate(720deg); opacity: 0; } }`;
      document.head.appendChild(style);
    }
    const timer = setTimeout(() => { pieces.forEach((p) => p.remove()); }, 5000);
    return () => { clearTimeout(timer); pieces.forEach((p) => p.remove()); };
  }, [container]);
  return null;
}

function estimatedDelivery(backendOrder, orderData) {
  const shipping = backendOrder?.shippingDetails || orderData?.shippingDetails;
  const days = shipping?.estimatedDays;
  if (!days) return null;
  const parts = String(days).split("–").map(Number);
  const minDays = (parts[0] || 5) + 2;
  const maxDays = (parts[1] || minDays + 3) + 2;
  const fmt = (d) => d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
  const from = new Date(); from.setDate(from.getDate() + minDays);
  const to = new Date(); to.setDate(to.getDate() + maxDays);
  return `${fmt(from)} – ${fmt(to)}`;
}

/* ══════════════════════════════════════════════════════════════════════════
   STEP 4 — Confirmation
   ══════════════════════════════════════════════════════════════════════════ */
const NEXT_STEPS = [
  { Icon: FiCheck, title: "Order confirmed", text: "We've received your order and payment.", done: true },
  { Icon: FiBox, title: "Crafted & packed", text: "Your pieces are made with care and gift-packed." },
  { Icon: FiTruck, title: "On the way", text: "Tracking details arrive by WhatsApp & email." },
  { Icon: FiPackage, title: "Delivered", text: "Unbox something made just for you." },
];

export const ConfirmationStep = ({
  orderData,
  paymentData,
  shippingAddress,
  total,
  navigate,
  backendOrder,
}) => {
  const wrapRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [invoiceState, setInvoiceState] = useState({ busy: false, error: "" });
  const orderId = backendOrder?._id || orderData?.orderId || orderData?.id || orderData?._id;
  const orderTotal = backendOrder?.totalAmount ?? orderData?.total ?? total ?? 0;
  const items = backendOrder?.items || orderData?.items || [];
  const deliveryRange = estimatedDelivery(backendOrder, orderData);
  const addr = {
    street: shippingAddress.street || orderData?.shippingAddress?.street,
    city: shippingAddress.city || orderData?.shippingAddress?.city,
    state: shippingAddress.state || orderData?.shippingAddress?.state,
    zip: shippingAddress.zipCode || orderData?.shippingAddress?.zipCode,
    country: shippingAddress.country || orderData?.shippingAddress?.country || "India",
  };
  const trackUrl = `${window.location.origin}/track/${orderId ?? ""}`;

  const handleInvoice = async () => {
    setInvoiceState({ busy: true, error: "" });
    try { await downloadInvoice(orderId); setInvoiceState({ busy: false, error: "" }); }
    catch (e) { setInvoiceState({ busy: false, error: e.message }); }
  };

  const copyLink = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: "My order from InfinityCraftSpace", text: "Just ordered a handcrafted gift! 🎁", url: trackUrl });
        return;
      }
      await navigator.clipboard.writeText(trackUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { /* share dialog dismissed */ }
  };

  return (
    <div ref={wrapRef} className="ck-main" style={{ position: "relative" }} aria-live="polite">
      <Confetti container={wrapRef} />

      {/* ── Success hero ───────────────────────────────────────────────── */}
      <section className="ck-card ck-hero">
        <div className="ck-hero-check" aria-hidden="true"><FiCheck /></div>
        <h2>Order confirmed! 🎉</h2>
        <p>Thank you for shopping with us. Your order has been received and we'll start working on it right away.</p>
        {orderId && <div className="ck-order-id">Order #{orderId}</div>}

        {deliveryRange && (
          <div className="ck-eta">
            <span className="ck-ico ck-ico--teal" aria-hidden="true"><FiTruck /></span>
            <div className="ck-eta-text">
              <small>Expected delivery</small>
              <strong>{deliveryRange}</strong>
            </div>
          </div>
        )}

        <div className="ck-actions ck-actions--center">
          {orderId && (
            <button type="button" className="ck-btn ck-btn--primary ck-btn--lg" onClick={() => navigate(`/track/${orderId}`)}>
              <FiTruck size={18} /> Track my order <FiArrowRight size={18} />
            </button>
          )}
          {orderId && backendOrder && (
            <button type="button" className="ck-btn ck-btn--ghost ck-btn--lg" onClick={handleInvoice} disabled={invoiceState.busy}>
              <FiDownload size={18} /> {invoiceState.busy ? "Preparing…" : "Download invoice"}
            </button>
          )}
          <button type="button" className="ck-btn ck-btn--ghost ck-btn--lg" onClick={() => navigate("/orders")}>
            <FiPackage size={18} /> View orders
          </button>
          <button type="button" className="ck-btn ck-btn--ghost ck-btn--lg" onClick={() => navigate("/products")}>
            <FiShoppingBag size={18} /> Continue shopping
          </button>
        </div>
        {invoiceState.error && <div role="alert" style={{ marginTop: 14, color: "#b91c1c", fontSize: "0.9rem" }}>{invoiceState.error}</div>}
      </section>

      {orderData && (
        <>
          {/* ── Details ──────────────────────────────────────────────── */}
          <div className="ck-grid3">
            <Card icon={FiPackage} title="Order details">
              <dl className="ck-kv"><dt>Order total</dt><dd className="big">{inr(orderTotal)}</dd></dl>
              <dl className="ck-kv"><dt>Items ordered</dt><dd>{items.length} item{items.length !== 1 ? "s" : ""}</dd></dl>
              {items.length > 0 && (
                <div className="ck-lines">
                  {items.map((it, idx) => (
                    <div key={idx}>
                      <span>{it.productName || it.name || it.product?.name} × {it.quantity}</span>
                      <b>{inr(it.totalPrice ?? it.unitPrice * it.quantity)}</b>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card icon={FiCreditCard} tint="teal" title="Payment">
              <dl className="ck-kv"><dt>Status</dt><dd><span className="ck-pill ck-pill--teal">Payment successful</span></dd></dl>
              <dl className="ck-kv"><dt>Payment ID</dt><dd className="mono">{paymentData?.razorpay_payment_id || paymentData?.payment_id || "N/A"}</dd></dl>
              <dl className="ck-kv"><dt>Method</dt><dd>{orderData.paymentDetails?.method || "Online payment"}</dd></dl>
            </Card>

            <Card icon={FiMapPin} title="Shipping to">
              <address style={{ fontStyle: "normal", fontSize: "1.02rem", lineHeight: 1.8, color: "var(--ics-text)" }}>
                {addr.street}
                <br />
                {addr.city}, {addr.state}
                <br />
                PIN: {addr.zip}
                <br />
                {addr.country}
              </address>
              {shippingAddress.phone && <p className="ck-meta" style={{ marginTop: 14 }}>📞 {shippingAddress.phone}</p>}
            </Card>
          </div>

          {/* ── What happens next ─────────────────────────────────────── */}
          <Card icon={FiClock} tint="teal" title="What happens next" subtitle="We'll keep you posted at every step">
            <ol className="ck-timeline">
              {NEXT_STEPS.map(({ Icon, title, text, done }) => (
                <li key={title} className={`ck-tl ${done ? "is-done" : ""}`}>
                  <div className="ck-tl-dot" aria-hidden="true"><Icon /></div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </li>
              ))}
            </ol>
          </Card>

          {/* ── Share ─────────────────────────────────────────────────── */}
          <section className="ck-card ck-share">
            <span className="ck-ico" aria-hidden="true"><FiShare2 /></span>
            <div className="ck-share-text">
              <h3>Loved your experience?</h3>
              <p>Share your order with friends and family.</p>
            </div>
            <a
              className="ck-btn ck-btn--teal"
              href={`https://wa.me/?text=${encodeURIComponent(`I just ordered from InfinityCraftSpace! 🎁 Order ID: ${orderId ?? ""}\nTrack my order: ${trackUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none" }}
            >
              <FiMessageCircle size={18} /> Share on WhatsApp
            </a>
            <button type="button" className="ck-btn ck-btn--ghost" onClick={copyLink}>
              <FiCopy size={18} /> {copied ? "Link copied ✓" : "Share order"}
            </button>
          </section>

          <p className="ck-email-note">
            <FiMail size={17} aria-hidden="true" /> You'll receive a confirmation email with your order details shortly.
          </p>
        </>
      )}
    </div>
  );
};
