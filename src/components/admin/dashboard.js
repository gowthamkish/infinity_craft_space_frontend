import React, { useEffect, useState } from "react";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Header from "../../components/header";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import Spinner from "react-bootstrap/Spinner";

export default function Dashboard() {
  const navigate = useNavigate();
  const [userCount, setUserCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      const usersRes = await api.get("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const productsRes = await api.get("/api/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserCount(usersRes.data.length);
      setProductCount(productsRes.data.length);
      setLoading(false);
    };
    fetchCounts();
  }, []);

  return (
    <div>
      <Header />
      <Container className="mt-5">
        <Row>
          <Col md={12} className="text-left mb-4">
            <h1>Dashboard</h1>
          </Col>
        </Row>
        {loading ? (
          <Row
            className="justify-content-center align-items-center"
            style={{ minHeight: "200px" }}
          >
            <Col xs="auto">
              <Spinner size="md" variant="primary" animation="border" role="status" />
            </Col>
          </Row>
        ) : (
          <Row className="justify-content-center">
            <Col xs={12} md={6} lg={4}>
              <Card
                onClick={() => navigate("/admin/users")}
                bg="primary"
                text="white"
                className="mb-4 text-center"
                style={{ cursor: "pointer" }}
              >
                <Card.Body>
                  <Card.Title>Users</Card.Title>
                  <Card.Text style={{ fontSize: "2rem" }}>
                    {userCount}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} md={6} lg={4}>
              <Card
                onClick={() => navigate("/admin/products")}
                bg="success"
                text="white"
                className="mb-4 text-center"
                style={{ cursor: "pointer" }}
              >
                <Card.Body>
                  <Card.Title>Products</Card.Title>
                  <Card.Text style={{ fontSize: "2rem" }}>
                    {productCount}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
}
