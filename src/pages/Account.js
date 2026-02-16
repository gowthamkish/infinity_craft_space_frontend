import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Badge from "react-bootstrap/Badge";
import Modal from "react-bootstrap/Modal";
import Spinner from "react-bootstrap/Spinner";
import {
  FiUser,
  FiMapPin,
  FiHeart,
  FiEdit2,
  FiTrash2,
  FiShoppingCart,
  FiCheckCircle,
  FiPhone,
  FiMap,
} from "react-icons/fi";
import api from "../api/axios";
import Header from "../components/header";
import { addToCart } from "../features/cartSlice";

export default function Account() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [addresses, setAddresses] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

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
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchAddresses(), fetchWishlist()]);
      setLoading(false);
    };
    fetchData();
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
    <div
      style={{
        background: "linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)",
        minHeight: "100vh",
      }}
    >
      <Header />
      <Container className="main-container" style={{ paddingTop: "110px" }}>
        {loading ? (
          <div
            className="d-flex flex-column justify-content-center align-items-center"
            style={{ minHeight: "60vh" }}
          >
            <div className="text-center">
              <div
                style={{
                  width: "100px",
                  height: "100px",
                  margin: "0 auto 2rem",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 10px 30px rgba(99, 102, 241, 0.3)",
                }}
              >
                <Spinner
                  animation="border"
                  role="status"
                  variant="light"
                  style={{
                    width: "3rem",
                    height: "3rem",
                    borderWidth: "0.25em",
                  }}
                >
                  <span className="visually-hidden">Loading account...</span>
                </Spinner>
              </div>
              <h4
                className="mt-3"
                style={{ fontWeight: "700", color: "#1f2937" }}
              >
                Loading your account...
              </h4>
              <p className="text-muted" style={{ fontWeight: "500" }}>
                Please wait while we fetch your addresses and wishlist
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-5">
              <div
                className="d-inline-flex align-items-center justify-content-center mb-3"
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                  boxShadow: "0 10px 30px rgba(99, 102, 241, 0.3)",
                  fontSize: "2.5rem",
                  fontWeight: "800",
                  color: "white",
                }}
              >
                IC
              </div>
              <h1
                className="mb-3"
                style={{
                  fontSize: "clamp(2rem, 4vw, 2.8rem)",
                  fontWeight: "800",
                  letterSpacing: "-0.02em",
                  color: "#1f2937",
                }}
              >
                My Account
              </h1>
              <p
                className="text-muted mb-0"
                style={{
                  fontSize: "clamp(1rem, 2vw, 1.15rem)",
                  fontWeight: "500",
                }}
              >
                Manage addresses and wishlist
              </p>
            </div>

            <div
              className="account-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))",
                gap: "2rem",
                marginBottom: "3rem",
              }}
            >
              <div>
                <Card
                  className="border-0"
                  style={{
                    borderRadius: "24px",
                    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1)",
                    background: "white",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      background: "linear-gradient(135deg, #06b6d4, #0891b2)",
                      padding: "1.5rem 2rem",
                      color: "white",
                    }}
                  >
                    <div className="d-flex align-items-center">
                      <FiMapPin size={28} className="me-3" />
                      <div>
                        <h4
                          className="mb-0"
                          style={{ fontWeight: "700", fontSize: "1.4rem" }}
                        >
                          Address Book
                        </h4>
                        <small style={{ opacity: 0.9 }}>
                          Manage your delivery addresses
                        </small>
                      </div>
                    </div>
                  </div>
                  <Card.Body style={{ padding: "2rem" }}>
                    {addresses.length === 0 ? (
                      <div className="text-center py-5">
                        <FiMapPin
                          size={64}
                          style={{ color: "#cbd5e1", marginBottom: "1rem" }}
                        />
                        <p
                          style={{
                            color: "#64748b",
                            fontSize: "1.1rem",
                            fontWeight: "600",
                          }}
                        >
                          No saved addresses yet.
                        </p>
                        <p style={{ color: "#94a3b8", fontSize: "0.95rem" }}>
                          Add an address to get started with deliveries
                        </p>
                      </div>
                    ) : (
                      <div style={{ display: "grid", gap: "1rem" }}>
                        {addresses.map((a) => (
                          <div
                            key={a._id}
                            style={{
                              padding: "1.5rem",
                              borderRadius: "16px",
                              background: "#f8fafc",
                              border: "2px solid #e2e8f0",
                              transition: "all 0.3s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = "#06b6d4";
                              e.currentTarget.style.boxShadow =
                                "0 4px 16px rgba(6, 182, 212, 0.25)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = "#e2e8f0";
                              e.currentTarget.style.boxShadow = "none";
                            }}
                          >
                            <div className="d-flex justify-content-between align-items-start mb-3">
                              <div>
                                <div
                                  style={{
                                    fontWeight: "700",
                                    fontSize: "1.1rem",
                                    color: "#1f2937",
                                    marginBottom: "0.5rem",
                                  }}
                                >
                                  {a.label || `${a.city}, ${a.state}`}
                                  {a.isDefault && (
                                    <Badge
                                      style={{
                                        marginLeft: "0.75rem",
                                        padding: "6px 12px",
                                        borderRadius: "12px",
                                        background:
                                          "linear-gradient(135deg, #06b6d4, #0891b2)",
                                        border: "none",
                                        fontWeight: "700",
                                        fontSize: "0.75rem",
                                      }}
                                    >
                                      <FiCheckCircle
                                        size={12}
                                        className="me-1"
                                      />
                                      Default
                                    </Badge>
                                  )}
                                </div>
                                <div
                                  style={{
                                    color: "#64748b",
                                    fontSize: "0.95rem",
                                    marginBottom: "0.5rem",
                                  }}
                                >
                                  <FiMap
                                    size={14}
                                    className="me-2"
                                    style={{ display: "inline" }}
                                  />
                                  {a.street}, {a.city}, {a.state} {a.zipCode}
                                </div>
                                <div
                                  style={{
                                    color: "#64748b",
                                    fontSize: "0.95rem",
                                  }}
                                >
                                  <FiPhone
                                    size={14}
                                    className="me-2"
                                    style={{ display: "inline" }}
                                  />
                                  {a.phone}
                                </div>
                              </div>
                            </div>
                            <div className="d-flex gap-2 flex-wrap">
                              <Button
                                size="sm"
                                onClick={() => openEdit(a)}
                                style={{
                                  borderRadius: "12px",
                                  padding: "8px 16px",
                                  fontWeight: "600",
                                  border: "2px solid #6366f1",
                                  color: "white",
                                  background: "#6366f1",
                                  transition: "all 0.3s ease",
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.background = "#4f46e5";
                                  e.target.style.color = "white";
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.background = "#6366f1";
                                  e.target.style.color = "white";
                                }}
                              >
                                <FiEdit2 size={14} className="me-1" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleSetDefault(a._id)}
                                style={{
                                  borderRadius: "12px",
                                  padding: "8px 16px",
                                  fontWeight: "600",
                                  border: "2px solid #06b6d4",
                                  color: "white",
                                  background: "#06b6d4",
                                  transition: "all 0.3s ease",
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.background = "#0891b2";
                                  e.target.style.color = "white";
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.background = "#06b6d4";
                                  e.target.style.color = "white";
                                }}
                              >
                                <FiCheckCircle size={14} className="me-1" />
                                Default
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleDeleteAddress(a._id)}
                                style={{
                                  borderRadius: "12px",
                                  padding: "8px 16px",
                                  fontWeight: "600",
                                  border: "2px solid #fb7185",
                                  color: "white",
                                  background: "#fb7185",
                                  transition: "all 0.3s ease",
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.background = "#e11d48";
                                  e.target.style.color = "white";
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.background = "#fb7185";
                                  e.target.style.color = "white";
                                }}
                              >
                                <FiTrash2 size={14} className="me-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </div>

              <div>
                <Card
                  className="border-0"
                  style={{
                    borderRadius: "24px",
                    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1)",
                    background: "white",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      background: "linear-gradient(135deg, #f43f5e, #e11d48)",
                      padding: "1.5rem 2rem",
                      color: "white",
                    }}
                  >
                    <div className="d-flex align-items-center">
                      <FiHeart size={28} className="me-3" />
                      <div>
                        <h4
                          className="mb-0"
                          style={{ fontWeight: "700", fontSize: "1.4rem" }}
                        >
                          Wishlist
                        </h4>
                        <small style={{ opacity: 0.9 }}>
                          Your favorite products
                        </small>
                      </div>
                    </div>
                  </div>
                  <Card.Body style={{ padding: "2rem" }}>
                    {wishlist.length === 0 ? (
                      <div className="text-center py-5">
                        <FiHeart
                          size={64}
                          style={{ color: "#cbd5e1", marginBottom: "1rem" }}
                        />
                        <p
                          style={{
                            color: "#64748b",
                            fontSize: "1.1rem",
                            fontWeight: "600",
                          }}
                        >
                          Your wishlist is empty.
                        </p>
                        <p style={{ color: "#94a3b8", fontSize: "0.95rem" }}>
                          Add products you love to save them for later
                        </p>
                      </div>
                    ) : (
                      <div style={{ display: "grid", gap: "1rem" }}>
                        {wishlist.map((p) => (
                          <div
                            key={p._id}
                            style={{
                              padding: "1.5rem",
                              borderRadius: "16px",
                              background: "#f8fafc",
                              border: "2px solid #e2e8f0",
                              transition: "all 0.3s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = "#f43f5e";
                              e.currentTarget.style.boxShadow =
                                "0 4px 16px rgba(244, 63, 94, 0.25)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = "#e2e8f0";
                              e.currentTarget.style.boxShadow = "none";
                            }}
                          >
                            <div className="d-flex justify-content-between align-items-start mb-3">
                              <div>
                                <div
                                  style={{
                                    fontWeight: "700",
                                    fontSize: "1.1rem",
                                    color: "#1f2937",
                                    marginBottom: "0.75rem",
                                  }}
                                >
                                  {p.name}
                                </div>
                                <div
                                  style={{
                                    fontSize: "1.3rem",
                                    fontWeight: "800",
                                    background:
                                      "linear-gradient(135deg, #10b981, #059669)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                  }}
                                >
                                  ₹{p.price}
                                </div>
                              </div>
                            </div>
                            <div className="d-flex gap-2 flex-wrap">
                              <Button
                                size="sm"
                                onClick={() => moveToCart(p)}
                                style={{
                                  borderRadius: "12px",
                                  padding: "8px 16px",
                                  fontWeight: "600",
                                  background:
                                    "linear-gradient(135deg, #10b981, #059669)",
                                  border: "none",
                                  color: "white",
                                  transition: "all 0.3s ease",
                                  boxShadow:
                                    "0 4px 12px rgba(16, 185, 129, 0.3)",
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.transform = "translateY(-2px)";
                                  e.target.style.boxShadow =
                                    "0 6px 16px rgba(16, 185, 129, 0.4)";
                                  e.target.style.color = "white";
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.transform = "translateY(0)";
                                  e.target.style.boxShadow =
                                    "0 4px 12px rgba(16, 185, 129, 0.3)";
                                  e.target.style.color = "white";
                                }}
                              >
                                <FiShoppingCart size={14} className="me-1" />
                                Add to Cart
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleRemoveWishlist(p._id)}
                                style={{
                                  borderRadius: "12px",
                                  padding: "8px 16px",
                                  fontWeight: "600",
                                  border: "2px solid #fb7185",
                                  color: "white",
                                  background: "#fb7185",
                                  transition: "all 0.3s ease",
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.background = "#e11d48";
                                  e.target.style.color = "white";
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.background = "#fb7185";
                                  e.target.style.color = "white";
                                }}
                              >
                                <FiTrash2 size={14} className="me-1" />
                                Remove
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </div>
            </div>
          </>
        )}

        <Modal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          centered
        >
          <div style={{ borderRadius: "20px", overflow: "hidden" }}>
            <div
              style={{
                background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                padding: "1.5rem 2rem",
                color: "white",
              }}
            >
              <Modal.Title
                style={{ fontWeight: "700", fontSize: "1.5rem", margin: 0 }}
              >
                <FiEdit2
                  size={24}
                  className="me-2"
                  style={{ display: "inline" }}
                />
                Edit Address
              </Modal.Title>
              <small style={{ opacity: 0.9 }}>
                Update your delivery address
              </small>
            </div>
            <Modal.Body style={{ padding: "2rem" }}>
              {editingAddress && (
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: "600", color: "#1f2937" }}>
                      Label
                    </Form.Label>
                    <Form.Control
                      value={editingAddress.label || ""}
                      onChange={(e) =>
                        setEditingAddress((prev) => ({
                          ...prev,
                          label: e.target.value,
                        }))
                      }
                      style={{
                        borderRadius: "12px",
                        border: "2px solid #e2e8f0",
                        padding: "12px 16px",
                        backgroundColor: "#f8fafc",
                      }}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: "600", color: "#1f2937" }}>
                      Street
                    </Form.Label>
                    <Form.Control
                      value={editingAddress.street || ""}
                      onChange={(e) =>
                        setEditingAddress((prev) => ({
                          ...prev,
                          street: e.target.value,
                        }))
                      }
                      style={{
                        borderRadius: "12px",
                        border: "2px solid #e2e8f0",
                        padding: "12px 16px",
                        backgroundColor: "#f8fafc",
                      }}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: "600", color: "#1f2937" }}>
                      City
                    </Form.Label>
                    <Form.Control
                      value={editingAddress.city || ""}
                      onChange={(e) =>
                        setEditingAddress((prev) => ({
                          ...prev,
                          city: e.target.value,
                        }))
                      }
                      style={{
                        borderRadius: "12px",
                        border: "2px solid #e2e8f0",
                        padding: "12px 16px",
                        backgroundColor: "#f8fafc",
                      }}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: "600", color: "#1f2937" }}>
                      State
                    </Form.Label>
                    <Form.Control
                      value={editingAddress.state || ""}
                      onChange={(e) =>
                        setEditingAddress((prev) => ({
                          ...prev,
                          state: e.target.value,
                        }))
                      }
                      style={{
                        borderRadius: "12px",
                        border: "2px solid #e2e8f0",
                        padding: "12px 16px",
                        backgroundColor: "#f8fafc",
                      }}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: "600", color: "#1f2937" }}>
                      ZIP Code
                    </Form.Label>
                    <Form.Control
                      value={editingAddress.zipCode || ""}
                      onChange={(e) =>
                        setEditingAddress((prev) => ({
                          ...prev,
                          zipCode: e.target.value,
                        }))
                      }
                      style={{
                        borderRadius: "12px",
                        border: "2px solid #e2e8f0",
                        padding: "12px 16px",
                        backgroundColor: "#f8fafc",
                      }}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: "600", color: "#1f2937" }}>
                      Phone
                    </Form.Label>
                    <Form.Control
                      value={editingAddress.phone || ""}
                      onChange={(e) =>
                        setEditingAddress((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      style={{
                        borderRadius: "12px",
                        border: "2px solid #e2e8f0",
                        padding: "12px 16px",
                        backgroundColor: "#f8fafc",
                      }}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
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
                      style={{ fontWeight: "600", color: "#1f2937" }}
                    />
                  </Form.Group>
                </Form>
              )}
            </Modal.Body>
            <Modal.Footer
              style={{
                padding: "1.5rem 2rem",
                background: "#f8fafc",
                border: "none",
              }}
            >
              <Button
                variant="secondary"
                onClick={() => setShowEditModal(false)}
                style={{
                  borderRadius: "12px",
                  padding: "10px 24px",
                  fontWeight: "600",
                  border: "2px solid #e2e8f0",
                  background: "#64748b",
                  color: "white",
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={saveEdit}
                style={{
                  borderRadius: "12px",
                  padding: "10px 24px",
                  fontWeight: "600",
                  background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                  border: "none",
                  color: "white",
                  boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
                }}
              >
                Save Changes
              </Button>
            </Modal.Footer>
          </div>
        </Modal>
      </Container>
    </div>
  );
}
