import { useState } from "react";
import { useDispatch } from "react-redux";
import {
  FiShoppingBag, FiArrowRight, FiArrowLeft, FiPlus, FiMinus, FiTrash2, FiEdit2, FiTag,
  FiLock, FiTruck, FiRefreshCw,
} from "react-icons/fi";
import CouponInput from "../../components/CouponInput";
import { isCustomItem } from "../../components/CheckoutDeliveryPanel";
import { updateCartItemNote } from "../../features/cartSlice";
import { useGetRecommendationsQuery } from "../../services/productsApi";
import { Thumb, Card, Alert, SummaryItems, Row, Total, MiniTrust, TRUST_MINI, HelpCard, inr, productImage } from "./ui";
import { PLACEHOLDER_SRC, onImgError } from "../../utils/imageFallback";

const FREE_THRESHOLD = 999;

/** Discount to show for an applied coupon: trust the amount the API calculated, else derive it. */
function couponDiscount(coupon, subtotal) {
  if (!coupon) return 0;
  if (typeof coupon.discount === "number") return coupon.discount;
  const isPercent = coupon.discountType === "percent" || coupon.discountType === "percentage";
  return isPercent ? (subtotal * coupon.discountValue) / 100 : coupon.discountValue || 0;
}

/* ── Free-shipping progress ─────────────────────────────────────────────── */
function FreeShippingBar({ subtotal }) {
  const remaining = Math.max(0, FREE_THRESHOLD - subtotal);
  const achieved = remaining === 0;
  const pct = Math.min(100, (subtotal / FREE_THRESHOLD) * 100);
  return (
    <div style={{ marginBottom: 24 }}>
      <div className="ck-ship-msg" style={{ color: achieved ? "#15803d" : "var(--ics-text)" }}>
        {achieved ? "🎉 You've unlocked free shipping!" : `Add ${inr(remaining).replace(".00", "")} more for free shipping`}
      </div>
      <div className={`ck-bar ${achieved ? "ck-bar--ok" : ""}`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)}>
        <i style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/* ── One cart line ──────────────────────────────────────────────────────── */
function CartItemRow({ item, handleQuantityChange, handleRemoveItem }) {
  const dispatch = useDispatch();
  const { product } = item;
  const tracked = product.trackInventory !== false;
  const atMax = tracked && item.quantity >= product.stock;
  const lowStock = tracked && product.stock <= (product.lowStockThreshold || 5) && product.stock > 0;

  const isCustom = isCustomItem(item);
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteValue, setNoteValue] = useState(item.customNote || "");

  const saveNote = () => {
    dispatch(updateCartItemNote({ productId: product._id, customNote: noteValue.trim() }));
    setNoteOpen(false);
  };

  return (
    <article className="ck-item">
      <Thumb product={product} />

      <div style={{ minWidth: 0 }}>
        <div className="ck-item-top">
          <div style={{ minWidth: 0 }}>
            <h3 className="ck-item-name">{product.name}</h3>
            <div className="ck-meta">{inr(product.price)} per unit</div>
          </div>
          <div className="ck-item-price">{inr(item.totalPrice)}</div>
        </div>

        {(isCustom || lowStock) && (
          <div className="ck-item-tags">
            {isCustom && <span className="ck-pill ck-pill--soft">✦ Handcrafted · 10–12 days</span>}
            {lowStock && <span className="ck-pill ck-pill--warn">Only {product.stock} left</span>}
          </div>
        )}

        {isCustom && (
          <>
            {!noteOpen && (
              <div className="ck-note-row" style={{ marginTop: 14 }}>
                {item.customNote ? (
                  <div className="ck-note" style={{ margin: 0, flex: 1 }}>
                    <div className="ck-note-title">Your personalization</div>
                    <div className="ck-note-text">{item.customNote}</div>
                  </div>
                ) : (
                  <span className="ck-meta" style={{ margin: 0, fontStyle: "italic" }}>No personalization added yet</span>
                )}
                <button type="button" className="ck-link ck-link--ember" onClick={() => { setNoteValue(item.customNote || ""); setNoteOpen(true); }}>
                  <FiEdit2 size={15} /> {item.customNote ? "Edit" : "Personalize"}
                </button>
              </div>
            )}
            {noteOpen && (
              <div className="ck-note">
                <div className="ck-note-title">✦ Personalize this item</div>
                <textarea
                  className="ck-textarea"
                  rows={3}
                  placeholder="Add your instructions — e.g. name, colour, date or a short message…"
                  value={noteValue}
                  onChange={(e) => setNoteValue(e.target.value.slice(0, 300))}
                  aria-label={`Personalization for ${product.name}`}
                />
                <div className="ck-note-row">
                  <span className="ck-note-count">{noteValue.length}/300</span>
                  <span style={{ display: "flex", gap: 10 }}>
                    <button type="button" className="ck-btn ck-btn--ghost" style={{ minHeight: 42, padding: "0 18px" }} onClick={() => setNoteOpen(false)}>Cancel</button>
                    <button type="button" className="ck-btn ck-btn--primary" style={{ minHeight: 42, padding: "0 20px" }} onClick={saveNote}>Save</button>
                  </span>
                </div>
              </div>
            )}
          </>
        )}

        <div className="ck-item-foot">
          <div className="ck-qty" role="group" aria-label={`Quantity for ${product.name}`}>
            <button type="button" aria-label="Decrease quantity" onClick={() => handleQuantityChange(product._id, item.quantity - 1)} disabled={item.quantity <= 1}>
              <FiMinus size={16} />
            </button>
            <span aria-live="polite">{item.quantity}</span>
            <button type="button" aria-label="Increase quantity" onClick={() => handleQuantityChange(product._id, item.quantity + 1)} disabled={atMax}>
              <FiPlus size={16} />
            </button>
          </div>
          <button type="button" className="ck-link" onClick={() => handleRemoveItem(product._id)}>
            <FiTrash2 size={16} /> Remove
          </button>
        </div>
      </div>
    </article>
  );
}

