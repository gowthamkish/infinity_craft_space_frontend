import React, { useState, useMemo, useCallback, lazy, Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addToCart, removeFromCart } from "../features/cartSlice";
import { useProducts } from "../hooks/useSmartFetch";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Spinner from "react-bootstrap/Spinner";
import Badge from "react-bootstrap/Badge";
import Alert from "react-bootstrap/Alert";
import Offcanvas from "react-bootstrap/Offcanvas";
import { FiGrid, FiFilter, FiShoppingCart, FiX } from "react-icons/fi";

// Lazy load components
const Header = lazy(() => import("../components/header"));
const ProductFilters = lazy(() => import("../components/ProductFilters"));
const ImageCarouselModal = lazy(() => import("../components/ImageCarouselModal"));

// Optimized ProductCard component with React.memo
const ProductCard = React.memo(({ 
  product, 
  quantityInCart, 
  onAddToCart, 
  onRemoveFromCart,
  onImageClick
}) => (
  <Card className="h-100 product-card hover-shadow">
    <div 
      style={{ 
        overflow: "hidden", 
        borderRadius: "12px 12px 0 0", 
        position: "relative",
        cursor: "pointer"
      }}
      onClick={() => onImageClick && onImageClick(product)}
    >
      {/* Multiple Images Display */}
      {product?.images?.length > 0 ? (
        <>
          <Card.Img
            variant="top"
            src={product.images[0].url}
            loading="lazy"
            style={{
              objectFit: "contain",
              height: "220px",
              background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
              padding: "1rem",
              transition: "transform 0.3s ease"
            }}
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/200x200?text=No+Image";
            }}
          />
          {/* Images Count Indicator */}
          {product.images.length > 1 && (
            <div 
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "rgba(0,0,0,0.8)",
                color: "white",
                padding: "6px 10px",
                borderRadius: "15px",
                fontSize: "12px",
                fontWeight: "bold",
                boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
              }}
            >
              📸 {product.images.length}
            </div>
          )}
          {/* Click to View Overlay */}
          <div 
            className="position-absolute w-100 h-100 d-flex align-items-center justify-content-center"
            style={{
              top: 0,
              left: 0,
              background: "rgba(0,0,0,0)",
              color: "white",
              opacity: 0,
              transition: "opacity 0.3s ease",
              fontSize: "14px",
              fontWeight: "600"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(0,0,0,0.5)";
              e.currentTarget.style.opacity = "1";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(0,0,0,0)";
              e.currentTarget.style.opacity = "0";
            }}
          >
            🔍 Click to view all images
          </div>
        </>
      ) : (
        // Backward compatibility for single image
        <>
          <Card.Img
            variant="top"
            src={product?.image?.url || "https://via.placeholder.com/200x200?text=No+Image"}
            loading="lazy"
            style={{
              objectFit: "contain",
              height: "220px",
              background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
              padding: "1rem",
              transition: "transform 0.3s ease"
            }}
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/200x200?text=No+Image";
            }}
          />
          {/* Click to View Overlay for single image */}
          <div 
            className="position-absolute w-100 h-100 d-flex align-items-center justify-content-center"
            style={{
              top: 0,
              left: 0,
              background: "rgba(0,0,0,0)",
              color: "white",
              opacity: 0,
              transition: "opacity 0.3s ease",
              fontSize: "14px",
              fontWeight: "600"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(0,0,0,0.5)";
              e.currentTarget.style.opacity = "1";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(0,0,0,0)";
              e.currentTarget.style.opacity = "0";
            }}
          >
            🔍 Click to view image
          </div>
        </>
      )}
    </div>
    <Card.Body className="d-flex flex-column p-4">
      <div className="d-flex justify-content-between align-items-start mb-2">
        <Card.Title className="mb-0" style={{ 
          fontSize: "1.1rem", 
          fontWeight: "600",
          color: "var(--text-primary)",
          lineHeight: "1.4"
        }}>
          {product.name}
        </Card.Title>
        {product.category && (
          <Badge 
            bg="light" 
            text="dark" 
            style={{
              fontSize: "0.75rem",
              padding: "4px 8px",
              borderRadius: "12px",
              backgroundColor: "var(--bg-tertiary)",
              color: "var(--text-secondary)"
            }}
          >
            {product.category}
          </Badge>
        )}
      </div>
      
      <div className="price-tag mb-2">
        ₹{product.price}
      </div>
      
      <Card.Text className="text-muted-custom" style={{ 
        fontSize: "0.9rem",
        lineHeight: "1.5",
        flex: "1"
      }}>
        {product.description}
      </Card.Text>
      
      <div className="mt-auto">
        {quantityInCart > 0 && (
          <div className="text-center mb-3">
            <Badge 
              style={{
                background: "var(--primary-color)",
                fontSize: "0.8rem",
                padding: "6px 12px",
                borderRadius: "20px"
              }}
            >
              {quantityInCart} in cart
            </Badge>
          </div>
        )}
        <div className="d-flex gap-2 justify-content-center">
          <Button
            variant="success"
            size="sm"
            onClick={() => onAddToCart(product)}
            className="hover-scale flex-fill"
            style={{
              borderRadius: "8px",
              fontWeight: "500",
              padding: "8px 16px",
              background: "var(--secondary-color)",
              border: "none"
            }}
          >
            + Add to Cart
          </Button>
          {quantityInCart > 0 && (
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => onRemoveFromCart(product)}
              className="hover-scale"
              style={{
                borderRadius: "8px",
                fontWeight: "500",
                padding: "8px 16px",
                borderColor: "var(--error-color)",
                color: "var(--error-color)"
              }}
            >
              Remove
            </Button>
          )}
        </div>
      </div>
    </Card.Body>
  </Card>
));

