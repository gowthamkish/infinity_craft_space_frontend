import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import AdminLayout from "../admin/AdminLayout";
import { OrbitLoader } from "../Loader";
import { FiShoppingBag, FiX } from "react-icons/fi";
import { useOrders } from "../../hooks/useSmartFetch";
import { updateOrderStatus } from "../../features/adminSlice";
import { getStatusBadge } from "../../utils/statusHelpers";
import { formatDateShort, formatCurrency } from "../../utils/formatters";
import FiltersBar from "./FiltersBar";
import OrdersTable from "./OrdersTable";
import OrdersCardList from "./OrdersCardList";
import StatusUpdateModal from "./StatusUpdateModal";
import OrderDetailsModal from "./OrderDetailsModal";
import Pagination from "./Pagination";
import "../admin/admin.css";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

  // Filter and paginate orders
  const filteredOrders = useMemo(() => {
    let filtered = orders.orders || [];

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((order) => {
        const orderNumber = (order.orderNumber || order._id?.slice(-6) || "")
          .toString()
          .toLowerCase();
        const customerName = (
          order.userId?.username ||
          order.customerName ||
          ""
        ).toLowerCase();
        const customerEmail = (
          order.user?.email ||
          order.customerEmail ||
          ""
        ).toLowerCase();

        return (
          orderNumber.includes(searchLower) ||
          customerName.includes(searchLower) ||
          customerEmail.includes(searchLower)
        );
      });
    }

    return filtered;
  }, [orders.orders, statusFilter, searchTerm]);

  // Calculate pagination values
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const validPage = Math.min(currentPage, Math.max(1, totalPages || 1));

  // Reset to page 1 if current page exceeds total pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  // Get paginated orders
  const paginatedOrders = useMemo(() => {
    const startIndex = (validPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredOrders.slice(startIndex, endIndex);
  }, [filteredOrders, validPage, itemsPerPage]);

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

  return (
    <AdminLayout>
      {/* Page header */}
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">
            <FiShoppingBag size={22} style={{ color: "var(--adm-primary)" }} />
            Orders
          </h1>
          <p className="adm-page-sub">
            {filteredOrders?.length ?? 0} order
            {filteredOrders?.length !== 1 ? "s" : ""}
            {(searchTerm || statusFilter !== "all") && " (filtered)"}
          </p>
        </div>
      </div>

      {/* Filters */}
      <FiltersBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      {/* Content */}
      <div className="adm-card" style={{ marginTop: "var(--adm-space-4)" }}>
        {loading ? (
          <div className="adm-loading">
            <OrbitLoader size="lg" />
            <span>Loading orders…</span>
          </div>
        ) : error ? (
          <div className="adm-empty">
            <div className="adm-empty-icon">
              <FiX size={28} />
            </div>
            <p
              className="adm-empty-title"
              style={{ color: "var(--adm-danger)" }}
            >
              Error loading orders
            </p>
            <p className="adm-empty-sub">{error}</p>
          </div>
        ) : filteredOrders?.length === 0 ? (
          <div className="adm-empty">
            <div className="adm-empty-icon">
              <FiShoppingBag size={28} />
            </div>
            <p className="adm-empty-title">No orders found</p>
            <p className="adm-empty-sub">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filters."
                : "No orders have been placed yet."}
            </p>
          </div>
        ) : (
          <>
            <OrdersTable
              filteredOrders={paginatedOrders}
              handleViewDetails={handleViewDetails}
              handleStatusUpdate={handleStatusUpdate}
              formatDate={formatDateShort}
              formatCurrency={formatCurrency}
              getStatusBadge={getStatusBadge}
            />
            <OrdersCardList
              filteredOrders={paginatedOrders}
              handleViewDetails={handleViewDetails}
              handleStatusUpdate={handleStatusUpdate}
              formatDate={formatDateShort}
              formatCurrency={formatCurrency}
              getStatusBadge={getStatusBadge}
            />
            <Pagination
              currentPage={validPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={(newItemsPerPage) => {
                setItemsPerPage(newItemsPerPage);
                setCurrentPage(1);
              }}
              totalItems={filteredOrders.length}
            />
          </>
        )}
      </div>

      <StatusUpdateModal
        show={showStatusModal}
        onHide={() => setShowStatusModal(false)}
        selectedOrder={selectedOrder}
        newStatus={newStatus}
        setNewStatus={setNewStatus}
        confirmStatusUpdate={confirmStatusUpdate}
        updating={updating}
        getStatusBadge={getStatusBadge}
        formatDate={formatDateShort}
        formatCurrency={formatCurrency}
      />
      <OrderDetailsModal
        show={showOrderDetails}
        onHide={() => setShowOrderDetails(false)}
        selectedOrder={selectedOrder}
        getStatusBadge={getStatusBadge}
        formatDate={formatDateShort}
        formatCurrency={formatCurrency}
      />
    </AdminLayout>
  );
};

export default Orders;
