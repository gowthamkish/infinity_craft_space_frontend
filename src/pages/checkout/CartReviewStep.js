import { useState, useEffect } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import Badge from "react-bootstrap/Badge";
import { Trash2, Plus, Minus, Package } from "react-feather";
import CouponInput from "../../components/CouponInput";
import { isCustomItem } from "../../components/CheckoutDeliveryPanel";
import api from "../../api/axios";

// Cross-sell strip — shows 3 recommendations based on the first cart item
function CrossSellSection({ cartItems, navigate }) {
  const [recs, setRecs] = useState([]);

  useEffect(() => {
    if (!cartItems?.length) return;
    const firstProductId = cartItems[0]?.product?._id;
    if (!firstProductId) return;
    api
      .get(`/api/products/${firstProductId}/recommendations`)
      .then((res) => {
        const products = res.data?.recommendations || res.data?.products || [];
        setRecs(products.slice(0, 3));
      })
      .catch(() => {});
  }, [cartItems]);

  if (!recs.length) return null;

  return (
    <div style={{ marginTop: "2rem" }}>
      <h6 style={{ fontWeight: 700, color: "#374151", marginBottom: "1rem" }}>
        🎁 Complete the set
      </h6>
      <Row className="g-3">
        {recs.map((product) => {
          const img = product.images?.[0]?.url || product.image?.url;
          return (
            <Col xs={12} sm={4} key={product._id}>
              <Card
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  cursor: "pointer",
                }}
                onClick={() =>
                  navigate(`/product/${product.slug || product._id}`)
                }
              >
                {img && (
                  <Card.Img
                    variant="top"
                    src={img}
                    alt={product.name}
                    style={{
                      height: 120,
                      objectFit: "cover",
                      borderRadius: "12px 12px 0 0",
                    }}
                  />
                )}
                <Card.Body style={{ padding: "0.6rem 0.75rem" }}>
                  <p
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      margin: 0,
                      color: "#111827",
                      lineClamp: 2,
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {product.name}
                  </p>
                  <p
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      color: "#7c3aed",
                      margin: "0.25rem 0 0",
                    }}
                  >
                    ₹{product.price}
                  </p>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
}

const FREE_SHIPPING_THRESHOLD = 999;

function FreeShippingBar({ subtotal }) {
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const pct = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const achieved = remaining === 0;

  return (
    <div
      style={{
        background: achieved ? "#ecfdf5" : "#f0fdf4",
        border: `1px solid ${achieved ? "#6ee7b7" : "#d1fae5"}`,
        borderRadius: "12px",
        padding: "0.85rem 1rem",
        marginBottom: "1.25rem",
      }}
    >
      <p
        style={{
          margin: "0 0 0.5rem",
          fontSize: "0.82rem",
          fontWeight: "600",
          color: achieved ? "#065f46" : "#374151",
        }}
      >
        {achieved
          ? "🎉 You've unlocked free shipping!"
          : `Add ₹${remaining.toFixed(0)} more for free shipping`}
      </p>
      <div
        style={{
          background: "#d1fae5",
          borderRadius: "9999px",
          height: "6px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: "linear-gradient(90deg, #10b981, #059669)",
            borderRadius: "9999px",
            transition: "width 0.4s ease",
          }}
        />
      </div>
    </div>
  );
}

export const CartReviewStep = ({
  cartItems,
  subtotal,
  total,
  error,
  proceedToCheckout,
  navigate,
  handleQuantityChange,
  handleRemoveItem,
  onCouponApplied,
  onRemoveCoupon,
  appliedCoupon,
}) => (
  <Row>
    <Col lg={8} xs={12}>
      <Card
        style={{
          border: "none",
          borderRadius: "20px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
          marginBottom: "clamp(1rem, 4vw, 2rem)",
          overflow: "hidden",
        }}
      >
        <Card.Header
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            border: "none",
            borderRadius: "0",
            padding: "clamp(1rem, 3vw, 1.75rem)",
          }}
        >
          <div className="d-flex align-items-center">
            <Package
              className="me-2"
              style={{ color: "white", strokeWidth: 2.5 }}
              size={24}
            />
            <h4
              className="mb-0"
              style={{
                color: "white",
                fontWeight: "700",
                fontSize: "clamp(1.1rem, 4vw, 1.5rem)",
                letterSpacing: "-0.02em",
              }}
            >
              Review Your Cart
            </h4>
            <Badge
              style={{
                marginLeft: "auto",
                fontSize: "clamp(0.75rem, 2vw, 0.85rem)",
                padding:
                  "clamp(0.4rem, 1.5vw, 0.6rem) clamp(0.75rem, 2vw, 1.1rem)",
                borderRadius: "25px",
                background: "rgba(255,255,255,0.25)",
                backdropFilter: "blur(10px)",
                fontWeight: "700",
                border: "1px solid rgba(255,255,255,0.3)",
              }}
            >
              {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
            </Badge>
          </div>
        </Card.Header>
        <Card.Body style={{ padding: "0", background: "#fafafa" }}>
          {cartItems.some(isCustomItem) && (
            <div
              style={{
                margin: "clamp(0.75rem, 2vw, 1rem)",
                padding: "0.75rem 1rem",
                background: "linear-gradient(135deg, #fef3c7, #fde68a)",
                border: "1px solid #fcd34d",
                borderRadius: "12px",
                display: "flex",
                gap: "0.6rem",
                alignItems: "flex-start",
                color: "#92400e",
              }}
              role="note"
            >
              <span style={{ fontSize: "1.1rem" }}>⏳</span>
              <div>
                <strong
                  style={{
                    fontSize: "0.88rem",
                    color: "#78350f",
                    display: "block",
                  }}
                >
                  Handcrafted Items Notice
                </strong>
                <span style={{ fontSize: "0.82rem", lineHeight: 1.5 }}>
                  Your order contains made-to-order items that require{" "}
                  <strong>10–12 business days</strong> of preparation before
                  dispatch. You will be notified when your order ships.
                </span>
              </div>
            </div>
          )}
          {cartItems.map((item, index) => (
            <div
              key={item.product._id}
              style={{
                padding: "clamp(1rem, 3vw, 1.75rem)",
                background: "white",
                margin: "clamp(0.75rem, 2vw, 1rem)",
                borderRadius: "16px",
                border: "1px solid #f0f0f0",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
              className="cart-item-hover"
            >
              <Row className="align-items-center d-none d-md-flex">
                <Col md={2}>
                  <div
                    style={{
                      width: "90px",
                      height: "90px",
                      background: `linear-gradient(135deg, ${
                        item.product.name.charAt(0) === "S"
                          ? "#10b981"
                          : item.product.name.charAt(0) === "K"
                            ? "#3b82f6"
                            : "#f59e0b"
                      }, ${
                        item.product.name.charAt(0) === "S"
                          ? "#059669"
                          : item.product.name.charAt(0) === "K"
                            ? "#1d4ed8"
                            : "#d97706"
                      })`,
                      borderRadius: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "2rem",
                      fontWeight: "800",
                      boxShadow: "0 8px 16px rgba(0,0,0,0.15)",
                      textTransform: "uppercase",
                    }}
                  >
                    {item.product.name.charAt(0)}
                  </div>
                </Col>
                <Col md={4}>
                  <h6
                    className="mb-2"
                    style={{
                      color: "#1f2937",
                      fontWeight: "700",
                      fontSize: "1.1rem",
                      lineHeight: "1.3",
                    }}
                  >
                    {item.product.name}
                  </h6>
                  {isCustomItem(item) && (
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.3rem",
                        background: "#fef3c7",
                        border: "1px solid #fcd34d",
                        color: "#92400e",
                        padding: "0.2rem 0.6rem",
                        borderRadius: "20px",
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        marginBottom: "0.5rem",
                      }}
                    >
                      ⏳ Handcrafted · 10–12 days to dispatch
                    </div>
                  )}
                  <p
                    className="mb-2"
                    style={{
                      color: "#6b7280",
                      fontSize: "0.9rem",
                      lineHeight: "1.5",
                    }}
                  >
                    {item.product.description}
                  </p>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      background: "linear-gradient(135deg, #10b981, #059669)",
                      color: "white",
                      padding: "0.35rem 0.85rem",
                      borderRadius: "20px",
                      fontWeight: "700",
                      fontSize: "0.95rem",
                    }}
                  >
                    ₹{item.product.price}
                  </div>
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
                        borderRadius: "12px",
                        width: "42px",
                        height: "42px",
                        border: "2px solid #e5e7eb",
                        background: "white",
                        transition: "all 0.2s",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Minus size={16} strokeWidth={3} />
                    </Button>
                    <span
                      className="mx-4"
                      style={{
                        minWidth: "35px",
                        textAlign: "center",
                        fontSize: "1.25rem",
                        fontWeight: "700",
                        color: "#1f2937",
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
                        borderRadius: "12px",
                        width: "42px",
                        height: "42px",
                        border: "2px solid #e5e7eb",
                        background: "white",
                        transition: "all 0.2s",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Plus size={16} strokeWidth={3} />
                    </Button>
                  </div>
                  {/* Stock Warning */}
                  {item.product.trackInventory !== false &&
                    item.product.stock <=
                      (item.product.lowStockThreshold || 5) &&
                    item.product.stock > 0 && (
                      <div className="text-center mt-2">
                        <small
                          style={{
                            color: "#f59e0b",
                            fontSize: "0.75rem",
                            fontWeight: "600",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.25rem",
                            background: "#fef3c7",
                            padding: "0.25rem 0.65rem",
                            borderRadius: "12px",
                          }}
                        >
                          ⚠️ Only {item.product.stock} left
                        </small>
                      </div>
                    )}
                </Col>
                <Col md={2}>
                  <div className="text-end">
                    <p
                      className="mb-3"
                      style={{
                        color: "#1f2937",
                        fontSize: "1.35rem",
                        fontWeight: "800",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      ₹{item.totalPrice}
                    </p>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleRemoveItem(item.product._id)}
                      style={{
                        borderRadius: "12px",
                        padding: "0.5rem 0.75rem",
                        border: "2px solid #fee2e2",
                        background: "#fef2f2",
                        color: "#dc2626",
                        fontWeight: "600",
                        transition: "all 0.2s",
                      }}
                    >
                      <Trash2 size={16} />
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
          borderRadius: "20px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
          position: "sticky",
          top: "2rem",
          overflow: "hidden",
        }}
      >
        <Card.Header
          style={{
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            color: "white",
            border: "none",
            borderRadius: "0",
            padding: "clamp(1rem, 3vw, 1.75rem)",
          }}
        >
          <div className="d-flex align-items-center">
            <Package className="me-2" size={24} strokeWidth={2.5} />
            <h5
              className="mb-0"
              style={{
                fontWeight: "800",
                fontSize: "clamp(1rem, 3vw, 1.25rem)",
                letterSpacing: "-0.02em",
              }}
            >
              Order Summary
            </h5>
          </div>
          <p
            className="mb-0 mt-2"
            style={{
              fontSize: "clamp(0.8rem, 2vw, 0.9rem)",
              opacity: "0.95",
              fontWeight: "500",
            }}
          >
            Review your items before checkout
          </p>
        </Card.Header>
        <Card.Body style={{ padding: "clamp(1rem, 3vw, 1.75rem)" }}>
          {/* Free shipping progress bar */}
          <FreeShippingBar subtotal={subtotal} />

          <div className="mb-4">
            <div
              className="d-flex justify-content-between mb-3 pb-3"
              style={{ borderBottom: "2px dashed #e5e7eb" }}
            >
              <span
                style={{
                  color: "#6b7280",
                  fontWeight: "600",
                  fontSize: "1rem",
                }}
              >
                Subtotal:
              </span>
              <span
                style={{
                  fontWeight: "700",
                  fontSize: "1.1rem",
                  color: "#1f2937",
                }}
              >
                ₹{subtotal.toFixed(2)}
              </span>
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <span
                style={{
                  fontSize: "1.2rem",
                  fontWeight: "800",
                  color: "#1f2937",
                  letterSpacing: "-0.02em",
                }}
              >
                Total:
              </span>
              <span
                style={{
                  fontSize: "2rem",
                  fontWeight: "900",
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "-0.03em",
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
              style={{
                borderRadius: "14px",
                fontSize: "0.875rem",
                border: "2px solid #fee2e2",
                background: "#fef2f2",
                color: "#dc2626",
                fontWeight: "600",
              }}
            >
              {error}
            </Alert>
          )}

          {/* Coupon Input Section */}
          <CouponInput
            cartTotal={subtotal}
            onCouponApplied={onCouponApplied}
            appliedCoupon={appliedCoupon}
            onRemoveCoupon={onRemoveCoupon}
          />

          <div className="d-grid gap-3">
            <Button
              variant="primary"
              size="lg"
              onClick={proceedToCheckout}
              disabled={cartItems.length === 0}
              style={{
                borderRadius: "16px",
                fontWeight: "700",
                padding: "16px",
                fontSize: "1.1rem",
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                border: "none",
                boxShadow: "0 8px 20px rgba(16, 185, 129, 0.35)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                letterSpacing: "-0.01em",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 12px 28px rgba(16, 185, 129, 0.45)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 8px 20px rgba(16, 185, 129, 0.35)";
              }}
            >
              Proceed to Checkout
            </Button>
            <Button
              variant="outline-secondary"
              onClick={() => navigate("/products")}
              style={{
                borderRadius: "16px",
                fontWeight: "600",
                padding: "14px",
                border: "2px solid #e5e7eb",
                color: "#6b7280",
                background: "white",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f9fafb";
                e.currentTarget.style.borderColor = "#d1d5db";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "white";
                e.currentTarget.style.borderColor = "#e5e7eb";
              }}
            >
              Continue Shopping
            </Button>
          </div>
        </Card.Body>
      </Card>
      <CrossSellSection cartItems={cartItems} navigate={navigate} />
    </Col>
  </Row>
);