// Add custom styles for better mobile experience with fixed header
const mobileStyles = `
  @media (max-width: 767.98px) {
    .main-container {
      padding: 90px 1rem 1rem 1rem !important;
      padding-top: 90px !important;
    }
    .filter-offcanvas .offcanvas-header {
      padding: 1.5rem;
    }
    .filter-offcanvas .offcanvas-body {
      padding: 0 1.5rem 1.5rem;
    }
    .product-card .card-body {
      padding: 1rem !important;
    }
    .product-card .card-img-top {
      height: 180px !important;
    }
  }
  
  /* Ensure content scrolls properly with fixed header */
  .main-container {
    height: 100vh;
    overflow-y: auto;
  }
  
  .filter-offcanvas {
    --bs-offcanvas-width: 320px;
  }
  
  .filter-badge-active {
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.7);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(220, 53, 69, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(220, 53, 69, 0);
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.innerHTML = mobileStyles;
  document.head.appendChild(styleElement);
}

const ProductListing = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data: products, loading, error } = useProducts();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [filters, setFilters] = useState({
    categories: [],
    priceRange: null,
    searchTerm: "",
    sortBy: ""
  });
  
  // Image carousel modal state
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const cartItems = useSelector((state) => state.cart.items);
  const isAuthenticated = useSelector((state) => state.auth.token);

  // Memoized calculations for better performance
  const totalCartItems = useMemo(() => 
    cartItems.reduce((total, item) => total + item.quantity, 0), 
    [cartItems]
  );

  // Memoized cart item lookup
  const cartItemsMap = useMemo(() => {
    const map = new Map();
    cartItems.forEach(item => {
      map.set(item.product._id, item.quantity);
    });
    return map;
  }, [cartItems]);

  const getItemQuantityInCart = useCallback((productId) => {
    return cartItemsMap.get(productId) || 0;
  }, [cartItemsMap]);

  // Optimized filter and sort products with better performance
  const filteredAndSortedProducts = useMemo(() => {
    if (!Array.isArray(products) || products.length === 0) return [];

    let filtered = products;

    // Search filter with optimized regex
    if (filters.searchTerm) {
      const searchRegex = new RegExp(filters.searchTerm, 'i');
      filtered = filtered.filter(product => 
        searchRegex.test(product.name) ||
        (product.description && searchRegex.test(product.description))
      );
    }

    // Category filter with Set for better performance
    if (filters.categories && filters.categories.length > 0) {
      const filterCategoriesSet = new Set(filters.categories.map(cat => cat.toLowerCase()));
      filtered = filtered.filter(product => {
        const productCategoryLower = product.category?.toLowerCase();
        const productSubCategoryLower = product.subCategory?.toLowerCase();
        
        return filterCategoriesSet.has(productCategoryLower) ||
               filterCategoriesSet.has(productSubCategoryLower);
      });
    }

    // Price range filter
    if (filters.priceRange) {
      const { min, max } = filters.priceRange;
      filtered = filtered.filter(product => 
        product.price >= min && product.price <= max
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
      sortBy: ""
    });
  }, []);

  const handleCloseMobileFilters = useCallback(() => {
    setShowMobileFilters(false);
  }, []);

  const handleShowMobileFilters = useCallback(() => {
    setShowMobileFilters(true);
  }, []);

  const handleAddToCart = useCallback((product) => {
    dispatch(addToCart({ product, quantity: 1 }));
  }, [dispatch]);

  const handleRemoveFromCart = useCallback((product) => {
    dispatch(removeFromCart({ product }));
  }, [dispatch]);

  const handleCheckout = useCallback(() => {
    if (!isAuthenticated) {
      localStorage.setItem('redirectAfterLogin', '/checkout');
      navigate('/login');
    } else {
      navigate('/checkout');
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

  return (
    <div className="App">
      <Suspense fallback={<div className="d-flex justify-content-center p-3"><Spinner animation="border" /></div>}>
        <Header />
      </Suspense>
      
      {/* Main Content with top margin to account for fixed header */}
      <div 
        className="main-container" 
        style={{ 
          backgroundColor: "#f8fafc", 
          minHeight: "100vh", 
          paddingTop: "90px", // Account for fixed header height
          padding: "90px 1rem 1rem 1rem",
          overflowY: "auto",
          maxHeight: "100vh"
        }}
      >
        <Container fluid style={{ padding: "0" }}>
          <Row>
            {/* Desktop Filter Panel - Hidden on mobile */}
            <Col lg={3} md={4} className="d-none d-md-block mb-4">
              <div 
                className="filter-panel"
                style={{
                  position: "sticky",
                  top: "0", // Account for fixed header (70px + 20px margin + 20px buffer)
                  maxHeight: "calc(100vh - 130px)", // Adjust for header and margins
                  overflowY: "auto"
                }}
              >
                <Suspense fallback={<div className="p-3"><Spinner size="sm" animation="border" /></div>}>
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
              style={{ width: "320px" }}
            >
              <Offcanvas.Header 
                style={{
                  background: "linear-gradient(135deg, var(--primary-color), #3b82f6)",
                  color: "white",
                  borderBottom: "none"
                }}
              >
                <Offcanvas.Title style={{ fontWeight: "600", fontSize: "1.3rem" }}>
                  <FiFilter size={20} className="me-2" />
                  Filter Products
                </Offcanvas.Title>
                <Button
                  variant="link"
                  onClick={handleCloseMobileFilters}
                  style={{
                    color: "white",
                    textDecoration: "none",
                    padding: "0.25rem",
                    fontSize: "1.5rem"
                  }}
                  className="ms-auto"
                >
                  <FiX size={24} />
                </Button>
              </Offcanvas.Header>
              <Offcanvas.Body style={{ padding: "1.5rem" }}>
                <Suspense fallback={<div className="p-3"><Spinner size="sm" animation="border" /></div>}>
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
                    style={{
                      borderRadius: "12px",
                      fontWeight: "600",
                      padding: "12px",
                      background: "linear-gradient(45deg, var(--primary-color), #3b82f6)",
                      border: "none"
                    }}
                  >
                    Apply Filters
                  </Button>
                </div>
              </Offcanvas.Body>
            </Offcanvas>

            {/* Main Content */}
            <Col lg={9} md={8} xs={12}>
              <div style={{ 
                backgroundColor: "white", 
                padding: "clamp(1rem, 3vw, 2rem)", 
                borderRadius: "16px", 
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                border: "1px solid #e2e8f0"
              }}>
                <div className="d-flex justify-content-between align-items-start align-items-md-center mb-4 flex-column flex-md-row gap-3">
                  <div className="d-flex align-items-center gap-3 flex-wrap">
                    <h1 className="mb-0" style={{ 
                      color: "#1e293b",
                      fontWeight: "700",
                      fontSize: "clamp(1.5rem, 4vw, 2rem)"
                    }}>
                      <FiGrid size={32} className="me-2" style={{ color: "#3b82f6" }} />
                      Products
                    </h1>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="d-md-none hover-scale"
                      onClick={handleShowMobileFilters}
                      style={{ 
                        borderRadius: "8px", 
                        fontWeight: "500",
                        border: "2px solid var(--primary-color)",
                        color: "var(--primary-color)"
                      }}
                    >
                      <FiFilter size={16} />
                      <span className="ms-1">Filters</span>
                      {(filters.categories.length > 0 || filters.priceRange || filters.searchTerm || filters.sortBy) && (
                        <Badge 
                          bg="danger" 
                          className="ms-2 filter-badge-active"
                          style={{ 
                            fontSize: "0.7rem",
                            padding: "2px 6px",
                            borderRadius: "10px"
                          }}
                        >
                          {[
                            ...filters.categories,
                            filters.priceRange ? 'price' : null,
                            filters.searchTerm ? 'search' : null,
                            filters.sortBy ? 'sort' : null
                          ].filter(Boolean).length}
                        </Badge>
                      )}
                    </Button>
                    <Badge 
                      bg="primary" 
                      style={{ 
                        fontSize: "0.9rem",
                        padding: "8px 12px",
                        borderRadius: "20px",
                        background: "var(--primary-color)"
                      }}
                    >
                      {filteredAndSortedProducts.length} of {products.length}
                    </Badge>
                  </div>
                  {totalCartItems > 0 && (
                    <Button 
                      variant="success" 
                      onClick={handleCheckout}
                      className="hover-scale"
                      style={{
                        borderRadius: "12px",
                        padding: "10px 20px",
                        fontWeight: "600",
                        boxShadow: "var(--shadow-md)",
                        whiteSpace: "nowrap"
                      }}
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
                <Alert 
                  variant="info" 
                  className="mb-4"
                  style={{
                    backgroundColor: "#f0f9ff",
                    border: "1px solid #0ea5e9",
                    borderRadius: "12px",
                    color: "#0c4a6e"
                  }}
                >
                  <Alert.Heading style={{ color: "#0c4a6e", fontSize: "1.2rem" }}>
                    Welcome to Infinity Craft Space! 👋
                  </Alert.Heading>
                  Browse our products and add them to your cart. You'll need to{' '}
                  <Alert.Link href="/login" style={{ color: "#0ea5e9", fontWeight: "600" }}>
                    login
                  </Alert.Link> to complete your purchase.
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
                  {filteredAndSortedProducts.length === 0 && products.length > 0 && (
                    <Alert variant="warning" className="text-center">
                      <Alert.Heading>No products match your filters</Alert.Heading>
                      <p>Try adjusting your search criteria or clear the filters.</p>
                      <Button variant="outline-warning" onClick={handleClearFilters}>
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
                        const quantityInCart = getItemQuantityInCart(product._id);
                        return (
                          <Col key={product._id}>
                            <ProductCard
                              product={product}
                              quantityInCart={quantityInCart}
                              onAddToCart={handleAddToCart}
                              onRemoveFromCart={handleRemoveFromCart}
                              onImageClick={handleImageClick}
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
          images={selectedProduct?.images || (selectedProduct?.image ? [selectedProduct.image] : [])}
          productName={selectedProduct?.name || "Product Images"}
          initialIndex={0}
        />
      </Suspense>
    </div>
  );
};

// Export with React.memo for performance optimization
export default React.memo(ProductListing);