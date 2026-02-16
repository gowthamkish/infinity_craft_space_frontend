import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Form, Button, Container, Row, Col, Card, Alert, Spinner } from "../ui";
import Breadcrumb from "@mui/material/Breadcrumb";
import {
  FiArrowLeft,
  FiPackage,
  FiSave,
  FiDollarSign,
  FiFileText,
  FiTag,
  FiLayers,
  FiCamera,
  FiX,
} from "react-icons/fi";
import Header from "../header";
import { addProduct, updateProduct } from "../../features/productsSlice";
import { fetchPublicCategories } from "../../features/categoriesSlice";

const AddProduct = () => {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  // Get categories from Redux state
  const {
    publicCategories: categories = [],
    publicCategoriesLoading: categoriesLoading,
  } = useSelector((state) => state.categories);

  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    subCategory: "",
    stock: "",
    lowStockThreshold: "5",
    trackInventory: true,
    estimatedDelivery: "5",
  });

  const [editingId] = useState(params?.id ?? null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: "", variant: "" });
  const [validated, setValidated] = useState(false);

  // Multiple image upload states
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageUploading, setImageUploading] = useState(false);
  const [existingImages, setExistingImages] = useState([]);
  const [dragOver, setDragOver] = useState(false);

  // Get subcategories for selected category from dynamic categories
  const subCategoryOptions = form.category
    ? categories
        .find((cat) => cat.name === form.category)
        ?.subcategories?.filter((sub) => sub.isActive) || []
    : [];

  // Handle multiple image files selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  // Handle files from input or drag & drop
  const handleFiles = (files) => {
    const maxFiles = 10;
    const maxSize = 10 * 1024 * 1024; // 10MB per file

    if (imageFiles.length + files.length > maxFiles) {
      setAlert({
        show: true,
        message: `You can only upload a maximum of ${maxFiles} images`,
        variant: "danger",
      });
      return;
    }

    const validFiles = [];
    const newPreviews = [];

    files.forEach((file) => {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setAlert({
          show: true,
          message: `${file.name} is not a valid image file`,
          variant: "warning",
        });
        return;
      }

      // Validate file size
      if (file.size > maxSize) {
        setAlert({
          show: true,
          message: `${file.name} is too large. Maximum size is 10MB`,
          variant: "warning",
        });
        return;
      }

      validFiles.push(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push({
          id: Date.now() + Math.random(),
          file: file,
          preview: reader.result,
          name: file.name,
        });

        if (newPreviews.length === validFiles.length) {
          setImageFiles((prev) => [...prev, ...validFiles]);
          setImagePreviews((prev) => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove specific image
  const handleRemoveImage = (index) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);

    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  // Remove all images
  const handleRemoveAllImages = () => {
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImages([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };
  // Optimized image compression function
  // Simplified image processing - just convert to base64 without compression
  // eslint-disable-next-line no-unused-vars
  const processImageFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Convert file to base64
  const fileToBase64 = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formElement = e.currentTarget;

    if (formElement.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    setLoading(true);
    setAlert({ show: false, message: "", variant: "" });

    try {
      let productData = { ...form };

      // Handle multiple images upload if files are selected
      if (imageFiles.length > 0) {
        setImageUploading(true);

        try {
          const imagesData = [];

          // Process images in batches to prevent memory issues
          for (let i = 0; i < imageFiles.length; i++) {
            const file = imageFiles[i];
            console.log(
              `Processing image ${i + 1}/${imageFiles.length}: ${file.name}`,
            );

            const base64Image = await fileToBase64(file);
            imagesData.push({
              base64: base64Image,
              filename: file.name,
              mimetype: file.type,
              size: file.size,
              originalName: file.name,
            });
          }

          productData.images = imagesData;
          console.log(
            `Total payload size: ~${JSON.stringify(productData).length / 1024 / 1024} MB`,
          );
        } catch (imageError) {
          console.error("Image processing error:", imageError);
          setAlert({
            show: true,
            message:
              "Failed to process images. Please try with fewer images or smaller file sizes.",
            variant: "danger",
          });
          setImageUploading(false);
          setLoading(false);
          return;
        }
      }

      if (editingId) {
        await dispatch(updateProduct({ id: editingId, productData })).unwrap();
        setAlert({
          show: true,
          message: "Product updated successfully!",
          variant: "success",
        });
      } else {
        await dispatch(addProduct(productData)).unwrap();
        setAlert({
          show: true,
          message: "Product added successfully!",
          variant: "success",
        });
      }

      // Reset form if adding new product
      if (!editingId) {
        setForm({
          name: "",
          price: "",
          description: "",
          category: "",
          subCategory: "",
          stock: "",
          lowStockThreshold: "5",
          trackInventory: true,
          estimatedDelivery: "5",
        });
        handleRemoveAllImages();
        setValidated(false);
      }

      // Navigate after delay to show success message
      setTimeout(() => {
        navigate("/admin/products");
      }, 1500);
    } catch (err) {
      console.error("Error submitting form:", err);

      let errorMessage =
        err?.message || err || "An error occurred while saving the product";

      // Handle specific error types
      if (
        err?.message?.includes("413") ||
        err?.message?.includes("Payload too large")
      ) {
        errorMessage =
          "The images are too large. Please try with fewer images or compress them further.";
      } else if (
        err?.message?.includes("timeout") ||
        err?.message?.includes("TIMEOUT")
      ) {
        errorMessage = "Request timed out. Please try with fewer images.";
      } else if (
        err?.message?.includes("network") ||
        err?.message?.includes("NETWORK")
      ) {
        errorMessage =
          "Network error. Please check your connection and try again.";
      }

      setAlert({
        show: true,
        message: errorMessage,
        variant: "danger",
      });
    } finally {
      setLoading(false);
      setImageUploading(false);
    }
  };

  // Fetch categories on component mount
  useEffect(() => {
    dispatch(fetchPublicCategories());
  }, [dispatch]);

  useEffect(() => {
    const product = location.state?.product;
    if (editingId && product) {
      setForm({
        name: product.name,
        price: product.price,
        description: product.description,
        category: product.category,
        subCategory: product.subCategory,
        stock: product.stock !== undefined ? product.stock : "",
        lowStockThreshold:
          product.lowStockThreshold !== undefined
            ? product.lowStockThreshold
            : "5",
        trackInventory:
          product.trackInventory !== undefined ? product.trackInventory : true,
      });

      // Set existing images if available
      if (product.images && product.images.length > 0) {
        setExistingImages(product.images);
      } else if (product.image && product.image.url) {
        // Backward compatibility for single image
        setExistingImages([
          {
            url: product.image.url,
            originalName: product.image.originalName || "existing-image.jpg",
            isPrimary: true,
          },
        ]);
      }
    }
  }, [editingId, location.state]);

  // Reset subCategory if category changes
  const handleCategoryChange = (e) => {
    setForm({
      ...form,
      category: e.target.value,
      subCategory: "", // reset subCategory when category changes
    });
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
            <Breadcrumb.Item
              onClick={() => navigate("/admin/products")}
              style={{
                cursor: "pointer",
                color: "#6c757d",
              }}
            >
              Products
            </Breadcrumb.Item>
            <Breadcrumb.Item active style={{ color: "#343a40" }}>
              {editingId ? "Edit Product" : "Add Product"}
            </Breadcrumb.Item>
          </Breadcrumb>

          <div className="text-center mb-5">
            <div
              className="d-inline-flex align-items-center justify-content-center mb-3"
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "20px",
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                boxShadow: "0 10px 30px rgba(102, 126, 234, 0.3)",
              }}
            >
              <FiPackage size={36} color="white" />
            </div>
            <h1
              className="text-dark mb-3"
              style={{
                fontSize: "clamp(2rem, 4vw, 2.8rem)",
                fontWeight: "800",
                letterSpacing: "-0.02em",
              }}
            >
              {editingId ? "Edit Product" : "Add New Product"}
            </h1>
            <p
              className="text-muted mb-0"
              style={{
                fontSize: "clamp(1rem, 2vw, 1.15rem)",
                fontWeight: "500",
              }}
            >
              {editingId
                ? "Update product information"
                : "Create a new product in your inventory"}
            </p>
          </div>
        </div>

        {/* Form Section */}
        <Row className="justify-content-center">
          <Col xs={12} md={10} lg={8} xl={6}>
            <Card
              className="border-0"
              style={{
                borderRadius: "24px",
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1)",
                background: "white",
                overflow: "hidden",
              }}
            >
              {/* Card Header with Gradient */}
              <div
                style={{
                  background: "linear-gradient(135deg, #667eea, #764ba2)",
                  padding: "1.5rem 2rem",
                  color: "white",
                }}
              >
                <h4
                  className="mb-0"
                  style={{ fontWeight: "700", fontSize: "1.3rem" }}
                >
                  Product Information
                </h4>
                <small style={{ opacity: 0.9 }}>
                  Fill in the details below
                </small>
              </div>
              <Card.Body className="p-4 p-md-5">
                {alert.show && (
                  <Alert
                    variant={alert.variant}
                    className="mb-4"
                    style={{
                      borderRadius: "16px",
                      border: "none",
                      padding: "1rem 1.25rem",
                      boxShadow:
                        alert.variant === "success"
                          ? "0 4px 16px rgba(16, 185, 129, 0.2)"
                          : alert.variant === "danger"
                            ? "0 4px 16px rgba(239, 68, 68, 0.2)"
                            : "0 4px 16px rgba(59, 130, 246, 0.2)",
                      fontWeight: "600",
                    }}
                  >
                    {alert.message}
                  </Alert>
                )}

                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                  <Row>
                    <Col md={12}>
                      <Form.Group className="mb-4" controlId="formName">
                        <Form.Label
                          className="fw-semibold text-dark mb-2"
                          style={{ fontSize: "1rem" }}
                        >
                          <FiPackage className="me-2" />
                          Product Name
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter product name"
                          value={form.name}
                          onChange={(e) =>
                            setForm({ ...form, name: e.target.value })
                          }
                          required
                          style={{
                            borderRadius: "14px",
                            border: "2px solid #e2e8f0",
                            fontSize: "1rem",
                            padding: "14px 18px",
                            transition: "all 0.3s ease",
                            backgroundColor: "#f8fafc",
                          }}
                          className="form-control-lg"
                          onFocus={(e) => {
                            e.target.style.border = "2px solid #667eea";
                            e.target.style.backgroundColor = "white";
                            e.target.style.boxShadow =
                              "0 0 0 4px rgba(102, 126, 234, 0.1)";
                          }}
                          onBlur={(e) => {
                            e.target.style.border = "2px solid #e2e8f0";
                            e.target.style.backgroundColor = "#f8fafc";
                            e.target.style.boxShadow = "none";
                          }}
                        />
                        <Form.Control.Feedback type="invalid">
                          Please provide a valid product name.
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-4" controlId="formPrice">
                        <Form.Label
                          className="fw-semibold text-dark mb-2"
                          style={{ fontSize: "1rem" }}
                        >
                          <FiDollarSign className="me-2" />
                          Price (₹)
                        </Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="0.00"
                          value={form.price}
                          onChange={(e) =>
                            setForm({ ...form, price: e.target.value })
                          }
                          required
                          min="0"
                          step="0.01"
                          style={{
                            borderRadius: "14px",
                            border: "2px solid #e2e8f0",
                            fontSize: "1rem",
                            padding: "14px 18px",
                            transition: "all 0.3s ease",
                            backgroundColor: "#f8fafc",
                          }}
                          className="form-control-lg"
                          onFocus={(e) => {
                            e.target.style.border = "2px solid #10b981";
                            e.target.style.backgroundColor = "white";
                            e.target.style.boxShadow =
                              "0 0 0 4px rgba(16, 185, 129, 0.1)";
                          }}
                          onBlur={(e) => {
                            e.target.style.border = "2px solid #e2e8f0";
                            e.target.style.backgroundColor = "#f8fafc";
                            e.target.style.boxShadow = "none";
                          }}
                        />
                        <Form.Control.Feedback type="invalid">
                          Please provide a valid price.
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-4" controlId="formStock">
                        <Form.Label
                          className="fw-semibold text-dark mb-2"
                          style={{ fontSize: "1rem" }}
                        >
                          <FiPackage className="me-2" />
                          Stock Quantity
                        </Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="0"
                          value={form.stock}
                          onChange={(e) =>
                            setForm({ ...form, stock: e.target.value })
                          }
                          min="0"
                          style={{
                            borderRadius: "14px",
                            border: "2px solid #e2e8f0",
                            fontSize: "1rem",
                            padding: "14px 18px",
                            transition: "all 0.3s ease",
                            backgroundColor: "#f8fafc",
                          }}
                          className="form-control-lg"
                          onFocus={(e) => {
                            e.target.style.border = "2px solid #667eea";
                            e.target.style.backgroundColor = "white";
                            e.target.style.boxShadow =
                              "0 0 0 4px rgba(102, 126, 234, 0.1)";
                          }}
                          onBlur={(e) => {
                            e.target.style.border = "2px solid #e2e8f0";
                            e.target.style.backgroundColor = "#f8fafc";
                            e.target.style.boxShadow = "none";
                          }}
                        />
                        <Form.Text className="text-muted">
                          Number of items available in stock
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group
                        className="mb-4"
                        controlId="formLowStockThreshold"
                      >
                        <Form.Label
                          className="fw-semibold text-dark mb-2"
                          style={{ fontSize: "1rem" }}
                        >
                          Low Stock Alert
                        </Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="5"
                          value={form.lowStockThreshold}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              lowStockThreshold: e.target.value,
                            })
                          }
                          min="0"
                          style={{
                            borderRadius: "14px",
                            border: "2px solid #e2e8f0",
                            fontSize: "1rem",
                            padding: "14px 18px",
                            transition: "all 0.3s ease",
                            backgroundColor: "#f8fafc",
                          }}
                          className="form-control-lg"
                          onFocus={(e) => {
                            e.target.style.border = "2px solid #f59e0b";
                            e.target.style.backgroundColor = "white";
                            e.target.style.boxShadow =
                              "0 0 0 4px rgba(245, 158, 11, 0.1)";
                          }}
                          onBlur={(e) => {
                            e.target.style.border = "2px solid #e2e8f0";
                            e.target.style.backgroundColor = "#f8fafc";
                            e.target.style.boxShadow = "none";
                          }}
                        />
                        <Form.Text className="text-muted">
                          Show "Only X left" when stock is at or below this
                          number
                        </Form.Text>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group
                        className="mb-4"
                        controlId="formTrackInventory"
                      >
                        <Form.Label
                          className="fw-semibold text-dark mb-2"
                          style={{ fontSize: "1rem" }}
                        >
                          Inventory Tracking
                        </Form.Label>
                        <Form.Check
                          type="switch"
                          id="track-inventory-switch"
                          label={
                            form.trackInventory
                              ? "Enabled - Stock will be tracked and validated"
                              : "Disabled - Unlimited stock"
                          }
                          checked={form.trackInventory}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              trackInventory: e.target.checked,
                            })
                          }
                          style={{
                            fontSize: "1rem",
                            padding: "12px 0",
                          }}
                        />
                        <Form.Text className="text-muted">
                          {form.trackInventory
                            ? "Customers cannot order more than available stock"
                            : "No stock limits will be enforced"}
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group
                        className="mb-4"
                        controlId="formEstimatedDelivery"
                      >
                        <Form.Label
                          className="fw-semibold text-dark mb-2"
                          style={{ fontSize: "1rem" }}
                        >
                          <FiPackage className="me-2" />
                          Estimated Delivery (Days)
                        </Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="5"
                          value={form.estimatedDelivery}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              estimatedDelivery: e.target.value,
                            })
                          }
                          min="1"
                          max="90"
                          style={{
                            borderRadius: "14px",
                            border: "2px solid #e2e8f0",
                            fontSize: "1rem",
                            padding: "14px 18px",
                            transition: "all 0.3s ease",
                            backgroundColor: "#f8fafc",
                          }}
                          className="form-control-lg"
                          onFocus={(e) => {
                            e.target.style.border = "2px solid #3b82f6";
                            e.target.style.backgroundColor = "white";
                            e.target.style.boxShadow =
                              "0 0 0 4px rgba(59, 130, 246, 0.1)";
                          }}
                          onBlur={(e) => {
                            e.target.style.border = "2px solid #e2e8f0";
                            e.target.style.backgroundColor = "#f8fafc";
                            e.target.style.boxShadow = "none";
                          }}
                        />
                        <Form.Text className="text-muted">
                          Number of days for estimated delivery (1-90 days)
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-4" controlId="formCategory">
                        <Form.Label
                          className="fw-semibold text-dark mb-2"
                          style={{ fontSize: "1rem" }}
                        >
                          <FiTag className="me-2" />
                          Category
                        </Form.Label>
                        <Form.Select
                          value={form.category}
                          onChange={handleCategoryChange}
                          required
                          style={{
                            borderRadius: "14px",
                            border: "2px solid #e2e8f0",
                            fontSize: "1rem",
                            padding: "14px 18px",
                            transition: "all 0.3s ease",
                            backgroundColor: "#f8fafc",
                          }}
                          className="form-control-lg"
                          onFocus={(e) => {
                            e.target.style.border = "2px solid #667eea";
                            e.target.style.backgroundColor = "white";
                            e.target.style.boxShadow =
                              "0 0 0 4px rgba(102, 126, 234, 0.1)";
                          }}
                          onBlur={(e) => {
                            e.target.style.border = "2px solid #e2e8f0";
                            e.target.style.backgroundColor = "#f8fafc";
                            e.target.style.boxShadow = "none";
                          }}
                        >
                          <option value="">Select Category</option>
                          {categoriesLoading ? (
                            <option disabled>Loading categories...</option>
                          ) : (
                            categories.map((cat) => (
                              <option key={cat._id} value={cat.name}>
                                {cat.name}
                              </option>
                            ))
                          )}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          Please select a category.
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={12}>
                      <Form.Group className="mb-4" controlId="formSubCategory">
                        <Form.Label
                          className="fw-semibold text-dark mb-2"
                          style={{ fontSize: "1rem" }}
                        >
                          <FiLayers className="me-2" />
                          Subcategory
                        </Form.Label>
                        <Form.Select
                          value={form.subCategory}
                          onChange={(e) =>
                            setForm({ ...form, subCategory: e.target.value })
                          }
                          disabled={!form.category}
                          style={{
                            borderRadius: "14px",
                            border: "2px solid #e2e8f0",
                            fontSize: "1rem",
                            padding: "14px 18px",
                            transition: "all 0.3s ease",
                            backgroundColor: !form.category
                              ? "#f8f9fa"
                              : "#f8fafc",
                          }}
                          className="form-control-lg"
                          onFocus={(e) => {
                            if (form.category) {
                              e.target.style.border = "2px solid #667eea";
                              e.target.style.backgroundColor = "white";
                              e.target.style.boxShadow =
                                "0 0 0 4px rgba(102, 126, 234, 0.1)";
                            }
                          }}
                          onBlur={(e) => {
                            e.target.style.border = "2px solid #e2e8f0";
                            e.target.style.backgroundColor = form.category
                              ? "#f8fafc"
                              : "#f8f9fa";
                            e.target.style.boxShadow = "none";
                          }}
                        >
                          <option value="">Select Subcategory</option>
                          {subCategoryOptions.map((sub) => (
                            <option key={sub._id} value={sub.name}>
                              {sub.name}
                            </option>
                          ))}
                        </Form.Select>
                        <Form.Text className="text-muted">
                          {!form.category && "Please select a category first"}
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={12}>
                      <Form.Group className="mb-4" controlId="formDescription">
                        <Form.Label
                          className="fw-semibold text-dark mb-2"
                          style={{ fontSize: "1rem" }}
                        >
                          <FiFileText className="me-2" />
                          Description
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={4}
                          placeholder="Enter product description..."
                          value={form.description}
                          onChange={(e) =>
                            setForm({ ...form, description: e.target.value })
                          }
                          style={{
                            borderRadius: "14px",
                            border: "2px solid #e2e8f0",
                            fontSize: "1rem",
                            padding: "14px 18px",
                            transition: "all 0.3s ease",
                            resize: "vertical",
                            backgroundColor: "#f8fafc",
                          }}
                          onFocus={(e) => {
                            e.target.style.border = "2px solid #667eea";
                            e.target.style.backgroundColor = "white";
                            e.target.style.boxShadow =
                              "0 0 0 4px rgba(102, 126, 234, 0.1)";
                          }}
                          onBlur={(e) => {
                            e.target.style.border = "2px solid #e2e8f0";
                            e.target.style.backgroundColor = "#f8fafc";
                            e.target.style.boxShadow = "none";
                          }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Multiple Images Upload Section */}
                  <Row>
                    <Col md={12}>
                      <Form.Group className="mb-4" controlId="formImages">
                        <Form.Label
                          className="fw-semibold text-dark mb-3"
                          style={{ fontSize: "1rem" }}
                        >
                          <FiCamera className="me-2" />
                          Product Images (Maximum 10)
                        </Form.Label>

                        {/* Drag & Drop Zone */}
                        <div
                          className={`rounded-4 p-5 text-center mb-4`}
                          style={{
                            border: dragOver
                              ? "3px dashed #667eea"
                              : "3px dashed #cbd5e1",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            background: dragOver
                              ? "linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05))"
                              : "#f8fafc",
                            borderRadius: "20px",
                          }}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <div
                            style={{
                              width: "80px",
                              height: "80px",
                              margin: "0 auto 1rem",
                              borderRadius: "50%",
                              background:
                                "linear-gradient(135deg, #667eea, #764ba2)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <FiCamera size={36} color="white" />
                          </div>
                          <h5
                            className="mb-3"
                            style={{ fontWeight: "700", color: "#1f2937" }}
                          >
                            <strong>Click to upload</strong> or drag and drop
                          </h5>
                          <p
                            className="text-muted mb-0"
                            style={{ fontSize: "0.95rem" }}
                          >
                            JPEG, PNG, GIF, WebP up to 10MB each (Maximum 10
                            images)
                          </p>
                        </div>

                        {/* Hidden File Input */}
                        <Form.Control
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageChange}
                          style={{ display: "none" }}
                        />

                        {/* Image Previews Grid */}
                        {(imagePreviews.length > 0 ||
                          existingImages.length > 0) && (
                          <div className="mt-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <h6 className="mb-0 text-dark">
                                Selected Images (
                                {imagePreviews.length + existingImages.length}
                                /10)
                              </h6>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={handleRemoveAllImages}
                                style={{
                                  borderRadius: "12px",
                                  fontWeight: "600",
                                  padding: "6px 14px",
                                }}
                              >
                                <FiX className="me-1" />
                                Remove All
                              </Button>
                            </div>

                            <Row className="g-3">
                              {/* Existing Images */}
                              {existingImages.map((img, index) => (
                                <Col
                                  xs={6}
                                  sm={4}
                                  md={3}
                                  key={`existing-${index}`}
                                >
                                  <div
                                    className="position-relative"
                                    style={{
                                      borderRadius: "12px",
                                      overflow: "hidden",
                                    }}
                                  >
                                    <Image
                                      src={img.url}
                                      alt={
                                        img.originalName ||
                                        `Existing image ${index + 1}`
                                      }
                                      thumbnail
                                      style={{
                                        width: "100%",
                                        height: "130px",
                                        objectFit: "cover",
                                        borderRadius: "12px",
                                        border: "3px solid #e2e8f0",
                                      }}
                                    />
                                    {img.isPrimary && (
                                      <div
                                        className="position-absolute top-0 start-0 text-white px-2 py-1"
                                        style={{
                                          fontSize: "0.7rem",
                                          borderRadius: "12px 0 12px 0",
                                          background:
                                            "linear-gradient(135deg, #10b981, #059669)",
                                          fontWeight: "700",
                                        }}
                                      >
                                        ⭐ Primary
                                      </div>
                                    )}
                                    <div
                                      className="position-absolute bottom-0 start-0 end-0 bg-dark bg-opacity-75 text-white p-1"
                                      style={{
                                        fontSize: "0.7rem",
                                        borderRadius: "0 0 8px 8px",
                                      }}
                                    >
                                      <small className="text-truncate d-block">
                                        {img.originalName || "Existing"}
                                      </small>
                                    </div>
                                  </div>
                                </Col>
                              ))}

                              {/* New Image Previews */}
                              {imagePreviews.map((imgData, index) => (
                                <Col xs={6} sm={4} md={3} key={`new-${index}`}>
                                  <div
                                    className="position-relative"
                                    style={{
                                      borderRadius: "12px",
                                      overflow: "hidden",
                                    }}
                                  >
                                    <Image
                                      src={imgData.preview}
                                      alt={imgData.name}
                                      thumbnail
                                      style={{
                                        width: "100%",
                                        height: "130px",
                                        objectFit: "cover",
                                        borderRadius: "12px",
                                        border: "3px solid #e2e8f0",
                                      }}
                                    />
                                    <Button
                                      variant="danger"
                                      size="sm"
                                      className="position-absolute"
                                      style={{
                                        top: "8px",
                                        right: "8px",
                                        borderRadius: "50%",
                                        width: "30px",
                                        height: "30px",
                                        padding: "0",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        background:
                                          "linear-gradient(135deg, #ef4444, #dc2626)",
                                        border: "none",
                                        boxShadow:
                                          "0 2px 8px rgba(239, 68, 68, 0.3)",
                                      }}
                                      onClick={() => handleRemoveImage(index)}
                                    >
                                      <FiX size={14} />
                                    </Button>
                                    {index === 0 &&
                                      existingImages.length === 0 && (
                                        <div
                                          className="position-absolute top-0 start-0 text-white px-2 py-1"
                                          style={{
                                            fontSize: "0.7rem",
                                            borderRadius: "12px 0 12px 0",
                                            background:
                                              "linear-gradient(135deg, #10b981, #059669)",
                                            fontWeight: "700",
                                          }}
                                        >
                                          ⭐ Primary
                                        </div>
                                      )}
                                    <div
                                      className="position-absolute bottom-0 start-0 end-0 bg-dark bg-opacity-75 text-white p-1"
                                      style={{
                                        fontSize: "0.7rem",
                                        borderRadius: "0 0 8px 8px",
                                      }}
                                    >
                                      <small className="text-truncate d-block">
                                        {imgData.name}
                                      </small>
                                    </div>
                                  </div>
                                </Col>
                              ))}
                            </Row>
                          </div>
                        )}

                        <Form.Text className="text-muted mt-2 d-block">
                          • Upload multiple product images (up to 10 images)
                          <br />
                          • Supported formats: JPEG, PNG, GIF, WebP
                          <br />
                          • Maximum size per image: 10MB
                          <br />• First image will be set as primary
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="d-grid gap-3 mt-5">
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={loading || imageUploading}
                      size="lg"
                      style={{
                        borderRadius: "16px",
                        fontWeight: "700",
                        padding: "18px",
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        border: "none",
                        fontSize: "1.15rem",
                        transition: "all 0.3s ease",
                        boxShadow: "0 8px 24px rgba(102, 126, 234, 0.3)",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.boxShadow =
                          "0 12px 32px rgba(102, 126, 234, 0.4)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow =
                          "0 8px 24px rgba(102, 126, 234, 0.3)";
                      }}
                    >
                      {loading || imageUploading ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-2"
                          />
                          {imageUploading
                            ? `Uploading ${imageFiles.length} image${imageFiles.length > 1 ? "s" : ""}...`
                            : loading
                              ? editingId
                                ? "Updating..."
                                : "Adding..."
                              : ""}
                        </>
                      ) : (
                        <>
                          <FiSave className="me-2" />
                          {editingId ? "Update Product" : "Add Product"}
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline-secondary"
                      onClick={() => navigate("/admin/products")}
                      disabled={loading || imageUploading}
                      size="lg"
                      style={{
                        borderRadius: "16px",
                        fontWeight: "600",
                        padding: "18px",
                        fontSize: "1rem",
                        border: "2px solid #e2e8f0",
                        color: "#64748b",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = "#f8fafc";
                        e.target.style.borderColor = "#cbd5e1";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "white";
                        e.target.style.borderColor = "#e2e8f0";
                      }}
                    >
                      <FiArrowLeft className="me-2" />
                      Back to Products
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default AddProduct;
