import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FiX } from "react-icons/fi";
import { useRecentlyViewed } from "../hooks/useRecentlyViewed";
import EmptyState from "./EmptyState";
import "../styles/designPatterns.css";

/**
 * RecentlyViewed Component
 * Displays recently viewed products with ability to clear
 */
const RecentlyViewed = ({ limit = 8 }) => {
  const { recentlyViewed, clearAll, removeProduct } = useRecentlyViewed();

  if (!recentlyViewed || recentlyViewed.length === 0) {
    return null;
  }

  const displayedProducts = recentlyViewed.slice(0, limit);

  return (
    <section
      style={{
        paddingTop: "var(--spacing-3xl)",
        paddingBottom: "var(--spacing-3xl)",
        backgroundColor: "var(--bg-secondary)",
      }}
    >
      <Container>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "var(--spacing-xl)",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontWeight: 700,
              fontSize: "var(--font-size-2xl)",
            }}
          >
            Recently Viewed
          </h2>
          {recentlyViewed.length > 0 && (
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={clearAll}
              style={{ borderRadius: "var(--radius-md)" }}
            >
              Clear History
            </Button>
          )}
        </div>

        <Row className="g-3">
          {displayedProducts.map((product) => (
            <Col key={product._id} xs={6} md={4} lg={3}>
              <RecentlyViewedCard product={product} onRemove={removeProduct} />
            </Col>
          ))}
        </Row>

        {recentlyViewed.length > limit && (
          <div style={{ textAlign: "center", marginTop: "var(--spacing-xl)" }}>
            <p
              style={{
                color: "var(--text-secondary)",
                marginBottom: "var(--spacing-md)",
              }}
            >
              +{recentlyViewed.length - limit} more
            </p>
            <Link to="/recently-viewed" style={{ textDecoration: "none" }}>
              <Button
                variant="outline-primary"
                style={{ borderRadius: "var(--radius-md)" }}
              >
                View All
              </Button>
            </Link>
          </div>
        )}
      </Container>
    </section>
  );
};

// Individual Recently Viewed Card
const RecentlyViewedCard = ({ product, onRemove }) => {
  const handleRemoveFromHistory = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (onRemove) {
      onRemove(product._id);
    }
  };

  return (
    <Card
      className="card-elevated card-hover h-100"
      style={{ position: "relative" }}
    >
      <Link
        to={`/product/${product._id}`}
        style={{ textDecoration: "none", color: "inherit", display: "block" }}
      >
        <div
          style={{
            position: "relative",
            aspectRatio: "1",
            overflow: "hidden",
            backgroundColor: "#f5f5f5",
          }}
        >
          {product.images && product.images[0] ? (
            <img
              src={product.images[0].url}
              alt={product.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
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
                color: "#999",
              }}
            >
              No Image
            </div>
          )}

          {/* Remove button */}
          <button
            onClick={handleRemoveFromHistory}
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              background: "rgba(0,0,0,0.5)",
              border: "none",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "white",
              opacity: 0,
              transition: "opacity 0.3s ease",
              padding: 0,
            }}
            onMouseEnter={(e) => (e.target.style.opacity = "1")}
            onMouseLeave={(e) => (e.target.style.opacity = "0")}
            title="Remove from history"
          >
            <FiX size={18} />
          </button>
        </div>
      </Link>

      <Card.Body style={{ padding: "var(--spacing-md)" }}>
        <p
          style={{
            margin: 0,
            marginBottom: "var(--spacing-sm)",
            fontWeight: 600,
            fontSize: "var(--font-size-sm)",
            color: "var(--text-primary)",
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

        <p
          style={{
            margin: 0,
            fontSize: "var(--font-size-lg)",
            fontWeight: 700,
            color: "var(--color-primary)",
          }}
        >
          ₹{product.price.toLocaleString()}
        </p>
      </Card.Body>
    </Card>
  );
};

export default RecentlyViewed;
