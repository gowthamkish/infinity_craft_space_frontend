import React from "react";
import { Card, Button } from "react-bootstrap";
import {
  FiShoppingBag,
  FiUser,
  FiCalendar,
  FiDollarSign,
  FiEye,
  FiEdit,
} from "react-icons/fi";

const OrdersCardList = ({
  filteredOrders,
  handleViewDetails,
  handleStatusUpdate,
  formatDate,
  formatCurrency,
  getStatusBadge,
}) => {
  return (
    <div className="d-lg-none">
      <div className="p-3">
        {filteredOrders?.length > 0 &&
          filteredOrders?.map((order) => (
            <Card
              key={order._id || order.id}
              className="mb-3 border-0 shadow-sm"
              style={{ borderRadius: "12px" }}
            >
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h6
                      className="mb-1"
                      style={{ fontWeight: "600", color: "#212529" }}
                    >
                      Order #{order.orderNumber || order._id?.slice(-6)}
                    </h6>
                    <small className="text-muted">
                      {order.items?.length || 0} items
                    </small>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                <div className="mb-3">
                  <div className="d-flex align-items-center mb-2">
                    <FiUser className="me-2" style={{ color: "#10b981" }} />
                    <span className="fw-medium">
                      {order.user?.name || order.customerName || "Unknown"}
                    </span>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <FiCalendar className="me-2" style={{ color: "#f59e0b" }} />
                    <span className="text-muted small">
                      {formatDate(order.createdAt || order.orderDate)}
                    </span>
                  </div>
                  <div className="d-flex align-items-center">
                    <FiDollarSign
                      className="me-2"
                      style={{ color: "#059669" }}
                    />
                    <span style={{ fontWeight: "600", color: "#059669" }}>
                      {formatCurrency(order.totalAmount || order.total)}
                    </span>
                  </div>
                </div>

                <div className="d-grid gap-2 d-md-flex">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleViewDetails(order)}
                    className="flex-fill"
                    style={{ borderRadius: "8px", fontWeight: "500" }}
                  >
                    <FiEye className="me-1" /> View Details
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => handleStatusUpdate(order)}
                    className="flex-fill"
                    style={{ borderRadius: "8px", fontWeight: "500" }}
                  >
                    <FiEdit className="me-1" /> Update Status
                  </Button>
                </div>
              </Card.Body>
            </Card>
          ))}
      </div>
    </div>
  );
};

export default OrdersCardList;
