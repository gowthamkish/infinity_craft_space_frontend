import React from "react";
import { Modal, Card, Row, Col } from "react-bootstrap";
import {
  FiShoppingBag,
  FiUser,
  FiMapPin,
  FiPackage,
  FiCreditCard,
} from "react-icons/fi";

const OrderDetailsModal = ({
  show,
  onHide,
  selectedOrder,
  getStatusBadge,
  formatDate,
  formatCurrency,
}) => {
  return (
    <Modal
      show={show}
      onHide={onHide}
      size="xl"
      centered
      className="order-details-modal"
    >
      <Modal.Header
        closeButton
        style={{
          background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
          color: "white",
          border: "none",
          borderRadius: "12px 12px 0 0",
          padding: "1rem 1.5rem",
        }}
      >
        <Modal.Title
          style={{
            fontSize: "1.25rem",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.2)",
              borderRadius: 8,
              padding: 8,
              marginRight: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FiShoppingBag size={20} />
          </div>
          Order #{selectedOrder?.orderNumber || selectedOrder?._id?.slice(-6)}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ padding: 0, background: "#f8fafc" }}>
        {selectedOrder && (
          <div>
            <div
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)",
                padding: "1.25rem",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "0.75rem",
              }}
            >
              <div>
                <h6
                  style={{
                    margin: "0 0 0.35rem 0",
                    color: "#1e293b",
                    fontWeight: "600",
                    fontSize: "1rem",
                  }}
                >
                  Order Status
                </h6>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  {getStatusBadge(selectedOrder.status)}
                  <span style={{ color: "#64748b", fontSize: "0.85rem" }}>
                    Placed on{" "}
                    {formatDate(
                      selectedOrder.createdAt || selectedOrder.orderDate,
                    )}
                  </span>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "#64748b",
                    marginBottom: "0.2rem",
                  }}
                >
                  Total Amount
                </div>
                <div
                  style={{
                    fontSize: "1.6rem",
                    fontWeight: "700",
                    color: "#059669",
                    textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                  }}
                >
                  {formatCurrency(
                    selectedOrder.totalAmount || selectedOrder.total,
                  )}
                </div>
              </div>
            </div>

            <div style={{ padding: "1.25rem" }}>
              <Row className="g-3">
                <Col lg={6}>
                  <Card
                    className="h-100 border-0 shadow-sm"
                    style={{ borderRadius: "12px", overflow: "hidden" }}
                  >
                    <div
                      style={{
                        background:
                          "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                        color: "white",
                        padding: "0.875rem 1rem",
                      }}
                    >
                      <h6
                        style={{
                          margin: 0,
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          fontSize: "0.9rem",
                        }}
                      >
                        <FiUser size={16} className="me-2" />
                        Customer Information
                      </h6>
                    </div>
                    <Card.Body style={{ padding: "1rem" }}>
                      <div className="mb-2">
                        <label
                          style={{
                            fontSize: "0.8rem",
                            color: "#64748b",
                            fontWeight: 500,
                          }}
                        >
                          Full Name
                        </label>
                        <p
                          style={{
                            margin: "0.15rem 0 0 0",
                            fontSize: "0.9rem",
                            fontWeight: 600,
                            color: "#1e293b",
                          }}
                        >
                          {typeof selectedOrder.userId === "object"
                            ? selectedOrder.userId?.username ||
                              selectedOrder.customerName ||
                              "Unknown Customer"
                            : selectedOrder.customerName || "Unknown Customer"}
                        </p>
                      </div>
                      <div className="mb-2">
                        <label
                          style={{
                            fontSize: "0.8rem",
                            color: "#64748b",
                            fontWeight: 500,
                          }}
                        >
                          Email Address
                        </label>
                        <p
                          style={{
                            margin: "0.15rem 0 0 0",
                            fontSize: "0.85rem",
                            color: "#475569",
                          }}
                        >
                          {typeof selectedOrder.userId === "object"
                            ? selectedOrder.userId?.email ||
                              selectedOrder.customerEmail ||
                              "N/A"
                            : selectedOrder.customerEmail || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label
                          style={{
                            fontSize: "0.8rem",
                            color: "#64748b",
                            fontWeight: 500,
                          }}
                        >
                          Phone Number
                        </label>
                        <p
                          style={{
                            margin: "0.15rem 0 0 0",
                            fontSize: "0.85rem",
                            color: "#475569",
                          }}
                        >
                          {selectedOrder.shippingAddress?.phone ||
                            selectedOrder.phone ||
                            "N/A"}
                        </p>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col lg={6}>
                  <Card
                    className="h-100 border-0 shadow-sm"
                    style={{ borderRadius: "12px", overflow: "hidden" }}
                  >
                    <div
                      style={{
                        background:
                          "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                        color: "white",
                        padding: "0.875rem 1rem",
                      }}
                    >
                      <h6
                        style={{
                          margin: 0,
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          fontSize: "0.9rem",
                        }}
                      >
                        <FiMapPin size={16} className="me-2" />
                        Shipping Address
                      </h6>
                    </div>
                    <Card.Body style={{ padding: "1rem" }}>
                      {selectedOrder.shippingAddress ? (
                        <div
                          style={{
                            background: "#f8fafc",
                            borderRadius: 8,
                            padding: "0.875rem",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <p
                            style={{
                              margin: 0,
                              lineHeight: "1.5",
                              color: "#475569",
                              fontSize: "0.85rem",
                            }}
                          >
                            {selectedOrder.shippingAddress?.street}
                            <br />
                            {selectedOrder.shippingAddress?.city},{" "}
                            {selectedOrder.shippingAddress?.state}
                            <br />
                            <strong>
                              {selectedOrder.shippingAddress?.zipCode}
                            </strong>
                          </p>
                        </div>
                      ) : (
                        <div className="text-center py-2">
                          <FiMapPin
                            size={36}
                            style={{ color: "#cbd5e1", margin: "0 0 0.5rem 0" }}
                          />
                          <p
                            style={{
                              color: "#64748b",
                              margin: 0,
                              fontSize: "0.85rem",
                            }}
                          >
                            No shipping address provided
                          </p>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Card
                className="mt-3 border-0 shadow-sm"
                style={{ borderRadius: "12px", overflow: "hidden" }}
              >
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                    color: "white",
                    padding: "0.875rem 1rem",
                  }}
                >
                  <h6
                    style={{
                      margin: 0,
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      fontSize: "0.9rem",
                    }}
                  >
                    <FiPackage size={16} className="me-2" />
                    Order Items ({selectedOrder.items?.length || 0} items)
                  </h6>
                </div>
                <div style={{ padding: 0 }}>
                  {selectedOrder.items?.length > 0 ? (
                    <div>
                      {selectedOrder.items.map((item, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: "1rem",
                            borderBottom:
                              idx < selectedOrder.items.length - 1
                                ? "1px solid #f1f5f9"
                                : "none",
                            background: idx % 2 === 0 ? "white" : "#fafbfc",
                          }}
                        >
                          <div className="d-flex justify-content-between align-items-start">
                            <div style={{ flex: 1 }}>
                              <h6
                                style={{
                                  margin: "0 0 0.35rem 0",
                                  color: "#1e293b",
                                  fontWeight: 600,
                                  fontSize: "0.95rem",
                                }}
                              >
                                {item.product?.name ||
                                  item.productName ||
                                  item.name ||
                                  "Unknown Product"}
                              </h6>
                              <div
                                style={{
                                  display: "flex",
                                  gap: "1rem",
                                  alignItems: "center",
                                }}
                              >
                                <div>
                                  <span
                                    style={{
                                      fontSize: "0.8rem",
                                      color: "#64748b",
                                      fontWeight: 500,
                                    }}
                                  >
                                    Quantity:
                                  </span>
                                  <span
                                    style={{
                                      marginLeft: 6,
                                      fontSize: "0.85rem",
                                      color: "#475569",
                                      fontWeight: 600,
                                    }}
                                  >
                                    {item.quantity}
                                  </span>
                                </div>
                                <div>
                                  <span
                                    style={{
                                      fontSize: "0.8rem",
                                      color: "#64748b",
                                      fontWeight: 500,
                                    }}
                                  >
                                    Unit Price:
                                  </span>
                                  <span
                                    style={{
                                      marginLeft: 6,
                                      fontSize: "0.85rem",
                                      color: "#475569",
                                      fontWeight: 600,
                                    }}
                                  >
                                    {formatCurrency(
                                      item.product?.price || item.price || 0,
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <div
                                style={{
                                  fontSize: "1.1rem",
                                  fontWeight: 700,
                                  color: "#059669",
                                }}
                              >
                                {formatCurrency(
                                  (item.product?.price || item.price || 0) *
                                    item.quantity,
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center">
                      <FiPackage
                        size={48}
                        style={{ color: "#cbd5e1", margin: "0 0 0.75rem 0" }}
                      />
                      <p
                        style={{
                          color: "#64748b",
                          margin: 0,
                          fontSize: "0.9rem",
                        }}
                      >
                        No items found in this order
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              <Card
                className="mt-3 border-0 shadow-sm"
                style={{
                  borderRadius: "12px",
                  overflow: "hidden",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, #059669 0%, #047857 100%)",
                    color: "white",
                    padding: "0.875rem 1rem",
                  }}
                >
                  <h6
                    style={{
                      margin: 0,
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      fontSize: "0.9rem",
                    }}
                  >
                    <FiCreditCard size={16} className="me-2" />
                    Payment Summary
                  </h6>
                </div>
                <div style={{ padding: "1rem", background: "white" }}>
                  <div style={{ marginBottom: "0.75rem" }}>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span style={{ color: "#64748b", fontSize: "0.85rem" }}>
                        Subtotal:
                      </span>
                      <span
                        style={{
                          color: "#475569",
                          fontWeight: 600,
                          fontSize: "0.9rem",
                        }}
                      >
                        {formatCurrency(
                          (selectedOrder.totalAmount || selectedOrder.total) -
                            (selectedOrder.shippingCost || 0),
                        )}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span style={{ color: "#64748b", fontSize: "0.85rem" }}>
                        Shipping:
                      </span>
                      <span
                        style={{
                          color: "#475569",
                          fontWeight: 600,
                          fontSize: "0.9rem",
                        }}
                      >
                        {formatCurrency(selectedOrder.shippingCost || 0)}
                      </span>
                    </div>
                    {selectedOrder.tax && (
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span style={{ color: "#64748b", fontSize: "0.85rem" }}>
                          Tax:
                        </span>
                        <span
                          style={{
                            color: "#475569",
                            fontWeight: 600,
                            fontSize: "0.9rem",
                          }}
                        >
                          {formatCurrency(selectedOrder.tax)}
                        </span>
                      </div>
                    )}
                  </div>
                  <hr
                    style={{ margin: "0.75rem 0", border: "1px solid #e2e8f0" }}
                  />
                  <div
                    className="d-flex justify-content-between align-items-center"
                    style={{
                      background:
                        "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
                      padding: "0.75rem",
                      borderRadius: 8,
                      border: "1px solid #bbf7d0",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "1rem",
                        fontWeight: 700,
                        color: "#166534",
                      }}
                    >
                      Total Amount:
                    </span>
                    <span
                      style={{
                        fontSize: "1.3rem",
                        fontWeight: 800,
                        color: "#059669",
                        textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                      }}
                    >
                      {formatCurrency(
                        selectedOrder.totalAmount || selectedOrder.total,
                      )}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer
        style={{
          background: "#f8fafc",
          border: "none",
          borderRadius: "0 0 12px 12px",
          padding: "1rem 1.5rem",
        }}
      >
        <div className="d-flex w-100" style={{ gap: 8 }}>
          <button
            className="btn btn-outline-secondary flex-fill"
            onClick={onHide}
            style={{
              borderRadius: 8,
              padding: "0.6rem 1.5rem",
              fontWeight: 500,
              border: "1px solid #e2e8f0",
              fontSize: "0.9rem",
            }}
          >
            Close
          </button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default OrderDetailsModal;
