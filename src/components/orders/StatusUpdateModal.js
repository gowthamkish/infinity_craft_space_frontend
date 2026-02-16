import React from "react";
import { Modal, Card, Row, Col, Form, Button, Spinner } from "../ui";
import {
  FiShoppingBag,
  FiUser,
  FiCalendar,
  FiDollarSign,
  FiPackage,
  FiEdit,
  FiX,
  FiCheck,
} from "react-icons/fi";

const StatusUpdateModal = ({
  show,
  onHide,
  selectedOrder,
  newStatus,
  setNewStatus,
  confirmStatusUpdate,
  updating,
  getStatusBadge,
  formatDate,
  formatCurrency,
}) => {
  return (
    <Modal show={show} onHide={onHide} centered className="status-update-modal">
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
            fontSize: "1.1rem",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.2)",
              borderRadius: 8,
              padding: 6,
              marginRight: 8,
              display: "flex",
            }}
          >
            <FiEdit size={16} />
          </div>
          Update Order Status
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ padding: "1.25rem", background: "#f8fafc" }}>
        <Card
          className="mb-3 border-0 shadow-sm"
          style={{ borderRadius: "10px", overflow: "hidden" }}
        >
          <Card.Body style={{ padding: "1rem", background: "white" }}>
            <div className="text-center mb-2">
              <div
                style={{
                  width: 45,
                  height: 45,
                  background:
                    "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 0.75rem auto",
                  border: "2px solid #4f46e5",
                }}
              >
                <FiShoppingBag size={20} style={{ color: "#4f46e5" }} />
              </div>
              <h6
                style={{
                  margin: "0 0 0.25rem 0",
                  color: "#1e293b",
                  fontWeight: "600",
                }}
              >
                Order #
                {selectedOrder?.orderNumber || selectedOrder?._id?.slice(-6)}
              </h6>
              <p style={{ margin: 0, color: "#64748b", fontSize: "0.85rem" }}>
                Current Status: {getStatusBadge(selectedOrder?.status)}
              </p>
            </div>

            {selectedOrder && (
              <div
                style={{
                  background: "#f1f5f9",
                  borderRadius: 6,
                  padding: "0.75rem",
                  border: "1px solid #e2e8f0",
                }}
              >
                <Row className="g-2 text-center">
                  <Col xs={4}>
                    <div>
                      <FiUser
                        size={16}
                        style={{ color: "#10b981", marginBottom: 4 }}
                      />
                      <div
                        style={{
                          fontSize: "0.7rem",
                          color: "#64748b",
                          fontWeight: 500,
                        }}
                      >
                        Customer
                      </div>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "#1e293b",
                          fontWeight: 600,
                        }}
                      >
                        {selectedOrder.user?.name || "Unknown"}
                      </div>
                    </div>
                  </Col>
                  <Col xs={4}>
                    <div>
                      <FiCalendar
                        size={16}
                        style={{ color: "#f59e0b", marginBottom: 4 }}
                      />
                      <div
                        style={{
                          fontSize: "0.7rem",
                          color: "#64748b",
                          fontWeight: 500,
                        }}
                      >
                        Date
                      </div>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "#1e293b",
                          fontWeight: 600,
                        }}
                      >
                        {
                          formatDate(
                            selectedOrder.createdAt || selectedOrder.orderDate,
                          ).split(",")[0]
                        }
                      </div>
                    </div>
                  </Col>
                  <Col xs={4}>
                    <div>
                      <FiDollarSign
                        size={16}
                        style={{ color: "#059669", marginBottom: 4 }}
                      />
                      <div
                        style={{
                          fontSize: "0.7rem",
                          color: "#64748b",
                          fontWeight: 500,
                        }}
                      >
                        Amount
                      </div>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "#059669",
                          fontWeight: 700,
                        }}
                      >
                        {formatCurrency(
                          selectedOrder.totalAmount || selectedOrder.total,
                        )}
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
            )}
          </Card.Body>
        </Card>

        <Card
          className="border-0 shadow-sm"
          style={{ borderRadius: 10, overflow: "hidden" }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
              color: "white",
              padding: "0.75rem 1rem",
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
              <FiEdit size={14} className="me-2" /> Select New Status
            </h6>
          </div>
          <Card.Body style={{ padding: "1rem", background: "white" }}>
            <Form.Group>
              <Form.Label
                style={{
                  fontWeight: 500,
                  color: "#374151",
                  marginBottom: 8,
                  fontSize: "0.9rem",
                }}
              >
                Choose the new status for this order:
              </Form.Label>
              <div className="position-relative">
                <FiPackage
                  className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
                  size={14}
                />
                <Form.Select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  style={{
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    fontSize: "0.9rem",
                    padding: "10px 10px 10px 2.2rem",
                    fontWeight: 500,
                    color: "#374151",
                  }}
                >
                  <option value="pending">
                    📋 Pending - Order received, awaiting confirmation
                  </option>
                  <option value="confirmed">
                    ✅ Confirmed - Order confirmed and being prepared
                  </option>
                  <option value="processing">
                    📦 Processing - Order is being processed
                  </option>
                  <option value="shipped">
                    🚚 Shipped - Order has been shipped
                  </option>
                  <option value="delivered">
                    🎉 Delivered - Order successfully delivered
                  </option>
                  <option value="cancelled">
                    ❌ Cancelled - Order has been cancelled
                  </option>
                </Form.Select>
              </div>
            </Form.Group>

            {newStatus && (
              <div
                style={{
                  marginTop: 12,
                  padding: 12,
                  background:
                    "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
                  borderRadius: 6,
                  border: "1px solid #bbf7d0",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.85rem",
                      color: "#166534",
                      fontWeight: 500,
                    }}
                  >
                    Preview of new status:
                  </span>
                  {getStatusBadge(newStatus)}
                </div>
              </div>
            )}
          </Card.Body>
        </Card>
      </Modal.Body>
      <Modal.Footer
        style={{
          background: "#f8fafc",
          border: "none",
          borderRadius: "0 0 12px 12px",
          padding: "1rem 1.5rem",
          gap: "0.5rem",
        }}
      >
        <Button
          variant="outline-secondary"
          onClick={onHide}
          style={{
            borderRadius: 8,
            padding: "0.6rem 1.2rem",
            fontWeight: 500,
            border: "1px solid #e2e8f0",
            color: "#64748b",
            flex: 1,
            fontSize: "0.9rem",
          }}
        >
          <FiX className="me-1" size={14} /> Cancel
        </Button>
        <Button
          variant="primary"
          onClick={confirmStatusUpdate}
          disabled={
            updating || !newStatus || newStatus === selectedOrder?.status
          }
          style={{
            borderRadius: 8,
            padding: "0.6rem 1.2rem",
            fontWeight: 500,
            background:
              updating || !newStatus || newStatus === selectedOrder?.status
                ? "#9ca3af"
                : "linear-gradient(135deg, #059669 0%, #047857 100%)",
            border: "none",
            flex: 2,
            fontSize: "0.9rem",
          }}
        >
          {updating ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-1"
              />
              Updating...
            </>
          ) : (
            <>
              <FiCheck className="me-1" size={14} />
              {newStatus === selectedOrder?.status
                ? "No Changes"
                : "Update Status"}
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default StatusUpdateModal;
