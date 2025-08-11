import React, { useEffect, useState } from "react";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Header from "../../components/header";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [userCount, setUserCount] = useState(0);
  const [productCount, setProductCount] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      const token = localStorage.getItem("token");
      // Replace these endpoints with your actual API endpoints for counts
      const usersRes = await api.get("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const productsRes = await api.get("/api/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserCount(usersRes.data.length);
      setProductCount(productsRes.data.length);
    };
    fetchCounts();
  }, []);

  return (
    <div>
      <Header />
      <Container className="mt-5">
        <Row className="justify-content-center">
          <Col xs={12} md={6} lg={4}>
            <Card
              onClick={() => navigate("/admin/users")}
              bg="primary"
              text="white"
              className="mb-4 text-center"
            >
              <Card.Body>
                <Card.Title>Users</Card.Title>
                <Card.Text style={{ fontSize: "2rem" }}>{userCount}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} md={6} lg={4}>
            <Card
              onClick={() => navigate("/admin/products")}
              bg="success"
              text="white"
              className="mb-4 text-center"
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
      </Container>
    </div>
  );
}
