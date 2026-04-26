import { useState, useEffect } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import { Trash2, Plus, Minus, Package, ShoppingCart, ArrowRight } from "react-feather";
import CouponInput from "../../components/CouponInput";
import { isCustomItem } from "../../components/CheckoutDeliveryPanel";
import api from "../../api/axios";

// ── Shared product thumbnail (real image → letter fallback) ─────
const THUMB_COLORS = [
  ["#10b981", "#059669"],
  ["#3b82f6", "#1d4ed8"],
  ["#f59e0b", "#d97706"],
  ["#ef4444", "#dc2626"],
  ["#8b5cf6", "#7c3aed"],
  ["#ec4899", "#db2777"],
];

export function ProductThumb({ product, className = "", size = "md" }) {
  const imgUrl = product?.images?.[0]?.url || product?.image?.url;
  const letter = (product?.name || "?").charAt(0).toUpperCase();
  const colorPair = THUMB_COLORS[letter.charCodeAt(0) % THUMB_COLORS.length];

  const sizeClass = size === "sm" ? "co-thumb co-thumb--sm" : size === "xs" ? "co-thumb co-thumb--xs" : "co-thumb";

  return (
    <div
      className={`${sizeClass} ${className}`}
      style={!imgUrl ? { background: `linear-gradient(135deg, ${colorPair[0]}, ${colorPair[1]})` } : undefined}
    >
      {imgUrl ? (
        <img src={imgUrl} alt={product?.name || ""} loading="lazy" />
      ) : (
        letter
      )}
    </div>
  );
}

