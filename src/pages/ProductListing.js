import React, { useState, useMemo, useCallback, lazy, Suspense, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addToCart, removeFromCart } from "../features/cartSlice";
import { useProducts } from "../hooks/useSmartFetch";
import { Spinner, Toast, ToastContainer, Offcanvas, Badge } from "react-bootstrap";
import { FiGrid, FiFilter, FiShoppingCart, FiX, FiHeart, FiTrash2, FiSearch } from "react-icons/fi";
import api from "../api/axios";
import SEOHead, { SEO_CONFIG } from "../components/SEOHead";
import { trackAddToCart, trackRemoveFromCart } from "../utils/analytics";
import "./ProductListing.css";

const Header      = lazy(() => import("../components/Header"));
const ProductFilters = lazy(() => import("../components/ProductFilters"));
const ImageCarouselModal = lazy(() => import("../components/ImageCarouselModal"));

// ─── Product Card ─────────────────────────────────────────────────────────────
const ProductCard = React.memo(({
  product, quantityInCart, onAddToCart, onRemoveFromCart,
  onImageClick, onShowToast, isWishlisted, onWishlistToggle,
}) => {
  const navigate        = useNavigate();
  const isAuthenticated = useSelector((state) => !!state.auth.user);
  const [cartLoading,     setCartLoading]     = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const isOutOfStock = product.trackInventory !== false && product.stock <= 0;
  const isLowStock   = product.trackInventory !== false && product.stock > 0 && product.stock <= (product.lowStockThreshold || 5);
  const imageUrl     = product.images?.[0]?.url || product.image?.url || product.image || null;
  const imgCount     = product.images?.length || 0;

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) { navigate("/login"); return; }
    setWishlistLoading(true);
    try {
      if (isWishlisted) {
        await api.delete(`/api/auth/wishlist/${product._id}`);
        onShowToast("Removed from wishlist", "success");
        onWishlistToggle?.(product._id, false);
      } else {
        await api.post("/api/auth/wishlist", { productId: product._id });
        onShowToast("Added to wishlist", "success");
        onWishlistToggle?.(product._id, true);
      }
    } catch { onShowToast("Wishlist action failed", "error"); }
    finally { setWishlistLoading(false); }
  };

  const handleCart = async (fn) => {
    setCartLoading(true);
    try { await Promise.resolve(fn(product)); } catch { /* ignore */ } finally { setCartLoading(false); }
  };

  return (
    <div className="pc">
      {/* Image */}
      <div className="pc-img-wrap" onClick={() => onImageClick?.(product)}>
        {imageUrl ? (
          <img src={imageUrl} alt={product.name} loading="lazy" onError={(e) => { e.target.src = "https://via.placeholder.com/300x300?text=No+Image"; }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#cbd5e1", fontSize: "2.5rem" }}>📦</div>
        )}
        <div className="pc-img-overlay">
          <FiSearch size={18} className="me-1" /> View images
        </div>
        {imgCount > 1 && <span className="pc-img-count">📸 {imgCount}</span>}
      </div>

      {/* Body */}
      <div className="pc-body">
        {product.category && <span className="pc-category">{product.category}</span>}

        <p className="pc-name" onClick={() => navigate(`/product/${product._id}`)} title={product.name}>
          {product.name}
        </p>

        <p className="pc-price">₹{product.price?.toLocaleString()}</p>

        {/* Badges */}
        <div className="pc-badges">
          {isOutOfStock && <span className="pc-badge pc-badge--out">Out of stock</span>}
          {isLowStock   && <span className="pc-badge pc-badge--low">Only {product.stock} left</span>}
          {product.estimatedDelivery && !isOutOfStock && (
            <span className="pc-badge pc-badge--delivery">🚚 {product.estimatedDelivery}d delivery</span>
          )}
        </div>

        <button className="pc-details-link" onClick={() => navigate(`/product/${product._id}`)}>
          View details & reviews →
        </button>

        {/* Actions */}
        <div className="pc-actions">
          {isOutOfStock ? (
            <button className="pc-btn pc-btn--sold" disabled>Out of Stock</button>
          ) : (
            <button
              className="pc-btn pc-btn--cart"
              onClick={() => handleCart(onAddToCart)}
              disabled={cartLoading}
              title="Add to Cart"
            >
              {cartLoading ? <Spinner animation="border" size="sm" variant="light" /> : <FiShoppingCart size={16} />}
            </button>
          )}

          {quantityInCart > 0 && !isOutOfStock && (
            <button
              className="pc-btn pc-btn--remove"
              onClick={() => handleCart(onRemoveFromCart)}
              disabled={cartLoading}
              title="Remove from Cart"
            >
              <FiTrash2 size={15} />
            </button>
          )}

          <button
            className={`pc-btn ${isWishlisted ? "pc-btn--wish-active" : "pc-btn--wish"}`}
            onClick={handleToggleWishlist}
            disabled={wishlistLoading}
            title={isWishlisted ? "In Wishlist" : "Add to Wishlist"}
          >
            {wishlistLoading
              ? <Spinner animation="border" size="sm" />
              : <FiHeart size={15} fill={isWishlisted ? "currentColor" : "none"} />}
          </button>
        </div>
      </div>
    </div>
  );
});

