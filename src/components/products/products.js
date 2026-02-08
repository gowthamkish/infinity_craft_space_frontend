import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import Header from "../header";
import Table from "react-bootstrap/Table";
import {
  Container,
  Breadcrumb,
  Button,
  Spinner,
  Card,
  Row,
  Col,
  Badge,
  Modal,
} from "react-bootstrap";
import {
  FiArrowLeft,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiPackage,
  FiSearch,
  FiFilter,
} from "react-icons/fi";
import { useProducts } from "../../hooks/useSmartFetch";
import { deleteProduct } from "../../features/productsSlice";

// Helper function to format date and time
const formatDateTime = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return {
    date: date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    time: date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
  };
};

const ProductList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data: products = [], loading = false } = useProducts() || {};
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleEdit = (product) => {
    debugger;
    navigate(`/admin/addProduct/${product?._id}`, {
      state: { product },
    });
  };

  const handleDeleteClick = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await dispatch(deleteProduct(selectedProduct._id)).unwrap();
      setShowDeleteModal(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error("Error deleting product:", error);
      // You could add error handling UI here
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredProducts =
    products && Array.isArray(products)
      ? products.filter((product) => {
          const matchesSearch =
            product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product?.category?.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesCategory =
            selectedCategory === "all" ||
            product?.category === selectedCategory;
          return matchesSearch && matchesCategory;
        })
      : [];

  const categories =
    products && Array.isArray(products)
      ? [...new Set(products.map((p) => p?.category).filter(Boolean))]
      : [];

  const getStatusBadge = (product) => {
    // You can customize this based on your product status logic
    return <Badge bg="success">Active</Badge>;
  };

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
        {/* Header Section */}
        <div className="mb-4">
          <Breadcrumb className="mb-3">
            <Breadcrumb.Item
              onClick={() => navigate("/admin/dashboard")}
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                color: "#495057",
              }}
            >
              <FiArrowLeft style={{ marginRight: 4 }} />
              Dashboard
            </Breadcrumb.Item>
            <Breadcrumb.Item active style={{ color: "#343a40" }}>
              Products
            </Breadcrumb.Item>
          </Breadcrumb>

          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
            <div className="mb-3 mb-md-0">
              <h1
                className="text-dark mb-2"
                style={{
                  fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
                  fontWeight: "700",
                }}
              >
                <FiPackage className="me-3" />
                Product Management
              </h1>
              <p
                className="text-muted mb-0"
                style={{ fontSize: "clamp(0.9rem, 2vw, 1.1rem)" }}
              >
                Manage your product inventory
              </p>
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate("/admin/addProduct")}
              className="shadow-sm"
              style={{
                borderRadius: "12px",
                fontWeight: "600",
                padding: "12px 24px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                border: "none",
              }}
            >
              <FiPlus className="me-2" />
              Add New Product
            </Button>
          </div>
        </div>

        {/* Filters and Search */}
        <Card
          className="mb-4 border-0 shadow-sm"
          style={{ borderRadius: "16px" }}
        >
          <Card.Body>
            <Row className="g-3">
              <Col md={6}>
                <div className="position-relative">
                  <FiSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                  <input
                    type="text"
                    className="form-control ps-5"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      borderRadius: "12px",
                      border: "2px solid #e9ecef",
                      fontSize: "1rem",
                      padding: "12px 12px 12px 2.5rem",
                    }}
                  />
                </div>
              </Col>
              <Col md={6}>
                <div className="position-relative">
                  <FiFilter className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                  <select
                    className="form-control ps-5"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    style={{
                      borderRadius: "12px",
                      border: "2px solid #e9ecef",
                      fontSize: "1rem",
                      padding: "12px 12px 12px 2.5rem",
                    }}
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Products Content */}
        {loading ? (
          <Card className="border-0 shadow-sm" style={{ borderRadius: "16px" }}>
            <Card.Body>
              <div
                className="d-flex justify-content-center align-items-center"
                style={{ minHeight: "300px" }}
              >
                <div className="text-center">
                  <Spinner
                    animation="border"
                    role="status"
                    style={{ width: "3rem", height: "3rem" }}
                  />
                  <p className="mt-3 text-muted">Loading products...</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        ) : (
          <Card className="border-0 shadow-sm" style={{ borderRadius: "16px" }}>
            <Card.Body className="p-0">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-5">
                  <FiPackage size={64} className="text-muted mb-3" />
                  <h4 className="text-muted">No products found</h4>
                  <p className="text-muted">
                    Try adjusting your search or filters
                  </p>
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="d-none d-lg-block">
                    <Table responsive className="mb-0">
                      <thead
                        style={{
                          background:
                            "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                        }}
                      >
                        <tr>
                          <th
                            style={{
                              border: "none",
                              padding: "1rem",
                              fontWeight: "600",
                              color: "#495057",
                            }}
                          >
                            Image
                          </th>
                          <th
                            style={{
                              border: "none",
                              padding: "1rem",
                              fontWeight: "600",
                              color: "#495057",
                            }}
                          >
                            Product
                          </th>
                          <th
                            style={{
                              border: "none",
                              padding: "1rem",
                              fontWeight: "600",
                              color: "#495057",
                            }}
                          >
                            Price
                          </th>
                          <th
                            style={{
                              border: "none",
                              padding: "1rem",
                              fontWeight: "600",
                              color: "#495057",
                            }}
                          >
                            Category
                          </th>
                          <th
                            style={{
                              border: "none",
                              padding: "1rem",
                              fontWeight: "600",
                              color: "#495057",
                            }}
                          >
                            Stock
                          </th>
                          <th
                            style={{
                              border: "none",
                              padding: "1rem",
                              fontWeight: "600",
                              color: "#495057",
                            }}
                          >
                            Status
                          </th>
                          <th
                            style={{
                              border: "none",
                              padding: "1rem",
                              fontWeight: "600",
                              color: "#495057",
                            }}
                          >
                            Last Edited By
                          </th>
                          <th
                            style={{
                              border: "none",
                              padding: "1rem",
                              fontWeight: "600",
                              color: "#495057",
                            }}
                          >
                            Last Edited At
                          </th>
                          <th
                            style={{
                              border: "none",
                              padding: "1rem",
                              fontWeight: "600",
                              color: "#495057",
                              textAlign: "center",
                            }}
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map((product, index) => (
                          <tr
                            key={product._id || product.id}
                            style={{ borderBottom: "1px solid #f1f3f4" }}
                          >
                            <td style={{ border: "none", padding: "1rem" }}>
                              {/* Multiple Images Display */}
                              <div className="d-flex align-items-center">
                                {product?.images?.length > 0 ? (
                                  <div className="d-flex">
                                    {/* Primary Image */}
                                    <img
                                      src={product.images[0].url}
                                      alt={product.name}
                                      style={{
                                        width: "50px",
                                        height: "50px",
                                        objectFit: "cover",
                                        borderRadius: "6px",
                                        border: "2px solid #e9ecef",
                                      }}
                                      onError={(e) => {
                                        e.target.style.display = "none";
                                      }}
                                    />
                                    {/* Additional Images Count */}
                                    {product.images.length > 1 && (
                                      <div
                                        className="ms-1 d-flex align-items-center justify-content-center bg-primary text-white"
                                        style={{
                                          width: "20px",
                                          height: "20px",
                                          borderRadius: "50%",
                                          fontSize: "10px",
                                          fontWeight: "bold",
                                        }}
                                      >
                                        +{product.images.length - 1}
                                      </div>
                                    )}
                                  </div>
                                ) : product?.image?.url ? (
                                  // Backward compatibility for single image
                                  <img
                                    src={product.image.url}
                                    alt={product.name}
                                    style={{
                                      width: "50px",
                                      height: "50px",
                                      objectFit: "cover",
                                      borderRadius: "6px",
                                      border: "2px solid #e9ecef",
                                    }}
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                    }}
                                  />
                                ) : (
                                  <div
                                    style={{
                                      width: "50px",
                                      height: "50px",
                                      backgroundColor: "#f8f9fa",
                                      borderRadius: "6px",
                                      border: "2px solid #e9ecef",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <FiPackage size={20} color="#6c757d" />
                                  </div>
                                )}
                              </div>
                            </td>
                            <td style={{ border: "none", padding: "1rem" }}>
                              <div>
                                <h6
                                  className="mb-1"
                                  style={{
                                    fontWeight: "600",
                                    color: "#212529",
                                  }}
                                >
                                  {product?.name}
                                </h6>
                                <small
                                  className="text-muted"
                                  style={{
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                  }}
                                >
                                  {product?.description}
                                </small>
                              </div>
                            </td>
                            <td style={{ border: "none", padding: "1rem" }}>
                              <span
                                style={{
                                  fontWeight: "600",
                                  color: "#28a745",
                                  fontSize: "1.1rem",
                                }}
                              >
                                ₹{product?.price}
                              </span>
                            </td>
                            <td style={{ border: "none", padding: "1rem" }}>
                              <Badge
                                bg="primary"
                                style={{
                                  borderRadius: "8px",
                                  padding: "0.5rem 0.75rem",
                                }}
                              >
                                {product?.category}
                              </Badge>
                              {product?.subCategory && (
                                <Badge
                                  bg="secondary"
                                  className="ms-1"
                                  style={{
                                    borderRadius: "8px",
                                    padding: "0.3rem 0.5rem",
                                    fontSize: "0.7rem",
                                  }}
                                >
                                  {product?.subCategory}
                                </Badge>
                              )}
                            </td>
                            <td style={{ border: "none", padding: "1rem" }}>
                              {product?.trackInventory === false ? (
                                <Badge
                                  bg="secondary"
                                  style={{
                                    borderRadius: "8px",
                                    padding: "0.5rem 0.75rem",
                                  }}
                                >
                                  Unlimited
                                </Badge>
                              ) : product?.stock === undefined ||
                                product?.stock === null ? (
                                <Badge
                                  bg="info"
                                  style={{
                                    borderRadius: "8px",
                                    padding: "0.5rem 0.75rem",
                                  }}
                                >
                                  Not Set
                                </Badge>
                              ) : product?.stock <= 0 ? (
                                <Badge
                                  bg="danger"
                                  style={{
                                    borderRadius: "8px",
                                    padding: "0.5rem 0.75rem",
                                  }}
                                >
                                  Out of Stock
                                </Badge>
                              ) : product?.stock <=
                                (product?.lowStockThreshold || 5) ? (
                                <Badge
                                  bg="warning"
                                  text="dark"
                                  style={{
                                    borderRadius: "8px",
                                    padding: "0.5rem 0.75rem",
                                  }}
                                >
                                  Low: {product?.stock}
                                </Badge>
                              ) : (
                                <Badge
                                  bg="success"
                                  style={{
                                    borderRadius: "8px",
                                    padding: "0.5rem 0.75rem",
                                  }}
                                >
                                  {product?.stock}
                                </Badge>
                              )}
                            </td>
                            <td style={{ border: "none", padding: "1rem" }}>
                              {getStatusBadge(product)}
                            </td>
                            <td style={{ border: "none", padding: "1rem" }}>
                              {product?.lastEditedBy ? (
                                <div>
                                  <h6
                                    className="mb-1"
                                    style={{
                                      fontWeight: "600",
                                      color: "#212529",
                                      fontSize: "0.9rem",
                                    }}
                                  >
                                    {product?.lastEditedBy?.name ||
                                      product?.lastEditedBy?.email ||
                                      "N/A"}
                                  </h6>
                                  <small
                                    className="text-muted"
                                    style={{ fontSize: "0.75rem" }}
                                  >
                                    {product?.lastEditedBy?.email}
                                  </small>
                                </div>
                              ) : (
                                <span className="text-muted">Not edited</span>
                              )}
                            </td>
                            <td style={{ border: "none", padding: "1rem" }}>
                              {product?.lastEditedAt ? (
                                <div>
                                  <p
                                    className="mb-1"
                                    style={{
                                      fontWeight: "500",
                                      fontSize: "0.9rem",
                                      color: "#212529",
                                    }}
                                  >
                                    {formatDateTime(product.lastEditedAt)?.date}
                                  </p>
                                  <small
                                    className="text-muted"
                                    style={{ fontSize: "0.75rem" }}
                                  >
                                    {formatDateTime(product.lastEditedAt)?.time}
                                  </small>
                                </div>
                              ) : (
                                <span className="text-muted">N/A</span>
                              )}
                            </td>
                            <td
                              style={{
                                border: "none",
                                padding: "1rem",
                                textAlign: "center",
                              }}
                            >
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleEdit(product)}
                                className="me-2"
                                style={{
                                  borderRadius: "8px",
                                  fontWeight: "500",
                                }}
                              >
                                <FiEdit2 className="me-1" />
                                Edit
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDeleteClick(product)}
                                style={{
                                  borderRadius: "8px",
                                  fontWeight: "500",
                                }}
                              >
                                <FiTrash2 className="me-1" />
                                Delete
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
                      {filteredProducts.map((product, index) => (
                        <Card
                          key={product._id || product.id}
                          className="mb-3 border-0 shadow-sm"
                          style={{ borderRadius: "12px" }}
                        >
                          <Card.Body>
                            <div className="d-flex align-items-start mb-3">
                              {/* Multiple Product Images */}
                              <div className="me-3">
                                {product?.images?.length > 0 ? (
                                  <div className="position-relative">
                                    {/* Primary Image */}
                                    <img
                                      src={product.images[0].url}
                                      alt={product.name}
                                      style={{
                                        width: "80px",
                                        height: "80px",
                                        objectFit: "cover",
                                        borderRadius: "12px",
                                        border: "2px solid #e9ecef",
                                      }}
                                      onError={(e) => {
                                        e.target.style.display = "none";
                                      }}
                                    />
                                    {/* Images Count Badge */}
                                    {product.images.length > 1 && (
                                      <div
                                        className="position-absolute top-0 end-0 bg-primary text-white"
                                        style={{
                                          fontSize: "10px",
                                          padding: "2px 6px",
                                          borderRadius: "8px",
                                          fontWeight: "bold",
                                          transform: "translate(25%, -25%)",
                                        }}
                                      >
                                        {product.images.length}
                                      </div>
                                    )}
                                  </div>
                                ) : product?.image?.url ? (
                                  // Backward compatibility for single image
                                  <img
                                    src={product.image.url}
                                    alt={product.name}
                                    style={{
                                      width: "80px",
                                      height: "80px",
                                      objectFit: "cover",
                                      borderRadius: "12px",
                                      border: "2px solid #e9ecef",
                                    }}
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                    }}
                                  />
                                ) : (
                                  <div
                                    style={{
                                      width: "80px",
                                      height: "80px",
                                      backgroundColor: "#f8f9fa",
                                      borderRadius: "12px",
                                      border: "2px solid #e9ecef",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <FiPackage size={32} color="#6c757d" />
                                  </div>
                                )}
                              </div>

                              {/* Product Info */}
                              <div className="flex-grow-1">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <h6
                                    className="mb-0"
                                    style={{
                                      fontWeight: "600",
                                      color: "#212529",
                                    }}
                                  >
                                    {product?.name}
                                  </h6>
                                  {getStatusBadge(product)}
                                </div>
                              </div>
                            </div>

                            <p
                              className="text-muted small mb-2"
                              style={{
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {product?.description}
                            </p>

                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <span
                                style={{
                                  fontWeight: "600",
                                  color: "#28a745",
                                  fontSize: "1.2rem",
                                }}
                              >
                                ₹{product?.price}
                              </span>
                              <div className="d-flex align-items-center gap-2">
                                {/* Stock Badge */}
                                {product?.trackInventory === false ? (
                                  <Badge
                                    bg="secondary"
                                    style={{ borderRadius: "8px" }}
                                  >
                                    Unlimited
                                  </Badge>
                                ) : product?.stock === undefined ||
                                  product?.stock === null ? (
                                  <Badge
                                    bg="info"
                                    style={{ borderRadius: "8px" }}
                                  >
                                    Not Set
                                  </Badge>
                                ) : product?.stock <= 0 ? (
                                  <Badge
                                    bg="danger"
                                    style={{ borderRadius: "8px" }}
                                  >
                                    Out of Stock
                                  </Badge>
                                ) : product?.stock <=
                                  (product?.lowStockThreshold || 5) ? (
                                  <Badge
                                    bg="warning"
                                    text="dark"
                                    style={{ borderRadius: "8px" }}
                                  >
                                    Low: {product?.stock}
                                  </Badge>
                                ) : (
                                  <Badge
                                    bg="success"
                                    style={{ borderRadius: "8px" }}
                                  >
                                    Stock: {product?.stock}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <div className="d-flex flex-wrap gap-1 mb-3">
                              <Badge
                                bg="primary"
                                className="me-1"
                                style={{ borderRadius: "8px" }}
                              >
                                {product?.category}
                              </Badge>
                              {product?.subCategory && (
                                <Badge
                                  bg="secondary"
                                  style={{
                                    borderRadius: "8px",
                                    fontSize: "0.7rem",
                                  }}
                                >
                                  {product?.subCategory}
                                </Badge>
                              )}
                            </div>

                            {/* Last Edited Info for Mobile */}
                            <div
                              className="mb-3"
                              style={{
                                padding: "0.75rem",
                                backgroundColor: "#f8f9fa",
                                borderRadius: "8px",
                              }}
                            >
                              <p
                                className="mb-1"
                                style={{
                                  fontSize: "0.85rem",
                                  fontWeight: "600",
                                  color: "#495057",
                                }}
                              >
                                Last Edited By:
                              </p>
                              {product?.lastEditedBy ? (
                                <div>
                                  <p
                                    className="mb-1"
                                    style={{
                                      fontSize: "0.9rem",
                                      color: "#212529",
                                      fontWeight: "500",
                                    }}
                                  >
                                    {product?.lastEditedBy?.name ||
                                      product?.lastEditedBy?.email ||
                                      "N/A"}
                                  </p>
                                  <small className="text-muted">
                                    {product?.lastEditedBy?.email}
                                  </small>
                                </div>
                              ) : (
                                <span className="text-muted">Not edited</span>
                              )}
                              <hr className="my-2" />
                              <p
                                className="mb-1"
                                style={{
                                  fontSize: "0.85rem",
                                  fontWeight: "600",
                                  color: "#495057",
                                }}
                              >
                                Last Edited At:
                              </p>
                              {product?.lastEditedAt ? (
                                <div>
                                  <p
                                    className="mb-0"
                                    style={{
                                      fontSize: "0.9rem",
                                      color: "#212529",
                                      fontWeight: "500",
                                    }}
                                  >
                                    {formatDateTime(product.lastEditedAt)?.date}
                                  </p>
                                  <small className="text-muted">
                                    {formatDateTime(product.lastEditedAt)?.time}
                                  </small>
                                </div>
                              ) : (
                                <span className="text-muted">N/A</span>
                              )}
                            </div>

                            <div className="d-grid gap-2 d-md-flex">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleEdit(product)}
                                className="flex-fill"
                                style={{
                                  borderRadius: "8px",
                                  fontWeight: "500",
                                }}
                              >
                                <FiEdit2 className="me-1" />
                                Edit
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDeleteClick(product)}
                                className="flex-fill"
                                style={{
                                  borderRadius: "8px",
                                  fontWeight: "500",
                                }}
                              >
                                <FiTrash2 className="me-1" />
                                Delete
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

        {/* Delete Confirmation Modal */}
        <Modal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          centered
        >
          <Modal.Header
            closeButton
            style={{ borderBottom: "none", paddingBottom: 0 }}
          >
            <Modal.Title style={{ color: "#dc3545", fontWeight: "600" }}>
              <FiTrash2 className="me-2" />
              Confirm Delete
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ paddingTop: "1rem" }}>
            <p className="mb-0">
              Are you sure you want to delete{" "}
              <strong>{selectedProduct?.name}</strong>? This action cannot be
              undone.
            </p>
          </Modal.Body>
          <Modal.Footer style={{ borderTop: "none", paddingTop: 0 }}>
            <Button
              variant="outline-secondary"
              onClick={() => setShowDeleteModal(false)}
              style={{ borderRadius: "8px" }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
              disabled={deleteLoading}
              style={{ borderRadius: "8px", fontWeight: "500" }}
            >
              {deleteLoading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-1"
                  />
                  Deleting...
                </>
              ) : (
                <>
                  <FiTrash2 className="me-1" />
                  Delete Product
                </>
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
};

export default ProductList;