// ── Cross-sell strip ─────────────────────────────────────────────
function CrossSellSection({ cartItems, navigate }) {
  const [recs, setRecs] = useState([]);

  useEffect(() => {
    if (!cartItems?.length) return;
    const firstProductId = cartItems[0]?.product?._id;
    if (!firstProductId) return;
    api
      .get(`/api/products/${firstProductId}/recommendations`)
      .then((res) => {
        const products = res.data?.recommendations || res.data?.products || [];
        setRecs(products.slice(0, 3));
      })
      .catch(() => {});
  }, [cartItems]);

  if (!recs.length) return null;

  return (
    <div style={{ marginTop: "1.5rem" }}>
      <h6 style={{ fontWeight: 700, color: "#374151", marginBottom: "1rem", fontSize: "0.9rem" }}>
        🎁 Complete the set
      </h6>
      <Row className="g-3">
        {recs.map((product) => {
          const img = product.images?.[0]?.url || product.image?.url;
          return (
            <Col xs={12} sm={4} key={product._id}>
              <div
                role="button"
                tabIndex={0}
                style={{ border: "1.5px solid #e5e7eb", borderRadius: 12, cursor: "pointer", overflow: "hidden", transition: "all 0.2s ease" }}
                onClick={() => navigate(`/product/${product.slug || product._id}`)}
                onKeyDown={(e) => { if (e.key === "Enter") navigate(`/product/${product.slug || product._id}`); }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#10b981"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(16,185,129,0.15)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.boxShadow = "none"; }}
              >
                {img && (
                  <img src={img} alt={product.name} style={{ width: "100%", height: 110, objectFit: "cover", display: "block" }} />
                )}
                <div style={{ padding: "0.6rem 0.75rem" }}>
                  <p style={{ fontSize: "0.8rem", fontWeight: 600, margin: 0, color: "#111827", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                    {product.name}
                  </p>
                  <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "#7c3aed", margin: "0.2rem 0 0" }}>
                    ₹{product.price}
                  </p>
                </div>
              </div>
            </Col>
          );
        })}
      </Row>
    </div>
  );
}

// ── Free shipping progress bar ───────────────────────────────────
const FREE_SHIPPING_THRESHOLD = 999;

function FreeShippingBar({ subtotal }) {
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const pct = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const achieved = remaining === 0;

  return (
    <div className={`co-free-ship ${achieved ? "co-free-ship--achieved" : ""}`}>
      <p style={{ margin: "0 0 0.4rem", fontSize: "0.82rem", fontWeight: 600, color: achieved ? "#065f46" : "#374151" }}>
        {achieved ? "🎉 You've unlocked free shipping!" : `Add ₹${Math.ceil(remaining)} more for free shipping`}
      </p>
      <div className="co-free-ship-track">
        <div className="co-free-ship-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ── CartReviewStep ────────────────────────────────────────────────
export const CartReviewStep = ({
  cartItems,
  subtotal,
  total,
  error,
  proceedToCheckout,
  navigate,
  handleQuantityChange,
  handleRemoveItem,
  onCouponApplied,
  onRemoveCoupon,
  appliedCoupon,
}) => {
  const discount = appliedCoupon
    ? appliedCoupon.discountType === "percent"
      ? (subtotal * appliedCoupon.discountValue) / 100
      : appliedCoupon.discountValue
    : 0;
  const discountedTotal = Math.max(0, total - discount);

  return (
    <>
      <Row>
        {/* ── Left: cart items ─────────────────────────────── */}
        <Col lg={8} xs={12}>
          <Card className="co-card">
            <Card.Header
              className="co-card-header"
              style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
            >
              <div className="d-flex align-items-center">
                <Package size={22} style={{ color: "white", marginRight: "0.6rem", strokeWidth: 2.5 }} />
                <h4 className="mb-0" style={{ color: "white", fontWeight: 700, fontSize: "clamp(1rem, 4vw, 1.4rem)", letterSpacing: "-0.02em" }}>
                  Review Your Cart
                </h4>
                <span style={{ marginLeft: "auto", background: "rgba(255,255,255,0.25)", color: "white", fontSize: "0.82rem", fontWeight: 700, padding: "0.35rem 0.9rem", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.3)" }}>
                  {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
                </span>
              </div>
            </Card.Header>

            <Card.Body style={{ padding: 0, background: "#fafafa" }}>
              {/* Handcrafted notice */}
              {cartItems.some(isCustomItem) && (
                <div className="co-handcraft-notice">
                  <span style={{ fontSize: "1.1rem" }}>⏳</span>
                  <div>
                    <strong style={{ fontSize: "0.88rem", color: "#78350f", display: "block" }}>Handcrafted Items Notice</strong>
                    <span style={{ fontSize: "0.82rem", lineHeight: 1.5 }}>
                      Your order contains made-to-order items that require <strong>10–12 business days</strong> of preparation before dispatch.
                    </span>
                  </div>
                </div>
              )}

              {/* Cart items */}
              <div style={{ padding: "0.75rem" }}>
                {cartItems.map((item) => (
                  <CartItemRow
                    key={item.product._id}
                    item={item}
                    handleQuantityChange={handleQuantityChange}
                    handleRemoveItem={handleRemoveItem}
                  />
                ))}
              </div>
            </Card.Body>
          </Card>

          <CrossSellSection cartItems={cartItems} navigate={navigate} />
        </Col>

        {/* ── Right: order summary ──────────────────────────── */}
        <Col lg={4}>
          <Card className="co-summary-card">
            <Card.Header
              className="co-card-header"
              style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}
            >
              <div className="d-flex align-items-center gap-2">
                <ShoppingCart size={20} style={{ color: "white" }} />
                <h5 className="mb-0" style={{ color: "white", fontWeight: 800, fontSize: "1.1rem", letterSpacing: "-0.02em" }}>
                  Order Summary
                </h5>
              </div>
              <p className="mb-0 mt-1" style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.9)" }}>
                Review before checkout
              </p>
            </Card.Header>

            <Card.Body className="co-summary-body">
              <FreeShippingBar subtotal={subtotal} />

              {/* Item list preview */}
              <div style={{ marginBottom: "1rem" }}>
                {cartItems.slice(0, 3).map((item) => (
                  <div key={item.product._id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                    <ProductThumb product={item.product} size="xs" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: "0.82rem", fontWeight: 600, color: "#1f2937", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.product.name}
                      </p>
                      <p style={{ margin: 0, fontSize: "0.72rem", color: "#6b7280" }}>Qty: {item.quantity}</p>
                    </div>
                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#374151", flexShrink: 0 }}>₹{item.totalPrice}</span>
                  </div>
                ))}
                {cartItems.length > 3 && (
                  <p style={{ fontSize: "0.8rem", color: "#6b7280", margin: 0, textAlign: "center" }}>
                    +{cartItems.length - 3} more item{cartItems.length - 3 !== 1 ? "s" : ""}
                  </p>
                )}
              </div>

              <hr style={{ borderColor: "#e5e7eb", margin: "1rem 0" }} />

              {/* Price breakdown */}
              <div style={{ marginBottom: "1rem" }}>
                <div className="co-summary-row">
                  <span style={{ color: "#6b7280" }}>Subtotal</span>
                  <span style={{ fontWeight: 600 }}>₹{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="co-summary-row">
                    <span style={{ color: "#059669" }}>Discount ({appliedCoupon.code})</span>
                    <span style={{ fontWeight: 700, color: "#059669" }}>−₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="co-summary-row">
                  <span style={{ color: "#6b7280" }}>Shipping</span>
                  <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Calculated next</span>
                </div>
                <div className="co-summary-row co-summary-row--total">
                  <span className="co-summary-total-label">Total</span>
                  <span className="co-summary-total-val">₹{discountedTotal.toFixed(2)}</span>
                </div>
              </div>

              {error && (
                <div style={{ background: "#fef2f2", border: "1.5px solid #fee2e2", borderRadius: 12, padding: "0.75rem 1rem", marginBottom: "1rem", fontSize: "0.875rem", color: "#dc2626", fontWeight: 600 }}>
                  {error}
                </div>
              )}

              {/* Coupon */}
              <CouponInput
                cartTotal={subtotal}
                onCouponApplied={onCouponApplied}
                appliedCoupon={appliedCoupon}
                onRemoveCoupon={onRemoveCoupon}
              />

              {/* CTAs */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
                <button
                  className="co-cta-btn"
                  onClick={proceedToCheckout}
                  disabled={cartItems.length === 0}
                >
                  Proceed to Checkout
                  <ArrowRight size={18} />
                </button>
                <button
                  style={{ padding: "13px", borderRadius: "14px", fontWeight: 600, border: "1.5px solid #e5e7eb", background: "white", color: "#6b7280", cursor: "pointer", transition: "all 0.15s ease" }}
                  onClick={() => navigate("/products")}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#f9fafb"; e.currentTarget.style.borderColor = "#d1d5db"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "#e5e7eb"; }}
                >
                  Continue Shopping
                </button>
              </div>
            </Card.Body>

            <div className="co-trust-row">
              <span className="co-trust-badge">🔒 Secure Checkout</span>
              <span className="co-trust-badge">🚚 Fast Delivery</span>
              <span className="co-trust-badge">↩ Easy Returns</span>
            </div>
          </Card>
        </Col>
      </Row>

      {/* ── Mobile sticky bar ─────────────────────────────── */}
      <div className="co-sticky-bar">
        <div className="co-sticky-total">
          <p className="co-sticky-total-label">Order Total</p>
          <p className="co-sticky-total-amount">₹{discountedTotal.toFixed(2)}</p>
        </div>
        <button
          className="co-cta-btn"
          style={{ flex: "0 0 auto", width: "auto", padding: "13px 20px", fontSize: "0.95rem" }}
          onClick={proceedToCheckout}
          disabled={cartItems.length === 0}
        >
          Checkout <ArrowRight size={16} />
        </button>
      </div>
    </>
  );
};

// ── CartItemRow component ────────────────────────────────────────
function CartItemRow({ item, handleQuantityChange, handleRemoveItem }) {
  const atMax = item.product.trackInventory !== false && item.quantity >= item.product.stock;
  const lowStock = item.product.trackInventory !== false && item.product.stock <= (item.product.lowStockThreshold || 5) && item.product.stock > 0;

  return (
    <div className="co-item-card" style={{ padding: "1rem 1.1rem", marginBottom: "0.75rem" }}>
      {/* Desktop */}
      <div className="d-none d-md-flex align-items-center gap-3">
        <ProductThumb product={item.product} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h6 style={{ margin: "0 0 0.25rem", color: "#1f2937", fontWeight: 700, fontSize: "1rem", letterSpacing: "-0.01em" }}>
            {item.product.name}
          </h6>
          {isCustomItem(item) && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", background: "#fef3c7", border: "1px solid #fcd34d", color: "#92400e", padding: "0.15rem 0.55rem", borderRadius: "20px", fontSize: "0.72rem", fontWeight: 600, marginBottom: "0.35rem" }}>
              ⏳ Handcrafted · 10–12 days
            </span>
          )}
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#6b7280", lineHeight: 1.4 }}>
            {item.product.description?.slice(0, 80)}{item.product.description?.length > 80 ? "…" : ""}
          </p>
          <span style={{ display: "inline-flex", alignItems: "center", background: "linear-gradient(135deg, #10b981, #059669)", color: "white", padding: "0.25rem 0.7rem", borderRadius: "20px", fontWeight: 700, fontSize: "0.88rem", marginTop: "0.35rem" }}>
            ₹{item.product.price}
          </span>
        </div>

        {/* Qty stepper + price + remove — all in one row */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexShrink: 0 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.3rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <button className="co-qty-btn" onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)} disabled={item.quantity <= 1} aria-label="Decrease quantity">
                <Minus size={14} strokeWidth={3} />
              </button>
              <span className="co-qty-val">{item.quantity}</span>
              <button className="co-qty-btn" onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)} disabled={atMax} title={atMax ? `Only ${item.product.stock} available` : "Add one"} aria-label="Increase quantity">
                <Plus size={14} strokeWidth={3} />
              </button>
            </div>
            {lowStock && (
              <span style={{ fontSize: "0.7rem", color: "#f59e0b", fontWeight: 600, background: "#fef3c7", padding: "0.15rem 0.5rem", borderRadius: "8px", whiteSpace: "nowrap" }}>
                ⚠ Only {item.product.stock} left
              </span>
            )}
          </div>

          <p style={{ margin: 0, color: "#1f2937", fontSize: "1.2rem", fontWeight: 800, letterSpacing: "-0.02em", minWidth: "70px", textAlign: "right" }}>
            ₹{item.totalPrice}
          </p>
          <button className="co-remove-btn" onClick={() => handleRemoveItem(item.product._id)} aria-label={`Remove ${item.product.name}`}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Mobile */}
      <div className="d-flex d-md-none gap-3">
        <ProductThumb product={item.product} size="sm" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <div style={{ minWidth: 0 }}>
              <h6 style={{ margin: "0 0 0.2rem", color: "#1f2937", fontWeight: 700, fontSize: "0.92rem" }}>
                {item.product.name}
              </h6>
              <span style={{ fontSize: "0.82rem", color: "#10b981", fontWeight: 700 }}>₹{item.product.price}</span>
            </div>
            <button className="co-remove-btn" onClick={() => handleRemoveItem(item.product._id)} aria-label={`Remove ${item.product.name}`}>
              <Trash2 size={13} />
            </button>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <button className="co-qty-btn" style={{ width: 30, height: 30 }} onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)} disabled={item.quantity <= 1}>
                <Minus size={12} />
              </button>
              <span className="co-qty-val" style={{ fontSize: "0.95rem" }}>{item.quantity}</span>
              <button className="co-qty-btn" style={{ width: 30, height: 30 }} onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)} disabled={atMax}>
                <Plus size={12} />
              </button>
              {lowStock && <span style={{ fontSize: "0.65rem", color: "#f59e0b", marginLeft: 4 }}>Only {item.product.stock} left</span>}
            </div>
            <span style={{ fontSize: "1rem", fontWeight: 800, color: "#1f2937" }}>₹{item.totalPrice}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
