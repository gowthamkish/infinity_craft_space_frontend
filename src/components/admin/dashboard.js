import React from "react";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Header from "../../components/header";
import { useNavigate } from "react-router-dom";
import Spinner from "react-bootstrap/Spinner";
import { FiUsers, FiPackage, FiTrendingUp, FiPlus, FiBarChart, FiShoppingCart } from "react-icons/fi";
import { useDashboardCounts } from "../../hooks/useSmartFetch";

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: dashboardCounts, loading, error } = useDashboardCounts();

  return (
    <div className="App">
      <Header />
      <div 
        className="main-container" 
        style={{ 
          backgroundColor: "#f8fafc", 
          minHeight: "100vh",
          paddingTop: "2rem"
        }}
      >
        <Container fluid className="px-3 px-md-4">
          {/* Dashboard Header */}
          <Row className="mb-5">
            <Col>
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
                <div>
                  <h1 
                    className="mb-2"
                    style={{
                      fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
                      fontWeight: "700",
                      color: "var(--text-primary)",
                      background: "linear-gradient(135deg, #1e293b, #334155)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent"
                    }}
                  >
                    <FiBarChart size={40} className="me-3" style={{ color: "#3b82f6" }} />
                    Admin Dashboard
                  </h1>
                  <p 
                    className="mb-0"
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "1.1rem"
                    }}
                  >
                    Welcome to your admin control panel. Manage your store efficiently.
                  </p>
                </div>
                <Badge 
                  bg="success" 
                  className="mt-3 mt-md-0"
                  style={{
                    fontSize: "0.9rem",
                    padding: "0.5rem 1rem",
                    borderRadius: "20px"
                  }}
                >
                  Online
                </Badge>
              </div>
            </Col>
          </Row>

          {loading ? (
            <Row
              className="justify-content-center align-items-center"
              style={{ minHeight: "300px" }}
            >
              <Col xs="auto" className="text-center">
                <Spinner 
                  animation="border" 
                  role="status"
                  style={{
                    width: "3rem",
                    height: "3rem",
                    color: "var(--primary-color)"
                  }}
                />
                <p className="mt-3" style={{ color: "var(--text-secondary)" }}>
                  Loading dashboard data...
                </p>
              </Col>
            </Row>
          ) : (
            <>
              {/* Statistics Cards */}
              <Row className="g-4 mb-5">
                <Col xs={12} sm={6} lg={4}>
                  <Card
                    className="h-100 border-0 shadow-sm hover-card"
                    style={{
                      borderRadius: "16px",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
                    }}
                    onClick={() => navigate("/admin/users")}
                  >
                    <Card.Body className="p-4 text-white">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div 
                          style={{
                            width: "60px",
                            height: "60px",
                            backgroundColor: "rgba(255, 255, 255, 0.2)",
                            borderRadius: "12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <FiUsers size={28} />
                        </div>
                        <FiTrendingUp size={20} style={{ opacity: 0.7 }} />
                      </div>
                      <h3 
                        className="mb-1"
                        style={{
                          fontSize: "2.5rem",
                          fontWeight: "700",
                          lineHeight: "1"
                        }}
                      >
                        {dashboardCounts?.userCount || 0}
                      </h3>
                      <p className="mb-0" style={{ fontSize: "1.1rem", opacity: 0.9 }}>
                        Total Users
                      </p>
                      <p className="mb-0 mt-2" style={{ fontSize: "0.875rem", opacity: 0.7 }}>
                        Click to manage users
                      </p>
                    </Card.Body>
                  </Card>
                </Col>

                <Col xs={12} sm={6} lg={4}>
                  <Card
                    className="h-100 border-0 shadow-sm hover-card"
                    style={{
                      borderRadius: "16px",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                    }}
                    onClick={() => navigate("/admin/products")}
                  >
                    <Card.Body className="p-4 text-white">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div 
                          style={{
                            width: "60px",
                            height: "60px",
                            backgroundColor: "rgba(255, 255, 255, 0.2)",
                            borderRadius: "12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <FiPackage size={28} />
                        </div>
                        <FiTrendingUp size={20} style={{ opacity: 0.7 }} />
                      </div>
                      <h3 
                        className="mb-1"
                        style={{
                          fontSize: "2.5rem",
                          fontWeight: "700",
                          lineHeight: "1"
                        }}
                      >
                        {dashboardCounts?.productCount || 0}
                      </h3>
                      <p className="mb-0" style={{ fontSize: "1.1rem", opacity: 0.9 }}>
                        Total Products
                      </p>
                      <p className="mb-0 mt-2" style={{ fontSize: "0.875rem", opacity: 0.7 }}>
                        Click to manage products
                      </p>
                    </Card.Body>
                  </Card>
                </Col>

                <Col xs={12} sm={6} lg={4}>
                  <Card
                    className="h-100 border-0 shadow-sm hover-card"
                    style={{
                      borderRadius: "16px",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                    }}
                    onClick={() => navigate("/admin/orders")}
                  >
                    <Card.Body className="p-4 text-white">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div 
                          style={{
                            width: "60px",
                            height: "60px",
                            backgroundColor: "rgba(255, 255, 255, 0.2)",
                            borderRadius: "12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <FiShoppingCart size={28} />
                        </div>
                        <FiTrendingUp size={20} style={{ opacity: 0.7 }} />
                      </div>
                      <h3 
                        className="mb-1"
                        style={{
                          fontSize: "2.5rem",
                          fontWeight: "700",
                          lineHeight: "1"
                        }}
                      >
                        {dashboardCounts?.orderCount || 0}
                      </h3>
                      <p className="mb-0" style={{ fontSize: "1.1rem", opacity: 0.9 }}>
                        Total Orders
                      </p>
                      <p className="mb-0 mt-2" style={{ fontSize: "0.875rem", opacity: 0.7 }}>
                        Click to view orders
                      </p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Quick Actions */}
              <Row>
                <Col>
                  <Card
                    className="border-0 shadow-sm"
                    style={{
                      borderRadius: "16px",
                      background: "white"
                    }}
                  >
                    <Card.Body className="p-4">
                      <h5 
                        className="mb-4"
                        style={{
                          fontWeight: "600",
                          color: "var(--text-primary)"
                        }}
                      >
                        Quick Actions
                      </h5>
                      <Row className="g-3">
                        <Col xs={12} sm={6} md={4}>
                          <Button
                            variant="outline-primary"
                            className="w-100 d-flex align-items-center justify-content-center"
                            style={{
                              borderRadius: "12px",
                              padding: "1rem",
                              border: "2px solid var(--primary-color)",
                              fontWeight: "500"
                            }}
                            onClick={() => navigate("/admin/addProduct")}
                          >
                            <FiPlus size={20} className="me-2" />
                            Add New Product
                          </Button>
                        </Col>
                        <Col xs={12} sm={6} md={4}>
                          <Button
                            variant="outline-success"
                            className="w-100 d-flex align-items-center justify-content-center"
                            style={{
                              borderRadius: "12px",
                              padding: "1rem",
                              border: "2px solid var(--secondary-color)",
                              fontWeight: "500"
                            }}
                            onClick={() => navigate("/admin/users")}
                          >
                            <FiUsers size={20} className="me-2" />
                            Manage Users
                          </Button>
                        </Col>
                        <Col xs={12} sm={6} md={4}>
                          <Button
                            variant="outline-warning"
                            className="w-100 d-flex align-items-center justify-content-center"
                            style={{
                              borderRadius: "12px",
                              padding: "1rem",
                              border: "2px solid #f59e0b",
                              fontWeight: "500",
                              color: "#f59e0b"
                            }}
                            onClick={() => navigate("/admin/orders")}
                          >
                            <FiShoppingCart size={20} className="me-2" />
                            View Orders
                          </Button>
                        </Col>
                        <Col xs={12} sm={6} md={4}>
                          <Button
                            variant="outline-info"
                            className="w-100 d-flex align-items-center justify-content-center"
                            style={{
                              borderRadius: "12px",
                              padding: "1rem",
                              border: "2px solid #0dcaf0",
                              fontWeight: "500",
                              color: "#0dcaf0"
                            }}
                            onClick={() => navigate("/admin/categories")}
                          >
                            <FiPackage size={20} className="me-2" />
                            Manage Categories
                          </Button>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </>
          )}
        </Container>
      </div>

      <style>{`
        .hover-card:hover {
          transform: translateY(-4px) !important;
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04) !important;
        }
      `}</style>
    </div>
  );
}