/* ── "You might also like" ──────────────────────────────────────────────── */
function CrossSell({ cartItems, navigate }) {
  // Cached per product id — editing quantities no longer re-requests the same recommendations.
  const firstId = cartItems[0]?.product?._id;
  const { data } = useGetRecommendationsQuery({ productId: firstId, limit: 6 }, { skip: !firstId });
  const recs = (data ?? []).slice(0, 3);
  if (!recs.length) return null;

  return (
    <Card icon={FiTag} className="ck-after" title="You might also like" subtitle="Handpicked to go with your order">
      <div className="ck-recs">
        {recs.map((p) => (
          <button key={p._id} type="button" className="ck-rec" onClick={() => navigate(`/product/${p.slug || p._id}`)}>
            <div className="ck-thumb ck-thumb--sm">
              <img src={productImage(p) || PLACEHOLDER_SRC} alt="" loading="lazy" onError={onImgError} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div className="ck-rec-name">{p.name}</div>
              <div className="ck-rec-price">{inr(p.price).replace(".00", "")}</div>
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
}

const PROMISES = [
  { Icon: FiLock, title: "Secure checkout", text: "Encrypted payments via Razorpay" },
  { Icon: FiTruck, title: "Free shipping ₹999+", text: "Delivered across India" },
  { Icon: FiRefreshCw, title: "Easy returns", text: "7-day hassle-free returns" },
];

/* ══════════════════════════════════════════════════════════════════════════
   STEP 1 — Cart review
   ══════════════════════════════════════════════════════════════════════════ */
export const CartReviewStep = ({
  cartItems, subtotal, total, error,
  proceedToCheckout, navigate,
  handleQuantityChange, handleRemoveItem,
  onCouponApplied, onRemoveCoupon, appliedCoupon,
}) => {
  const discount = couponDiscount(appliedCoupon, subtotal);
  const discountedTotal = Math.max(0, total - discount);
  const hasCustom = cartItems.some(isCustomItem);
  const missingNotes = cartItems.some((i) => isCustomItem(i) && !i.customNote);
  const count = cartItems.length;

  return (
    <div className="ck-grid">
      <div className="ck-main">
        <Card
          icon={FiShoppingBag}
          title="Your cart"
          subtitle="Review your items before checkout"
          badge={<span className="ck-pill">{count} {count === 1 ? "item" : "items"}</span>}
          noBody
          footer={
            <button type="button" className="ck-link" onClick={() => navigate("/products")}>
              <FiArrowLeft size={16} /> Continue shopping
            </button>
          }
        >
          {hasCustom && (
            <div style={{ padding: "24px 28px 0" }}>
              <Alert kind="warn">
                <strong>Handcrafted items:</strong> made-to-order pieces take <strong>10–12 business days</strong> to prepare
                before dispatch.{missingNotes && " Add your personalization details below for each item."}
              </Alert>
            </div>
          )}
          <div className="ck-items">
            {cartItems.map((item) => (
              <CartItemRow key={item.product._id} item={item} handleQuantityChange={handleQuantityChange} handleRemoveItem={handleRemoveItem} />
            ))}
          </div>
        </Card>

        <CrossSell cartItems={cartItems} navigate={navigate} />

        <div className="ck-trust ck-after">
          {PROMISES.map(({ Icon, title, text }, i) => (
            <div key={title} className="ck-trust-item">
              <span className={`ck-ico ${i === 1 ? "ck-ico--teal" : ""}`} aria-hidden="true"><Icon /></span>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <aside className="ck-aside" aria-label="Order summary">
        <Card title="Order summary" subtitle={`${count} ${count === 1 ? "item" : "items"} in your cart`} noBody footer={<MiniTrust items={TRUST_MINI} />}>
          <div className="ck-card-body">
            <FreeShippingBar subtotal={subtotal} />
            <SummaryItems cartItems={cartItems} />
            <hr className="ck-hr" />
            <div className="ck-rows">
              <Row label="Subtotal" value={inr(subtotal)} />
              {discount > 0 && <Row label={`Coupon (${appliedCoupon.code})`} value={`−${inr(discount)}`} tone="ok" />}
              <Row label="Shipping" hint="Calculated at the next step" />
            </div>
            <hr className="ck-hr" />
            <Total value={inr(discountedTotal)} />

            {error && <div style={{ marginTop: 20 }}><Alert kind="error">{error}</Alert></div>}

            <div style={{ marginTop: 24 }}>
              <CouponInput cartTotal={subtotal} onCouponApplied={onCouponApplied} appliedCoupon={appliedCoupon} onRemoveCoupon={onRemoveCoupon} />
            </div>

            <button type="button" className="ck-btn ck-btn--primary ck-btn--lg ck-btn--block" style={{ marginTop: 24 }} onClick={proceedToCheckout} disabled={count === 0}>
              Proceed to checkout <FiArrowRight size={18} />
            </button>
          </div>
        </Card>
        <HelpCard />
      </aside>
    </div>
  );
};