// ─── Page ──────────────────────────────────────────────────────────────────────
const ProductListing = () => {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { data: products, loading, error } = useProducts();

  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [filters, setFilters] = useState({ categories: [], priceRange: null, searchTerm: "", sortBy: "" });
  const [showImageModal,  setShowImageModal]  = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showToast,   setShowToast]   = useState(false);
  const [toastMsg,    setToastMsg]    = useState("");
  const [toastType,   setToastType]   = useState("success");
  const [wishlistIds, setWishlistIds] = useState(new Set());

  const cartItems       = useSelector((state) => state.cart.items);
  const isAuthenticated = useSelector((state) => !!state.auth.user);

  const totalCartItems = useMemo(() => cartItems.reduce((s, i) => s + i.quantity, 0), [cartItems]);
  const cartItemsMap   = useMemo(() => { const m = new Map(); cartItems.forEach((i) => m.set(i.product._id, i.quantity)); return m; }, [cartItems]);
  const getQty         = useCallback((id) => cartItemsMap.get(id) || 0, [cartItemsMap]);

  useEffect(() => {
    if (!isAuthenticated) { setWishlistIds(new Set()); return; }
    let mounted = true;
    api.get("/api/auth/wishlist")
      .then((res) => { if (mounted) setWishlistIds(new Set((res.data.wishlist || []).map((p) => p._id))); })
      .catch(() => {});
    return () => { mounted = false; };
  }, [isAuthenticated]);

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products) || !products.length) return [];
    let out = products;
    if (filters.searchTerm) {
      const re = new RegExp(filters.searchTerm, "i");
      out = out.filter((p) => re.test(p.name) || re.test(p.description || ""));
    }
    if (filters.categories?.length) {
      const set = new Set(filters.categories.map((c) => c.toLowerCase()));
      out = out.filter((p) => set.has(p.category?.toLowerCase()) || set.has(p.subCategory?.toLowerCase()));
    }
    if (filters.priceRange) {
      const { min, max } = filters.priceRange;
      out = out.filter((p) => p.price >= min && p.price <= max);
    }
    if (filters.sortBy) {
      out = [...out];
      if      (filters.sortBy === "price-low-high") out.sort((a, b) => a.price - b.price);
      else if (filters.sortBy === "price-high-low") out.sort((a, b) => b.price - a.price);
      else if (filters.sortBy === "name-asc")       out.sort((a, b) => a.name.localeCompare(b.name));
      else if (filters.sortBy === "name-desc")      out.sort((a, b) => b.name.localeCompare(a.name));
    }
    return out;
  }, [products, filters]);

  const handleFiltersChange = useCallback((f) => setFilters(f), []);
  const handleClearFilters  = useCallback(() => setFilters({ categories: [], priceRange: null, searchTerm: "", sortBy: "" }), []);

  const handleAddToCart    = useCallback((p) => { dispatch(addToCart({ product: p, quantity: 1 })); trackAddToCart(p, 1); }, [dispatch]);
  const handleRemoveFromCart = useCallback((p) => { dispatch(removeFromCart({ product: p })); trackRemoveFromCart(p, 1); }, [dispatch]);

  const handleCheckout = useCallback(() => {
    if (!isAuthenticated) { localStorage.setItem("redirectAfterLogin", "/checkout"); navigate("/login"); }
    else navigate("/checkout");
  }, [isAuthenticated, navigate]);

  const handleImageClick = useCallback((p) => { setSelectedProduct(p); setShowImageModal(true); }, []);
  const handleShowToast  = useCallback((msg, type = "success") => {
    setToastMsg(msg); setToastType(type); setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }, []);

  const handleWishlistToggle = useCallback((id, added) => {
    setWishlistIds((prev) => { const s = new Set(prev); added ? s.add(id) : s.delete(id); return s; });
  }, []);

  const activeFilterCount = [
    filters.categories.length > 0,
    !!filters.priceRange,
    !!filters.searchTerm,
    !!filters.sortBy,
  ].filter(Boolean).length;

  const seoTitle = filters.searchTerm
    ? `${filters.searchTerm} - Craft Supplies - ${SEO_CONFIG.SITE_NAME}`
    : `Premium Craft Supplies & Materials - ${SEO_CONFIG.SITE_NAME}`;

  return (
    <div className="pl-page">
      <SEOHead title={seoTitle} description={SEO_CONFIG.DEFAULT_DESCRIPTION} url={`${SEO_CONFIG.SITE_URL}/products`} canonical={`${SEO_CONFIG.SITE_URL}/products`} />

      <Suspense fallback={<div style={{ height: "70px" }} />}>
        <Header />
      </Suspense>

      <div className="pl-layout">
        {/* ── Desktop Sidebar ── */}
        <aside className="pl-sidebar d-none d-lg-block">
          <Suspense fallback={<div className="p-3"><Spinner size="sm" animation="border" /></div>}>
            <ProductFilters
              products={products}
              onFiltersChange={handleFiltersChange}
              activeFilters={filters}
              onClearFilters={handleClearFilters}
            />
          </Suspense>
        </aside>

        {/* ── Main Content ── */}
        <main className="pl-content">
          {/* Toolbar */}
          <div className="pl-toolbar">
            <div className="pl-toolbar-left">
              <h1 className="pl-page-title">
                <span className="pl-title-icon"><FiGrid size={18} /></span>
                Products
              </h1>
              {/* Mobile filter btn */}
              <button className="pl-mobile-filter-btn d-lg-none" onClick={() => setShowMobileFilters(true)}>
                <FiFilter size={15} /> Filters
                {activeFilterCount > 0 && <span className="pl-filter-dot" />}
              </button>
              <Badge bg="primary" className="pl-count-badge">
                {filteredProducts.length} / {products.length}
              </Badge>
            </div>

            {totalCartItems > 0 && (
              <button className="pl-checkout-btn" onClick={handleCheckout}>
                <FiShoppingCart size={16} />
                Cart ({totalCartItems}) · Checkout
              </button>
            )}
          </div>

          {/* Welcome banner */}
          {!isAuthenticated && (
            <div className="pl-welcome">
              👋 Welcome! Browse and add to cart freely — <a href="/login">sign in</a> to complete your purchase.
            </div>
          )}

          {error && <div className="alert alert-danger mb-3">{error}</div>}

          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "4rem 0" }}>
              <Spinner animation="border" role="status" variant="primary" style={{ width: "3rem", height: "3rem" }}>
                <span className="visually-hidden">Loading…</span>
              </Spinner>
            </div>
          ) : (
            <>
              {filteredProducts.length === 0 && products.length > 0 && (
                <div className="pl-empty">
                  <h4>No products match your filters</h4>
                  <p>Try adjusting your search or clearing the filters.</p>
                  <button className="pl-clear-btn" onClick={handleClearFilters}><FiX size={14} /> Clear All Filters</button>
                </div>
              )}
              {products.length === 0 && !error && (
                <div className="pl-empty">
                  <h4>No products available</h4>
                  <p>Check back later for new arrivals!</p>
                </div>
              )}
              {filteredProducts.length > 0 && (
                <div className="pl-grid">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      quantityInCart={getQty(product._id)}
                      onAddToCart={handleAddToCart}
                      onRemoveFromCart={handleRemoveFromCart}
                      onImageClick={handleImageClick}
                      onShowToast={handleShowToast}
                      isWishlisted={wishlistIds.has(product._id)}
                      onWishlistToggle={handleWishlistToggle}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Mobile Filter Offcanvas */}
      <Offcanvas show={showMobileFilters} onHide={() => setShowMobileFilters(false)} placement="start" className="pl-offcanvas d-lg-none">
        <Offcanvas.Header className="pl-offcanvas-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", color: "white" }}>
            <FiFilter size={18} /> <strong>Filters</strong>
          </div>
          <button className="pl-offcanvas-close" onClick={() => setShowMobileFilters(false)}><FiX size={22} /></button>
        </Offcanvas.Header>
        <Offcanvas.Body className="pl-offcanvas-body">
          <Suspense fallback={<Spinner size="sm" animation="border" />}>
            <ProductFilters
              products={products}
              onFiltersChange={handleFiltersChange}
              activeFilters={filters}
              onClearFilters={handleClearFilters}
            />
          </Suspense>
          <button className="pl-offcanvas-apply" onClick={() => setShowMobileFilters(false)}>
            Show {filteredProducts.length} products
          </button>
        </Offcanvas.Body>
      </Offcanvas>

      {/* Image Modal */}
      <Suspense fallback={null}>
        <ImageCarouselModal
          show={showImageModal}
          onHide={() => { setShowImageModal(false); setSelectedProduct(null); }}
          images={selectedProduct?.images || (selectedProduct?.image ? [selectedProduct.image] : [])}
          productName={selectedProduct?.name || "Product Images"}
          initialIndex={0}
        />
      </Suspense>

      {/* Toast */}
      <ToastContainer className="pl-toast-wrap">
        <Toast show={showToast} onClose={() => setShowToast(false)} bg={toastType === "success" ? "success" : "danger"} autohide delay={3000}>
          <Toast.Header><strong className="me-auto">{toastType === "success" ? "✓ Done" : "⚠ Error"}</strong></Toast.Header>
          <Toast.Body style={{ color: "white", fontWeight: 500 }}>{toastMsg}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default React.memo(ProductListing);
