import React, { useState, useEffect, lazy, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Spinner,
  Alert,
  Breadcrumb,
} from "../components/ui";
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

// Lazy load components
const Header = lazy(() => import("../components/header"));
const ReviewList = lazy(() => import("../components/reviews/ReviewList"));
const ImageCarouselModal = lazy(
  () => import("../components/ImageCarouselModal"),
);

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isAuthenticated = useSelector((state) => !!state.auth.token);
  const cartItems = useSelector((state) => state.cart.items);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [ratingStats, setRatingStats] = useState(null);

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/products/${id}`);
        setProduct(response.data.product || response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(err.response?.data?.error || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Fetch rating summary
  useEffect(() => {
    const fetchRatingSummary = async () => {
      try {
        const response = await api.get(`/api/reviews/product/${id}/summary`);
        setRatingStats(response.data);
      } catch (err) {
        // Silently fail for 404 (reviews route not deployed yet)
        if (err.response?.status !== 404) {
          console.error("Error fetching rating summary:", err);
        }
        // Set default empty stats
        setRatingStats({
          averageRating: 0,
          reviewCount: 0,
          ratingBreakdown: {},
        });
      }
    };

    if (id) {
      fetchRatingSummary();
    }
  }, [id]);

  // Check wishlist status
  useEffect(() => {
    const checkWishlist = async () => {
      if (!isAuthenticated || !product) return;

      try {
        const response = await api.get("/api/auth/wishlist");
        const wishlistIds = (response.data.wishlist || []).map((item) =>
          typeof item === "object" ? item._id : item,
        );
        setIsWishlisted(wishlistIds.includes(product._id));
      } catch (err) {
        console.error("Error checking wishlist:", err);
      }
    };

    checkWishlist();
  }, [isAuthenticated, product]);

  const handleAddToCart = async () => {
    if (!product) return;

    setAddingToCart(true);
    try {
      dispatch(addToCart({ product, quantity: 1 }));
      // Show success feedback (could use toast)
    } catch (err) {
      console.error("Error adding to cart:", err);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setWishlistLoading(true);
    try {
      if (isWishlisted) {
        await api.delete(`/api/auth/wishlist/${product._id}`);
        setIsWishlisted(false);
      } else {
        await api.post(`/api/auth/wishlist/${product._id}`);
        setIsWishlisted(true);
      }
    } catch (err) {
      console.error("Error updating wishlist:", err);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const getImages = () => {
    if (product?.images && product.images.length > 0) {
      return product.images;
    }
    if (product?.image?.url) {
      return [product.image];
    }
    return [];
  };

  const images = getImages();
  const quantityInCart =
    cartItems.find((item) => item.product._id === id)?.quantity || 0;

  if (loading) {
    return (
      <>
        <Suspense fallback={null}>
          <Header />
        </Suspense>
        <Container
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "60vh", marginTop: "90px" }}
        >
          <div className="text-center">
            <Spinner
              animation="border"
              style={{ width: "3rem", height: "3rem", color: "#3b82f6" }}
            />
            <p className="mt-3 text-muted">Loading product...</p>
          </div>
        </Container>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Suspense fallback={null}>
          <Header />
        </Suspense>
        <Container className="py-5" style={{ marginTop: "90px" }}>
          <Alert variant="danger" className="text-center">
            <h5>Error Loading Product</h5>
            <p>{error}</p>
            <Button variant="outline-primary" onClick={() => navigate("/")}>
              Back to Products
            </Button>
          </Alert>
        </Container>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Suspense fallback={null}>
          <Header />
        </Suspense>
        <Container className="py-5" style={{ marginTop: "90px" }}>
          <Alert variant="warning" className="text-center">
            <h5>Product Not Found</h5>
            <p>The product you're looking for doesn't exist.</p>
            <Button variant="outline-primary" onClick={() => navigate("/")}>
              Back to Products
            </Button>
          </Alert>
        </Container>
      </>
    );
  }

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

      <Container className="py-4" style={{ marginTop: "90px" }}>
        <Breadcrumb className="mb-4">
          <Breadcrumb.Item
            onClick={() => navigate("/")}
            style={{ cursor: "pointer" }}
          >
            Home
          </Breadcrumb.Item>
          {product.category && (
            <Breadcrumb.Item active>{product.category}</Breadcrumb.Item>
          )}
          <Breadcrumb.Item active>{product.name}</Breadcrumb.Item>
        </Breadcrumb>

        <Row>
          {/* Product Images */}
          <Col lg={6} className="mb-4">
            <Card
              style={{
                border: "none",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "var(--shadow-lg)",
              }}
            >
              {/* Main Image */}
              <div
                style={{
                  position: "relative",
                  paddingTop: "100%",
                  background: "#f8f9fa",
                  cursor: "zoom-in",
                }}
                onClick={() => setShowImageModal(true)}
              >
                {images.length > 0 ? (
                  <img
                    src={images[selectedImageIndex]?.url}
                    alt={product.name}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      padding: "1rem",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      color: "#adb5bd",
                    }}
                  >
                    <FiPackage size={64} />
                    <p className="mt-2">No image</p>
                  </div>
                )}

                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <Button
                      variant="light"
                      className="position-absolute"
                      style={{
                        left: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        borderRadius: "50%",
                        width: "40px",
                        height: "40px",
                        padding: 0,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImageIndex((prev) =>
                          prev > 0 ? prev - 1 : images.length - 1,
                        );
                      }}
                    >
                      <FiChevronLeft size={20} />
                    </Button>
                    <Button
                      variant="light"
                      className="position-absolute"
                      style={{
                        right: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        borderRadius: "50%",
                        width: "40px",
                        height: "40px",
                        padding: 0,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImageIndex((prev) =>
                          prev < images.length - 1 ? prev + 1 : 0,
                        );
                      }}
                    >
                      <FiChevronRight size={20} />
                    </Button>
                  </>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="d-flex gap-2 p-3" style={{ overflowX: "auto" }}>
                  {images.map((image, index) => (
                    <img
                      key={index}
                      src={image.url}
                      alt={`${product.name} ${index + 1}`}
                      onClick={() => setSelectedImageIndex(index)}
                      style={{
                        width: "70px",
                        height: "70px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        cursor: "pointer",
                        border:
                          index === selectedImageIndex
                            ? "2px solid var(--primary-color)"
                            : "2px solid transparent",
                        transition: "all 0.2s ease",
                      }}
                    />
                  ))}
                </div>
              )}
            </Card>
          </Col>

          {/* Product Details */}
          <Col lg={6}>
            <div className="mb-3">
              {/* Category Badge */}
              {product.category && (
                <Badge
                  bg="light"
                  text="dark"
                  className="me-2"
                  style={{
                    fontSize: "0.85rem",
                    padding: "0.5rem 0.75rem",
                    borderRadius: "20px",
                  }}
                >
                  {product.category}
                </Badge>
              )}
              {product.subCategory && (
                <Badge
                  bg="secondary"
                  style={{
                    fontSize: "0.85rem",
                    padding: "0.5rem 0.75rem",
                    borderRadius: "20px",
                  }}
                >
                  {product.subCategory}
                </Badge>
              )}
            </div>

            {/* Product Name */}
            <h1
              style={{
                fontSize: "clamp(1.5rem, 4vw, 2.25rem)",
                fontWeight: "700",
                color: "var(--text-primary)",
                marginBottom: "0.75rem",
              }}
            >
              {product.name}
            </h1>

            {/* Rating */}
            {ratingStats && ratingStats.reviewCount > 0 && (
              <div className="d-flex align-items-center gap-2 mb-3">
                <StarRating
                  rating={ratingStats.averageRating}
                  size="1.1rem"
                  showValue
                />
                <span
                  style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}
                >
                  ({ratingStats.reviewCount}{" "}
                  {ratingStats.reviewCount === 1 ? "review" : "reviews"})
                </span>
              </div>
            )}

            {/* Price */}
            <div className="mb-4">
              <span
                style={{
                  fontSize: "2rem",
                  fontWeight: "700",
                  color: "#10b981",
                }}
              >
                ₹{product.price}
              </span>
              <span
                className="ms-2"
                style={{
                  fontSize: "0.9rem",
                  color: "var(--text-secondary)",
                }}
              >
                (Inclusive of all taxes)
              </span>
            </div>

            {/* Stock Status */}
            {product.trackInventory !== false && (
              <div className="mb-4">
                {product.stock <= 0 ? (
                  <Badge
                    bg="danger"
                    style={{
                      fontSize: "0.9rem",
                      padding: "8px 16px",
                      borderRadius: "20px",
                    }}
                  >
                    ⚠️ Out of Stock
                  </Badge>
                ) : product.stock <= (product.lowStockThreshold || 5) ? (
                  <Badge
                    bg="warning"
                    text="dark"
                    style={{
                      fontSize: "0.9rem",
                      padding: "8px 16px",
                      borderRadius: "20px",
                    }}
                  >
                    🔥 Only {product.stock} left in stock - Order soon!
                  </Badge>
                ) : (
                  <Badge
                    bg="success"
                    style={{
                      fontSize: "0.9rem",
                      padding: "8px 16px",
                      borderRadius: "20px",
                    }}
                  >
                    ✓ In Stock
                  </Badge>
                )}
              </div>
            )}

            {/* Description */}
            <div className="mb-4">
              <h5
                style={{
                  fontWeight: "600",
                  color: "var(--text-primary)",
                  marginBottom: "0.5rem",
                }}
              >
                Description
              </h5>
              <p
                style={{
                  color: "var(--text-secondary)",
                  lineHeight: "1.7",
                  fontSize: "1rem",
                }}
              >
                {product.description}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="d-flex flex-wrap gap-3 mb-4">
              {/* Check if product is out of stock */}
              {product.trackInventory !== false && product.stock <= 0 ? (
                <Button
                  variant="secondary"
                  size="lg"
                  disabled
                  style={{
                    flex: "1 1 200px",
                    borderRadius: "12px",
                    fontWeight: "600",
                    padding: "0.875rem 1.5rem",
                    opacity: 0.7,
                  }}
                >
                  <FiPackage className="me-2" />
                  Out of Stock
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  style={{
                    flex: "1 1 200px",
                    borderRadius: "12px",
                    fontWeight: "600",
                    padding: "0.875rem 1.5rem",
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    border: "none",
                  }}
                >
                  {addingToCart ? (
                    <Spinner animation="border" size="sm" className="me-2" />
                  ) : (
                    <FiShoppingCart className="me-2" />
                  )}
                  {quantityInCart > 0
                    ? `Add More (${quantityInCart} in cart)`
                    : "Add to Cart"}
                </Button>
              )}

              <Button
                variant={isWishlisted ? "danger" : "outline-danger"}
                size="lg"
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
                style={{
                  borderRadius: "12px",
                  fontWeight: "600",
                  padding: "0.875rem 1.5rem",
                }}
              >
                {wishlistLoading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  <FiHeart
                    style={{ fill: isWishlisted ? "currentColor" : "none" }}
                  />
                )}
              </Button>

              <Button
                variant="outline-secondary"
                size="lg"
                onClick={handleShare}
                style={{
                  borderRadius: "12px",
                  fontWeight: "600",
                  padding: "0.875rem 1.5rem",
                }}
              >
                <FiShare2 />
              </Button>
            </div>

            {/* Features */}
            <Card
              style={{
                border: "none",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
              }}
            >
              <Card.Body>
                <Row className="g-3">
                  <Col xs={6}>
                    <div className="d-flex align-items-center gap-2">
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "10px",
                          background: "#10b98133",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <FiTruck size={18} style={{ color: "#10b981" }} />
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: "0.85rem",
                            fontWeight: "600",
                            color: "var(--text-primary)",
                          }}
                        >
                          Free Shipping
                        </div>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--text-secondary)",
                          }}
                        >
                          On orders above ₹999
                        </div>
                      </div>
                    </div>
                  </Col>
                  <Col xs={6}>
                    <div className="d-flex align-items-center gap-2">
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "10px",
                          background: "#3b82f633",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <FiShield size={18} style={{ color: "#3b82f6" }} />
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: "0.85rem",
                            fontWeight: "600",
                            color: "var(--text-primary)",
                          }}
                        >
                          Secure Payment
                        </div>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--text-secondary)",
                          }}
                        >
                          100% Secure Checkout
                        </div>
                      </div>
                    </div>
                  </Col>
                  <Col xs={6}>
                    <div className="d-flex align-items-center gap-2">
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "10px",
                          background: "#f59e0b33",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <FiRefreshCw size={18} style={{ color: "#f59e0b" }} />
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: "0.85rem",
                            fontWeight: "600",
                            color: "var(--text-primary)",
                          }}
                        >
                          Easy Returns
                        </div>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--text-secondary)",
                          }}
                        >
                          7 Days Return Policy
                        </div>
                      </div>
                    </div>
                  </Col>
                  <Col xs={6}>
                    <div className="d-flex align-items-center gap-2">
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "10px",
                          background: "#8b5cf633",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <FiCheck size={18} style={{ color: "#8b5cf6" }} />
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: "0.85rem",
                            fontWeight: "600",
                            color: "var(--text-primary)",
                          }}
                        >
                          Quality Assured
                        </div>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--text-secondary)",
                          }}
                        >
                          Handcrafted with care
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Reviews Section */}
        <Row className="mt-5">
          <Col xs={12}>
            <Card
              style={{
                border: "none",
                borderRadius: "16px",
                boxShadow: "var(--shadow-lg)",
              }}
            >
              <Card.Body className="p-4">
                <Suspense
                  fallback={
                    <div className="text-center py-5">
                      <Spinner animation="border" />
                      <p className="mt-2 text-muted">Loading reviews...</p>
                    </div>
                  }
                >
                  <ReviewList productId={id} productName={product.name} />
                </Suspense>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Image Modal */}
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
