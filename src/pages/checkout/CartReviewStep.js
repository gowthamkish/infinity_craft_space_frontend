import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import Badge from "react-bootstrap/Badge";
import { Trash2, Plus, Minus, Package } from "react-feather";

export const CartReviewStep = ({
  cartItems,
  subtotal,
  total,
  error,
  proceedToCheckout,
  navigate,
  handleQuantityChange,
  handleRemoveItem,
}) => (
  <Row>
    <Col lg={8} xs={12}>
      <Card
        style={{
          border: "none",
          borderRadius: "16px",
          boxShadow: "var(--shadow-lg)",
          marginBottom: "clamp(1rem, 4vw, 2rem)",
        }}
      >
        <Card.Header
          style={{
            background:
              "linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary))",
            border: "none",
            borderRadius: "16px 16px 0 0",
            padding: "clamp(0.75rem, 3vw, 1.5rem)",
          }}
        >
          <div className="d-flex align-items-center">
            <Package
              className="me-2"
              style={{ color: "var(--primary-color)" }}
            />
            <h4
              className="mb-0"
              style={{
                color: "var(--text-primary)",
                fontWeight: "600",
                fontSize: "clamp(1rem, 4vw, 1.35rem)",
              }}
            >
              Review Your Cart
            </h4>
            <Badge
              bg="primary"
              style={{
                marginLeft: "auto",
                fontSize: "clamp(0.7rem, 2vw, 0.8rem)",
                padding:
                  "clamp(0.35rem, 1.5vw, 0.5rem) clamp(0.6rem, 2vw, 1rem)",
                borderRadius: "20px",
              }}
            >
              {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
            </Badge>
          </div>
        </Card.Header>
        <Card.Body style={{ padding: "0" }}>
          {cartItems.map((item, index) => (
            <div
              key={item.product._id}
              style={{
                padding: "clamp(0.75rem, 3vw, 1.5rem)",
                borderBottom:
                  index < cartItems.length - 1
                    ? "1px solid var(--border-light)"
                    : "none",
                transition: "all 0.3s ease",
              }}
              className="cart-item-hover"
            >
              <Row className="align-items-center d-none d-md-flex">
                <Col md={2}>
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      background: `linear-gradient(135deg, ${
                        item.product.name.charAt(0) === "K"
                          ? "#3b82f6"
                          : "#10b981"
                      }, ${
                        item.product.name.charAt(0) === "K"
                          ? "#1d4ed8"
                          : "#059669"
                      })`,
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "1.5rem",
                      fontWeight: "700",
                      boxShadow: "var(--shadow-md)",
                    }}
                  >
                    {item.product.name.charAt(0)}
                  </div>
                </Col>
                <Col md={4}>
                  <h6
                    className="mb-1"
                    style={{ color: "var(--text-primary)", fontWeight: "600" }}
                  >
                    {item.product.name}
                  </h6>
                  <p
                    className="mb-1"
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.875rem",
                    }}
                  >
                    {item.product.description}
                  </p>
                  <p
                    className="mb-0"
                    style={{ color: "var(--primary-color)", fontWeight: "600" }}
                  >
                    ₹{item.product.price}
                  </p>
                </Col>
                <Col md={3}>
                  <div className="d-flex align-items-center justify-content-center">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() =>
                        handleQuantityChange(
                          item.product._id,
                          item.quantity - 1,
                        )
                      }
                      disabled={item.quantity <= 1}
                      style={{
                        borderRadius: "8px",
                        width: "35px",
                        height: "35px",
                      }}
                    >
                      <Minus size={14} />
                    </Button>
                    <span
                      className="mx-3"
                      style={{
                        minWidth: "30px",
                        textAlign: "center",
                        fontSize: "1.1rem",
                        fontWeight: "600",
                      }}
                    >
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() =>
                        handleQuantityChange(
                          item.product._id,
                          item.quantity + 1,
                        )
                      }
                      disabled={
                        item.product.trackInventory !== false &&
                        item.quantity >= item.product.stock
                      }
                      title={
                        item.product.trackInventory !== false &&
                        item.quantity >= item.product.stock
                          ? `Only ${item.product.stock} available`
                          : "Add one"
                      }
                      style={{
                        borderRadius: "8px",
                        width: "35px",
                        height: "35px",
                      }}
                    >
                      <Plus size={14} />
                    </Button>
                  </div>
                  {/* Stock Warning */}
                  {item.product.trackInventory !== false &&
                    item.product.stock <=
                      (item.product.lowStockThreshold || 5) &&
                    item.product.stock > 0 && (
                      <div className="text-center mt-1">
                        <small style={{ color: "#f59e0b", fontSize: "0.7rem" }}>
                          Only {item.product.stock} left
                        </small>
                      </div>
                    )}
                </Col>
                <Col md={2}>
                  <div className="text-end">
                    <p
                      className="mb-1"
                      style={{
                        color: "var(--text-primary)",
                        fontSize: "1.1rem",
                        fontWeight: "600",
                      }}
                    >
                      ₹{item.totalPrice}
                    </p>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleRemoveItem(item.product._id)}
                      style={{ borderRadius: "8px", padding: "0.25rem 0.5rem" }}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </Col>
              </Row>

              <div className="d-flex d-md-none">
                <div className="me-3">
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      background: `linear-gradient(135deg, ${
                        item.product.name.charAt(0) === "K"
                          ? "#3b82f6"
                          : "#10b981"
                      }, ${
                        item.product.name.charAt(0) === "K"
                          ? "#1d4ed8"
                          : "#059669"
                      })`,
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "1.2rem",
                      fontWeight: "700",
                      boxShadow: "var(--shadow-md)",
                    }}
                  >
                    {item.product.name.charAt(0)}
                  </div>
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h6
                        className="mb-1"
                        style={{
                          color: "var(--text-primary)",
                          fontWeight: "600",
                          fontSize: "1rem",
                        }}
                      >
                        {item.product.name}
                      </h6>
                      <p
                        className="mb-1"
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: "0.8rem",
                        }}
                      >
                        {item.product.description}
                      </p>
                      <p
                        className="mb-0"
                        style={{
                          color: "var(--primary-color)",
                          fontWeight: "600",
                          fontSize: "0.9rem",
                        }}
                      >
                        ₹{item.product.price}
                      </p>
                    </div>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleRemoveItem(item.product._id)}
                      style={{ borderRadius: "8px", padding: "0.25rem 0.5rem" }}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() =>
                          handleQuantityChange(
                            item.product._id,
                            item.quantity - 1,
                          )
                        }
                        disabled={item.quantity <= 1}
                        style={{
                          borderRadius: "6px",
                          width: "30px",
                          height: "30px",
                          padding: "0",
                        }}
                      >
                        <Minus size={12} />
                      </Button>
                      <span
                        className="mx-2"
                        style={{
                          minWidth: "25px",
                          textAlign: "center",
                          fontSize: "1rem",
                          fontWeight: "600",
                        }}
                      >
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() =>
                          handleQuantityChange(
                            item.product._id,
                            item.quantity + 1,
                          )
                        }
                        disabled={
                          item.product.trackInventory !== false &&
                          item.quantity >= item.product.stock
                        }
                        style={{
                          borderRadius: "6px",
                          width: "30px",
                          height: "30px",
                          padding: "0",
                        }}
                      >
                        <Plus size={12} />
                      </Button>
                      {/* Stock Warning for Mobile */}
                      {item.product.trackInventory !== false &&
                        item.product.stock <=
                          (item.product.lowStockThreshold || 5) &&
                        item.product.stock > 0 && (
                          <small
                            style={{
                              color: "#f59e0b",
                              fontSize: "0.65rem",
                              marginLeft: "8px",
                            }}
                          >
                            Only {item.product.stock} left
                          </small>
                        )}
                    </div>
                    <p
                      className="mb-0"
                      style={{
                        color: "var(--text-primary)",
                        fontSize: "1.1rem",
                        fontWeight: "700",
                      }}
                    >
                      ₹{item.totalPrice}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Card.Body>
      </Card>
    </Col>
    <Col lg={4}>
      <Card
        style={{
          border: "none",
          borderRadius: "16px",
          boxShadow: "var(--shadow-lg)",
          position: "sticky",
          top: "2rem",
        }}
      >
        <Card.Header
          style={{
            background:
              "linear-gradient(135deg, var(--secondary-color), #34d399)",
            color: "white",
            border: "none",
            borderRadius: "16px 16px 0 0",
            padding: "clamp(0.75rem, 3vw, 1.5rem)",
          }}
        >
          <div className="d-flex align-items-center">
            <Package className="me-2" />
            <h5
              className="mb-0 fw-bold"
              style={{ fontSize: "clamp(0.95rem, 3vw, 1.15rem)" }}
            >
              Order Summary
            </h5>
          </div>
          <p
            className="mb-0 mt-1"
            style={{ fontSize: "clamp(0.8rem, 2vw, 0.875rem)", opacity: "0.9" }}
          >
            Review your items before checkout
          </p>
        </Card.Header>
        <Card.Body style={{ padding: "clamp(0.75rem, 3vw, 1.5rem)" }}>
          <div className="mb-3">
            <div className="d-flex justify-content-between mb-2">
              <span style={{ color: "var(--text-secondary)" }}>Subtotal:</span>
              <span style={{ fontWeight: "600" }}>₹{subtotal.toFixed(2)}</span>
            </div>
            <hr style={{ border: "1px solid var(--border-color)" }} />
            <div className="d-flex justify-content-between">
              <span
                style={{
                  fontSize: "1.1rem",
                  fontWeight: "700",
                  color: "var(--text-primary)",
                }}
              >
                Total:
              </span>
              <span
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "700",
                  color: "var(--secondary-color)",
                }}
              >
                ₹{total.toFixed(2)}
              </span>
            </div>
          </div>

          {error && (
            <Alert
              variant="danger"
              className="mb-3"
              style={{ borderRadius: "12px", fontSize: "0.875rem" }}
            >
              {error}
            </Alert>
          )}

          <div className="d-grid gap-2">
            <Button
              variant="primary"
              size="lg"
              onClick={proceedToCheckout}
              disabled={cartItems.length === 0}
              style={{
                borderRadius: "12px",
                fontWeight: "600",
                padding: "12px",
                background:
                  "linear-gradient(45deg, var(--secondary-color), #34d399)",
                border: "none",
                boxShadow: "var(--shadow-md)",
              }}
            >
              Proceed to Checkout
            </Button>
            <Button
              variant="outline-secondary"
              onClick={() => navigate("/")}
              style={{ borderRadius: "12px", fontWeight: "500" }}
            >
              Continue Shopping
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Col>
  </Row>
);
