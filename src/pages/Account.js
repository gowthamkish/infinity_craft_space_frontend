import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Badge from "react-bootstrap/Badge";
import Modal from "react-bootstrap/Modal";
import api from "../api/axios";
import Header from "../components/header";
import { addToCart } from "../features/cartSlice";

export default function Account() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [addresses, setAddresses] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  const [editingAddress, setEditingAddress] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchAddresses = async () => {
    try {
      const res = await api.get("/api/auth/addresses");
      setAddresses(res.data.addresses || []);
    } catch (err) {
      console.error(
        "Failed to load addresses",
        err.response?.data || err.message,
      );
    }
  };

  const fetchWishlist = async () => {
    try {
      const res = await api.get("/api/auth/wishlist");
      setWishlist(res.data.wishlist || []);
    } catch (err) {
      console.error(
        "Failed to load wishlist",
        err.response?.data || err.message,
      );
    }
  };

  useEffect(() => {
    fetchAddresses();
    fetchWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDeleteAddress = async (id) => {
    try {
      await api.delete(`/api/auth/addresses/${id}`);
      fetchAddresses();
    } catch (err) {
      console.error("Delete address failed", err.response?.data || err.message);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await api.post(`/api/auth/addresses/${id}/default`);
      fetchAddresses();
    } catch (err) {
      console.error("Set default failed", err.response?.data || err.message);
    }
  };

  const openEdit = (addr) => {
    setEditingAddress({ ...addr });
    setShowEditModal(true);
  };

  const saveEdit = async () => {
    try {
      const id = editingAddress._id;
      await api.put(`/api/auth/addresses/${id}`, editingAddress);
      setShowEditModal(false);
      fetchAddresses();
    } catch (err) {
      console.error("Update address failed", err.response?.data || err.message);
    }
  };

  const handleRemoveWishlist = async (productId) => {
    try {
      await api.delete(`/api/auth/wishlist/${productId}`);
      fetchWishlist();
    } catch (err) {
      console.error(
        "Remove wishlist failed",
        err.response?.data || err.message,
      );
    }
  };

  const moveToCart = (product) => {
    // Add to cart and go to checkout
    dispatch(addToCart({ product, quantity: 1 }));
    navigate("/checkout");
  };

  return (
    <div>
      <Header />
      <Container style={{ paddingTop: 110 }}>
        <h2 className="mb-4">My Account</h2>
        <Row>
          <Col md={6} className="mb-4">
            <Card>
              <Card.Header>
                <strong>Address Book</strong>
              </Card.Header>
              <Card.Body>
                {addresses.length === 0 ? (
                  <div>No saved addresses yet.</div>
                ) : (
                  <div style={{ display: "grid", gap: "0.75rem" }}>
                    {addresses.map((a) => (
                      <div
                        key={a._id}
                        style={{
                          border: "1px solid var(--border-color)",
                          padding: "0.75rem",
                          borderRadius: 8,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 600 }}>
                              {a.label || `${a.city}, ${a.state}`}
                              {a.isDefault && (
                                <Badge bg="success" className="ms-2">
                                  Default
                                </Badge>
                              )}
                            </div>
                            <div style={{ color: "var(--text-secondary)" }}>
                              {a.street}, {a.city}, {a.state} {a.zipCode}
                            </div>
                            <div style={{ color: "var(--text-secondary)" }}>
                              📞 {a.phone}
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() => openEdit(a)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-secondary"
                              onClick={() => handleSetDefault(a._id)}
                            >
                              Set Default
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => handleDeleteAddress(a._id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} className="mb-4">
            <Card>
              <Card.Header>
                <strong>Wishlist</strong>
              </Card.Header>
              <Card.Body>
                {wishlist.length === 0 ? (
                  <div>Your wishlist is empty.</div>
                ) : (
                  <div style={{ display: "grid", gap: "0.75rem" }}>
                    {wishlist.map((p) => (
                      <div
                        key={p._id}
                        style={{
                          border: "1px solid var(--border-color)",
                          padding: "0.75rem",
                          borderRadius: 8,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600 }}>{p.name}</div>
                          <div style={{ color: "var(--text-secondary)" }}>
                            ₹{p.price}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => moveToCart(p)}
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleRemoveWishlist(p._id)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Address</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {editingAddress && (
              <Form>
                <Form.Group className="mb-2">
                  <Form.Label>Label</Form.Label>
                  <Form.Control
                    value={editingAddress.label || ""}
                    onChange={(e) =>
                      setEditingAddress((prev) => ({
                        ...prev,
                        label: e.target.value,
                      }))
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Street</Form.Label>
                  <Form.Control
                    value={editingAddress.street || ""}
                    onChange={(e) =>
                      setEditingAddress((prev) => ({
                        ...prev,
                        street: e.target.value,
                      }))
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>City</Form.Label>
                  <Form.Control
                    value={editingAddress.city || ""}
                    onChange={(e) =>
                      setEditingAddress((prev) => ({
                        ...prev,
                        city: e.target.value,
                      }))
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>State</Form.Label>
                  <Form.Control
                    value={editingAddress.state || ""}
                    onChange={(e) =>
                      setEditingAddress((prev) => ({
                        ...prev,
                        state: e.target.value,
                      }))
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>ZIP Code</Form.Label>
                  <Form.Control
                    value={editingAddress.zipCode || ""}
                    onChange={(e) =>
                      setEditingAddress((prev) => ({
                        ...prev,
                        zipCode: e.target.value,
                      }))
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    value={editingAddress.phone || ""}
                    onChange={(e) =>
                      setEditingAddress((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Check
                    type="checkbox"
                    label="Set as default"
                    checked={!!editingAddress.isDefault}
                    onChange={(e) =>
                      setEditingAddress((prev) => ({
                        ...prev,
                        isDefault: e.target.checked,
                      }))
                    }
                  />
                </Form.Group>
              </Form>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={saveEdit}>
              Save
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
}
