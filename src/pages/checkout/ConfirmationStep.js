import { useEffect, useRef } from "react";
import { Check, Package, MapPin, CreditCard } from "react-feather";

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
    const timer = setTimeout(() => { pieces.forEach((p) => p.remove()); }, 4000);
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
    <div className="co-confirm-wrap" ref={wrapRef} aria-live="polite">
      <Confetti container={wrapRef} />

      {/* Hero */}
      <div className="co-confirm-hero">
        <div className="co-confirm-check" aria-hidden="true">
          <Check size={44} strokeWidth={3} />
        </div>
        <h1 className="co-confirm-title">Order Confirmed! 🎉</h1>
        <p className="co-confirm-sub">
          Thank you for your order! We've received your payment and will start processing right away.
        </p>
      </div>

      {/* Detail cards */}
      {orderData && (
        <div className="co-confirm-body">
          <div className="co-confirm-cards">
            {/* Order details */}
            <div className="co-confirm-card">
              <div className="co-confirm-card-head">
                <Package size={15} className="co-confirm-card-icon co-confirm-card-icon--green" />
                <span>Order Details</span>
              </div>
              <p className="co-confirm-kv">
                <span className="co-confirm-key">ID</span>
                <span className="co-confirm-val co-confirm-val--break">{orderId}</span>
              </p>
              <p className="co-confirm-kv">
                <span className="co-confirm-key">Total</span>
                <span className="co-confirm-val">₹{orderTotal}</span>
              </p>
              <p className="co-confirm-kv">
                <span className="co-confirm-key">Items</span>
                <span className="co-confirm-val">{items.length}</span>
              </p>
              {items.length > 0 && (
                <div className="co-confirm-items">
                  {items.map((it, idx) => (
                    <div key={idx} className="co-confirm-item-row">
                      <span>{it.productName || it.name || it.product?.name} × {it.quantity}</span>
                      <span>₹{(it.totalPrice ?? it.unitPrice * it.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payment info */}
            <div className="co-confirm-card">
              <div className="co-confirm-card-head">
                <CreditCard size={15} className="co-confirm-card-icon co-confirm-card-icon--purple" />
                <span>Payment</span>
              </div>
              <p className="co-confirm-kv">
                <span className="co-confirm-key">Payment ID</span>
                <span className="co-confirm-val co-confirm-val--break">
                  {paymentData?.razorpay_payment_id || paymentData?.payment_id || "N/A"}
                </span>
              </p>
              <p className="co-confirm-kv">
                <span className="co-confirm-key">Status</span>
                <span className="co-confirm-status-badge">
                  {orderData.paymentDetails?.payment_status || "Completed"}
                </span>
              </p>
              <p className="co-confirm-kv">
                <span className="co-confirm-key">Method</span>
                <span className="co-confirm-val">{orderData.paymentDetails?.method || "Online Payment"}</span>
              </p>
            </div>

            {/* Shipping address */}
            <div className="co-confirm-card">
              <div className="co-confirm-card-head">
                <MapPin size={15} className="co-confirm-card-icon co-confirm-card-icon--amber" />
                <span>Shipping To</span>
              </div>
              <p className="co-confirm-val" style={{ lineHeight: 1.6 }}>
                {shippingAddress.street || orderData.shippingAddress?.street}<br />
                {shippingAddress.city || orderData.shippingAddress?.city},{" "}
                {shippingAddress.state || orderData.shippingAddress?.state}{" "}
                {shippingAddress.zipCode || orderData.shippingAddress?.zipCode}<br />
                {shippingAddress.country || orderData.shippingAddress?.country || "India"}
              </p>
            </div>
          </div>

          {/* Delivery estimate */}
          {deliveryRange && (
            <div className="co-confirm-delivery">
              <span className="co-confirm-delivery-icon">🚚</span>
              <div>
                <p className="co-confirm-delivery-label">Estimated Delivery</p>
                <p className="co-confirm-delivery-range">{deliveryRange}</p>
                <p className="co-confirm-delivery-note">You'll get tracking updates via WhatsApp &amp; email</p>
              </div>
            </div>
          )}

          {/* CTAs */}
          <div className="co-confirm-ctas">
            {orderId && (
              <button className="co-cta co-cta--blue" onClick={() => navigate(`/track/${orderId}`)}>
                🚚 Track Order
              </button>
            )}
            <button className="co-cta" onClick={() => navigate("/orders")}>
              View Order History
            </button>
            <button className="co-cta co-cta--outline" onClick={() => navigate("/products")}>
              Continue Shopping
            </button>
          </div>

          {/* Share strip */}
          <div className="co-confirm-share">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`I just ordered from InfinityCraftSpace! 🎁 Order ID: ${orderId ?? ""}\nTrack my order: ${window.location.origin}/track/${orderId ?? ""}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="co-share-btn co-share-btn--whatsapp"
            >
              💬 Share on WhatsApp
            </a>
            <button
              className="co-share-btn"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: "My order from InfinityCraftSpace", text: "Just ordered a handcrafted gift! 🎁", url: window.location.origin });
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
  );
};
