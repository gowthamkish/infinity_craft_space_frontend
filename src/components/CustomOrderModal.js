import React, { useEffect, useRef } from "react";
import "./CustomOrderModal.css";

/**
 * Shown when the cart contains embroidery / kundan / thread-bangle items.
 * customItems — array of cart items that matched the custom-product check.
 * onConfirm   — user acknowledges and proceeds to checkout.
 * onCancel    — user goes back to cart.
 */
export default function CustomOrderModal({ customItems, onConfirm, onCancel }) {
  const confirmRef = useRef(null);

  // Focus confirm button on open for keyboard accessibility
  useEffect(() => {
    confirmRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onCancel]);

  return (
    <div className="com-backdrop" role="dialog" aria-modal="true" aria-labelledby="com-title">
      <div className="com-card" onClick={(e) => e.stopPropagation()}>

        {/* Icon */}
        <div className="com-icon-wrap" aria-hidden="true">
          <span className="com-icon">🧵</span>
        </div>

        {/* Heading */}
        <h2 className="com-title" id="com-title">Handcrafted Order Notice</h2>
        <p className="com-subtitle">
          Your cart includes <strong>handcrafted / customized items</strong> that
          require extra care during production.
        </p>

        {/* Item list */}
        <ul className="com-item-list" aria-label="Customized items in your cart">
          {customItems.map((item) => (
            <li key={item.product._id} className="com-item">
              <span className="com-item-dot" aria-hidden="true">✦</span>
              <span className="com-item-name">{item.product.name}</span>
              <span className="com-item-qty">× {item.quantity}</span>
            </li>
          ))}
        </ul>

        {/* Notice banner */}
        <div className="com-notice" role="note">
          <span className="com-notice-icon" aria-hidden="true">⏳</span>
          <div>
            <strong>Dispatch Timeline: 10–12 Business Days</strong>
            <p className="com-notice-sub">
              Each piece is handcrafted to order. Once dispatched, standard
              delivery timelines apply. Thank you for your patience!
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="com-actions">
          <button className="com-btn com-btn--back" onClick={onCancel}>
            ← Back to Cart
          </button>
          <button
            ref={confirmRef}
            className="com-btn com-btn--confirm"
            onClick={onConfirm}
          >
            Got it, Continue →
          </button>
        </div>
      </div>
    </div>
  );
}
