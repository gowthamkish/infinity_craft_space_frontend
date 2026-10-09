import { FiShoppingBag, FiArrowRight } from "react-icons/fi";

export const EmptyCart = ({ navigate }) => (
  <main className="ck-empty">
    <div>
      <div className="ck-empty-ico" aria-hidden="true"><FiShoppingBag /></div>
      <h2>Your cart is empty</h2>
      <p>Looks like you haven't added anything yet. Discover our handcrafted collection and find something you'll love.</p>
      <button type="button" className="ck-btn ck-btn--primary ck-btn--lg" onClick={() => navigate("/products")}>
        Start shopping <FiArrowRight size={18} />
      </button>
    </div>
  </main>
);
