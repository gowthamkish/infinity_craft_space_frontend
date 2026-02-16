import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";
import { Check } from "react-feather";

export const ConfirmationStep = ({
  orderData,
  paymentData,
  shippingAddress,
  total,
  navigate,
}) => (
  <Row className="justify-content-center">
    <Col md={10} lg={8}>
      <Card
        className="text-center"
        style={{
          border: "none",
          borderRadius: "24px",
          boxShadow: "var(--shadow-xl)",
          background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <Card.Body style={{ padding: "3rem 2rem" }}>
          <div
            style={{
              width: "100px",
              height: "100px",
              background: "var(--secondary-color)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 2rem",
              animation: "bounce 1s ease-in-out infinite alternate",
            }}
          >
            <Check size={50} color="white" />
          </div>

          <h1
            className="mb-3"
            style={{
              color: "var(--secondary-dark)",
              fontWeight: "700",
              fontSize: "2.5rem",
            }}
          >
            Order Confirmed! 🎉
          </h1>

          <p
            className="mb-4"
            style={{
              color: "var(--text-primary)",
              fontSize: "1.1rem",
              lineHeight: "1.6",
            }}
          >
            Thank you for your order! We've received your payment and will start
            processing your order right away.
          </p>

          {orderData && (
            <Card
              className="mb-4"
              style={{
                border: "none",
                borderRadius: "16px",
                background: "rgba(255, 255, 255, 0.7)",
                backdropFilter: "blur(10px)",
              }}
            >
              <Card.Body style={{ padding: "1.5rem" }}>
                <div className="row text-start">
                  <div className="col-md-4">
                    <h6
                      style={{
                        color: "var(--text-primary)",
                        fontWeight: "600",
                      }}
                    >
                      Order Details
                    </h6>
                    <p className="mb-1">
                      <strong>Order ID:</strong>{" "}
                      {orderData.orderId || orderData.id || orderData._id}
                    </p>
                    <p className="mb-1">
                      <strong>Total Amount:</strong> ₹
                      {(orderData.total ?? total).toFixed(2)}
                    </p>
                    <p className="mb-0">
                      <strong>Items:</strong> {orderData.items?.length || 0}{" "}
                      {orderData.items?.length === 1 ? "item" : "items"}
                    </p>

                    {orderData.items && orderData.items.length > 0 && (
                      <div style={{ marginTop: "0.75rem" }}>
                        {orderData.items.map((it, idx) => (
                          <div
                            key={idx}
                            style={{
                              fontSize: "0.9rem",
                              color: "var(--text-secondary)",
                              marginBottom: "0.4rem",
                            }}
                          >
                            {it.productName || it.name || it.product} ×{" "}
                            {it.quantity} — ₹
                            {(
                              it.totalPrice ?? it.unitPrice * it.quantity
                            ).toFixed(2)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="col-md-4">
                    <h6
                      style={{
                        color: "var(--text-primary)",
                        fontWeight: "600",
                      }}
                    >
                      Payment Details
                    </h6>
                    <p className="mb-1">
                      <strong>Payment ID:</strong>{" "}
                      {paymentData?.razorpay_payment_id ||
                        paymentData?.payment_id ||
                        paymentData?.id ||
                        "N/A"}
                    </p>
                    <p className="mb-1">
                      <strong>Status:</strong>
                      <Badge bg="success" className="ms-2">
                        {orderData.paymentDetails?.payment_status ||
                          paymentData?.payment_status ||
                          "Completed"}
                      </Badge>
                    </p>
                    <p className="mb-0">
                      <strong>Method:</strong>{" "}
                      {orderData.paymentDetails?.method ||
                        orderData.paymentDetails?.payment_method ||
                        paymentData?.method ||
                        "Online Payment"}
                    </p>
                  </div>
                  <div className="col-md-4">
                    <h6
                      style={{
                        color: "var(--text-primary)",
                        fontWeight: "600",
                      }}
                    >
                      Shipping Address
                    </h6>
                    <p className="mb-0" style={{ fontSize: "0.9rem" }}>
                      {shippingAddress.street ||
                        orderData.shippingAddress?.street}
                      <br />
                      {shippingAddress.city ||
                        orderData.shippingAddress?.city},{" "}
                      {shippingAddress.state ||
                        orderData.shippingAddress?.state}{" "}
                      {shippingAddress.zipCode ||
                        orderData.shippingAddress?.zipCode}
                      <br />
                      {shippingAddress.country ||
                        orderData.shippingAddress?.country}
                    </p>
                  </div>
                </div>
              </Card.Body>
            </Card>
          )}

          <div className="d-flex gap-3 justify-content-center">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate("/orders")}
              style={{
                borderRadius: "12px",
                fontWeight: "600",
                padding: "12px 24px",
                background:
                  "linear-gradient(45deg, var(--secondary-color), #34d399)",
                border: "none",
                boxShadow: "var(--shadow-md)",
              }}
            >
              View Order History
            </Button>
            <Button
              variant="outline-primary"
              size="lg"
              onClick={() => navigate("/")}
              style={{
                borderRadius: "12px",
                fontWeight: "500",
                padding: "12px 24px",
                borderColor: "var(--secondary-color)",
                color: "var(--secondary-color)",
              }}
            >
              Continue Shopping
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Col>
  </Row>
);
