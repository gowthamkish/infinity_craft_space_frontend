import { useState, useEffect } from "react";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "react-feather";
import CouponInput from "../../components/CouponInput";
import { isCustomItem } from "../../components/CheckoutDeliveryPanel";
import api from "../../api/axios";

/* ── Shared color palette for thumbnail fallbacks ─────────────────────── */
const THUMB_COLORS = [
  ["#10b981","#059669"], ["#3b82f6","#1d4ed8"], ["#f59e0b","#d97706"],
  ["#ef4444","#dc2626"], ["#8b5cf6","#7c3aed"], ["#ec4899","#db2777"],
];

/* ── Product thumbnail ────────────────────────────────────────────────── */
export function ProductThumb({ product, className = "", size = "md" }) {
  const imgUrl   = product?.images?.[0]?.url || product?.image?.url || product?.image;
  const letter   = (product?.name || "?").charAt(0).toUpperCase();
  const colors   = THUMB_COLORS[letter.charCodeAt(0) % THUMB_COLORS.length];
  const sizeClass = size === "sm" ? "co-thumb co-thumb--sm"
                  : size === "xs" ? "co-thumb co-thumb--xs"
                  : "co-thumb";
  return (
    <div
      className={`${sizeClass} ${className}`}
      style={!imgUrl ? { background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` } : undefined}
      aria-hidden="true"
    >
      {imgUrl ? <img src={imgUrl} alt={product?.name || ""} loading="lazy" /> : letter}
    </div>
  );
}

/* ── Free shipping progress bar ────────────────────────────────────────── */
const FREE_THRESHOLD = 999;

function FreeShippingBar({ subtotal }) {
  const remaining = Math.max(0, FREE_THRESHOLD - subtotal);
  const pct       = Math.min(100, (subtotal / FREE_THRESHOLD) * 100);
  const achieved  = remaining === 0;

  return (
    <div className={`co-ship-bar${achieved ? " co-ship-bar--done" : ""}`}>
      <p className="co-ship-bar-text">
        {achieved
          ? "🎉 You've unlocked free shipping!"
          : `Add ₹${Math.ceil(remaining)} more for free shipping`}
      </p>
      <div className="co-ship-bar-track" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
        <div className="co-ship-bar-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/* ── Cross-sell strip ───────────────────────────────────────────────────── */
function CrossSellSection({ cartItems, navigate }) {
  const [recs, setRecs] = useState([]);

  useEffect(() => {
    const id = cartItems[0]?.product?._id;
    if (!id) return;
    api.get(`/api/products/${id}/recommendations`)
      .then((res) => setRecs((res.data?.recommendations || res.data?.products || []).slice(0, 3)))
      .catch(() => {});
  }, [cartItems]);

  if (!recs.length) return null;

  return (
    <div className="co-crosssell">
      <p className="co-crosssell-title">🎁 Complete the set</p>
      <div className="co-crosssell-grid">
        {recs.map((product) => {
          const img = product.images?.[0]?.url || product.image?.url || product.image;
          const slug = product.slug || product._id;
          return (
            <div
              key={product._id}
              role="button"
              tabIndex={0}
              className="co-crosssell-card"
              onClick={() => navigate(`/product/${slug}`)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") navigate(`/product/${slug}`); }}
            >
              {img && <img src={img} alt={product.name} className="co-crosssell-img" />}
              <div className="co-crosssell-info">
                <p className="co-crosssell-name">{product.name}</p>
                <p className="co-crosssell-price">₹{product.price}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Cart item row ──────────────────────────────────────────────────────── */
function CartItemRow({ item, handleQuantityChange, handleRemoveItem }) {
  const atMax   = item.product.trackInventory !== false && item.quantity >= item.product.stock;
  const lowStock = item.product.trackInventory !== false
    && item.product.stock <= (item.product.lowStockThreshold || 5)
    && item.product.stock > 0;

  return (
    <article className="co-item" aria-label={item.product.name}>
      <ProductThumb product={item.product} />

      <div className="co-item-info">
        <h3 className="co-item-name">{item.product.name}</h3>
        {isCustomItem(item) && (
          <span className="co-item-tag co-item-tag--custom">⏳ Handcrafted · 10–12 days</span>
        )}
        {item.product.description && (
          <p className="co-item-desc">
            {item.product.description.slice(0, 72)}{item.product.description.length > 72 ? "…" : ""}
          </p>
        )}
        <span className="co-item-tag co-item-tag--price">₹{item.product.price} each</span>
      </div>

      <div className="co-item-controls">
        <span className="co-item-total">₹{item.totalPrice}</span>

        <div className="co-item-actions">
          <div className="co-qty" role="group" aria-label="Quantity">
            <button
              className="co-qty-btn"
              onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              aria-label="Decrease quantity"
            >
              <Minus size={13} strokeWidth={3} />
            </button>
            <span className="co-qty-val" aria-live="polite">{item.quantity}</span>
            <button
              className="co-qty-btn"
              onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
              disabled={atMax}
              title={atMax ? `Only ${item.product.stock} available` : "Increase quantity"}
              aria-label="Increase quantity"
            >
              <Plus size={13} strokeWidth={3} />
            </button>
          </div>

          <button
            className="co-remove-btn"
            onClick={() => handleRemoveItem(item.product._id)}
            aria-label={`Remove ${item.product.name} from cart`}
          >
            <Trash2 size={13} />
          </button>
        </div>

        {lowStock && (
          <span className="co-low-stock">⚠ Only {item.product.stock} left</span>
        )}
      </div>
    </article>
  );
}

/* ── CartReviewStep ─────────────────────────────────────────────────────── */
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
      <div className="co-grid">
        {/* ── Main: cart items ─── */}
        <div className="co-main">
          <section className="co-section" aria-label="Cart items">
            <header className="co-section-head">
              <div className="co-section-icon co-section-icon--purple">
                <ShoppingBag size={18} />
              </div>
              <div>
                <h2 className="co-section-title">Your Cart</h2>
                <p className="co-section-sub">{cartItems.length} {cartItems.length === 1 ? "item" : "items"} ready to order</p>
              </div>
              <span className="co-section-badge">{cartItems.length} items</span>
            </header>

            {cartItems.some(isCustomItem) && (
              <div className="co-handcraft" role="note">
                <span style={{ fontSize: "1.05rem", flexShrink: 0 }}>⏳</span>
                <div>
                  <span className="co-handcraft-title">Handcrafted Items Notice</span>
                  <p className="co-handcraft-text">
                    Your order contains made-to-order items that require{" "}
                    <strong>10–12 business days</strong> of preparation before dispatch.
                  </p>
                </div>
              </div>
            )}

            <div className="co-items-list">
              {cartItems.map((item) => (
                <CartItemRow
                  key={item.product._id}
                  item={item}
                  handleQuantityChange={handleQuantityChange}
                  handleRemoveItem={handleRemoveItem}
                />
              ))}
            </div>
          </section>

          <CrossSellSection cartItems={cartItems} navigate={navigate} />
        </div>

        {/* ── Sidebar: order summary ─── */}
        <aside className="co-sidebar" aria-label="Order summary">
          <div className="co-summary">
            <div className="co-summary-head">
              <p className="co-summary-head-title">Order Summary</p>
              <p className="co-summary-head-sub">Review your items before checkout</p>
            </div>

            <div className="co-summary-body">
              <FreeShippingBar subtotal={subtotal} />

              {/* Item list preview */}
              <div style={{ marginBottom: "4px" }}>
                {cartItems.slice(0, 3).map((item) => (
                  <div key={item.product._id} className="co-summary-item">
                    <ProductThumb product={item.product} size="xs" />
                    <div className="co-summary-item-info">
                      <p className="co-summary-item-name">{item.product.name}</p>
                      <p className="co-summary-item-qty">Qty: {item.quantity}</p>
                    </div>
                    <span className="co-summary-item-price">₹{item.totalPrice}</span>
                  </div>
                ))}
                {cartItems.length > 3 && (
                  <p className="co-summary-more">+{cartItems.length - 3} more item{cartItems.length - 3 !== 1 ? "s" : ""}</p>
                )}
              </div>

              <hr className="co-divider" />

              {/* Price breakdown */}
              <div className="co-price-row">
                <span className="co-price-label">Subtotal</span>
                <span className="co-price-val">₹{subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="co-price-row co-price-row--discount">
                  <span className="co-price-label">Discount ({appliedCoupon.code})</span>
                  <span className="co-price-val">−₹{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="co-price-row">
                <span className="co-price-label">Shipping</span>
                <span style={{ fontSize: "0.78rem", color: "var(--co-ink-4)" }}>Calculated next</span>
              </div>
              <div className="co-price-row co-price-row--total">
                <span className="co-total-label">Total</span>
                <span className="co-total-val">₹{discountedTotal.toFixed(2)}</span>
              </div>

              <hr className="co-divider" />

              {error && (
                <div className="co-error" role="alert">⚠ {error}</div>
              )}

              <CouponInput
                cartTotal={subtotal}
                onCouponApplied={onCouponApplied}
                appliedCoupon={appliedCoupon}
                onRemoveCoupon={onRemoveCoupon}
              />

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px" }}>
                <button
                  className="co-cta"
                  onClick={proceedToCheckout}
                  disabled={cartItems.length === 0}
                  aria-label="Proceed to checkout"
                >
                  Proceed to Checkout
                  <ArrowRight size={17} />
                </button>
                <button
                  className="co-cta co-cta--outline"
                  onClick={() => navigate("/products")}
                >
                  Continue Shopping
                </button>
              </div>
            </div>

            <div className="co-trust" aria-label="Trust indicators">
              <div className="co-trust-item"><span className="co-trust-icon">🔒</span>Secure Checkout</div>
              <div className="co-trust-item"><span className="co-trust-icon">🚚</span>Fast Delivery</div>
              <div className="co-trust-item"><span className="co-trust-icon">↩</span>Easy Returns</div>
            </div>
          </div>
        </aside>
      </div>

      {/* ── Mobile sticky bar ─── */}
      <div className="co-sticky-bar">
        <div className="co-sticky-total">
          <p className="co-sticky-lbl">Order Total</p>
          <p className="co-sticky-amount">₹{discountedTotal.toFixed(2)}</p>
        </div>
        <button
          className="co-cta"
          onClick={proceedToCheckout}
          disabled={cartItems.length === 0}
          aria-label="Checkout"
        >
          Checkout <ArrowRight size={15} />
        </button>
      </div>
    </>
  );
};
