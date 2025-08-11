import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, removeFromCart } from "../features/cartSlice";
import Header from "../components/header";
import api from "../api/axios";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Spinner from "react-bootstrap/Spinner";

export default function Home() {
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const cart = useSelector((state) => state.cart.items);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await api.get("/api/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  return (
    <div>
      <Header />
      <Container className="mt-4">
        <h1 className="mb-4 text-center">Product Listings</h1>
        {loading ? (
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ minHeight: "200px" }}
          >
            <Spinner animation="border" role="status" variant="primary">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : (
          <>
            {products.length === 0 && (
              <div className="text-center">No products available</div>
            )}
            <Row xs={1} sm={2} md={3} lg={4} className="g-4">
              {products.length > 0 &&
                products.map((product) => (
                  <Col key={product._id}>
                    <Card className="h-100">
                      <Card.Img
                        variant="top"
                        src={
                          product.image ||
                          "https://via.placeholder.com/200x200?text=No+Image"
                        }
                        style={{
                          objectFit: "contain",
                          height: "200px",
                          background: "#f8f8f8",
                        }}
                      />
                      <Card.Body className="d-flex flex-column">
                        <Card.Title>{product.name}</Card.Title>
                        <Card.Text>
                          <strong>₹{product.price}</strong>
                          <br />
                          <span style={{ color: "#555" }}>
                            {product.description}
                          </span>
                        </Card.Text>
                        <div className="mt-auto d-flex gap-2">
                          <Button
                            variant="success"
                            onClick={() =>
                              dispatch(addToCart({ product, quantity: 1 }))
                            }
                          >
                            +
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() =>
                              dispatch(removeFromCart({ product }))
                            }
                          >
                            -
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
            </Row>
          </>
        )}
      </Container>
    </div>
  );
}
