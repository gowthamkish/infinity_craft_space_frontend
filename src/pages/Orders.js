import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Header from "../components/header";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import ListGroup from "react-bootstrap/ListGroup";
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
        setOrders(res.data);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load orders. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "pending": return "warning";
      case "processing": return "info";
      case "shipped": return "primary";
      case "delivered": return "success";
      case "cancelled": return "danger";
      default: return "secondary";
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
      <div>
        <Header />
        <Container className="mt-4">
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "200px" }}>
            <Spinner animation="border" role="status" variant="primary">
              <span className="visually-hidden">Loading orders...</span>
            </Spinner>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <Container className="mt-4">
        <h1 className="mb-4">My Orders</h1>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {orders.length === 0 && !error ? (
          <Alert variant="info" className="text-center">
            <Alert.Heading>No orders found</Alert.Heading>
            <p>You haven't placed any orders yet. Start shopping to see your orders here!</p>
          </Alert>
        ) : (
          <div className="row">
            {orders.map((order) => (
              <div key={order._id} className="col-12 mb-4">
                <Card>
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>Order #{order._id.slice(-8)}</strong>
                      <br />
                      <small className="text-muted">
                        Placed on {formatDate(order.createdAt)}
                      </small>
                    </div>
                    <Badge bg={getStatusBadgeVariant(order.status)} className="fs-6">
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </Card.Header>
                  <Card.Body>
                    <div className="row">
                      <div className="col-md-8">
                        <h6>Items Ordered:</h6>
                        <ListGroup variant="flush">
                          {order.items.map((item, index) => (
                            <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center px-0">
                              <div>
                                <div className="fw-bold">{item.product?.name || "Product"}</div>
                                <small className="text-muted">Quantity: {item.quantity}</small>
                              </div>
                              <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      </div>
                      <div className="col-md-4">
                        <Card className="bg-light">
                          <Card.Body>
                            <h6>Order Summary</h6>
                            <div className="d-flex justify-content-between mb-1">
                              <small>Subtotal:</small>
                              <small>₹{order.subtotal?.toFixed(2) || "0.00"}</small>
                            </div>
                            <div className="d-flex justify-content-between mb-1">
                              <small>Shipping:</small>
                              <small>₹{order.shipping?.toFixed(2) || "0.00"}</small>
                            </div>
                            <div className="d-flex justify-content-between mb-1">
                              <small>Tax:</small>
                              <small>₹{order.tax?.toFixed(2) || "0.00"}</small>
                            </div>
                            <hr className="my-2" />
                            <div className="d-flex justify-content-between">
                              <strong>Total:</strong>
                              <strong>₹{order.total?.toFixed(2) || "0.00"}</strong>
                            </div>
                          </Card.Body>
                        </Card>
                        
                        {order.shippingAddress && (
                          <Card className="mt-3">
                            <Card.Body>
                              <h6>Shipping Address</h6>
                              <address className="mb-0">
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
    </div>
  );
}