import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import Header from "../header";
import { Container, Spinner, Card, Badge } from "../ui";
import {
  FiArrowLeft,
  FiShoppingBag,
  FiCheck,
  FiX,
  FiClock,
  FiPackage,
  FiTruck,
} from "react-icons/fi";
import { useOrders } from "../../hooks/useSmartFetch";
import { updateOrderStatus } from "../../features/adminSlice";
import FiltersBar from "./FiltersBar";
import OrdersTable from "./OrdersTable";
import OrdersCardList from "./OrdersCardList";
import StatusUpdateModal from "./StatusUpdateModal";
import OrderDetailsModal from "./OrderDetailsModal";
import "./orders.css";

const Orders = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { data: orders, loading, error } = useOrders();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [updating, setUpdating] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  // Auto-open order details when navigation provides an `openOrderId` in location.state
  useEffect(() => {
    try {
      const openOrderId = location?.state?.openOrderId;
      if (openOrderId && orders?.orders?.length) {
        const ord = orders.orders.find(
          (o) =>
            (o._id && o._id.toString() === openOrderId.toString()) ||
            o.id === openOrderId,
        );
        if (ord) {
          setSelectedOrder(ord);
          setShowOrderDetails(true);
          // Clear the history state so reloading or back navigation doesn't reopen it
          try {
            window.history.replaceState({}, document.title, "/admin/orders");
          } catch (e) {
            /* ignore */
          }
        }
      }
    } catch (e) {
      // ignore
    }
  }, [location, orders]);

  // Filter orders based on search and status
  const filteredOrders = orders.orders;

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "#f59e0b";
      case "confirmed":
        return "#3b82f6";
      case "processing":
        return "#8b5cf6";
      case "shipped":
        return "#10b981";
      case "delivered":
        return "#059669";
      case "cancelled":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return <FiClock size={14} />;
      case "confirmed":
        return <FiCheck size={14} />;
      case "processing":
        return <FiPackage size={14} />;
      case "shipped":
        return <FiTruck size={14} />;
      case "delivered":
        return <FiCheck size={14} />;
      case "cancelled":
        return <FiX size={14} />;
      default:
        return <FiClock size={14} />;
    }
  };

  const getStatusBadge = (status) => {
    const color = getStatusColor(status);
    return (
      <Badge
        className="d-flex align-items-center"
        style={{
          backgroundColor: color,
          color: "white",
          borderRadius: "8px",
          fontSize: "0.75rem",
          padding: "0.4rem 0.6rem",
          gap: "0.25rem",
          border: "none",
          backgroundImage: "none", // Override Bootstrap's gradient
        }}
        bg="" // Remove Bootstrap's default background variant
      >
        {getStatusIcon(status)}
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </Badge>
    );
  };

  const handleStatusUpdate = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setShowStatusModal(true);
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const confirmStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return;

    setUpdating(true);
    try {
      await dispatch(
        updateOrderStatus({
          orderId: selectedOrder._id,
          status: newStatus,
        }),
      ).unwrap();
      setShowStatusModal(false);
      setSelectedOrder(null);
      setNewStatus("");
    } catch (error) {
      console.error("Failed to update order status:", error);
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  return (
    <>
      <Header />

      <Container
        fluid
        className=""
        style={{
          background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
          minHeight: "100vh",
          paddingTop: "110px",
        }}
      >
        {/* Header Section */}
        <div className="mb-4">
          <Breadcrumb className="mb-3">
            <Breadcrumb.Item
              onClick={() => navigate("/admin/dashboard")}
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                color: "#495057",
              }}
            >
              <FiArrowLeft style={{ marginRight: 4 }} />
              Dashboard
            </Breadcrumb.Item>
            <Breadcrumb.Item active style={{ color: "#343a40" }}>
              Orders
            </Breadcrumb.Item>
          </Breadcrumb>

          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
            <div className="mb-3 mb-md-0">
              <h1
                className="text-dark mb-2"
                style={{
                  fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
                  fontWeight: "700",
                }}
              >
                <FiShoppingBag className="me-3" style={{ color: "#4f46e5" }} />
                Order Management
              </h1>
              <p
                className="text-muted mb-0"
                style={{ fontSize: "clamp(0.9rem, 2vw, 1.1rem)" }}
              >
                Track and manage customer orders
              </p>
            </div>
            <Badge
              bg="primary"
              className="d-flex align-items-center"
              style={{
                fontSize: "1rem",
                padding: "0.75rem 1.25rem",
                borderRadius: "12px",
                gap: "0.5rem",
              }}
            >
              <FiShoppingBag size={16} />
              {filteredOrders?.length}{" "}
              {filteredOrders?.length === 1 ? "Order" : "Orders"}
            </Badge>
          </div>
        </div>

        {/* Filters Section */}
        <FiltersBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />

        {/* Orders Content */}
        {loading ? (
          <Card className="border-0 shadow-sm" style={{ borderRadius: "16px" }}>
            <Card.Body>
              <div
                className="d-flex justify-content-center align-items-center"
                style={{ minHeight: "300px" }}
              >
                <div className="text-center">
                  <Spinner
                    animation="border"
                    role="status"
                    style={{ width: "3rem", height: "3rem", color: "#4f46e5" }}
                  />
                  <p className="mt-3 text-muted">Loading orders...</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        ) : error ? (
          <Card className="border-0 shadow-sm" style={{ borderRadius: "16px" }}>
            <Card.Body>
              <div className="text-center py-5">
                <FiX size={64} className="text-danger mb-3" />
                <h4 className="text-danger">Error Loading Orders</h4>
                <p className="text-muted">{error}</p>
              </div>
            </Card.Body>
          </Card>
        ) : (
          <Card className="border-0 shadow-sm" style={{ borderRadius: "16px" }}>
            <Card.Body className="p-0">
              {filteredOrders?.length === 0 ? (
                <div className="text-center py-5">
                  <FiShoppingBag size={64} className="text-muted mb-3" />
                  <h4 className="text-muted">No orders found</h4>
                  <p className="text-muted">
                    {searchTerm || statusFilter !== "all"
                      ? "Try adjusting your search or filters"
                      : "No orders have been placed yet"}
                  </p>
                </div>
              ) : (
                <>
                  <OrdersTable
                    filteredOrders={filteredOrders}
                    handleViewDetails={handleViewDetails}
                    handleStatusUpdate={handleStatusUpdate}
                    formatDate={formatDate}
                    formatCurrency={formatCurrency}
                    getStatusBadge={getStatusBadge}
                  />

                  <OrdersCardList
                    filteredOrders={filteredOrders}
                    handleViewDetails={handleViewDetails}
                    handleStatusUpdate={handleStatusUpdate}
                    formatDate={formatDate}
                    formatCurrency={formatCurrency}
                    getStatusBadge={getStatusBadge}
                  />
                </>
              )}
            </Card.Body>
          </Card>
        )}

        {/* Status Update Modal */}
        <StatusUpdateModal
          show={showStatusModal}
          onHide={() => setShowStatusModal(false)}
          selectedOrder={selectedOrder}
          newStatus={newStatus}
          setNewStatus={setNewStatus}
          confirmStatusUpdate={confirmStatusUpdate}
          updating={updating}
          getStatusBadge={getStatusBadge}
          formatDate={formatDate}
          formatCurrency={formatCurrency}
        />
        <OrderDetailsModal
          show={showOrderDetails}
          onHide={() => setShowOrderDetails(false)}
          selectedOrder={selectedOrder}
          getStatusBadge={getStatusBadge}
          formatDate={formatDate}
          formatCurrency={formatCurrency}
        />
      </Container>
    </>
  );
};

export default Orders;
