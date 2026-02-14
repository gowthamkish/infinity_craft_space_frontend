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
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import api from "../api/axios";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Spinner from "react-bootstrap/Spinner";
import Badge from "react-bootstrap/Badge";
import Alert from "react-bootstrap/Alert";
import Toast from "react-bootstrap/Toast";
import ToastContainer from "react-bootstrap/ToastContainer";
import Offcanvas from "react-bootstrap/Offcanvas";
import {
  FiGrid,
  FiFilter,
  FiShoppingCart,
  FiX,
  FiHeart,
  FiTrash2,
} from "react-icons/fi";
import SEOHead, { SEO_CONFIG } from "../components/SEOHead";
import "./ProductListing.css";

// Lazy load components
const Header = lazy(() => import("../components/header"));
const ProductFilters = lazy(() => import("../components/ProductFilters"));
const ImageCarouselModal = lazy(
  () => import("../components/ImageCarouselModal"),
);

// Optimized ProductCard component with React.memo
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
    const [cartLoading, setCartLoading] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);

    const handleToggleWishlist = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      setWishlistLoading(true);
      try {
        if (isWishlisted) {
          // remove
          await api.delete(`/api/auth/wishlist/${product._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          onShowToast("Removed from wishlist", "success");
          if (onWishlistToggle) onWishlistToggle(product._id, false);
        } else {
          // add
          await api.post(
            "/api/auth/wishlist",
            { productId: product._id },
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          onShowToast("✓ Added to wishlist!", "success");
          if (onWishlistToggle) onWishlistToggle(product._id, true);
        }
      } catch (err) {
        onShowToast("Wishlist action failed", "error");
        console.error(err);
      } finally {
        setWishlistLoading(false);
      }
    };
    return (
      <Card className="h-100 product-card">
        <div
          className="product-card-image-wrapper"
          onClick={() => onImageClick && onImageClick(product)}
        >
          {/* Multiple Images Display */}
          {product?.images?.length > 0 ? (
            <>
              <Card.Img
                variant="top"
                src={product.images[0].url}
                loading="lazy"
                className="product-card-img"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/200x200?text=No+Image";
                }}
              />
              {/* Images Count Indicator */}
              {product.images.length > 1 && (
                <div className="product-image-count-badge">
                  📸 {product.images.length}
                </div>
              )}
              {/* Click to View Overlay */}
              <div className="product-image-overlay">
                🔍 Click to view all images
              </div>
            </>
          ) : (
            // Backward compatibility for single image
            <>
              <Card.Img
                variant="top"
                src={
                  product?.image?.url ||
                  "https://via.placeholder.com/200x200?text=No+Image"
                }
                loading="lazy"
                className="product-card-img"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/200x200?text=No+Image";
                }}
              />
              {/* Click to View Overlay for single image */}
              <div className="product-image-overlay">
                🔍 Click to view image
              </div>
            </>
          )}
        </div>
        <Card.Body className="d-flex flex-column product-card-body">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <Card.Title className="mb-0 product-title" title={product.name}>
              {product.name}
            </Card.Title>
            {product.category && (
              <Badge className="product-category-badge">
                {product.category}
              </Badge>
            )}
          </div>

          <div className="product-price mb-2">₹{product.price}</div>

          {/* Stock Status & Estimated Delivery - Single Row */}
          {(product.trackInventory !== false || product.estimatedDelivery) && (
            <div className="mb-2 d-flex align-items-center product-stock-delivery-row">
              {/* Out of Stock */}
              {product.trackInventory !== false && product.stock <= 0 && (
                <Badge className="stock-badge-out">❌ Out of Stock</Badge>
              )}
              {/* Only X left */}
              {product.trackInventory !== false &&
                product.stock > 0 &&
                product.stock <= (product.lowStockThreshold || 5) && (
                  <Badge className="stock-badge-low">
                    ⚠️ Only {product.stock} left!
                  </Badge>
                )}
              {/* Estimated Delivery */}
              {product.estimatedDelivery && (
                <Badge className="delivery-badge">
                  🚚 Delivery in {product.estimatedDelivery}{" "}
                  {product.estimatedDelivery === 1 ? "day" : "days"}
                </Badge>
              )}
            </div>
          )}

          <div
            className="mb-2 product-details-link"
            onClick={() => navigate(`/product/${product._id}`)}
          >
            View Details & Reviews →
          </div>
          <div className="d-flex product-action-buttons justify-content-center">
            {/* Check if product is out of stock */}
            {product.trackInventory !== false && product.stock <= 0 ? (
              <Button
                variant="secondary"
                size="sm"
                disabled
                className="flex-fill btn-out-of-stock"
              >
                Out of Stock
              </Button>
            ) : (
              <Button
                variant="success"
                size="sm"
                onClick={async () => {
                  setCartLoading(true);
                  try {
                    await Promise.resolve(onAddToCart(product));
                  } catch (err) {
                    console.error(err);
                  } finally {
                    setCartLoading(false);
                  }
                }}
                className="hover-scale flex-fill btn-add-to-cart"
                title={cartLoading ? "Processing..." : "Add to Cart"}
                disabled={cartLoading}
              >
                {cartLoading ? (
                  <Spinner animation="border" size="sm" variant="light" />
                ) : (
                  <FiShoppingCart size={18} strokeWidth={2.5} />
                )}
              </Button>
            )}
            {quantityInCart > 0 &&
              !(product.trackInventory !== false && product.stock <= 0) && (
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={async () => {
                    setCartLoading(true);
                    try {
                      await Promise.resolve(onRemoveFromCart(product));
                    } catch (err) {
                      console.error(err);
                    } finally {
                      setCartLoading(false);
                    }
                  }}
                  className="hover-scale flex-fill btn-remove-from-cart"
                  title={cartLoading ? "Processing..." : "Remove from Cart"}
                  disabled={cartLoading}
                >
                  {cartLoading ? (
                    <Spinner animation="border" size="sm" variant="danger" />
                  ) : (
                    <FiTrash2 size={18} strokeWidth={2.5} />
                  )}
                </Button>
              )}
            <Button
              variant={isWishlisted ? "primary" : "outline-secondary"}
              size="sm"
              onClick={handleToggleWishlist}
              className={`hover-scale flex-fill btn-wishlist ${isWishlisted ? "btn-wishlist-active" : "btn-wishlist-inactive"}`}
              title={
                wishlistLoading
                  ? "Processing..."
                  : isWishlisted
                    ? "In Wishlist"
                    : "Add to Wishlist"
              }
              disabled={wishlistLoading}
            >
              {wishlistLoading ? (
                <Spinner
                  animation="border"
                  size="sm"
                  variant={isWishlisted ? "light" : "danger"}
                />
              ) : (
                <FiHeart
                  size={18}
                  strokeWidth={2.5}
                  fill={isWishlisted ? "white" : "none"}
                />
              )}
            </Button>
          </div>
        </Card.Body>
      </Card>
    );
  },
);

const ProductListing = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data: products, loading, error } = useProducts();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [filters, setFilters] = useState({
    categories: [],
    priceRange: null,
    searchTerm: "",
    sortBy: "",
  });

  // Image carousel modal state
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Toast notification state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success"); // 'success' or 'error'

  const cartItems = useSelector((state) => state.cart.items);
  const isAuthenticated = useSelector((state) => state.auth.token);

  // Wishlist IDs set
  const [wishlistIds, setWishlistIds] = useState(new Set());

  // Fetch wishlist when authenticated
  useEffect(() => {
    let mounted = true;
    const fetchWishlist = async () => {
      if (!isAuthenticated) {
        if (mounted) setWishlistIds(new Set());
        return;
      }
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/api/auth/wishlist", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const ids = new Set((res.data.wishlist || []).map((p) => p._id));
        if (mounted) setWishlistIds(ids);
      } catch (err) {
        // ignore
      }
    };
    fetchWishlist();
    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  // Memoized calculations for better performance
  const totalCartItems = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems],
  );

  // Memoized cart item lookup
  const cartItemsMap = useMemo(() => {
    const map = new Map();
    cartItems.forEach((item) => {
      map.set(item.product._id, item.quantity);
    });
    return map;
  }, [cartItems]);

  const getItemQuantityInCart = useCallback(
    (productId) => {
      return cartItemsMap.get(productId) || 0;
    },
    [cartItemsMap],
  );

  // Optimized filter and sort products with better performance
  const filteredAndSortedProducts = useMemo(() => {
    if (!Array.isArray(products) || products.length === 0) return [];

    let filtered = products;

    // Search filter with optimized regex
    if (filters.searchTerm) {
      const searchRegex = new RegExp(filters.searchTerm, "i");
      filtered = filtered.filter(
        (product) =>
          searchRegex.test(product.name) ||
          (product.description && searchRegex.test(product.description)),
      );
    }

    // Category filter with Set for better performance
    if (filters.categories && filters.categories.length > 0) {
      const filterCategoriesSet = new Set(
        filters.categories.map((cat) => cat.toLowerCase()),
      );
      filtered = filtered.filter((product) => {
        const productCategoryLower = product.category?.toLowerCase();
        const productSubCategoryLower = product.subCategory?.toLowerCase();

        return (
          filterCategoriesSet.has(productCategoryLower) ||
          filterCategoriesSet.has(productSubCategoryLower)
        );
      });
    }

    // Price range filter
    if (filters.priceRange) {
      const { min, max } = filters.priceRange;
      filtered = filtered.filter(
        (product) => product.price >= min && product.price <= max,
      );
    }

    // Sort products with optimized sorting
    if (filters.sortBy) {
      const sortedFiltered = [...filtered]; // Create new array for immutability
      switch (filters.sortBy) {
        case "price-low-high":
          sortedFiltered.sort((a, b) => a.price - b.price);
          break;
        case "price-high-low":
          sortedFiltered.sort((a, b) => b.price - a.price);
          break;
        case "name-asc":
          sortedFiltered.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case "name-desc":
          sortedFiltered.sort((a, b) => b.name.localeCompare(a.name));
          break;
        default:
          return filtered;
      }
      return sortedFiltered;
    }

    return filtered;
  }, [products, filters]);

  // Optimized event handlers with useCallback
  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      categories: [],
      priceRange: null,
      searchTerm: "",
      sortBy: "",
    });
  }, []);

  const handleCloseMobileFilters = useCallback(() => {
    setShowMobileFilters(false);
  }, []);

  const handleShowMobileFilters = useCallback(() => {
    setShowMobileFilters(true);
  }, []);

  const handleAddToCart = useCallback(
    (product) => {
      dispatch(addToCart({ product, quantity: 1 }));
    },
    [dispatch],
  );

  const handleRemoveFromCart = useCallback(
    (product) => {
      dispatch(removeFromCart({ product }));
    },
    [dispatch],
  );

  const handleCheckout = useCallback(() => {
    if (!isAuthenticated) {
      localStorage.setItem("redirectAfterLogin", "/checkout");
      navigate("/login");
    } else {
      navigate("/checkout");
    }
  }, [isAuthenticated, navigate]);

  // Image modal handlers
  const handleImageClick = useCallback((product) => {
    setSelectedProduct(product);
    setShowImageModal(true);
  }, []);

  const handleCloseImageModal = useCallback(() => {
    setShowImageModal(false);
    setSelectedProduct(null);
  }, []);

  // Toast handler
  const handleShowToast = useCallback((message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000); // Auto hide after 3 seconds
  }, []);

  // Generate dynamic SEO based on filters and search
  const generatePageSEO = useMemo(() => {
    let title = "Premium Craft Supplies & Materials";
    let description = SEO_CONFIG.DEFAULT_DESCRIPTION;
    let keywords = SEO_CONFIG.DEFAULT_KEYWORDS;

    if (filters.searchTerm) {
      title = `${filters.searchTerm} - Craft Supplies & Materials`;
      description = `Find ${filters.searchTerm} and related craft supplies at Infinity Craft Space. Browse our collection of premium materials and tools.`;
      keywords = `${filters.searchTerm}, ${SEO_CONFIG.DEFAULT_KEYWORDS}`;
    }

    if (filters.categories && filters.categories.length > 0) {
      const categoryText = filters.categories.join(", ");
      title = `${categoryText} - Craft Supplies`;
      description = `Shop ${categoryText} supplies at Infinity Craft Space. Premium quality materials and tools for your crafting needs.`;
      keywords = `${categoryText}, ${SEO_CONFIG.DEFAULT_KEYWORDS}`;
    }

    if (filters.priceRange) {
      const priceText = `₹${filters.priceRange.min} - ₹${filters.priceRange.max}`;
      title = `Craft Supplies ${priceText} - Affordable Materials`;
      description = `Quality craft supplies in the ${priceText} price range. Find affordable materials and tools at Infinity Craft Space.`;
    }

    return {
      title: `${title} - ${SEO_CONFIG.SITE_NAME}`,
      description,
      keywords,
      url: `${SEO_CONFIG.SITE_URL}${filters.searchTerm ? `/search?q=${encodeURIComponent(filters.searchTerm)}` : "/products"}`,
      structuredData: {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: title,
        description: description,
        url: `${SEO_CONFIG.SITE_URL}${filters.searchTerm ? `/search?q=${encodeURIComponent(filters.searchTerm)}` : "/products"}`,
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: filteredAndSortedProducts.length,
          itemListElement: filteredAndSortedProducts
            .slice(0, 20)
            .map((product, index) => ({
              "@type": "ListItem",
              position: index + 1,
              item: {
                "@type": "Product",
                name: product.name,
                description:
                  product.description ||
                  `${product.name} - Premium craft supply from Infinity Craft Space`,
                image:
                  product.images?.[0]?.url ||
                  product.image?.url ||
                  "https://infinitycraftspace.com/ICS_Logo.jpeg",
                offers: {
                  "@type": "Offer",
                  price: product.price,
                  priceCurrency: "INR",
                  availability: "https://schema.org/InStock",
                },
              },
            })),
        },
      },
    };
  }, [filters, filteredAndSortedProducts]);

  const breadcrumbs = [
    { name: "Home", url: SEO_CONFIG.SITE_URL },
    { name: "Products", url: `${SEO_CONFIG.SITE_URL}/products` },
  ];

  if (filters.categories && filters.categories.length > 0) {
    filters.categories.forEach((category) => {
      breadcrumbs.push({
        name: category,
        url: `${SEO_CONFIG.SITE_URL}/products?category=${encodeURIComponent(category)}`,
      });
    });
  }

  return (
    <div className="App">
      <SEOHead
        title={generatePageSEO.title}
        description={generatePageSEO.description}
        keywords={generatePageSEO.keywords}
        url={generatePageSEO.url}
        type="website"
        structuredData={generatePageSEO.structuredData}
        canonical={generatePageSEO.url}
      />

      <Suspense
        fallback={
          <div className="d-flex justify-content-center p-3">
            <Spinner animation="border" />
          </div>
        }
      >
        <Header />
      </Suspense>

      {/* Main Content with top margin to account for fixed header */}
      <div className="main-container">
        <Container fluid className="p-0">
          <Row>
            {/* Desktop Filter Panel - Hidden on mobile */}
            <Col lg={3} md={4} className="d-none d-md-block mb-4">
              <div className="filter-panel">
                <Suspense
                  fallback={
                    <div className="p-3">
                      <Spinner size="sm" animation="border" />
                    </div>
                  }
                >
                  <ProductFilters
                    products={products}
                    onFiltersChange={handleFiltersChange}
                    activeFilters={filters}
                    onClearFilters={handleClearFilters}
                  />
                </Suspense>
              </div>
            </Col>

            {/* Mobile Filter Offcanvas */}
            <Offcanvas
              show={showMobileFilters}
              onHide={handleCloseMobileFilters}
              placement="start"
              backdrop={true}
              scroll={false}
              className="d-md-none filter-offcanvas"
            >
              <Offcanvas.Header className="filter-offcanvas-header">
                <Offcanvas.Title className="filter-offcanvas-title">
                  <FiFilter size={22} className="me-2" strokeWidth={2.5} />
                  Filter Products
                </Offcanvas.Title>
                <Button
                  variant="link"
                  onClick={handleCloseMobileFilters}
                  className="ms-auto filter-offcanvas-close"
                >
                  <FiX size={24} />
                </Button>
              </Offcanvas.Header>
              <Offcanvas.Body className="filter-offcanvas-body">
                <Suspense
                  fallback={
                    <div className="p-3">
                      <Spinner size="sm" animation="border" />
                    </div>
                  }
                >
                  <ProductFilters
                    products={products}
                    onFiltersChange={handleFiltersChange}
                    activeFilters={filters}
                    onClearFilters={handleClearFilters}
                  />
                </Suspense>
                <div className="mt-4 d-grid">
                  <Button
                    variant="primary"
                    onClick={handleCloseMobileFilters}
                    className="apply-filters-btn"
                  >
                    Apply Filters
                  </Button>
                </div>
              </Offcanvas.Body>
            </Offcanvas>

            {/* Main Content */}
            <Col lg={9} md={8} xs={12}>
              <div className="content-card">
                <div className="d-flex justify-content-between align-items-start align-items-md-center mb-5 flex-column flex-md-row gap-3">
                  <div className="d-flex align-items-center gap-3 flex-wrap">
                    <h1 className="mb-0 page-title">
                      <div className="page-title-icon">
                        <FiGrid
                          size={28}
                          className="text-white"
                          strokeWidth={2.5}
                        />
                      </div>
                      Products
                    </h1>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="d-md-none hover-scale mobile-filter-btn"
                      onClick={handleShowMobileFilters}
                    >
                      <FiFilter size={18} strokeWidth={2.5} />
                      <span>Filters</span>
                      {(filters.categories.length > 0 ||
                        filters.priceRange ||
                        filters.searchTerm ||
                        filters.sortBy) && (
                        <Badge className="filter-count-badge">
                          {
                            [
                              ...filters.categories,
                              filters.priceRange ? "price" : null,
                              filters.searchTerm ? "search" : null,
                              filters.sortBy ? "sort" : null,
                            ].filter(Boolean).length
                          }
                        </Badge>
                      )}
                    </Button>
                    <Badge bg="primary" className="products-count-badge">
                      {filteredAndSortedProducts.length} of {products.length}
                    </Badge>
                  </div>
                  {totalCartItems > 0 && (
                    <Button
                      variant="success"
                      onClick={handleCheckout}
                      className="hover-scale checkout-btn"
                    >
                      <FiShoppingCart size={18} className="me-2" />
                      <span className="d-none d-sm-inline">Cart </span>
                      <Badge bg="light" text="dark" className="ms-2 cart-badge">
                        {totalCartItems}
                      </Badge>
                      <span className="ms-2 d-none d-sm-inline">Checkout</span>
                      <span className="ms-2 d-sm-none">Go</span>
                    </Button>
                  )}
                </div>

                {!isAuthenticated && (
                  <Alert variant="info" className="mb-4 welcome-alert">
                    <Alert.Heading className="welcome-alert-heading">
                      Welcome to Infinity Craft Space! 👋
                    </Alert.Heading>
                    Browse our products and add them to your cart. You'll need
                    to{" "}
                    <Alert.Link href="/login" className="welcome-alert-link">
                      login
                    </Alert.Link>{" "}
                    to complete your purchase.
                  </Alert>
                )}

                {error && (
                  <Alert variant="danger" dismissible>
                    {error}
                  </Alert>
                )}

                {loading ? (
                  <div
                    className="d-flex justify-content-center align-items-center"
                    style={{ minHeight: "200px" }}
                  >
                    <Spinner animation="border" role="status" variant="primary">
                      <span className="visually-hidden">Loading...</span>
                    </Spinner>
                  </div>
                ) : (
                  <>
                    {filteredAndSortedProducts.length === 0 &&
                      products.length > 0 && (
                        <Alert variant="warning" className="text-center">
                          <Alert.Heading>
                            No products match your filters
                          </Alert.Heading>
                          <p>
                            Try adjusting your search criteria or clear the
                            filters.
                          </p>
                          <Button
                            variant="outline-warning"
                            onClick={handleClearFilters}
                          >
                            Clear All Filters
                          </Button>
                        </Alert>
                      )}

                    {products.length === 0 && !error && (
                      <div className="text-center">
                        <h4>No products available</h4>
                        <p>Check back later for new products!</p>
                      </div>
                    )}

                    <Row xs={1} sm={2} lg={3} xl={4} className="g-4">
                      {filteredAndSortedProducts.length > 0 &&
                        filteredAndSortedProducts.map((product) => {
                          const quantityInCart = getItemQuantityInCart(
                            product._id,
                          );
                          return (
                            <Col key={product._id}>
                              <ProductCard
                                product={product}
                                quantityInCart={quantityInCart}
                                onAddToCart={handleAddToCart}
                                onRemoveFromCart={handleRemoveFromCart}
                                onImageClick={handleImageClick}
                                onShowToast={handleShowToast}
                                isWishlisted={wishlistIds.has(product._id)}
                                onWishlistToggle={(id, added) => {
                                  setWishlistIds((prev) => {
                                    const s = new Set(prev);
                                    if (added) s.add(id);
                                    else s.delete(id);
                                    return s;
                                  });
                                }}
                              />
                            </Col>
                          );
                        })}
                    </Row>
                  </>
                )}
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Image Carousel Modal */}
      <Suspense fallback={<div>Loading...</div>}>
        <ImageCarouselModal
          show={showImageModal}
          onHide={handleCloseImageModal}
          images={
            selectedProduct?.images ||
            (selectedProduct?.image ? [selectedProduct.image] : [])
          }
          productName={selectedProduct?.name || "Product Images"}
          initialIndex={0}
        />
      </Suspense>

      {/* Toast Notification */}
      <ToastContainer position="top-end" className="p-3 toast-container-custom">
        <Toast
          show={showToast}
          onClose={() => setShowToast(false)}
          bg={toastType === "success" ? "success" : "danger"}
          autohide
          delay={3000}
        >
          <Toast.Header closeButton>
            <strong className="me-auto">
              {toastType === "success" ? "✓ Success" : "⚠ Error"}
            </strong>
          </Toast.Header>
          <Toast.Body className="toast-body-custom">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

// Export with React.memo for performance optimization
export default React.memo(ProductListing);
