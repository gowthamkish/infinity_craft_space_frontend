import React, { useState, useEffect, lazy, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Container, Row, Col, Card, Alert } from "react-bootstrap";
import { OrbitLoader, DotsLoader, PageLoader } from "../components/Loader";
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
} from "react-icons/fi";
import { addToCart } from "../features/cartSlice";
import { StarRating } from "../components/reviews/StarRating";
import api from "../api/axios";
import SEOHead, { generateProductStructuredData } from "../components/SEOHead";
import { useRecentlyViewed } from "../hooks/useRecentlyViewed";
import Breadcrumbs from "../components/Breadcrumbs";
import ProductRecommendations from "../components/ProductRecommendations";
import ProductQnA from "../components/ProductQnA";
import "./ProductDetail.css";

const Header = lazy(() => import("../components/Header"));
const ReviewList = lazy(() => import("../components/reviews/ReviewList"));
const ImageCarouselModal = lazy(() => import("../components/ImageCarouselModal"));

const TRUST_ITEMS = [
  { icon: <FiTruck size={18} />, color: "#10b981", bg: "#dcfce7", label: "Free Shipping", sub: "On orders above ₹999" },
  { icon: <FiShield size={18} />, color: "#3b82f6", bg: "#dbeafe", label: "Secure Payment", sub: "100% Secure Checkout" },
  { icon: <FiRefreshCw size={18} />, color: "#f59e0b", bg: "#fef3c7", label: "Easy Returns", sub: "7 Days Return Policy" },
  { icon: <FiCheck size={18} />, color: "#8b5cf6", bg: "#ede9fe", label: "Quality Assured", sub: "Handcrafted with care" },
];

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { addProduct } = useRecentlyViewed();

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

  // Fetch product
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

  // Fetch rating summary
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

  // Check wishlist
  useEffect(() => {
    if (!isAuthenticated || !product) return;
    const checkWishlist = async () => {
      try {
        const response = await api.get("/api/auth/wishlist");
        const ids = (response.data.wishlist || []).map((item) =>
          typeof item === "object" ? item._id : item,
        );
        setIsWishlisted(ids.includes(product._id));
      } catch {
        // silently ignore
      }
    };
    checkWishlist();
  }, [isAuthenticated, product]);

  const handleAddToCart = async () => {
    if (!product) return;
    setAddingToCart(true);
    try {
      dispatch(addToCart({ product, quantity: 1 }));
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) { navigate("/login"); return; }
    setWishlistLoading(true);
    try {
      if (isWishlisted) {
        await api.delete(`/api/auth/wishlist/${product._id}`);
        setIsWishlisted(false);
      } else {
        await api.post(`/api/auth/wishlist/${product._id}`);
        setIsWishlisted(true);
      }
    } catch {
      // silently ignore
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, text: product.description, url: window.location.href });
      } catch { /* cancelled */ }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const getImages = () => {
    if (product?.images?.length > 0) return product.images;
    if (product?.image?.url) return [product.image];
    return [];
  };

  // ── Loading / Error / Not Found ───────────────────────────────

  const headerFallback = (
    <Suspense fallback={null}>
      <Header />
    </Suspense>
  );

  if (loading) {
    return (
      <>
        {headerFallback}
        <div className="pd-state-container">
          <div className="pd-loading-inner">
            <OrbitLoader size="lg" />
            <p className="mt-3 text-muted">Loading product…</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        {headerFallback}
        <Container className="pd-state-container">
          <Alert variant={error ? "danger" : "warning"} className="text-center">
            <h5>{error ? "Error Loading Product" : "Product Not Found"}</h5>
            <p>{error || "The product you're looking for doesn't exist."}</p>
            <button className="pd-btn pd-btn--share" onClick={() => navigate("/products")}>
              Back to Products
            </button>
          </Alert>
        </Container>
      </>
    );
  }

  const images = getImages();
  const quantityInCart = cartItems.find((item) => item.product._id === id)?.quantity || 0;
  const isOutOfStock = product.trackInventory !== false && product.stock <= 0;
  const isLowStock = product.trackInventory !== false && product.stock > 0 && product.stock <= (product.lowStockThreshold || 5);

  return (
    <>
      <SEOHead
        title={`${product.name} - Infinity Craft Space`}
        description={product.description}
        type="product"
        structuredData={generateProductStructuredData(product, [])}
      />

      <Suspense fallback={null}>
        <Header />
      </Suspense>

      <div className="pd-page">
        <Container className="pd-container">
          <Breadcrumbs
            category={product.category}
            subCategory={product.subCategory}
            productName={product.name}
          />

          <Row className="mt-3 g-4">
            {/* ── Image Panel ── */}
            <Col lg={6}>
              <Card className="pd-image-card">
                <div
                  className="pd-image-main"
                  onClick={() => images.length > 0 && setShowImageModal(true)}
                >
                  {images.length > 0 ? (
                    <img src={images[selectedImageIndex]?.url} alt={product.name} />
                  ) : (
                    <div className="pd-image-no-img">
                      <FiPackage size={64} />
                      <p className="mt-2">No image</p>
                    </div>
                  )}

                  {images.length > 1 && (
                    <>
                      <button
                        className="pd-img-arrow pd-img-arrow--prev"
                        onClick={(e) => { e.stopPropagation(); setSelectedImageIndex((p) => (p > 0 ? p - 1 : images.length - 1)); }}
                        aria-label="Previous image"
                      >
                        <FiChevronLeft size={20} />
                      </button>
                      <button
                        className="pd-img-arrow pd-img-arrow--next"
                        onClick={(e) => { e.stopPropagation(); setSelectedImageIndex((p) => (p < images.length - 1 ? p + 1 : 0)); }}
                        aria-label="Next image"
                      >
                        <FiChevronRight size={20} />
                      </button>
                    </>
                  )}
                </div>

                {images.length > 1 && (
                  <div className="pd-thumbnails">
                    {images.map((image, index) => (
                      <img
                        key={index}
                        src={image.url}
                        alt={`${product.name} ${index + 1}`}
                        className={`pd-thumb ${index === selectedImageIndex ? "pd-thumb--active" : ""}`}
                        onClick={() => setSelectedImageIndex(index)}
                      />
                    ))}
                  </div>
                )}
              </Card>
            </Col>

            {/* ── Info Panel ── */}
            <Col lg={6}>
              <div className="pd-info">
                {/* Category badges */}
                <div className="pd-badges">
                  {product.category && <span className="pd-badge">{product.category}</span>}
                  {product.subCategory && <span className="pd-badge pd-badge--sub">{product.subCategory}</span>}
                </div>

                {/* Name */}
                <h1 className="pd-name">{product.name}</h1>

                {/* Rating */}
                {ratingStats?.reviewCount > 0 && (
                  <div className="pd-rating-row">
                    <StarRating rating={ratingStats.averageRating} size="1.1rem" showValue />
                    <span>({ratingStats.reviewCount} {ratingStats.reviewCount === 1 ? "review" : "reviews"})</span>
                  </div>
                )}

                {/* Price */}
                <div className="pd-price-row">
                  <span className="pd-price">₹{product.price}</span>
                  <span className="pd-price-note">Inclusive of all taxes</span>
                </div>

                {/* Stock */}
                {product.trackInventory !== false && (
                  <div>
                    {isOutOfStock ? (
                      <span className="pd-stock pd-stock--out">⚠️ Out of Stock</span>
                    ) : isLowStock ? (
                      <span className="pd-stock pd-stock--low">🔥 Only {product.stock} left — Order soon!</span>
                    ) : (
                      <span className="pd-stock pd-stock--in"><FiCheck size={14} /> In Stock</span>
                    )}
                  </div>
                )}

                {/* Description */}
                <div>
                  <p className="pd-desc-heading">Description</p>
                  <p className="pd-desc-body">{product.description}</p>
                </div>

                {/* Actions */}
                <div className="pd-actions">
                  {isOutOfStock ? (
                    <button className="pd-btn pd-btn--disabled" disabled>
                      <FiPackage /> Out of Stock
                    </button>
                  ) : (
                    <button
                      className="pd-btn pd-btn--primary"
                      onClick={handleAddToCart}
                      disabled={addingToCart}
                    >
                      {addingToCart ? (
                        <DotsLoader size="sm" />
                      ) : (
                        <FiShoppingCart />
                      )}
                      {quantityInCart > 0 ? `Add More (${quantityInCart} in cart)` : "Add to Cart"}
                    </button>
                  )}

                  <button
                    className={`pd-btn ${isWishlisted ? "pd-btn--wishlist-active" : "pd-btn--wishlist"}`}
                    onClick={handleWishlistToggle}
                    disabled={wishlistLoading}
                    aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    {wishlistLoading ? (
                      <DotsLoader size="sm" />
                    ) : (
                      <FiHeart style={{ fill: isWishlisted ? "currentColor" : "none" }} />
                    )}
                  </button>

                  <button className="pd-btn pd-btn--share" onClick={handleShare} aria-label="Share product">
                    <FiShare2 />
                  </button>
                </div>

                {/* Trust strip */}
                <div className="pd-trust-strip">
                  {TRUST_ITEMS.map((item) => (
                    <div key={item.label} className="pd-trust-item">
                      <div className="pd-trust-icon" style={{ background: item.bg, color: item.color }}>
                        {item.icon}
                      </div>
                      <div>
                        <p className="pd-trust-label">{item.label}</p>
                        <p className="pd-trust-sub">{item.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Col>
          </Row>

          {/* Reviews */}
          <Row className="mt-5">
            <Col>
              <Card className="pd-section-card">
                <Card.Body>
                  <Suspense fallback={<PageLoader variant="card" label="Loading…" />}>
                    <ReviewList productId={id} productName={product.name} />
                  </Suspense>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Q&A */}
          <Row className="mt-4">
            <Col>
              <Card className="pd-section-card">
                <Card.Body>
                  <Suspense fallback={<PageLoader variant="card" label="Loading…" />}>
                    <ProductQnA productId={id} isAuthenticated={isAuthenticated} userName={userName} />
                  </Suspense>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Recommendations */}
          <Row className="mt-4">
            <Col>
              <Suspense fallback={<PageLoader variant="card" label="Loading…" />}>
                <ProductRecommendations productId={id} currentProductCategory={product.category} />
              </Suspense>
            </Col>
          </Row>
        </Container>
      </div>

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
