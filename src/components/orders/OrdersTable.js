import React from "react";
import { Table, Button } from "react-bootstrap";
import {
  FiShoppingBag,
  FiUser,
  FiCalendar,
  FiDollarSign,
  FiEye,
  FiEdit,
} from "react-icons/fi";

const OrdersTable = ({
  filteredOrders,
  handleViewDetails,
  handleStatusUpdate,
  formatDate,
  formatCurrency,
  getStatusBadge,
}) => {
  return (
    <div className="d-none d-lg-block">
      <Table responsive className="mb-0">
        <thead
          style={{
            background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
          }}
        >
          <tr>
            <th
              style={{
                border: "none",
                padding: "1rem",
                fontWeight: "600",
                color: "#495057",
              }}
            >
              <FiShoppingBag className="me-2" style={{ color: "#4f46e5" }} />
              Order
            </th>
            <th
              style={{
                border: "none",
                padding: "1rem",
                fontWeight: "600",
                color: "#495057",
              }}
            >
              <FiUser className="me-2" style={{ color: "#10b981" }} />
              Customer
            </th>
            <th
              style={{
                border: "none",
                padding: "1rem",
                fontWeight: "600",
                color: "#495057",
              }}
            >
              <FiCalendar className="me-2" style={{ color: "#f59e0b" }} />
              Date
            </th>
            <th
              style={{
                border: "none",
                padding: "1rem",
                fontWeight: "600",
                color: "#495057",
              }}
            >
              <FiDollarSign className="me-2" style={{ color: "#059669" }} />
              Amount
            </th>
            <th
              style={{
                border: "none",
                padding: "1rem",
                fontWeight: "600",
                color: "#495057",
              }}
            >
              Status
            </th>
            <th
              style={{
                border: "none",
                padding: "1rem",
                fontWeight: "600",
                color: "#495057",
                textAlign: "center",
              }}
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders?.length > 0 &&
            filteredOrders?.map((order) => (
              <tr
                key={order._id || order.id}
                style={{ borderBottom: "1px solid #f1f3f4" }}
              >
                <td style={{ border: "none", padding: "1rem" }}>
                  <div>
                    <h6
                      className="mb-1"
                      style={{ fontWeight: "600", color: "#212529" }}
                    >
                      #{order.orderNumber || order._id?.slice(-6)}
                    </h6>
                    <small className="text-muted">
                      {order.items?.length || 0} items
                    </small>
                  </div>
                </td>
                <td style={{ border: "none", padding: "1rem" }}>
                  <div>
                    <h6
                      className="mb-0"
                      style={{ fontWeight: "500", color: "#374151" }}
                    >
                      {order.userId?.username ||
                        order.customerName ||
                        "Unknown"}
                    </h6>
                    <small className="text-muted">
                      {order.user?.email || order.customerEmail}
                    </small>
                  </div>
                </td>
                <td style={{ border: "none", padding: "1rem" }}>
                  <span className="text-muted">
                    {formatDate(order.createdAt || order.orderDate)}
                  </span>
                </td>
                <td style={{ border: "none", padding: "1rem" }}>
                  <span
                    style={{
                      fontWeight: "600",
                      color: "#059669",
                      fontSize: "1.1rem",
                    }}
                  >
                    {formatCurrency(order.totalAmount || order.total)}
                  </span>
                </td>
                <td style={{ border: "none", padding: "1rem" }}>
                  {getStatusBadge(order.status)}
                </td>
                <td
                  style={{
                    border: "none",
                    padding: "1rem",
                    textAlign: "center",
                  }}
                >
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleViewDetails(order)}
                    className="me-2"
                    style={{ borderRadius: "8px", fontWeight: "500" }}
                  >
                    <FiEye className="me-1" /> View
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => handleStatusUpdate(order)}
                    style={{ borderRadius: "8px", fontWeight: "500" }}
                  >
                    <FiEdit className="me-1" /> Update
                  </Button>
                </td>
              </tr>
            ))}
        </tbody>
      </Table>
    </div>
  );
};

export default OrdersTable;
