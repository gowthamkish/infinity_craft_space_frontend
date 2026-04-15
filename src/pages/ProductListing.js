import React, {
  useState,
  useMemo,
  useCallback,
  lazy,
  Suspense,
  useEffect,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addToCart, removeFromCart } from "../features/cartSlice";
import { useProducts } from "../hooks/useSmartFetch";
import { Offcanvas } from "react-bootstrap";
import { DotsLoader, BarsLoader } from "../components/Loader";
import {
  FiGrid,
  FiSliders,
  FiShoppingCart,
  FiX,
  FiHeart,
  FiTrash2,
  FiSearch,
  FiPackage,
  FiCheck,
  FiAlertCircle,
} from "react-icons/fi";
import api from "../api/axios";
import SEOHead, { SEO_CONFIG } from "../components/SEOHead";
import { trackAddToCart, trackRemoveFromCart } from "../utils/analytics";
import "./ProductListing.css";

const Header = lazy(() => import("../components/Header"));
const ProductFilters = lazy(() => import("../components/ProductFilters"));
const ImageCarouselModal = lazy(
  () => import("../components/ImageCarouselModal"),
);

// ─── Skeleton Card ────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="pc pc--skeleton">
    <div className="pc-img-wrap skel-block" />
    <div className="pc-body">
      <div className="skel-line skel-line--xs" />
      <div className="skel-line skel-line--md" />
      <div className="skel-line skel-line--sm" />
      <div className="skel-line skel-line--lg" style={{ marginTop: "auto" }} />
    </div>
  </div>
);

// ─── Product Card ─────────────────────────────────────────────────────────────
const ProductCard = React.memo(
  ({
    product,
    quantityInCart,
    onAddToCart,
    onRemoveFromCart,
    onImageClick,
    onShowToast,
    isWishlisted,
    onWishlistToggle,
  }) => {
    const navigate = useNavigate();
    const isAuthenticated = useSelector((state) => !!state.auth.user);
    const [cartLoading, setCartLoading] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);

    const isOutOfStock =
      product.trackInventory !== false && product.stock <= 0;
    const isLowStock =
      product.trackInventory !== false &&
      product.stock > 0 &&
      product.stock <= (product.lowStockThreshold || 5);
    const imageUrl =
      product.images?.[0]?.url || product.image?.url || product.image || null;
    const imgCount = product.images?.length || 0;

    const handleToggleWishlist = async () => {
      if (!isAuthenticated) {
        navigate("/login");
        return;
      }
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
      } catch {
        onShowToast("Wishlist action failed", "error");
      } finally {
        setWishlistLoading(false);
      }
    };

    const handleCart = async (fn) => {
      setCartLoading(true);
      try {
        await Promise.resolve(fn(product));
      } catch {
        /* ignore */
      } finally {
        setCartLoading(false);
      }
    };

    return (
      <div className="pc">
        {/* Image */}
        <div className="pc-img-wrap" onClick={() => onImageClick?.(product)}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              loading="lazy"
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/300x300?text=No+Image";
              }}
            />
          ) : (
            <div className="pc-img-placeholder">
              <FiPackage size={40} />
            </div>
          )}
          <div className="pc-img-overlay">
            <FiSearch size={16} className="me-1" /> View images
          </div>
          {imgCount > 1 && (
            <span className="pc-img-count">+{imgCount - 1} photos</span>
          )}
          {isWishlisted && (
            <span className="pc-wish-badge" aria-label="In wishlist">
              <FiHeart size={12} fill="currentColor" />
            </span>
          )}
        </div>

        {/* Body */}
        <div className="pc-body">
          {product.category && (
            <span className="pc-category">{product.category}</span>
          )}

          <p
            className="pc-name"
            onClick={() => navigate(`/product/${product._id}`)}
            title={product.name}
          >
            {product.name}
          </p>

          <div className="pc-price-row">
            <p className="pc-price">₹{product.price?.toLocaleString()}</p>
            {quantityInCart > 0 && (
              <span className="pc-in-cart-badge">{quantityInCart} in cart</span>
            )}
          </div>

          {/* Badges */}
          <div className="pc-badges">
            {isOutOfStock && (
              <span className="pc-badge pc-badge--out">Out of stock</span>
            )}
            {isLowStock && (
              <span className="pc-badge pc-badge--low">
                Only {product.stock} left
              </span>
            )}
            {product.estimatedDelivery && !isOutOfStock && (
              <span className="pc-badge pc-badge--delivery">
                🚚 {product.estimatedDelivery}d delivery
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="pc-actions">
            {isOutOfStock ? (
              <button className="pc-btn pc-btn--sold" disabled>
                Out of Stock
              </button>
            ) : (
              <button
                className="pc-btn pc-btn--cart"
                onClick={() => handleCart(onAddToCart)}
                disabled={cartLoading}
                aria-label="Add to Cart"
              >
                {cartLoading ? (
                  <DotsLoader size="sm" />
                ) : (
                  <>
                    <FiShoppingCart size={15} />
                    <span className="pc-btn-label">Add to Cart</span>
                  </>
                )}
              </button>
            )}

            {quantityInCart > 0 && !isOutOfStock && (
              <button
                className="pc-btn pc-btn--remove"
                onClick={() => handleCart(onRemoveFromCart)}
                disabled={cartLoading}
                title="Remove from Cart"
                aria-label="Remove from Cart"
              >
                <FiTrash2 size={15} />
              </button>
            )}

            <button
              className={`pc-btn ${isWishlisted ? "pc-btn--wish-active" : "pc-btn--wish"}`}
              onClick={handleToggleWishlist}
              disabled={wishlistLoading}
              title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
              aria-label={
                isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"
              }
            >
              {wishlistLoading ? (
                <DotsLoader size="sm" />
              ) : (
                <FiHeart
                  size={15}
                  fill={isWishlisted ? "currentColor" : "none"}
                />
              )}
            </button>
          </div>

          <button
            className="pc-details-link"
            onClick={() => navigate(`/product/${product._id}`)}
          >
            View details & reviews →
          </button>
        </div>
      </div>
    );
  },
);

