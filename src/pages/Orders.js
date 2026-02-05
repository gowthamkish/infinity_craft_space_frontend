import { useEffect, useState, useMemo } from "react";
import Header from "../components/header";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import ListGroup from "react-bootstrap/ListGroup";
import Table from "react-bootstrap/Table";
import Pagination from "react-bootstrap/Pagination";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import {
  FiPackage,
  FiCalendar,
  FiMapPin,
  FiCreditCard,
  FiTruck,
  FiCheck,
  FiClock,
  FiX,
  FiSearch,
  FiShoppingBag,
} from "react-icons/fi";
import api from "../api/axios";
import SEOHead, { SEO_CONFIG } from "../components/SEOHead";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Global search state and filtered orders must be declared before any early returns
  const [search, setSearch] = useState("");
  const filteredOrders = useMemo(() => {
    if (!search) return orders || [];
    const q = String(search).toLowerCase().trim();
    return (orders || []).filter((order) => {
      if (!order) return false;
      const id = order._id ? String(order._id).toLowerCase() : "";
      if (id.includes(q)) return true;
      const status = order.status ? String(order.status).toLowerCase() : "";
      if (status.includes(q)) return true;
      const total =
        typeof order.totalAmount !== "undefined" && order.totalAmount !== null
          ? String(order.totalAmount).toLowerCase()
          : "";
      if (total.includes(q)) return true;
      if (order.shippingAddress) {
        const addr = [
          order.shippingAddress.street,
          order.shippingAddress.city,
          order.shippingAddress.state,
          order.shippingAddress.zipCode,
          order.shippingAddress.country,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (addr.includes(q)) return true;
      }
      if (Array.isArray(order.items)) {
        for (const item of order.items) {
          const name = item.product?.name || item.name || "";
          if (String(name).toLowerCase().includes(q)) return true;
        }
      }
      return false;
    });
  }, [orders, search]);

  // Client-side pagination: compute current page slice (do not set state during render)
  const totalPages = Math.max(
    1,
    Math.ceil((filteredOrders.length || 0) / pageSize),
  );
  const current = Math.min(currentPage, totalPages);
  const start = (current - 1) * pageSize;
  const pagedOrders = Array.isArray(filteredOrders)
    ? filteredOrders.slice(start, start + pageSize)
    : [];

  // Build pagination items (pre-computed to keep JSX clean)
  const paginationItems = (() => {
    const items = [];
    const total = totalPages;
    let s = Math.max(1, current - 2);
    let e = Math.min(total, current + 2);
    if (e - s < 4) {
      s = Math.max(1, e - 4);
      e = Math.min(total, s + 4);
    }
    if (s > 1)
      items.push(<Pagination.Ellipsis key="start-ellipsis" disabled />);
    for (let i = s; i <= e; i++) {
      items.push(
        <Pagination.Item
          key={i}
          active={i === current}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </Pagination.Item>,
      );
    }
    if (e < total)
      items.push(<Pagination.Ellipsis key="end-ellipsis" disabled />);
    return items;
  })();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/api/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Handle the response structure: { success, count, orders }
        if (res.data.success && Array.isArray(res.data.orders)) {
          setOrders(res.data.orders);
        } else {
          console.warn("Unexpected orders response format:", res.data);
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
      case "pending":
        return "warning";
      case "confirmed":
        return "info";
      case "processing":
        return "info";
      case "shipped":
        return "primary";
      case "delivered":
        return "success";
      case "cancelled":
        return "danger";
      default:
        return "secondary";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <FiClock className="me-1" />;
      case "confirmed":
        return <FiCheck className="me-1" />;
      case "processing":
        return <FiPackage className="me-1" />;
      case "shipped":
        return <FiTruck className="me-1" />;
      case "delivered":
        return <FiCheck className="me-1" />;
      case "cancelled":
        return <FiX className="me-1" />;
      default:
        return <FiPackage className="me-1" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
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
          <div
            className="d-flex flex-column justify-content-center align-items-center"
            style={{ minHeight: "60vh" }}
          >
            <div className="text-center">
              <Spinner
                animation="border"
                role="status"
                variant="primary"
                style={{
                  width: "4rem",
                  height: "4rem",
                  borderWidth: "0.3em",
                }}
              >
                <span className="visually-hidden">Loading orders...</span>
              </Spinner>
              <h4 className="mt-3 text-muted">Loading your orders...</h4>
              <p className="text-muted">
                Please wait while we fetch your order history
              </p>
            </div>
          </div>
        </Container>
      </>
    );
  }

  return (
    <>
      <SEOHead
        title={`My Orders - ${SEO_CONFIG.SITE_NAME}`}
        description="View and track all your craft supply orders. Check order status, delivery information, and leave reviews for delivered products."
        keywords="my orders, order history, track orders, delivery status, order management, purchase history"
        url={`${SEO_CONFIG.SITE_URL}/orders`}
        noindex={true}
        canonical={`${SEO_CONFIG.SITE_URL}/orders`}
      />
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
        <div className="text-center mb-5">
          <h1
            className="text-dark mb-2"
            style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: "700" }}
          >
            <FiShoppingBag className="me-3" style={{ color: "#667eea" }} />
            My Orders
          </h1>
          <p
            className="text-muted mb-0"
            style={{ fontSize: "clamp(1rem, 2vw, 1.2rem)" }}
          >
            Track and manage all your orders in one place
          </p>
        </div>

        <Row className="mb-3">
          <Col xs={12} md={8} className="mx-md-auto">
            <InputGroup>
              <InputGroup.Text>
                <FiSearch />
              </InputGroup.Text>
              <Form.Control
                placeholder="Search orders, items, address, status, or ID"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <Button
                variant="outline-secondary"
                onClick={() => {
                  setSearch("");
                  setCurrentPage(1);
                }}
              >
                Clear
              </Button>
            </InputGroup>
          </Col>
        </Row>

        <Container fluid>
          {error && (
            <Alert
              variant="danger"
              dismissible
              onClose={() => setError(null)}
              className="mb-4 border-0 shadow-sm"
              style={{ borderRadius: "15px" }}
            >
              <div className="d-flex align-items-center">
                <FiX className="me-2" size={20} />
                {error}
              </div>
            </Alert>
          )}

          {(!orders || orders.length === 0) && !error ? (
            <div className="text-center py-5">
              <Card
                className="border-0 shadow-lg mx-auto"
                style={{ maxWidth: "500px", borderRadius: "20px" }}
              >
                <Card.Body className="p-5">
                  <div className="mb-4">
                    <FiShoppingBag
                      size={80}
                      className="text-muted mb-3"
                      style={{ opacity: 0.3 }}
                    />
                  </div>
                  <Alert.Heading className="text-dark mb-3">
                    No orders found
                  </Alert.Heading>
                  <p className="text-muted mb-4">
                    You haven't placed any orders yet. Start shopping to see
                    your orders here!
                  </p>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => (window.location.href = "/products")}
                    style={{
                      borderRadius: "12px",
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      border: "none",
                      fontWeight: "600",
                      padding: "12px 30px",
                    }}
                  >
                    <FiPackage className="me-2" />
                    Start Shopping
                  </Button>
                </Card.Body>
              </Card>
            </div>
          ) : (
            <Card
              className="border-0 shadow-sm mb-4"
              style={{ borderRadius: "12px" }}
            >
              <Card.Body className="p-3">
                <div className="d-none d-md-block">
                  <Table responsive hover className="mb-0 align-middle">
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Placed</th>
                        <th>Items Ordered</th>
                        <th>Order Summary</th>
                        <th>Shipping Address</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedOrders.map((order) => {
                        const orderId =
                          order && order._id ? String(order._id) : "";
                        const displayOrderShort = orderId
                          ? `#${orderId.slice(-8)}`
                          : "—";
                        const status =
                          order && order.status
                            ? String(order.status)
                            : "unknown";
                        const displayStatus = status
                          ? status.charAt(0).toUpperCase() + status.slice(1)
                          : "Unknown";
                        return (
                          <tr key={orderId || Math.random()}>
                            <td style={{ minWidth: "160px" }}>
                              <div className="fw-bold">{displayOrderShort}</div>
                              <div className="text-muted small">
                                {orderId || "—"}
                              </div>
                            </td>
                            <td style={{ minWidth: "180px" }}>
                              {order && order.createdAt
                                ? formatDate(order.createdAt)
                                : "—"}
                            </td>
                            <td style={{ maxWidth: "320px" }}>
                              <div
                                style={{
                                  maxHeight: "140px",
                                  overflowY: "auto",
                                }}
                              >
                                <ul className="mb-0 ps-3">
                                  {Array.isArray(order.items) &&
                                    order.items.map((item, idx) => {
                                      const qty = Number(item.quantity || 1);
                                      const unit = Number(
                                        item.product?.price || 0,
                                      );
                                      const total = Number(
                                        (typeof item.totalPrice !==
                                          "undefined" &&
                                        item.totalPrice !== null
                                          ? item.totalPrice
                                          : unit * qty) || 0,
                                      );
                                      const name =
                                        item.product?.name ||
                                        item.name ||
                                        "Product";
                                      return (
                                        <li key={idx} className="small">
                                          <strong>{name}</strong> × {qty} — ₹
                                          {total.toFixed(2)}
                                        </li>
                                      );
                                    })}
                                </ul>
                              </div>
                            </td>
                            <td>
                              <div className="fw-bold">
                                ₹
                                {Number(
                                  order &&
                                    typeof order.totalAmount !== "undefined"
                                    ? order.totalAmount
                                    : 0,
                                ).toFixed(2)}
                              </div>
                              <div className="text-muted small">
                                Items: {(order.items || []).length}
                              </div>
                            </td>
                            <td style={{ maxWidth: "240px" }}>
                              {order.shippingAddress ? (
                                <div className="small text-muted">
                                  {order.shippingAddress.street}
                                  <br />
                                  {order.shippingAddress.city},{" "}
                                  {order.shippingAddress.state}{" "}
                                  {order.shippingAddress.zipCode}
                                  <br />
                                  {order.shippingAddress.country}
                                </div>
                              ) : (
                                <div className="text-muted small">—</div>
                              )}
                            </td>
                            <td>
                              <Badge
                                bg={getStatusBadgeVariant(status)}
                                style={{ fontWeight: 600 }}
                              >
                                {displayStatus}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>

                {/* Mobile: stacked cards for small screens */}
                <div className="d-md-none">
                  {pagedOrders.map((order) => {
                    const oid = order && order._id ? String(order._id) : "";
                    const short = oid ? `#${oid.slice(-8)}` : "—";
                    const dt =
                      order && order.createdAt
                        ? formatDate(order.createdAt)
                        : "—";
                    const total = Number(
                      order && typeof order.totalAmount !== "undefined"
                        ? order.totalAmount
                        : 0,
                    ).toFixed(2);
                    const status =
                      order && order.status ? String(order.status) : "unknown";
                    return (
                      <Card key={oid || Math.random()} className="mb-3">
                        <Card.Body className="p-3">
                          <div className="d-flex">
                            <div className="flex-grow-1">
                              <div className="d-flex justify-content-between align-items-start">
                                <div>
                                  <div className="fw-bold">{short}</div>
                                  <div className="small text-muted">{dt}</div>
                                </div>
                                <div className="text-end">
                                  <Badge
                                    bg={getStatusBadgeVariant(status)}
                                    style={{ fontWeight: 600 }}
                                  >
                                    {status.charAt(0).toUpperCase() +
                                      status.slice(1)}
                                  </Badge>
                                </div>
                              </div>

                              <div className="mt-2 small">
                                <div className="fw-bold">Total: ₹{total}</div>
                                <div className="text-muted">
                                  Items: {(order.items || []).length}
                                </div>
                                <div className="mt-2">
                                  {order.shippingAddress ? (
                                    <div className="small text-muted">
                                      {order.shippingAddress.street || ""}
                                      {order.shippingAddress.city
                                        ? ", " + order.shippingAddress.city
                                        : ""}
                                    </div>
                                  ) : (
                                    <div className="small text-muted">—</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    );
                  })}
                </div>
              </Card.Body>
            </Card>
          )}
          <Row className="align-items-center mt-3 mb-4">
            <Col xs={12}>
              <div className="d-flex justify-content-md-end justify-content-center align-items-center gap-3">
                <div className="d-flex align-items-center">
                  <label className="small me-2 mb-0">Rows:</label>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10) || 10;
                      setPageSize(v);
                      setCurrentPage(1);
                    }}
                    className="form-select form-select-sm d-inline-block"
                    style={{ width: 90 }}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                <div className="small text-muted">
                  Page {current} of {totalPages}
                </div>

                <Pagination
                  size="sm"
                  aria-label="Orders pagination"
                  className="mb-0"
                >
                  <Pagination.First
                    onClick={() => setCurrentPage(1)}
                    disabled={current === 1}
                  />
                  <Pagination.Prev
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={current === 1}
                  />
                  {paginationItems}
                  <Pagination.Next
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={current === totalPages}
                  />
                  <Pagination.Last
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={current === totalPages}
                  />
                </Pagination>
              </div>
            </Col>
          </Row>
        </Container>
      </Container>
    </>
  );
}
