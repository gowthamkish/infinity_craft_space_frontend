export const EmptyCart = ({ navigate }) => (
  <div className="co-empty-page">
    <div className="co-empty">
      <div className="co-empty-icon" aria-hidden="true">🛒</div>
      <h2 className="co-empty-title">Your Cart is Empty</h2>
      <p className="co-empty-sub">
        Looks like you haven't added any items to your cart yet. Start shopping to fill it up!
      </p>
      <button className="co-cta" onClick={() => navigate("/products")}>
        Start Shopping
      </button>
    </div>
  </div>
);
