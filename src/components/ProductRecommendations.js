import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Spinner } from "react-bootstrap";
import { FiChevronRight } from "react-icons/fi";
import { recommendationsAPI } from "../api/features";
import { SkeletonProductGrid, SkeletonProductCard } from "./SkeletonLoaders";
import "../styles/designPatterns.css";

/**
 * ProductRecommendations Component
 * Displays recommended products in multiple variations
 */
const ProductRecommendations = ({
  productId,
  title = "You May Also Like",
  limit = 6,
  type = "similar",
}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      setError(null);

      try {
        let result;

        switch (type) {
          case "boughtTogether":
            result = await recommendationsAPI.getBoughtTogether(
              productId,
              limit,
            );
            break;
          case "trending":
            result = await recommendationsAPI.getTrending(limit);
            break;
          case "popular":
            result = await recommendationsAPI.getPopular(limit);
            break;
          case "similar":
          default:
            result = await recommendationsAPI.getByProduct(productId, limit);
        }

        if (result.success) {
          setProducts(
            result.data || result.products || result.recommendations || [],
          );
        } else {
          setError("Failed to load recommendations");
        }
      } catch (err) {
        console.error("Error fetching recommendations:", err);
        setError("An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (productId || type !== "similar") {
      fetchRecommendations();
    }
  }, [productId, type]);

  if (loading) {
    return (
      <section className="recommendations-section py-5">
        <Container>
          <h2 className="section-title mb-4">{title}</h2>
          <SkeletonProductGrid count={Math.min(limit, 4)} />
        </Container>
      </section>
    );
  }

  if (error || products.length === 0) {
    return null;
  }

  return (
    <section
      className="recommendations-section py-5"
      style={{ backgroundColor: "#f9fafb" }}
    >
      <Container>
        <div className="section-header">
          <h2 className="section-title">{title}</h2>
          <a
            href="/products"
            style={{
              color: "var(--color-primary)",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            View All <FiChevronRight size={18} />
          </a>
        </div>

        <Row className="g-4">
          {products.map((product) => (
            <Col key={product._id} md={6} lg={3} className="mb-4">
              <ProductRecommendationCard product={product} />
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

// Individual recommendation card component
const ProductRecommendationCard = ({ product }) => {
  const handleAddToCart = () => {
    // Dispatch to cart
    console.log("Added to cart:", product._id);
  };

  const handleViewProduct = () => {
    window.location.href = `/product/${product._id}`;
  };

  return (
    <Card
      className="card-elevated card-hover h-100"
      style={{ cursor: "pointer" }}
    >
      <div
        style={{
          position: "relative",
          aspectRatio: "1",
          overflow: "hidden",
          backgroundColor: "#f5f5f5",
        }}
        onClick={handleViewProduct}
      >
        {product.images && product.images[0] ? (
          <img
            src={product.images[0].url}
            alt={product.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.3s ease",
            }}
            onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#e5e5e5",
            }}
          >
            No Image
          </div>
        )}

        {product.stock > 0 && product.stock <= 5 && (
          <div
            className="badge-danger"
            style={{ position: "absolute", top: "8px", right: "8px" }}
          >
            Only {product.stock} left
          </div>
        )}
      </div>

      <Card.Body
        className="d-flex flex-column"
        style={{ padding: "var(--spacing-md)" }}
      >
        <p
          className="m-0 mb-2"
          style={{
            fontWeight: 600,
            color: "var(--text-primary)",
            fontSize: "var(--font-size-sm)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            WebkitLineClamp: 2,
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            minHeight: "2.8em",
          }}
        >
          {product.name}
        </p>

        {product.ratingCount > 0 && (
          <div
            className="rating-display mb-2"
            style={{ fontSize: "var(--font-size-xs)" }}
          >
            <div className="rating-stars">
              {"★".repeat(Math.round(product.averageRating))}
              {"☆".repeat(5 - Math.round(product.averageRating))}
            </div>
            <span className="rating-count">({product.ratingCount})</span>
          </div>
        )}

        <p
          className="m-0 mb-3 mt-auto"
          style={{
            fontSize: "var(--font-size-lg)",
            fontWeight: 700,
            color: "var(--color-primary)",
          }}
        >
          ₹{product.price.toLocaleString()}
        </p>

        <Button
          onClick={handleViewProduct}
          className="w-100"
          style={{
            backgroundColor: "var(--color-primary)",
            border: "none",
            color: "white",
            padding: "var(--spacing-sm)",
            borderRadius: "var(--radius-md)",
            fontSize: "var(--font-size-sm)",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all var(--transition-fast)",
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "var(--primary-700)";
            e.target.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "var(--color-primary)";
            e.target.style.transform = "translateY(0)";
          }}
        >
          View Product
        </Button>
      </Card.Body>
    </Card>
  );
};

export default ProductRecommendations;
export { ProductRecommendationCard };
