import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import Badge from "react-bootstrap/Badge";
import { Lock, CreditCard, Check } from "react-feather";

export const PaymentStep = ({
  cartItems,
  shippingAddress,
  subtotal,
  shipping,
  tax,
  total,
  error,
  loading,
  handlePayment,
  setCurrentStep,
}) => (
  <Row className="justify-content-center">
    <Col lg={8} xs={12}>
      <Card
        style={{
          border: "none",
          borderRadius: "16px",
          boxShadow: "var(--shadow-lg)",
          marginBottom: "2rem",
        }}
      >
        <Card.Header
          style={{
            background:
              "linear-gradient(135deg, var(--primary-color), #3b82f6)",
            color: "white",
            border: "none",
            borderRadius: "16px 16px 0 0",
            padding: "clamp(1rem, 4vw, 1.5rem)",
          }}
        >
          <div className="d-flex align-items-center">
            <Lock className="me-2" />
            <div>
              <h4
                className="mb-0 fw-bold"
                style={{ fontSize: "clamp(1.1rem, 4vw, 1.5rem)" }}
              >
                Secure Payment
              </h4>
              <p
                className="mb-0 mt-1"
                style={{
                  fontSize: "clamp(0.75rem, 2.5vw, 0.875rem)",
                  opacity: "0.9",
                }}
              >
                Your payment information is protected with bank-level security
              </p>
            </div>
          </div>
        </Card.Header>
        <Card.Body style={{ padding: "clamp(1rem, 4vw, 2rem)" }}>
          <div className="mb-4">
            <h5
              className="mb-3"
              style={{
                color: "var(--text-primary)",
                fontWeight: "600",
                fontSize: "clamp(1rem, 4vw, 1.25rem)",
              }}
            >
              Choose Payment Method
            </h5>

            <div className="d-grid gap-3">
              <Card
                className="payment-method-card"
                style={{
                  border: "2px solid var(--border-color)",
                  borderRadius: "12px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onClick={handlePayment}
              >
                <Card.Body style={{ padding: "clamp(1rem, 4vw, 1.5rem)" }}>
                  <div className="d-none d-md-flex align-items-center">
                    <div
                      style={{
                        width: "50px",
                        height: "50px",
                        background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: "1rem",
                      }}
                    >
                      <CreditCard size={24} color="white" />
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="mb-1" style={{ fontWeight: "600" }}>
                        Credit/Debit Card, UPI, NetBanking
                      </h6>
                      <p
                        className="mb-0"
                        style={{
                          fontSize: "0.875rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        Powered by Razorpay • Secure & Fast
                      </p>
                    </div>
                    <Badge
                      bg="success"
                      style={{ padding: "0.5rem 1rem", borderRadius: "20px" }}
                    >
                      Recommended
                    </Badge>
                  </div>

                  <div className="d-flex d-md-none flex-column text-center">
                    <div
                      style={{
                        width: "60px",
                        height: "60px",
                        background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 1rem",
                      }}
                    >
                      <CreditCard size={28} color="white" />
                    </div>
                    <div className="mb-2">
                      <h6
                        className="mb-1"
                        style={{ fontWeight: "600", fontSize: "1rem" }}
                      >
                        Credit/Debit Card, UPI, NetBanking
                      </h6>
                      <p
                        className="mb-2"
                        style={{
                          fontSize: "0.85rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        Powered by Razorpay • Secure & Fast
                      </p>
                      <Badge
                        bg="success"
                        style={{
                          padding: "0.4rem 0.8rem",
                          borderRadius: "20px",
                          fontSize: "0.75rem",
                        }}
                      >
                        Recommended
                      </Badge>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              {/* Demo payment removed for testing — only real gateway remains */}
            </div>
          </div>

          <div
            style={{
              background: "var(--bg-tertiary)",
              padding: "clamp(1rem, 4vw, 1.5rem)",
              borderRadius: "12px",
              marginBottom: "1.5rem",
            }}
          >
            <h6
              className="mb-3"
              style={{
                color: "var(--text-primary)",
                fontWeight: "600",
                fontSize: "clamp(0.9rem, 3vw, 1rem)",
              }}
            >
              🔒 Your Payment is Protected
            </h6>
            <Row>
              <Col sm={6} xs={12} className="mb-2">
                <div className="d-flex align-items-center">
                  <Check
                    size={16}
                    className="me-2"
                    style={{ color: "var(--secondary-color)" }}
                  />
                  <span style={{ fontSize: "clamp(0.8rem, 2.5vw, 0.875rem)" }}>
                    256-bit SSL Encryption
                  </span>
                </div>
              </Col>
              <Col sm={6} xs={12} className="mb-2">
                <div className="d-flex align-items-center">
                  <Check
                    size={16}
                    className="me-2"
                    style={{ color: "var(--secondary-color)" }}
                  />
                  <span style={{ fontSize: "clamp(0.8rem, 2.5vw, 0.875rem)" }}>
                    PCI DSS Compliant
                  </span>
                </div>
              </Col>
              <Col sm={6} xs={12} className="mb-2">
                <div className="d-flex align-items-center">
                  <Check
                    size={16}
                    className="me-2"
                    style={{ color: "var(--secondary-color)" }}
                  />
                  <span style={{ fontSize: "clamp(0.8rem, 2.5vw, 0.875rem)" }}>
                    No Card Details Stored
                  </span>
                </div>
              </Col>
              <Col sm={6} xs={12}>
                <div className="d-flex align-items-center">
                  <Check
                    size={16}
                    className="me-2"
                    style={{ color: "var(--secondary-color)" }}
                  />
                  <span style={{ fontSize: "clamp(0.8rem, 2.5vw, 0.875rem)" }}>
                    Bank-Level Security
                  </span>
                </div>
              </Col>
            </Row>
          </div>

          {error && (
            <Alert
              variant="danger"
              className="mb-3"
              style={{ borderRadius: "12px" }}
            >
              {error}
            </Alert>
          )}

          <div className="d-flex gap-3 justify-content-center justify-content-md-start">
            <Button
              variant="outline-secondary"
              onClick={() => setCurrentStep(2)}
              disabled={loading}
              style={{
                borderRadius: "12px",
                fontWeight: "500",
                padding: "clamp(10px, 3vw, 12px) clamp(16px, 4vw, 24px)",
                fontSize: "clamp(0.85rem, 2.5vw, 1rem)",
              }}
            >
              ← Back to Shipping
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Col>
    <Col lg={4} xs={12} className="mt-3 mt-lg-0">
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
            padding: "clamp(1rem, 4vw, 1.5rem)",
          }}
        >
          <div className="d-flex align-items-center">
            <Lock className="me-2" />
            <h5
              className="mb-0 fw-bold"
              style={{ fontSize: "clamp(1rem, 4vw, 1.25rem)" }}
            >
              Payment Summary
            </h5>
          </div>
          <p
            className="mb-0 mt-1"
            style={{
              fontSize: "clamp(0.75rem, 2.5vw, 0.875rem)",
              opacity: "0.9",
            }}
          >
            Final order review
          </p>
        </Card.Header>
        <Card.Body style={{ padding: "clamp(1rem, 4vw, 1.5rem)" }}>
          <div className="mb-3">
            <h6 style={{ fontWeight: "600", marginBottom: "0.75rem" }}>
              Order Items ({cartItems.length})
            </h6>
            {cartItems.slice(0, 2).map((item) => (
              <div
                key={item.product._id}
                className="d-flex align-items-center mb-2"
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    background: `linear-gradient(135deg, ${
                      item.product.name.charAt(0) === "K"
                        ? "#3b82f6"
                        : "#10b981"
                    }, ${
                      item.product.name.charAt(0) === "K"
                        ? "#1d4ed8"
                        : "#059669"
                    })`,
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "0.875rem",
                    fontWeight: "700",
                    marginRight: "12px",
                  }}
                >
                  {item.product.name.charAt(0)}
                </div>
                <div className="flex-grow-1">
                  <h6
                    className="mb-0"
                    style={{ fontSize: "0.8rem", fontWeight: "600" }}
                  >
                    {item.product.name}
                  </h6>
                  <p
                    className="mb-0"
                    style={{
                      fontSize: "0.7rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    Qty: {item.quantity} × ₹{item.product.price}
                  </p>
                </div>
              </div>
            ))}
            {cartItems.length > 2 && (
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "var(--text-secondary)",
                  marginBottom: "0",
                }}
              >
                +{cartItems.length - 2} more items
              </p>
            )}
          </div>

          <div className="mb-3">
            <h6 style={{ fontWeight: "600", marginBottom: "0.75rem" }}>
              Shipping Address
            </h6>
            <p
              style={{
                fontSize: "0.8rem",
                color: "var(--text-secondary)",
                lineHeight: "1.4",
                marginBottom: "0",
              }}
            >
              {shippingAddress.street}
              <br />
              {shippingAddress.city}, {shippingAddress.state}{" "}
              {shippingAddress.zipCode}
            </p>
          </div>

          <hr style={{ border: "1px solid var(--border-color)" }} />

          <div className="mb-3">
            <div className="d-flex justify-content-between mb-2">
              <span style={{ color: "var(--text-secondary)" }}>Subtotal:</span>
              <span style={{ fontWeight: "600" }}>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span style={{ color: "var(--text-secondary)" }}>
                Shipping:{" "}
                {shipping === 0 && (
                  <Badge bg="success" className="ms-1">
                    FREE
                  </Badge>
                )}
              </span>
              <span style={{ fontWeight: "600" }}>₹{shipping.toFixed(2)}</span>
            </div>
            <div className="d-flex justify-content-between mb-3">
              <span style={{ color: "var(--text-secondary)" }}>
                Tax (18% GST):
              </span>
              <span style={{ fontWeight: "600" }}>₹{tax.toFixed(2)}</span>
            </div>
            <hr style={{ border: "2px solid var(--secondary-color)" }} />
            <div className="d-flex justify-content-between">
              <span
                style={{
                  fontSize: "1.2rem",
                  fontWeight: "700",
                  color: "var(--text-primary)",
                }}
              >
                Total to Pay:
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

          {loading && (
            <Alert
              variant="info"
              className="text-center"
              style={{ borderRadius: "12px" }}
            >
              <div className="d-flex align-items-center justify-content-center">
                <div
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                >
                  <span className="visually-hidden">Loading...</span>
                </div>
                Processing Payment...
              </div>
            </Alert>
          )}
        </Card.Body>
      </Card>
    </Col>
  </Row>
);