// ─── Page ──────────────────────────────────────────────────────────────────────
const ProductListing = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data: products, loading, error } = useProducts();

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    categories: [],
    priceRange: null,
    searchTerm: "",
    sortBy: "",
  });
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success");
  const [wishlistIds, setWishlistIds] = useState(new Set());

  const cartItems = useSelector((state) => state.cart.items);
  const isAuthenticated = useSelector((state) => !!state.auth.user);

  const totalCartItems = useMemo(
    () => cartItems.reduce((s, i) => s + i.quantity, 0),
    [cartItems],
  );
  const cartItemsMap = useMemo(() => {
    const m = new Map();
    cartItems.forEach((i) => m.set(i.product._id, i.quantity));
    return m;
  }, [cartItems]);
  const getQty = useCallback(
    (id) => cartItemsMap.get(id) || 0,
    [cartItemsMap],
  );

  useEffect(() => {
    if (!isAuthenticated) {
      setWishlistIds(new Set());
      return;
    }
    let mounted = true;
    api
      .get("/api/auth/wishlist")
      .then((res) => {
        if (mounted)
          setWishlistIds(
            new Set((res.data.wishlist || []).map((p) => p._id)),
          );
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products) || !products.length) return [];
    let out = products;
    if (filters.searchTerm) {
      const re = new RegExp(filters.searchTerm, "i");
      out = out.filter(
        (p) => re.test(p.name) || re.test(p.description || ""),
      );
    }
    if (filters.categories?.length) {
      const set = new Set(filters.categories.map((c) => c.toLowerCase()));
      out = out.filter(
        (p) =>
          set.has(p.category?.toLowerCase()) ||
          set.has(p.subCategory?.toLowerCase()),
      );
    }
    if (filters.priceRange) {
      const { min, max } = filters.priceRange;
      out = out.filter((p) => p.price >= min && p.price <= max);
    }
    if (filters.sortBy) {
      out = [...out];
      if (filters.sortBy === "price-low-high")
        out.sort((a, b) => a.price - b.price);
      else if (filters.sortBy === "price-high-low")
        out.sort((a, b) => b.price - a.price);
      else if (filters.sortBy === "name-asc")
        out.sort((a, b) => a.name.localeCompare(b.name));
      else if (filters.sortBy === "name-desc")
        out.sort((a, b) => b.name.localeCompare(a.name));
    }
    return out;
  }, [products, filters]);

  const handleFiltersChange = useCallback((f) => setFilters(f), []);
  const handleClearFilters = useCallback(
    () =>
      setFilters({
        categories: [],
        priceRange: null,
        searchTerm: "",
        sortBy: "",
      }),
    [],
  );

  const handleAddToCart = useCallback(
    (p) => {
      dispatch(addToCart({ product: p, quantity: 1 }));
      trackAddToCart(p, 1);
    },
    [dispatch],
  );
  const handleRemoveFromCart = useCallback(
    (p) => {
      dispatch(removeFromCart({ product: p }));
      trackRemoveFromCart(p, 1);
    },
    [dispatch],
  );

  const handleCheckout = useCallback(() => {
    if (!isAuthenticated) {
      localStorage.setItem("redirectAfterLogin", "/checkout");
      navigate("/login");
    } else navigate("/checkout");
  }, [isAuthenticated, navigate]);

  const handleImageClick = useCallback((p) => {
    setSelectedProduct(p);
    setShowImageModal(true);
  }, []);

  const handleShowToast = useCallback((msg, type = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }, []);

  const handleWishlistToggle = useCallback((id, added) => {
    setWishlistIds((prev) => {
      const s = new Set(prev);
      added ? s.add(id) : s.delete(id);
      return s;
    });
  }, []);

  // Count only panel filters (not search — it has its own clear button)
  const activeFilterCount = [
    filters.categories.length > 0,
    !!filters.priceRange,
    !!filters.sortBy,
  ].filter(Boolean).length;

  // Active chips for the chips bar
  const activeChips = [
    ...filters.categories.map((c) => ({
      key: `cat-${c}`,
      label: c,
      onRemove: () =>
        handleFiltersChange({
          ...filters,
          categories: filters.categories.filter((x) => x !== c),
        }),
    })),
    ...(filters.priceRange
      ? [
          {
            key: "price",
            label: `₹${filters.priceRange.min} – ${filters.priceRange.max === Infinity ? "Max" : `₹${filters.priceRange.max}`}`,
            onRemove: () =>
              handleFiltersChange({ ...filters, priceRange: null }),
          },
        ]
      : []),
    ...(filters.sortBy
      ? [
          {
            key: "sort",
            label: filters.sortBy.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
            onRemove: () =>
              handleFiltersChange({ ...filters, sortBy: "" }),
          },
        ]
      : []),
  ];

  const seoTitle = filters.searchTerm
    ? `${filters.searchTerm} - Craft Supplies - ${SEO_CONFIG.SITE_NAME}`
    : `Premium Craft Supplies & Materials - ${SEO_CONFIG.SITE_NAME}`;

  return (
    <div className="pl-page">
      <SEOHead
        title={seoTitle}
        description={SEO_CONFIG.DEFAULT_DESCRIPTION}
        url={`${SEO_CONFIG.SITE_URL}/products`}
        canonical={`${SEO_CONFIG.SITE_URL}/products`}
      />

      <Suspense fallback={<div style={{ height: "70px" }} />}>
        <Header />
      </Suspense>

      {/* ── Sticky Command Bar ── */}
      <div className="pl-command-bar">
        <div className="pl-command-inner">
          {/* Search */}
          <div className="pl-search-field">
            <FiSearch size={17} className="pl-search-icon" aria-hidden="true" />
            <input
              type="search"
              className="pl-search-input"
              placeholder="Search products…"
              value={filters.searchTerm}
              onChange={(e) =>
                handleFiltersChange({ ...filters, searchTerm: e.target.value })
              }
              aria-label="Search products"
            />
            {filters.searchTerm && (
              <button
                className="pl-search-clear"
                onClick={() =>
                  handleFiltersChange({ ...filters, searchTerm: "" })
                }
                aria-label="Clear search"
              >
                <FiX size={15} />
              </button>
            )}
          </div>

          {/* Right actions */}
          <div className="pl-command-actions">
            <button
              className={`pl-filter-btn ${activeFilterCount > 0 ? "pl-filter-btn--active" : ""}`}
              onClick={() => setShowFilters(true)}
              aria-label={`Filters${activeFilterCount > 0 ? `, ${activeFilterCount} active` : ""}`}
            >
              <FiSliders size={15} />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="pl-filter-count" aria-hidden="true">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {!loading && (
              <span className="pl-results-count" aria-live="polite">
                {filteredProducts.length}
                {filteredProducts.length !== products.length &&
                  ` of ${products.length}`}{" "}
                results
              </span>
            )}
          </div>
        </div>

        {/* Active filter chips */}
        {activeChips.length > 0 && (
          <div className="pl-chips-bar" role="list" aria-label="Active filters">
            {activeChips.map((chip) => (
              <span key={chip.key} className="pl-chip" role="listitem">
                {chip.label}
                <button
                  className="pl-chip-remove"
                  onClick={chip.onRemove}
                  aria-label={`Remove filter: ${chip.label}`}
                >
                  <FiX size={11} />
                </button>
              </span>
            ))}
            <button className="pl-chips-clear-all" onClick={handleClearFilters}>
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* ── Main Layout ── */}
      <div className="pl-layout">
        <main className="pl-content">
          {/* Toolbar */}
          <div className="pl-toolbar">
            <h1 className="pl-page-title">
              <span className="pl-title-icon" aria-hidden="true">
                <FiGrid size={16} />
              </span>
              Products
            </h1>

            {totalCartItems > 0 && (
              <button className="pl-checkout-btn" onClick={handleCheckout}>
                <FiShoppingCart size={15} />
                <span>
                  Cart{" "}
                  <strong>({totalCartItems})</strong>
                </span>
                <span className="pl-checkout-sep">·</span>
                <span>Checkout</span>
              </button>
            )}
          </div>

          {/* Guest welcome */}
          {!isAuthenticated && (
            <div className="pl-welcome" role="note">
              Browse freely — <a href="/login">sign in</a> to save your wishlist
              and complete checkout.
            </div>
          )}

          {error && (
            <div className="alert alert-danger mb-3" role="alert">
              {error}
            </div>
          )}

          {/* Products */}
          {loading ? (
            <div className="pl-grid" aria-busy="true" aria-label="Loading products">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <>
              {/* No results from filters */}
              {filteredProducts.length === 0 && products.length > 0 && (
                <div className="pl-empty">
                  <div className="pl-empty-icon" aria-hidden="true">🔍</div>
                  <h3 className="pl-empty-title">No products found</h3>
                  <p className="pl-empty-sub">
                    {filters.searchTerm
                      ? `No results for "${filters.searchTerm}"`
                      : "Try adjusting your filters"}
                  </p>
                  <button className="pl-clear-btn" onClick={handleClearFilters}>
                    <FiX size={14} /> Clear filters
                  </button>
                </div>
              )}

              {/* No products at all */}
              {products.length === 0 && !error && (
                <div className="pl-empty">
                  <div className="pl-empty-icon" aria-hidden="true">📦</div>
                  <h3 className="pl-empty-title">No products yet</h3>
                  <p className="pl-empty-sub">
                    Check back soon — new arrivals are on their way.
                  </p>
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

      {/* ── Filter Offcanvas ── */}
      <Offcanvas
        show={showFilters}
        onHide={() => setShowFilters(false)}
        placement="start"
        className="pl-offcanvas"
        aria-labelledby="filters-offcanvas-title"
      >
        <Offcanvas.Header className="pl-offcanvas-header">
          <div className="pl-offcanvas-title-row">
            <FiSliders size={17} aria-hidden="true" />
            <strong id="filters-offcanvas-title">Filters</strong>
            {activeFilterCount > 0 && (
              <span className="pl-offcanvas-count">{activeFilterCount} active</span>
            )}
          </div>
          <button
            className="pl-offcanvas-close"
            onClick={() => setShowFilters(false)}
            aria-label="Close filters"
          >
            <FiX size={20} />
          </button>
        </Offcanvas.Header>
        <Offcanvas.Body className="pl-offcanvas-body">
          <Suspense fallback={<BarsLoader size="sm" />}>
            <ProductFilters
              products={products}
              onFiltersChange={handleFiltersChange}
              activeFilters={filters}
              onClearFilters={handleClearFilters}
            />
          </Suspense>
          <button
            className="pl-offcanvas-apply"
            onClick={() => setShowFilters(false)}
          >
            Show {filteredProducts.length} product
            {filteredProducts.length !== 1 ? "s" : ""}
          </button>
        </Offcanvas.Body>
      </Offcanvas>

      {/* ── Image Modal ── */}
      <Suspense fallback={null}>
        <ImageCarouselModal
          show={showImageModal}
          onHide={() => {
            setShowImageModal(false);
            setSelectedProduct(null);
          }}
          images={
            selectedProduct?.images ||
            (selectedProduct?.image ? [selectedProduct.image] : [])
          }
          productName={selectedProduct?.name || "Product Images"}
          initialIndex={0}
        />
      </Suspense>

      {/* ── Toast ── */}
      {showToast && (
        <div
          className={`pl-toast pl-toast--${toastType}`}
          role="status"
          aria-live="polite"
        >
          <span className="pl-toast__icon">
            {toastType === "success" ? <FiCheck size={15} strokeWidth={3} /> : <FiAlertCircle size={15} />}
          </span>
          <span className="pl-toast__msg">{toastMsg}</span>
          <button
            className="pl-toast__close"
            onClick={() => setShowToast(false)}
            aria-label="Dismiss"
          >
            <FiX size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default React.memo(ProductListing);
