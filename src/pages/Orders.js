import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Header from "../components/header";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import ListGroup from "react-bootstrap/ListGroup";
import Button from "react-bootstrap/Button";
import { FiPackage, FiCalendar, FiMapPin, FiCreditCard, FiTruck, FiCheck, FiClock, FiX, FiShoppingBag } from "react-icons/fi";
import api from "../api/axios";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/api/orders", {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Handle the response structure: { success, count, orders }
        console.log('Orders API Response:', res.data);
        if (res.data.success && Array.isArray(res.data.orders)) {
          setOrders(res.data.orders);
        } else {
          console.warn('Unexpected orders response format:', res.data);
          setOrders([]);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load orders. Please try again later.");
        setOrders([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "pending": return "warning";
      case "confirmed": return "info";
      case "processing": return "info";
      case "shipped": return "primary";
      case "delivered": return "success";
      case "cancelled": return "danger";
      default: return "secondary";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending": return <FiClock className="me-1" />;
      case "confirmed": return <FiCheck className="me-1" />;
      case "processing": return <FiPackage className="me-1" />;
      case "shipped": return <FiTruck className="me-1" />;
      case "delivered": return <FiCheck className="me-1" />;
      case "cancelled": return <FiX className="me-1" />;
      default: return <FiPackage className="me-1" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <>
        <Header />
        <Container fluid className="py-4" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', minHeight: '100vh' }}>
          <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
            <div className="text-center">
              <Spinner 
                animation="border" 
                role="status" 
                variant="primary"
                style={{ 
                  width: '4rem', 
                  height: '4rem',
                  borderWidth: '0.3em'
                }}
              >
                <span className="visually-hidden">Loading orders...</span>
              </Spinner>
              <h4 className="mt-3 text-muted">Loading your orders...</h4>
              <p className="text-muted">Please wait while we fetch your order history</p>
            </div>
          </div>
        </Container>
      </>
    );
  }

  return (
    <>
      <Header />
      <Container fluid className="py-4" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', minHeight: '100vh' }}>
        {/* Header Section */}
        <div className="text-center mb-5">
          <h1 className="text-dark mb-2" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: '700' }}>
            <FiShoppingBag className="me-3" style={{ color: '#667eea' }} />
            My Orders
          </h1>
          <p className="text-muted mb-0" style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)' }}>
            Track and manage all your orders in one place
          </p>
        </div>

        <Container>
          {error && (
            <Alert 
              variant="danger" 
              dismissible 
              onClose={() => setError(null)}
              className="mb-4 border-0 shadow-sm"
              style={{ borderRadius: '15px' }}
            >
              <div className="d-flex align-items-center">
                <FiX className="me-2" size={20} />
                {error}
              </div>
            </Alert>
          )}

          {(!orders || orders.length === 0) && !error ? (
            <div className="text-center py-5">
              <Card className="border-0 shadow-lg mx-auto" style={{ maxWidth: '500px', borderRadius: '20px' }}>
                <Card.Body className="p-5">
                  <div className="mb-4">
                    <FiShoppingBag 
                      size={80} 
                      className="text-muted mb-3" 
                      style={{ opacity: 0.3 }}
                    />
                  </div>
                  <Alert.Heading className="text-dark mb-3">No orders found</Alert.Heading>
                  <p className="text-muted mb-4">You haven't placed any orders yet. Start shopping to see your orders here!</p>
                  <Button 
                    variant="primary"
                    size="lg"
                    onClick={() => window.location.href = '/products'}
                    style={{
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      fontWeight: '600',
                      padding: '12px 30px'
                    }}
                  >
                    <FiPackage className="me-2" />
                    Start Shopping
                  </Button>
                </Card.Body>
              </Card>
            </div>
          ) : (
            <div className="row">
              {Array.isArray(orders) && orders.map((order) => (
                <div key={order._id} className="col-12 mb-4">
                  <Card className="border-0 shadow-lg overflow-hidden" style={{ borderRadius: '20px' }}>
                    <Card.Header 
                      className="d-flex justify-content-between align-items-center border-0"
                      style={{ 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        padding: '20px 25px'
                      }}
                    >
                      <div>
                        <div className="d-flex align-items-center mb-2">
                          <FiPackage className="me-2" size={20} />
                          <strong style={{ fontSize: '1.1rem' }}>Order #{order._id.slice(-8)}</strong>
                        </div>
                        <small className="d-flex align-items-center opacity-75">
                          <FiCalendar className="me-1" size={14} />
                          Placed on {formatDate(order.createdAt)}
                        </small>
                      </div>
                      <Badge 
                        bg={getStatusBadgeVariant(order.status)} 
                        className="fs-6 px-3 py-2"
                        style={{ 
                          borderRadius: '12px',
                          fontWeight: '600',
                          background: 'rgba(255,255,255,0.2)',
                          border: '1px solid rgba(255,255,255,0.3)'
                        }}
                      >
                        {getStatusIcon(order.status)}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </Card.Header>
                    <Card.Body className="p-4">
                      <div className="row">
                        <div className="col-md-8">
                          <h6 className="text-dark mb-3 d-flex align-items-center">
                            <FiShoppingBag className="me-2 text-primary" />
                            Items Ordered
                          </h6>
                          <ListGroup variant="flush" className="border rounded-3">
                            {Array.isArray(order.items) && order.items.map((item, index) => (
                              <ListGroup.Item 
                                key={index} 
                                className="d-flex justify-content-between align-items-center border-0 px-3 py-3"
                                style={{ 
                                  backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white',
                                  borderRadius: index === 0 ? '12px 12px 0 0' : 
                                              index === order.items.length - 1 ? '0 0 12px 12px' : '0'
                                }}
                              >
                                <div>
                                  <div className="fw-bold text-dark" style={{ fontSize: '1rem' }}>
                                    {item.product?.name || item.name || "Product"}
                                  </div>
                                  <small className="text-muted d-flex align-items-center mt-1">
                                    <FiPackage className="me-1" size={12} />
                                    Quantity: {item.quantity || 1}
                                  </small>
                                </div>
                                <span className="fw-bold text-primary" style={{ fontSize: '1.1rem' }}>
                                  ₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                                </span>
                              </ListGroup.Item>
                            ))}
                          </ListGroup>
                        </div>
                        <div className="col-md-4">
                          <Card 
                            className="border-0 shadow-sm mb-3" 
                            style={{ 
                              borderRadius: '15px',
                              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
                            }}
                          >
                            <Card.Body className="p-3">
                              <h6 className="text-dark mb-3 d-flex align-items-center">
                                <FiCreditCard className="me-2 text-success" />
                                Order Summary
                              </h6>
                              <div className="d-flex justify-content-between mb-2">
                                <small className="text-muted">Subtotal:</small>
                                <small className="fw-semibold">₹{order.subtotal?.toFixed(2) || "0.00"}</small>
                              </div>
                              <div className="d-flex justify-content-between mb-2">
                                <small className="text-muted">Shipping:</small>
                                <small className="fw-semibold">₹{order.shipping?.toFixed(2) || "0.00"}</small>
                              </div>
                              <div className="d-flex justify-content-between mb-2">
                                <small className="text-muted">Tax:</small>
                                <small className="fw-semibold">₹{order.tax?.toFixed(2) || "0.00"}</small>
                              </div>
                              <hr className="my-2" style={{ borderColor: '#dee2e6' }} />
                              <div className="d-flex justify-content-between">
                                <strong className="text-dark">Total:</strong>
                                <strong className="text-primary" style={{ fontSize: '1.2rem' }}>
                                  ₹{order.total?.toFixed(2) || "0.00"}
                                </strong>
                              </div>
                            </Card.Body>
                          </Card>
                          
                          {order.shippingAddress && (
                            <Card 
                              className="border-0 shadow-sm" 
                              style={{ 
                                borderRadius: '15px',
                                background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)'
                              }}
                            >
                              <Card.Body className="p-3">
                                <h6 className="text-dark mb-3 d-flex align-items-center">
                                  <FiMapPin className="me-2 text-info" />
                                  Shipping Address
                                </h6>
                                <address className="mb-0 text-muted" style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
                                  {order.shippingAddress.street}<br />
                                  {order.shippingAddress.city}, {order.shippingAddress.state}<br />
                                  {order.shippingAddress.zipCode}<br />
                                  {order.shippingAddress.country}
                                </address>
                              </Card.Body>
                            </Card>
                          )}
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </Container>
      </Container>
    </>
  );
}