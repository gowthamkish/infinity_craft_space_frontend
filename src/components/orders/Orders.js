import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import Header from "../header";
import { Container, Spinner, Breadcrumb, Card, Row, Col, Badge, Button, Modal, Form, Alert, Table } from "react-bootstrap";
import { 
  FiArrowLeft, 
  FiShoppingBag, 
  FiCalendar, 
  FiUser, 
  FiMapPin, 
  FiCreditCard, 
  FiPackage, 
  FiTruck, 
  FiCheck, 
  FiX, 
  FiClock, 
  FiDollarSign,
  FiSearch,
  FiFilter,
  FiEye,
  FiEdit
} from "react-icons/fi";
import { useOrders } from "../../hooks/useSmartFetch";
import { updateOrderStatus } from "../../features/adminSlice";

const Orders = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data: orders, loading, error } = useOrders();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [updating, setUpdating] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  // Filter orders based on search and status
  const filteredOrders = orders.orders;

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return '#f59e0b';
      case 'confirmed': return '#3b82f6';
      case 'processing': return '#8b5cf6';
      case 'shipped': return '#10b981';
      case 'delivered': return '#059669';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return <FiClock size={14} />;
      case 'confirmed': return <FiCheck size={14} />;
      case 'processing': return <FiPackage size={14} />;
      case 'shipped': return <FiTruck size={14} />;
      case 'delivered': return <FiCheck size={14} />;
      case 'cancelled': return <FiX size={14} />;
      default: return <FiClock size={14} />;
    }
  };

  const getStatusBadge = (status) => {
    const color = getStatusColor(status);
    return (
      <Badge 
        className="d-flex align-items-center"
        style={{ 
          backgroundColor: color,
          color: 'white',
          borderRadius: '8px',
          fontSize: '0.75rem',
          padding: '0.4rem 0.6rem',
          gap: '0.25rem',
          border: 'none',
          backgroundImage: 'none' // Override Bootstrap's gradient
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
      await dispatch(updateOrderStatus({ 
        orderId: selectedOrder._id, 
        status: newStatus 
      })).unwrap();
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <>
      <Header />
      
      <Container fluid className="" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', minHeight: '100vh', paddingTop: '110px' }}>
        {/* Header Section */}
        <div className="mb-4">
          <Breadcrumb className="mb-3">
            <Breadcrumb.Item
              onClick={() => navigate("/admin/dashboard")}
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                color: '#495057'
              }}
            >
              <FiArrowLeft style={{ marginRight: 4 }} />
              Dashboard
            </Breadcrumb.Item>
            <Breadcrumb.Item active style={{ color: '#343a40' }}>Orders</Breadcrumb.Item>
          </Breadcrumb>

          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
            <div className="mb-3 mb-md-0">
              <h1 className="text-dark mb-2" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: '700' }}>
                <FiShoppingBag className="me-3" style={{ color: '#4f46e5' }} />
                Order Management
              </h1>
              <p className="text-muted mb-0" style={{ fontSize: 'clamp(0.9rem, 2vw, 1.1rem)' }}>
                Track and manage customer orders
              </p>
            </div>
            <Badge 
              bg="primary" 
              className="d-flex align-items-center"
              style={{
                fontSize: '1rem',
                padding: '0.75rem 1.25rem',
                borderRadius: '12px',
                gap: '0.5rem'
              }}
            >
              <FiShoppingBag size={16} />
              {filteredOrders?.length} {filteredOrders?.length === 1 ? 'Order' : 'Orders'}
            </Badge>
          </div>
        </div>

        {/* Filters Section */}
        <Card className="mb-4 border-0 shadow-sm" style={{ borderRadius: '16px' }}>
          <Card.Body>
            <Row className="g-3">
              <Col md={6}>
                <div className="position-relative">
                  <FiSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                  <input
                    type="text"
                    className="form-control ps-5"
                    placeholder="Search orders by number, customer name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ 
                      borderRadius: '12px', 
                      border: '2px solid #e9ecef',
                      fontSize: '1rem',
                      padding: '12px 12px 12px 2.5rem'
                    }}
                  />
                </div>
              </Col>
              <Col md={6}>
                <div className="position-relative">
                  <FiFilter className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                  <select
                    className="form-control ps-5"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ 
                      borderRadius: '12px', 
                      border: '2px solid #e9ecef',
                      fontSize: '1rem',
                      padding: '12px 12px 12px 2.5rem'
                    }}
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Orders Content */}
        {loading ? (
          <Card className="border-0 shadow-sm" style={{ borderRadius: '16px' }}>
            <Card.Body>
              <div
                className="d-flex justify-content-center align-items-center"
                style={{ minHeight: "300px" }}
              >
                <div className="text-center">
                  <Spinner animation="border" role="status" style={{ width: '3rem', height: '3rem', color: '#4f46e5' }} />
                  <p className="mt-3 text-muted">Loading orders...</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        ) : error ? (
          <Card className="border-0 shadow-sm" style={{ borderRadius: '16px' }}>
            <Card.Body>
              <div className="text-center py-5">
                <FiX size={64} className="text-danger mb-3" />
                <h4 className="text-danger">Error Loading Orders</h4>
                <p className="text-muted">{error}</p>
              </div>
            </Card.Body>
          </Card>
        ) : (
          <Card className="border-0 shadow-sm" style={{ borderRadius: '16px' }}>
            <Card.Body className="p-0">
              {filteredOrders?.length === 0 ? (
                <div className="text-center py-5">
                  <FiShoppingBag size={64} className="text-muted mb-3" />
                  <h4 className="text-muted">No orders found</h4>
                  <p className="text-muted">
                    {searchTerm || statusFilter !== 'all' ? 'Try adjusting your search or filters' : 'No orders have been placed yet'}
                  </p>
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="d-none d-lg-block">
                    <Table responsive className="mb-0">
                      <thead style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
                        <tr>
                          <th style={{ border: 'none', padding: '1rem', fontWeight: '600', color: '#495057' }}>
                            <FiShoppingBag className="me-2" style={{ color: '#4f46e5' }} />
                            Order
                          </th>
                          <th style={{ border: 'none', padding: '1rem', fontWeight: '600', color: '#495057' }}>
                            <FiUser className="me-2" style={{ color: '#10b981' }} />
                            Customer
                          </th>
                          <th style={{ border: 'none', padding: '1rem', fontWeight: '600', color: '#495057' }}>
                            <FiCalendar className="me-2" style={{ color: '#f59e0b' }} />
                            Date
                          </th>
                          <th style={{ border: 'none', padding: '1rem', fontWeight: '600', color: '#495057' }}>
                            <FiDollarSign className="me-2" style={{ color: '#059669' }} />
                            Amount
                          </th>
                          <th style={{ border: 'none', padding: '1rem', fontWeight: '600', color: '#495057' }}>Status</th>
                          <th style={{ border: 'none', padding: '1rem', fontWeight: '600', color: '#495057', textAlign: 'center' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders?.length > 0 && filteredOrders?.map((order, index) => (
                          <tr key={order._id || order.id} style={{ borderBottom: '1px solid #f1f3f4' }}>
                            <td style={{ border: 'none', padding: '1rem' }}>
                              <div>
                                <h6 className="mb-1" style={{ fontWeight: '600', color: '#212529' }}>
                                  #{order.orderNumber || order._id?.slice(-6)}
                                </h6>
                                <small className="text-muted">
                                  {order.items?.length || 0} items
                                </small>
                              </div>
                            </td>
                            <td style={{ border: 'none', padding: '1rem' }}>
                              <div>
                                <h6 className="mb-0" style={{ fontWeight: '500', color: '#374151' }}>
                                  {order.userId.username || order.customerName || 'Unknown'}
                                </h6>
                                <small className="text-muted">{order.user?.email || order.customerEmail}</small>
                              </div>
                            </td>
                            <td style={{ border: 'none', padding: '1rem' }}>
                              <span className="text-muted">{formatDate(order.createdAt || order.orderDate)}</span>
                            </td>
                            <td style={{ border: 'none', padding: '1rem' }}>
                              <span style={{ fontWeight: '600', color: '#059669', fontSize: '1.1rem' }}>
                                {formatCurrency(order.totalAmount || order.total)}
                              </span>
                            </td>
                            <td style={{ border: 'none', padding: '1rem' }}>
                              {getStatusBadge(order.status)}
                            </td>
                            <td style={{ border: 'none', padding: '1rem', textAlign: 'center' }}>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleViewDetails(order)}
                                className="me-2"
                                style={{ borderRadius: '8px', fontWeight: '500' }}
                              >
                                <FiEye className="me-1" />
                                View
                              </Button>
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => handleStatusUpdate(order)}
                                style={{ borderRadius: '8px', fontWeight: '500' }}
                              >
                                <FiEdit className="me-1" />
                                Update
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="d-lg-none">
                    <div className="p-3">
                      {filteredOrders?.length > 0 && filteredOrders?.map((order, index) => (
                        <Card key={order._id || order.id} className="mb-3 border-0 shadow-sm" style={{ borderRadius: '12px' }}>
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-start mb-3">
                              <div>
                                <h6 className="mb-1" style={{ fontWeight: '600', color: '#212529' }}>
                                  Order #{order.orderNumber || order._id?.slice(-6)}
                                </h6>
                                <small className="text-muted">{order.items?.length || 0} items</small>
                              </div>
                              {getStatusBadge(order.status)}
                            </div>
                            
                            <div className="mb-3">
                              <div className="d-flex align-items-center mb-2">
                                <FiUser className="me-2" style={{ color: '#10b981' }} />
                                <span className="fw-medium">{order.user?.name || order.customerName || 'Unknown'}</span>
                              </div>
                              <div className="d-flex align-items-center mb-2">
                                <FiCalendar className="me-2" style={{ color: '#f59e0b' }} />
                                <span className="text-muted small">{formatDate(order.createdAt || order.orderDate)}</span>
                              </div>
                              <div className="d-flex align-items-center">
                                <FiDollarSign className="me-2" style={{ color: '#059669' }} />
                                <span style={{ fontWeight: '600', color: '#059669' }}>
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
                                style={{ borderRadius: '8px', fontWeight: '500' }}
                              >
                                <FiEye className="me-1" />
                                View Details
                              </Button>
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => handleStatusUpdate(order)}
                                className="flex-fill"
                                style={{ borderRadius: '8px', fontWeight: '500' }}
                              >
                                <FiEdit className="me-1" />
                                Update Status
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        )}

        {/* Status Update Modal */}
        <Modal 
          show={showStatusModal} 
          onHide={() => setShowStatusModal(false)} 
          centered
          className="status-update-modal"
        >
          <Modal.Header 
            closeButton 
            style={{ 
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px 12px 0 0',
              padding: '1rem 1.5rem'
            }}
          >
            <Modal.Title style={{ fontSize: '1.1rem', fontWeight: '600', display: 'flex', alignItems: 'center' }}>
              <div 
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  padding: '0.4rem',
                  marginRight: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <FiEdit size={16} />
              </div>
              Update Order Status
            </Modal.Title>
          </Modal.Header>
          
          <Modal.Body style={{ padding: '1.25rem', background: '#f8fafc' }}>
            {/* Order Information Card */}
            <Card 
              className="mb-3 border-0 shadow-sm" 
              style={{ borderRadius: '10px', overflow: 'hidden' }}
            >
              <Card.Body style={{ padding: '1rem', background: 'white' }}>
                <div className="text-center mb-2">
                  <div 
                    style={{
                      width: '45px',
                      height: '45px',
                      background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 0.75rem auto',
                      border: '2px solid #4f46e5'
                    }}
                  >
                    <FiShoppingBag size={20} style={{ color: '#4f46e5' }} />
                  </div>
                  <h6 style={{ margin: '0 0 0.25rem 0', color: '#1e293b', fontWeight: '600' }}>
                    Order #{selectedOrder?.orderNumber || selectedOrder?._id?.slice(-6)}
                  </h6>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>
                    Current Status: {getStatusBadge(selectedOrder?.status)}
                  </p>
                </div>
                
                {selectedOrder && (
                  <div 
                    style={{
                      background: '#f1f5f9',
                      borderRadius: '6px',
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <Row className="g-2 text-center">
                      <Col xs={4}>
                        <div>
                          <FiUser size={16} style={{ color: '#10b981', marginBottom: '0.2rem' }} />
                          <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '500' }}>Customer</div>
                          <div style={{ fontSize: '0.8rem', color: '#1e293b', fontWeight: '600' }}>
                            {selectedOrder.user?.name || 'Unknown'}
                          </div>
                        </div>
                      </Col>
                      <Col xs={4}>
                        <div>
                          <FiCalendar size={16} style={{ color: '#f59e0b', marginBottom: '0.2rem' }} />
                          <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '500' }}>Date</div>
                          <div style={{ fontSize: '0.8rem', color: '#1e293b', fontWeight: '600' }}>
                            {formatDate(selectedOrder.createdAt || selectedOrder.orderDate).split(',')[0]}
                          </div>
                        </div>
                      </Col>
                      <Col xs={4}>
                        <div>
                          <FiDollarSign size={16} style={{ color: '#059669', marginBottom: '0.2rem' }} />
                          <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '500' }}>Amount</div>
                          <div style={{ fontSize: '0.8rem', color: '#059669', fontWeight: '700' }}>
                            {formatCurrency(selectedOrder.totalAmount || selectedOrder.total)}
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Status Selection */}
            <Card className="border-0 shadow-sm" style={{ borderRadius: '10px', overflow: 'hidden' }}>
              <Card.Header 
                style={{ 
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1rem'
                }}
              >
                <h6 style={{ margin: 0, fontWeight: '600', display: 'flex', alignItems: 'center', fontSize: '0.9rem' }}>
                  <FiEdit size={14} className="me-2" />
                  Select New Status
                </h6>
              </Card.Header>
              <Card.Body style={{ padding: '1rem', background: 'white' }}>
                <Form.Group>
                  <Form.Label 
                    style={{ 
                      fontWeight: '500', 
                      color: '#374151', 
                      marginBottom: '0.5rem',
                      fontSize: '0.9rem'
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
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        fontSize: '0.9rem',
                        padding: '10px 10px 10px 2.2rem',
                        fontWeight: '500',
                        color: '#374151'
                      }}
                      className="form-select-custom"
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

                {/* Status Preview */}
                {newStatus && (
                  <div 
                    style={{
                      marginTop: '0.75rem',
                      padding: '0.75rem',
                      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                      borderRadius: '6px',
                      border: '1px solid #bbf7d0'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.85rem', color: '#166534', fontWeight: '500' }}>
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
              background: '#f8fafc',
              border: 'none',
              borderRadius: '0 0 12px 12px',
              padding: '1rem 1.5rem',
              gap: '0.5rem'
            }}
          >
            <Button 
              variant="outline-secondary"
              onClick={() => setShowStatusModal(false)}
              style={{ 
                borderRadius: '8px',
                padding: '0.6rem 1.2rem',
                fontWeight: '500',
                border: '1px solid #e2e8f0',
                color: '#64748b',
                flex: 1,
                fontSize: '0.9rem'
              }}
            >
              <FiX className="me-1" size={14} />
              Cancel
            </Button>
            <Button 
              variant="primary"
              onClick={confirmStatusUpdate}
              disabled={updating || !newStatus || newStatus === selectedOrder?.status}
              style={{ 
                borderRadius: '8px',
                padding: '0.6rem 1.2rem',
                fontWeight: '500',
                background: updating || !newStatus || newStatus === selectedOrder?.status 
                  ? '#9ca3af' 
                  : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                border: 'none',
                flex: 2,
                fontSize: '0.9rem'
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
                  {newStatus === selectedOrder?.status ? 'No Changes' : 'Update Status'}
                </>
              )}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Order Details Modal */}
        <Modal 
          show={showOrderDetails} 
          onHide={() => setShowOrderDetails(false)} 
          size="xl" 
          centered
          className="order-details-modal"
        >
          <Modal.Header 
            closeButton 
            style={{ 
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px 12px 0 0',
              padding: '1rem 1.5rem'
            }}
          >
            <Modal.Title style={{ fontSize: '1.25rem', fontWeight: '600', display: 'flex', alignItems: 'center' }}>
              <div 
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  padding: '0.5rem',
                  marginRight: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <FiShoppingBag size={20} />
              </div>
              Order #{selectedOrder?.orderNumber || selectedOrder?._id?.slice(-6)}
            </Modal.Title>
          </Modal.Header>
          
          <Modal.Body style={{ padding: '0', background: '#f8fafc' }}>
            {selectedOrder && (
              <div>
                {/* Order Status Banner */}
                <div 
                  style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
                    padding: '1.25rem',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.75rem'
                  }}
                >
                  <div>
                    <h6 style={{ margin: '0 0 0.35rem 0', color: '#1e293b', fontWeight: '600', fontSize: '1rem' }}>
                      Order Status
                    </h6>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {getStatusBadge(selectedOrder.status)}
                      <span style={{ color: '#64748b', fontSize: '0.85rem' }}>
                        Placed on {formatDate(selectedOrder.createdAt || selectedOrder.orderDate)}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.2rem' }}>
                      Total Amount
                    </div>
                    <div style={{ 
                      fontSize: '1.6rem', 
                      fontWeight: '700', 
                      color: '#059669',
                      textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }}>
                      {formatCurrency(selectedOrder.totalAmount || selectedOrder.total)}
                    </div>
                  </div>
                </div>

                <div style={{ padding: '1.25rem' }}>
                  <Row className="g-3">
                    {/* Customer Information Card */}
                    <Col lg={6}>
                      <Card 
                        className="h-100 border-0 shadow-sm" 
                        style={{ borderRadius: '12px', overflow: 'hidden' }}
                      >
                        <Card.Header 
                          style={{ 
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '0.875rem 1rem'
                          }}
                        >
                          <h6 style={{ margin: 0, fontWeight: '600', display: 'flex', alignItems: 'center', fontSize: '0.9rem' }}>
                            <FiUser size={16} className="me-2" />
                            Customer Information
                          </h6>
                        </Card.Header>
                        <Card.Body style={{ padding: '1rem' }}>
                          <div className="mb-2">
                            <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '500' }}>
                              Full Name
                            </label>
                            <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.9rem', fontWeight: '600', color: '#1e293b' }}>
                              {selectedOrder.user?.name || selectedOrder.customerName || 'Unknown Customer'}
                            </p>
                          </div>
                          <div className="mb-2">
                            <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '500' }}>
                              Email Address
                            </label>
                            <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.85rem', color: '#475569' }}>
                              {selectedOrder.user?.email || selectedOrder.customerEmail || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '500' }}>
                              Phone Number
                            </label>
                            <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.85rem', color: '#475569' }}>
                              {selectedOrder.shippingAddress?.phone || 'N/A'}
                            </p>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>

                    {/* Shipping Address Card */}
                    <Col lg={6}>
                      <Card 
                        className="h-100 border-0 shadow-sm" 
                        style={{ borderRadius: '12px', overflow: 'hidden' }}
                      >
                        <Card.Header 
                          style={{ 
                            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '0.875rem 1rem'
                          }}
                        >
                          <h6 style={{ margin: 0, fontWeight: '600', display: 'flex', alignItems: 'center', fontSize: '0.9rem' }}>
                            <FiMapPin size={16} className="me-2" />
                            Shipping Address
                          </h6>
                        </Card.Header>
                        <Card.Body style={{ padding: '1rem' }}>
                          {selectedOrder.shippingAddress ? (
                            <div 
                              style={{
                                background: '#f8fafc',
                                borderRadius: '8px',
                                padding: '0.875rem',
                                border: '1px solid #e2e8f0'
                              }}
                            >
                              <p style={{ 
                                margin: 0, 
                                lineHeight: '1.5', 
                                color: '#475569',
                                fontSize: '0.85rem'
                              }}>
                                {selectedOrder.shippingAddress.street}<br />
                                {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}<br />
                                <strong>{selectedOrder.shippingAddress.zipCode}</strong>
                              </p>
                            </div>
                          ) : (
                            <div className="text-center py-2">
                              <FiMapPin size={36} style={{ color: '#cbd5e1', margin: '0 0 0.5rem 0' }} />
                              <p style={{ color: '#64748b', margin: 0, fontSize: '0.85rem' }}>No shipping address provided</p>
                            </div>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>

                  {/* Order Items Card */}
                  <Card 
                    className="mt-3 border-0 shadow-sm" 
                    style={{ borderRadius: '12px', overflow: 'hidden' }}
                  >
                    <Card.Header 
                      style={{ 
                        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                        color: 'white',
                        border: 'none',
                        padding: '0.875rem 1rem'
                      }}
                    >
                      <h6 style={{ margin: 0, fontWeight: '600', display: 'flex', alignItems: 'center', fontSize: '0.9rem' }}>
                        <FiPackage size={16} className="me-2" />
                        Order Items ({selectedOrder.items?.length || 0} items)
                      </h6>
                    </Card.Header>
                    <Card.Body style={{ padding: '0' }}>
                      {selectedOrder.items?.length > 0 ? (
                        <div>
                          {selectedOrder.items.map((item, index) => (
                            <div 
                              key={index} 
                              style={{
                                padding: '1rem',
                                borderBottom: index < selectedOrder.items.length - 1 ? '1px solid #f1f5f9' : 'none',
                                background: index % 2 === 0 ? 'white' : '#fafbfc'
                              }}
                            >
                              <div className="d-flex justify-content-between align-items-start">
                                <div style={{ flex: 1 }}>
                                  <h6 style={{ 
                                    margin: '0 0 0.35rem 0', 
                                    color: '#1e293b', 
                                    fontWeight: '600',
                                    fontSize: '0.95rem'
                                  }}>
                                    {item.productName || item.name || 'Unknown Product'}
                                  </h6>
                                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div>
                                      <span style={{ 
                                        fontSize: '0.8rem', 
                                        color: '#64748b',
                                        fontWeight: '500'
                                      }}>
                                        Quantity: 
                                      </span>
                                      <span style={{ 
                                        marginLeft: '0.35rem',
                                        fontSize: '0.85rem',
                                        color: '#475569',
                                        fontWeight: '600'
                                      }}>
                                        {item.quantity}
                                      </span>
                                    </div>
                                    <div>
                                      <span style={{ 
                                        fontSize: '0.8rem', 
                                        color: '#64748b',
                                        fontWeight: '500'
                                      }}>
                                        Unit Price: 
                                      </span>
                                      <span style={{ 
                                        marginLeft: '0.35rem',
                                        fontSize: '0.85rem',
                                        color: '#475569',
                                        fontWeight: '600'
                                      }}>
                                        {formatCurrency(item.price)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                  <div style={{ 
                                    fontSize: '1.1rem', 
                                    fontWeight: '700', 
                                    color: '#059669'
                                  }}>
                                    {formatCurrency(item.price * item.quantity)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center">
                          <FiPackage size={48} style={{ color: '#cbd5e1', margin: '0 0 0.75rem 0' }} />
                          <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>No items found in this order</p>
                        </div>
                      )}
                    </Card.Body>
                  </Card>

                  {/* Payment Summary Card */}
                  <Card 
                    className="mt-3 border-0 shadow-sm" 
                    style={{ 
                      borderRadius: '12px', 
                      overflow: 'hidden',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <Card.Header 
                      style={{ 
                        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                        color: 'white',
                        border: 'none',
                        padding: '0.875rem 1rem'
                      }}
                    >
                      <h6 style={{ margin: 0, fontWeight: '600', display: 'flex', alignItems: 'center', fontSize: '0.9rem' }}>
                        <FiCreditCard size={16} className="me-2" />
                        Payment Summary
                      </h6>
                    </Card.Header>
                    <Card.Body style={{ padding: '1rem', background: 'white' }}>
                      <div style={{ marginBottom: '0.75rem' }}>
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Subtotal:</span>
                          <span style={{ color: '#475569', fontWeight: '600', fontSize: '0.9rem' }}>
                            {formatCurrency((selectedOrder.totalAmount || selectedOrder.total) - (selectedOrder.shippingCost || 0))}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Shipping:</span>
                          <span style={{ color: '#475569', fontWeight: '600', fontSize: '0.9rem' }}>
                            {formatCurrency(selectedOrder.shippingCost || 0)}
                          </span>
                        </div>
                        {selectedOrder.tax && (
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Tax:</span>
                            <span style={{ color: '#475569', fontWeight: '600', fontSize: '0.9rem' }}>
                              {formatCurrency(selectedOrder.tax)}
                            </span>
                          </div>
                        )}
                      </div>
                      <hr style={{ margin: '0.75rem 0', border: '1px solid #e2e8f0' }} />
                      <div 
                        className="d-flex justify-content-between align-items-center"
                        style={{
                          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                          padding: '0.75rem',
                          borderRadius: '8px',
                          border: '1px solid #bbf7d0'
                        }}
                      >
                        <span style={{ 
                          fontSize: '1rem', 
                          fontWeight: '700', 
                          color: '#166534'
                        }}>
                          Total Amount:
                        </span>
                        <span style={{ 
                          fontSize: '1.3rem', 
                          fontWeight: '800', 
                          color: '#059669',
                          textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                        }}>
                          {formatCurrency(selectedOrder.totalAmount || selectedOrder.total)}
                        </span>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              </div>
            )}
          </Modal.Body>
          
          <Modal.Footer 
            style={{ 
              background: '#f8fafc',
              border: 'none',
              borderRadius: '0 0 12px 12px',
              padding: '1rem 1.5rem'
            }}
          >
            <Button 
              variant="outline-secondary"
              onClick={() => setShowOrderDetails(false)}
              style={{ 
                borderRadius: '8px',
                padding: '0.6rem 1.5rem',
                fontWeight: '500',
                border: '1px solid #e2e8f0',
                fontSize: '0.9rem'
              }}
            >
              Close
            </Button>
            <Button 
              variant="primary"
              onClick={() => {
                setShowOrderDetails(false);
                handleStatusUpdate(selectedOrder);
              }}
              style={{ 
                borderRadius: '8px',
                padding: '0.6rem 1.5rem',
                fontWeight: '500',
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                border: 'none',
                fontSize: '0.9rem'
              }}
            >
              <FiEdit className="me-1" size={14} />
              Update Status
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
};

export default Orders;