import React, { useState, useEffect, lazy, Suspense, useRef, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { DotsLoader, PageLoader } from "../components/Loader";
import {
  FiShoppingCart,
  FiHeart,
  FiShare2,
  FiChevronLeft,
  FiChevronRight,
  FiCheck,
  FiPackage,
  FiTruck,
  FiShield,
  FiRefreshCw,
  FiPlus,
  FiMinus,
  FiChevronRight as FiArrow,
  FiZoomIn,
  FiHome,
  FiBox,
  FiBell,
  FiStar,
} from "react-icons/fi";
import { addToCart } from "../features/cartSlice";
import { StarRating } from "../components/reviews/StarRating";
import api from "../api/axios";
import SEOHead, { generateProductStructuredData, generateBreadcrumbStructuredData, getBaseUrl } from "../components/SEOHead";
import { useRecentlyViewed } from "../hooks/useRecentlyViewed";
import { useLazySection } from "../hooks/useLazySection";
import DeliveryEstimator from "../components/DeliveryEstimator";
import { ToastContext } from "../context/ToastContext";

const ProductRecommendations = lazy(() => import("../components/ProductRecommendations"));
const ProductQnA = lazy(() => import("../components/ProductQnA"));
import "./ProductDetail.css";

const Header = lazy(() => import("../components/Header"));
const ReviewList = lazy(() => import("../components/reviews/ReviewList"));
const ImageCarouselModal = lazy(() => import("../components/ImageCarouselModal"));

const TRUST_ITEMS = [
  { icon: <FiTruck size={20} />, color: "#059669", bg: "#d1fae5", label: "Free Shipping", sub: "Orders above ₹999" },
  { icon: <FiShield size={20} />, color: "#7c3aed", bg: "#ede9fe", label: "Secure Payment", sub: "100% Safe Checkout" },
  { icon: <FiRefreshCw size={20} />, color: "#d97706", bg: "#fef3c7", label: "Easy Returns", sub: "7-Day Return Policy" },
  { icon: <FiCheck size={20} />, color: "#0891b2", bg: "#cffafe", label: "Quality Assured", sub: "Handcrafted with care" },
];

/* ─── Skeleton loader ─────────────────────────────────────────── */
function PDPSkeleton() {
  return (
    <div className="pdp-skeleton">
      <div className="pdp-hero">
        <div className="pdp-gallery">
          <div className="pdp-sk pdp-sk--gallery" />
          <div className="pdp-gallery-thumbs">
            {[0, 1, 2].map((i) => (
              <div key={i} className="pdp-sk pdp-sk--thumb" />
            ))}
          </div>
        </div>
        <div className="pdp-info">
          <div className="pdp-sk pdp-sk--badge" />
          <div className="pdp-sk pdp-sk--title" />
          <div className="pdp-sk pdp-sk--subtitle" />
          <div className="pdp-sk pdp-sk--price" />
          <div className="pdp-sk pdp-sk--text" />
          <div className="pdp-sk pdp-sk--text" style={{ width: "80%" }} />
          <div className="pdp-sk pdp-sk--btn" />
        </div>
      </div>
    </div>
  );
}

/* ─── Breadcrumb ──────────────────────────────────────────────── */
function PDPBreadcrumb({ category, subCategory, productName }) {
  return (
    <nav className="pdp-breadcrumb" aria-label="Breadcrumb">
      <ol>
        <li><Link to="/"><FiHome size={13} /> Home</Link></li>
        <li><FiArrow size={12} /></li>
        <li><Link to="/products">Products</Link></li>
        {category && (
          <>
            <li><FiArrow size={12} /></li>
            <li><Link to={`/products?category=${encodeURIComponent(category)}`}>{category}</Link></li>
          </>
        )}
        {subCategory && (
          <>
            <li><FiArrow size={12} /></li>
            <li>
              <Link to={`/products?category=${encodeURIComponent(category)}&subCategory=${encodeURIComponent(subCategory)}`}>
                {subCategory}
              </Link>
            </li>
          </>
        )}
        {productName && (
          <>
            <li><FiArrow size={12} /></li>
            <li className="pdp-breadcrumb__current" aria-current="page">{productName}</li>
          </>
        )}
      </ol>
    </nav>
  );
}

/* ─── Quantity Selector ───────────────────────────────────────── */
function QuantitySelector({ value, onChange, min = 1, max = 99 }) {
  return (
    <div className="pdp-qty" role="group" aria-label="Quantity">
      <button
        className="pdp-qty__btn"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Decrease quantity"
      >
        <FiMinus size={14} />
      </button>
      <span className="pdp-qty__val" aria-live="polite">{value}</span>
      <button
        className="pdp-qty__btn"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Increase quantity"
      >
        <FiPlus size={14} />
      </button>
    </div>
  );
}

/* ─── Main Component ──────────────────────────────────────────── */
const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { addProduct } = useRecentlyViewed();
  const { ref: qnaRef, inView: qnaInView } = useLazySection();
  const { ref: recoRef, inView: recoInView } = useLazySection();
  const { addSuccess, addError } = useContext(ToastContext);

  const isAuthenticated = useSelector((state) => !!state.auth.user);
  const cartItems = useSelector((state) => state.cart.items);
  const userName = useSelector(
    (state) => state.auth.user?.name || state.auth.user?.email || "Customer",
  );

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [ratingStats, setRatingStats] = useState(null);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifyStatus, setNotifyStatus] = useState(null);
  const [customNote, setCustomNote] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [descExpanded, setDescExpanded] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const thumbsRef = useRef(null);

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/products/${id}`);
        const productData = response.data.product || response.data;
        setProduct(productData);
        setError(null);
        addProduct(productData);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const fetchRatingSummary = async () => {
      try {
        const response = await api.get(`/api/reviews/product/${id}/summary`);
        setRatingStats(response.data);
      } catch {
        setRatingStats({ averageRating: 0, reviewCount: 0, ratingBreakdown: {} });
      }
    };
    fetchRatingSummary();
  }, [id]);

  useEffect(() => {
    if (!isAuthenticated || !product) return;
    const checkWishlist = async () => {
      try {
        const response = await api.get("/api/auth/wishlist");
        const ids = (response.data.wishlist || []).map((item) =>
          typeof item === "object" ? item._id : item,
        );
        setIsWishlisted(ids.includes(product._id));
      } catch { /* silently ignore */ }
    };
    checkWishlist();
  }, [isAuthenticated, product]);

  /* scroll active thumb into view */
  useEffect(() => {
    if (!thumbsRef.current) return;
    const active = thumbsRef.current.querySelector(".pdp-thumb--active");
    active?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [selectedImageIndex]);

  const handleAddToCart = async () => {
    if (!product) return;
    setAddingToCart(true);
    try {
      dispatch(addToCart({ product, quantity, customNote: customNote.trim() || undefined }));
      addSuccess(`${product.name} added to cart!`, "Added to Cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate("/checkout");
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) { navigate("/login"); return; }
    setWishlistLoading(true);
    try {
      if (isWishlisted) {
        await api.delete(`/api/auth/wishlist/${product._id}`);
        setIsWishlisted(false);
        addSuccess("Removed from wishlist", "Wishlist");
      } else {
        await api.post(`/api/auth/wishlist/${product._id}`);
        setIsWishlisted(true);
        addSuccess("Saved to wishlist!", "Wishlist");
      }
    } catch {
      addError("Could not update wishlist. Try again.", "Error");
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleNotifyMe = async (e) => {
    e.preventDefault();
    if (!notifyEmail) return;
    setNotifyStatus("loading");
    try {
      await api.post(`/api/products/${id}/notify`, { email: notifyEmail });
      setNotifyStatus("success");
    } catch {
      setNotifyStatus("error");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, text: product.description, url: window.location.href });
      } catch { /* cancelled */ }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
      addSuccess("Link copied to clipboard!", "Shared");
    }
  };

  const getImages = () => {
    if (product?.images?.length > 0) return product.images;
    if (product?.image?.url) return [product.image];
    return [];
  };

  const handleKeyNav = (e) => {
    const imgs = getImages();
    if (e.key === "ArrowLeft") setSelectedImageIndex((p) => (p > 0 ? p - 1 : imgs.length - 1));
    if (e.key === "ArrowRight") setSelectedImageIndex((p) => (p < imgs.length - 1 ? p + 1 : 0));
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <>
        <Suspense fallback={null}><Header /></Suspense>
        <div className="pdp-page">
          <div className="pdp-container">
            <PDPSkeleton />
          </div>
        </div>
      </>
    );
  }

  /* ── Error / Not Found ── */
  if (error || !product) {
    return (
      <>
        <Suspense fallback={null}><Header /></Suspense>
        <div className="pdp-page">
          <div className="pdp-container">
            <div className="pdp-error-state">
              <div className="pdp-error-icon">
                <FiBox size={40} />
              </div>
              <h2 className="pdp-error-title">
                {error ? "Couldn't load product" : "Product not found"}
              </h2>
              <p className="pdp-error-sub">
                {error || "The product you're looking for doesn't exist or has been removed."}
              </p>
              <button className="pdp-btn pdp-btn--primary" onClick={() => navigate("/products")}>
                Browse Products
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const images = getImages();
  const quantityInCart = cartItems.find((item) => item.product._id === id)?.quantity || 0;
  const isOutOfStock = product.trackInventory !== false && product.stock <= 0;
  const isLowStock = product.trackInventory !== false && product.stock > 0 && product.stock <= (product.lowStockThreshold || 5);
  const DESC_LIMIT = 220;
  const isLongDesc = (product.description || "").length > DESC_LIMIT;

  return (
    <>
      <SEOHead
        title={`${product.name} - Infinity Craft Space`}
        description={product.seoDescription || product.description}
        type="product"
        price={product.price}
        availability={isOutOfStock ? "https://schema.org/OutOfStock" : "https://schema.org/InStock"}
        rating={ratingStats?.averageRating}
        reviewCount={ratingStats?.reviewCount}
        image={images[0]?.url}
        url={`${getBaseUrl()}/product/${product.slug || product._id}`}
        canonical={`${getBaseUrl()}/product/${product.slug || product._id}`}
        structuredData={{
          "@context": "https://schema.org",
          "@graph": [
            generateProductStructuredData(product, []),
            generateBreadcrumbStructuredData([
              { name: "Home", url: getBaseUrl() },
              { name: "Products", url: `${getBaseUrl()}/` },
              ...(product.category ? [{ name: product.category, url: `${getBaseUrl()}/?category=${encodeURIComponent(product.category)}` }] : []),
              { name: product.name, url: `${getBaseUrl()}/product/${product.slug || product._id}` },
            ]),
          ],
        }}
      />

      <Suspense fallback={null}><Header /></Suspense>

      <div className="pdp-page">
        <div className="pdp-container">

          {/* ── Breadcrumb ─────────────────────────────────────── */}
          <PDPBreadcrumb
            category={product.category}
            subCategory={product.subCategory}
            productName={product.name}
          />

          {/* ── Hero: Gallery + Info ────────────────────────────── */}
          <div className="pdp-hero">

            {/* ── IMAGE GALLERY ─────────────────────────────────── */}
            <div className="pdp-gallery" onKeyDown={handleKeyNav} tabIndex={-1}>
              <div
                className="pdp-gallery-main"
                onClick={() => images.length > 0 && setShowImageModal(true)}
                role="button"
                tabIndex={0}
                aria-label="Open full-screen image viewer"
                onKeyDown={(e) => e.key === "Enter" && setShowImageModal(true)}
              >
                {images.length > 0 ? (
                  <img
                    src={images[selectedImageIndex]?.url}
                    alt={`${product.name} — image ${selectedImageIndex + 1}`}
                    fetchPriority={selectedImageIndex === 0 ? "high" : "auto"}
                    loading={selectedImageIndex === 0 ? "eager" : "lazy"}
                    className="pdp-gallery-img"
                  />
                ) : (
                  <div className="pdp-gallery-empty">
                    <FiPackage size={56} />
                    <p>No image available</p>
                  </div>
                )}

                {/* Zoom hint */}
                {images.length > 0 && (
                  <div className="pdp-gallery-zoom-hint" aria-hidden="true">
                    <FiZoomIn size={14} /> Full screen
                  </div>
                )}

                {/* Stock overlay badge */}
                {isOutOfStock && (
                  <div className="pdp-gallery-overlay-badge pdp-gallery-overlay-badge--out">
                    Out of Stock
                  </div>
                )}
                {!isOutOfStock && isLowStock && (
                  <div className="pdp-gallery-overlay-badge pdp-gallery-overlay-badge--low">
                    Only {product.stock} left
                  </div>
                )}

                {/* Nav arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      className="pdp-gallery-arrow pdp-gallery-arrow--prev"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImageIndex((p) => (p > 0 ? p - 1 : images.length - 1));
                      }}
                      aria-label="Previous image"
                    >
                      <FiChevronLeft size={18} />
                    </button>
                    <button
                      className="pdp-gallery-arrow pdp-gallery-arrow--next"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImageIndex((p) => (p < images.length - 1 ? p + 1 : 0));
                      }}
                      aria-label="Next image"
                    >
                      <FiChevronRight size={18} />
                    </button>
                  </>
                )}

                {/* Dot indicators */}
                {images.length > 1 && (
                  <div className="pdp-gallery-dots" aria-label="Image navigation">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        className={`pdp-gallery-dot ${i === selectedImageIndex ? "pdp-gallery-dot--active" : ""}`}
                        onClick={(e) => { e.stopPropagation(); setSelectedImageIndex(i); }}
                        aria-label={`Image ${i + 1}`}
                        aria-pressed={i === selectedImageIndex}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Thumbnail strip */}
              {images.length > 1 && (
                <div className="pdp-gallery-thumbs" ref={thumbsRef} role="list">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      role="listitem"
                      className={`pdp-thumb ${index === selectedImageIndex ? "pdp-thumb--active" : ""}`}
                      onClick={() => setSelectedImageIndex(index)}
                      aria-label={`View image ${index + 1}`}
                      aria-pressed={index === selectedImageIndex}
                    >
                      <img src={image.url} alt={`${product.name} thumbnail ${index + 1}`} loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── INFO PANEL ────────────────────────────────────── */}
            <div className="pdp-info">

              {/* Category tags */}
              <div className="pdp-tags">
                {product.category && (
                  <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="pdp-tag">
                    {product.category}
                  </Link>
                )}
                {product.subCategory && (
                  <Link to={`/products?category=${encodeURIComponent(product.category)}&subCategory=${encodeURIComponent(product.subCategory)}`} className="pdp-tag pdp-tag--sub">
                    {product.subCategory}
                  </Link>
                )}
                {product.isCustomizable && (
                  <span className="pdp-tag pdp-tag--custom">✦ Customizable</span>
                )}
              </div>

              {/* Product name */}
              <h1 className="pdp-name">{product.name}</h1>

              {/* Rating row */}
              {ratingStats?.reviewCount > 0 && (
                <div className="pdp-rating">
                  <StarRating rating={ratingStats.averageRating} size="1rem" showValue />
                  <span className="pdp-rating-count">
                    {ratingStats.reviewCount} {ratingStats.reviewCount === 1 ? "review" : "reviews"}
                  </span>
                  <span className="pdp-rating-dot" aria-hidden="true">·</span>
                  <span className="pdp-rating-avg">{Number(ratingStats.averageRating).toFixed(1)}</span>
                </div>
              )}

              {/* Divider */}
              <div className="pdp-divider" />

              {/* Price block */}
              <div className="pdp-price-block">
                <div className="pdp-price-main">
                  <span className="pdp-price">₹{product.price.toLocaleString("en-IN")}</span>
                </div>
                <p className="pdp-price-note">Inclusive of all taxes</p>
              </div>

              {/* Stock status */}
              {product.trackInventory !== false && (
                <div className="pdp-stock-row">
                  {isOutOfStock ? (
                    <span className="pdp-stock pdp-stock--out">
                      <FiPackage size={13} /> Out of Stock
                    </span>
                  ) : isLowStock ? (
                    <span className="pdp-stock pdp-stock--low">
                      🔥 Only {product.stock} left — Order soon!
                    </span>
                  ) : (
                    <span className="pdp-stock pdp-stock--in">
                      <FiCheck size={13} /> In Stock
                    </span>
                  )}
                </div>
              )}

              {/* Description */}
              <div className="pdp-desc">
                <p className={`pdp-desc-text ${!descExpanded && isLongDesc ? "pdp-desc-text--clamped" : ""}`}>
                  {product.description}
                </p>
                {isLongDesc && (
                  <button
                    className="pdp-desc-toggle"
                    onClick={() => setDescExpanded((v) => !v)}
                  >
                    {descExpanded ? "Show less ↑" : "Read more ↓"}
                  </button>
                )}
              </div>

              {/* Bulk discount table */}
              {product.bulkDiscounts?.length > 0 && (
                <div className="pdp-bulk">
                  <div className="pdp-bulk-header">
                    <FiStar size={14} /> Buy more, save more
                  </div>
                  <div className="pdp-bulk-rows">
                    {product.bulkDiscounts.map((bd) => (
                      <div key={bd.minQuantity} className="pdp-bulk-row">
                        <span>Buy {bd.minQuantity}{bd.maxQuantity ? `–${bd.maxQuantity}` : "+"} units</span>
                        <span className="pdp-bulk-badge">Save {bd.discount}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Customization panel */}
              {product.isCustomizable && (
                <div className="pdp-custom">
                  <div className="pdp-custom-header">
                    <span className="pdp-custom-icon" aria-hidden="true">✦</span>
                    <div>
                      <p className="pdp-custom-title">Personalize This Item</p>
                      <p className="pdp-custom-sub">Add a name, date, or message — we'll craft it just for you.</p>
                    </div>
                  </div>
                  <textarea
                    className="pdp-custom-input"
                    rows={3}
                    maxLength={300}
                    placeholder={`e.g. "For Priya, with love ❤️" · Anniversary date · Initials…`}
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                  />
                  <div className="pdp-custom-count">{customNote.length}/300</div>
                </div>
              )}

              {/* CTA section */}
              <div className="pdp-cta">
                {isOutOfStock ? (
                  /* Notify me form */
                  <div className="pdp-notify">
                    {notifyStatus === "success" ? (
                      <div className="pdp-notify-success">
                        <FiCheck size={16} />
                        <div>
                          <strong>You're on the list!</strong>
                          <p>We'll notify you at <strong>{notifyEmail}</strong> when this is back in stock.</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="pdp-notify-label">
                          <FiBell size={14} /> Get notified when available
                        </p>
                        <form onSubmit={handleNotifyMe} className="pdp-notify-form">
                          <input
                            type="email"
                            placeholder="your@email.com"
                            value={notifyEmail}
                            onChange={(e) => setNotifyEmail(e.target.value)}
                            className="pdp-notify-input"
                            required
                          />
                          <button
                            type="submit"
                            className="pdp-btn pdp-btn--notify"
                            disabled={notifyStatus === "loading"}
                          >
                            {notifyStatus === "loading" ? <DotsLoader size="sm" /> : "Notify Me"}
                          </button>
                        </form>
                        {notifyStatus === "error" && (
                          <p className="pdp-notify-error">Something went wrong. Please try again.</p>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Quantity selector */}
                    <div className="pdp-cta-qty-row">
                      <span className="pdp-qty-label">Quantity</span>
                      <QuantitySelector
                        value={quantity}
                        onChange={setQuantity}
                        max={product.trackInventory !== false ? product.stock : 99}
                      />
                      {quantityInCart > 0 && (
                        <span className="pdp-in-cart-badge">
                          <FiShoppingCart size={12} /> {quantityInCart} in cart
                        </span>
                      )}
                    </div>

                    {/* Primary CTAs */}
                    <div className="pdp-cta-btns">
                      <button
                        className="pdp-btn pdp-btn--cart"
                        onClick={handleAddToCart}
                        disabled={addingToCart}
                      >
                        {addingToCart ? <DotsLoader size="sm" /> : <FiShoppingCart size={18} />}
                        {quantityInCart > 0 ? "Add More" : "Add to Cart"}
                      </button>
                      <button
                        className="pdp-btn pdp-btn--buy"
                        onClick={handleBuyNow}
                        disabled={addingToCart}
                      >
                        Buy Now
                      </button>
                    </div>
                  </>
                )}

                {/* Secondary actions: Wishlist + Share */}
                <div className="pdp-secondary-actions">
                  <button
                    className={`pdp-action-btn ${isWishlisted ? "pdp-action-btn--wishlisted" : ""}`}
                    onClick={handleWishlistToggle}
                    disabled={wishlistLoading}
                    aria-label={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
                  >
                    {wishlistLoading ? (
                      <DotsLoader size="sm" />
                    ) : (
                      <FiHeart size={16} style={{ fill: isWishlisted ? "currentColor" : "none" }} />
                    )}
                    {isWishlisted ? "Saved" : "Save"}
                  </button>

                  <button
                    className="pdp-action-btn"
                    onClick={handleShare}
                    aria-label="Share product"
                  >
                    <FiShare2 size={16} />
                    {linkCopied ? "Copied!" : "Share"}
                  </button>
                </div>
              </div>

              {/* Delivery estimator */}
              <div className="pdp-delivery-wrap">
                <DeliveryEstimator
                  productId={product._id}
                  isCustomizable={product.isCustomizable}
                  processingDaysMin={product.processingDaysMin}
                  processingDaysMax={product.processingDaysMax}
                />
              </div>

              {/* Trust strip */}
              <div className="pdp-trust">
                {TRUST_ITEMS.map((item) => (
                  <div key={item.label} className="pdp-trust-item">
                    <div className="pdp-trust-icon" style={{ background: item.bg, color: item.color }}>
                      {item.icon}
                    </div>
                    <div className="pdp-trust-text">
                      <p className="pdp-trust-label">{item.label}</p>
                      <p className="pdp-trust-sub">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Product meta */}
              {(product.sku || product.category) && (
                <div className="pdp-meta">
                  {product.sku && (
                    <span className="pdp-meta-item">
                      <span className="pdp-meta-key">SKU:</span> {product.sku}
                    </span>
                  )}
                  {product.category && (
                    <span className="pdp-meta-item">
                      <span className="pdp-meta-key">Category:</span> {product.category}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Below-fold sections ──────────────────────────── */}

          {/* Reviews */}
          <section className="pdp-section" aria-label="Customer Reviews">
            <Suspense fallback={<PageLoader variant="card" label="Loading reviews…" />}>
              <ReviewList productId={id} productName={product.name} />
            </Suspense>
          </section>

          {/* Q&A */}
          <section className="pdp-section" ref={qnaRef} aria-label="Questions & Answers">
            {qnaInView && (
              <Suspense fallback={<PageLoader variant="card" label="Loading Q&A…" />}>
                <ProductQnA productId={id} isAuthenticated={isAuthenticated} userName={userName} />
              </Suspense>
            )}
          </section>

          {/* Recommendations */}
          <section className="pdp-section pdp-section--reco" ref={recoRef} aria-label="You may also like">
            {recoInView && (
              <Suspense fallback={<PageLoader variant="card" label="Loading recommendations…" />}>
                <ProductRecommendations productId={id} currentProductCategory={product.category} />
              </Suspense>
            )}
          </section>

        </div>
      </div>

      {/* ── Sticky mobile CTA ────────────────────────────────────── */}
      {!isOutOfStock && (
        <div className="pdp-sticky-bar" aria-label="Quick add to cart">
          <div className="pdp-sticky-info">
            {images[0]?.url && (
              <img src={images[0].url} alt={product.name} className="pdp-sticky-thumb" />
            )}
            <div>
              <p className="pdp-sticky-name">{product.name}</p>
              <p className="pdp-sticky-price">₹{product.price.toLocaleString("en-IN")}</p>
            </div>
          </div>
          <button
            className="pdp-btn pdp-btn--cart pdp-sticky-cta"
            onClick={handleAddToCart}
            disabled={addingToCart}
          >
            {addingToCart ? <DotsLoader size="sm" /> : <FiShoppingCart size={16} />}
            {quantityInCart > 0 ? `Add More (${quantityInCart})` : "Add to Cart"}
          </button>
        </div>
      )}

      {/* ── Image modal ─────────────────────────────────────────── */}
      {showImageModal && images.length > 0 && (
        <Suspense fallback={null}>
          <ImageCarouselModal
            show={showImageModal}
            onHide={() => setShowImageModal(false)}
            images={images}
            productName={product.name}
            initialIndex={selectedImageIndex}
          />
        </Suspense>
      )}
    </>
  );
};

export default ProductDetail;
