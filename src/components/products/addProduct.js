import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Form,
  Button,
  Container,
  Row,
  Col,
  Card,
  Breadcrumb,
  Alert,
  Image,
} from "react-bootstrap";
import { DotsLoader } from "../Loader";
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
import Header from "../Header";
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
    weightInGrams: "500",
    isCustomizable: false,
    processingDaysMin: "10",
    processingDaysMax: "12",
  });

  // UI-only: which unit the admin is viewing in the weight field
  const [weightUnit, setWeightUnit] = useState("g");

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
          weightInGrams: "500",
          isCustomizable: false,
          processingDaysMin: "10",
          processingDaysMax: "12",
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
        estimatedDelivery:
          product.estimatedDelivery !== undefined
            ? String(product.estimatedDelivery)
            : "5",
        weightInGrams:
          product.weightInGrams !== undefined ? String(product.weightInGrams) : "500",
        isCustomizable: product.isCustomizable ?? false,
        processingDaysMin: product.processingDaysMin !== undefined ? String(product.processingDaysMin) : "10",
        processingDaysMax: product.processingDaysMax !== undefined ? String(product.processingDaysMax) : "12",
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

  const sectionStyle = {
    background: "white",
    borderRadius: "16px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    marginBottom: "1.5rem",
    overflow: "hidden",
  };

  const sectionHeaderStyle = (color1, color2) => ({
    background: `linear-gradient(135deg, ${color1}, ${color2})`,
    padding: "0.9rem 1.25rem",
    color: "white",
    fontWeight: 700,
    fontSize: "0.9rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  });

  const sectionBodyStyle = { padding: "1.25rem" };

  const fieldStyle = {
    borderRadius: "10px",
    border: "1.5px solid #e2e8f0",
    fontSize: "0.9rem",
    padding: "10px 14px",
    backgroundColor: "#f8fafc",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };

  const fieldFocus = (accent) => (e) => {
    e.target.style.border = `1.5px solid ${accent}`;
    e.target.style.backgroundColor = "white";
    e.target.style.boxShadow = `0 0 0 3px ${accent}22`;
  };

  const fieldBlur = (e) => {
    e.target.style.border = "1.5px solid #e2e8f0";
    e.target.style.backgroundColor = "#f8fafc";
    e.target.style.boxShadow = "none";
  };

  return (
    <>
      <Header />

      <Container
        fluid
        style={{
          background: "linear-gradient(160deg, #f0f4ff 0%, #f8fafc 100%)",
          minHeight: "100vh",
          paddingTop: "20px",
          paddingBottom: "40px",
        }}
      >
        {/* ── Page Header ── */}
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1rem" }}>
          <div className="d-flex align-items-center gap-3 mb-4">
            <button
              type="button"
              onClick={() => navigate("/admin/products")}
              style={{
                background: "white",
                border: "1.5px solid #e2e8f0",
                borderRadius: "10px",
                padding: "8px 14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: "#64748b",
                fontSize: "0.85rem",
                fontWeight: 600,
              }}
            >
              <FiArrowLeft size={15} /> Products
            </button>
            <div>
              <h2 style={{ margin: 0, fontWeight: 800, fontSize: "1.4rem", color: "#1e293b" }}>
                {editingId ? "Edit Product" : "Add New Product"}
              </h2>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#94a3b8" }}>
                {editingId ? "Update product details" : "Fill in the details to create a new listing"}
              </p>
            </div>
          </div>

          {alert.show && (
            <Alert
              variant={alert.variant}
              style={{ borderRadius: "12px", border: "none", fontWeight: 600, marginBottom: "1.25rem" }}
            >
              {alert.message}
            </Alert>
          )}

          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Row className="g-4">
              {/* ── LEFT COLUMN ── */}
              <Col xs={12} lg={7}>
                {/* Basic Info */}
                <div style={sectionStyle}>
                  <div style={sectionHeaderStyle("#667eea", "#764ba2")}>
                    <FiPackage size={15} /> Basic Information
                  </div>
                  <div style={sectionBodyStyle}>
                    <Form.Group className="mb-3" controlId="formName">
                      <Form.Label className="fw-semibold text-dark mb-1" style={{ fontSize: "0.85rem" }}>
                        Product Name *
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="e.g. Kundan Bangle Set"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                        style={fieldStyle}
                        onFocus={fieldFocus("#667eea")}
                        onBlur={fieldBlur}
                      />
                      <Form.Control.Feedback type="invalid">Required</Form.Control.Feedback>
                    </Form.Group>

                    <Row className="g-3 mb-3">
                      <Col xs={6}>
                        <Form.Group controlId="formCategory">
                          <Form.Label className="fw-semibold text-dark mb-1" style={{ fontSize: "0.85rem" }}>
                            <FiTag size={12} className="me-1" /> Category *
                          </Form.Label>
                          <Form.Select
                            value={form.category}
                            onChange={handleCategoryChange}
                            required
                            style={fieldStyle}
                            onFocus={fieldFocus("#667eea")}
                            onBlur={fieldBlur}
                          >
                            <option value="">Select Category</option>
                            {categoriesLoading ? (
                              <option disabled>Loading…</option>
                            ) : (
                              categories.map((cat) => (
                                <option key={cat._id} value={cat.name}>{cat.name}</option>
                              ))
                            )}
                          </Form.Select>
                          <Form.Control.Feedback type="invalid">Required</Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col xs={6}>
                        <Form.Group controlId="formSubCategory">
                          <Form.Label className="fw-semibold text-dark mb-1" style={{ fontSize: "0.85rem" }}>
                            <FiLayers size={12} className="me-1" /> Subcategory
                          </Form.Label>
                          <Form.Select
                            value={form.subCategory}
                            onChange={(e) => setForm({ ...form, subCategory: e.target.value })}
                            disabled={!form.category}
                            style={{ ...fieldStyle, backgroundColor: !form.category ? "#f1f5f9" : "#f8fafc" }}
                            onFocus={fieldFocus("#667eea")}
                            onBlur={fieldBlur}
                          >
                            <option value="">Select Subcategory</option>
                            {subCategoryOptions.map((sub) => (
                              <option key={sub._id} value={sub.name}>{sub.name}</option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group controlId="formDescription">
                      <Form.Label className="fw-semibold text-dark mb-1" style={{ fontSize: "0.85rem" }}>
                        <FiFileText size={12} className="me-1" /> Description
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        placeholder="Describe the product — materials, style, occasion…"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        style={{ ...fieldStyle, resize: "vertical" }}
                        onFocus={fieldFocus("#667eea")}
                        onBlur={fieldBlur}
                      />
                    </Form.Group>
                  </div>
                </div>

                {/* Images */}
                <div style={sectionStyle}>
                  <div style={sectionHeaderStyle("#0ea5e9", "#6366f1")}>
                    <FiCamera size={15} /> Product Images
                    <span style={{ marginLeft: "auto", fontSize: "0.75rem", opacity: 0.85, fontWeight: 500 }}>
                      {imagePreviews.length + existingImages.length}/10 uploaded
                    </span>
                  </div>
                  <div style={sectionBodyStyle}>
                    <div
                      style={{
                        border: dragOver ? "2px dashed #667eea" : "2px dashed #cbd5e1",
                        borderRadius: "12px",
                        padding: "2rem 1rem",
                        textAlign: "center",
                        cursor: "pointer",
                        background: dragOver ? "rgba(102,126,234,0.04)" : "#f8fafc",
                        transition: "all 0.2s ease",
                        marginBottom: "1rem",
                      }}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div style={{
                        width: 52, height: 52, borderRadius: "50%",
                        background: "linear-gradient(135deg, #667eea, #764ba2)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        margin: "0 auto 0.75rem",
                      }}>
                        <FiCamera size={22} color="white" />
                      </div>
                      <p style={{ fontWeight: 700, color: "#1e293b", margin: "0 0 4px" }}>
                        Click to upload or drag & drop
                      </p>
                      <p style={{ color: "#94a3b8", fontSize: "0.8rem", margin: 0 }}>
                        JPEG, PNG, WebP · max 10MB each · up to 10 images
                      </p>
                    </div>

                    <Form.Control
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      style={{ display: "none" }}
                    />

                    {(imagePreviews.length > 0 || existingImages.length > 0) && (
                      <div>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151" }}>
                            Selected ({imagePreviews.length + existingImages.length})
                          </span>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={handleRemoveAllImages}
                            style={{ borderRadius: "8px", fontSize: "0.78rem", padding: "3px 10px" }}
                          >
                            <FiX size={12} className="me-1" /> Remove All
                          </Button>
                        </div>
                        <Row className="g-2">
                          {existingImages.map((img, index) => (
                            <Col xs={4} sm={3} key={`existing-${index}`}>
                              <div className="position-relative" style={{ borderRadius: "10px", overflow: "hidden" }}>
                                <Image
                                  src={img.url}
                                  alt={img.originalName || `Image ${index + 1}`}
                                  thumbnail
                                  style={{ width: "100%", height: "90px", objectFit: "cover", borderRadius: "10px", border: "2px solid #e2e8f0" }}
                                />
                                {img.isPrimary && (
                                  <div className="position-absolute top-0 start-0 text-white px-2 py-1"
                                    style={{ fontSize: "0.65rem", background: "linear-gradient(135deg,#10b981,#059669)", borderRadius: "10px 0 10px 0", fontWeight: 700 }}>
                                    ⭐ Primary
                                  </div>
                                )}
                              </div>
                            </Col>
                          ))}
                          {imagePreviews.map((imgData, index) => (
                            <Col xs={4} sm={3} key={`new-${index}`}>
                              <div className="position-relative" style={{ borderRadius: "10px", overflow: "hidden" }}>
                                <Image
                                  src={imgData.preview}
                                  alt={imgData.name}
                                  thumbnail
                                  style={{ width: "100%", height: "90px", objectFit: "cover", borderRadius: "10px", border: "2px solid #e2e8f0" }}
                                />
                                <Button
                                  variant="danger"
                                  size="sm"
                                  className="position-absolute"
                                  style={{
                                    top: "5px", right: "5px", borderRadius: "50%", width: "24px", height: "24px",
                                    padding: 0, display: "flex", alignItems: "center", justifyContent: "center",
                                    background: "linear-gradient(135deg,#ef4444,#dc2626)", border: "none",
                                  }}
                                  onClick={() => handleRemoveImage(index)}
                                >
                                  <FiX size={12} />
                                </Button>
                                {index === 0 && existingImages.length === 0 && (
                                  <div className="position-absolute top-0 start-0 text-white px-2 py-1"
                                    style={{ fontSize: "0.65rem", background: "linear-gradient(135deg,#10b981,#059669)", borderRadius: "10px 0 10px 0", fontWeight: 700 }}>
                                    ⭐ Primary
                                  </div>
                                )}
                                <div className="position-absolute bottom-0 start-0 end-0 bg-dark bg-opacity-75 text-white p-1"
                                  style={{ fontSize: "0.65rem", borderRadius: "0 0 8px 8px" }}>
                                  <small className="text-truncate d-block">{imgData.name}</small>
                                </div>
                              </div>
                            </Col>
                          ))}
                        </Row>
                      </div>
                    )}
                  </div>
                </div>
              </Col>

              {/* ── RIGHT COLUMN ── */}
              <Col xs={12} lg={5}>
                {/* Pricing & Stock */}
                <div style={sectionStyle}>
                  <div style={sectionHeaderStyle("#10b981", "#059669")}>
                    <FiDollarSign size={15} /> Pricing & Stock
                  </div>
                  <div style={sectionBodyStyle}>
                    <Row className="g-3 mb-3">
                      <Col xs={6}>
                        <Form.Group controlId="formPrice">
                          <Form.Label className="fw-semibold text-dark mb-1" style={{ fontSize: "0.85rem" }}>Price (₹) *</Form.Label>
                          <Form.Control
                            type="number"
                            placeholder="0.00"
                            value={form.price}
                            onChange={(e) => setForm({ ...form, price: e.target.value })}
                            required
                            min="0"
                            step="0.01"
                            style={fieldStyle}
                            onFocus={fieldFocus("#10b981")}
                            onBlur={fieldBlur}
                          />
                          <Form.Control.Feedback type="invalid">Required</Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col xs={6}>
                        <Form.Group controlId="formStock">
                          <Form.Label className="fw-semibold text-dark mb-1" style={{ fontSize: "0.85rem" }}>Stock Qty</Form.Label>
                          <Form.Control
                            type="number"
                            placeholder="0"
                            value={form.stock}
                            onChange={(e) => setForm({ ...form, stock: e.target.value })}
                            min="0"
                            style={fieldStyle}
                            onFocus={fieldFocus("#10b981")}
                            onBlur={fieldBlur}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row className="g-3">
                      <Col xs={6}>
                        <Form.Group controlId="formLowStockThreshold">
                          <Form.Label className="fw-semibold text-dark mb-1" style={{ fontSize: "0.85rem" }}>Low Stock Alert</Form.Label>
                          <Form.Control
                            type="number"
                            placeholder="5"
                            value={form.lowStockThreshold}
                            onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })}
                            min="0"
                            style={fieldStyle}
                            onFocus={fieldFocus("#f59e0b")}
                            onBlur={fieldBlur}
                          />
                          <Form.Text style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Show "Only X left" warning</Form.Text>
                        </Form.Group>
                      </Col>
                      <Col xs={6}>
                        <Form.Group controlId="formTrackInventory">
                          <Form.Label className="fw-semibold text-dark mb-1" style={{ fontSize: "0.85rem" }}>Track Inventory</Form.Label>
                          <div
                            style={{
                              display: "flex", alignItems: "center", gap: "0.5rem",
                              background: form.trackInventory ? "#f0fdf4" : "#f8fafc",
                              border: `1.5px solid ${form.trackInventory ? "#86efac" : "#e2e8f0"}`,
                              borderRadius: "10px", padding: "10px 14px", cursor: "pointer",
                            }}
                            onClick={() => setForm({ ...form, trackInventory: !form.trackInventory })}
                          >
                            <Form.Check
                              type="switch"
                              id="track-inventory-switch"
                              checked={form.trackInventory}
                              onChange={() => {}}
                              style={{ pointerEvents: "none" }}
                            />
                            <span style={{ fontSize: "0.78rem", color: form.trackInventory ? "#166534" : "#6b7280", fontWeight: 600 }}>
                              {form.trackInventory ? "Enabled" : "Disabled"}
                            </span>
                          </div>
                        </Form.Group>
                      </Col>
                    </Row>
                  </div>
                </div>

                {/* Shipping */}
                <div style={sectionStyle}>
                  <div style={sectionHeaderStyle("#3b82f6", "#6366f1")}>
                    <FiPackage size={15} /> Shipping
                  </div>
                  <div style={sectionBodyStyle}>
                    <Form.Group className="mb-3" controlId="formWeight">
                      <Form.Label className="fw-semibold text-dark mb-1" style={{ fontSize: "0.85rem" }}>
                        Product Weight <span style={{ color: "#94a3b8", fontWeight: 400 }}>(used for shipping cost)</span>
                      </Form.Label>
                      <div style={{ display: "flex", gap: "0.4rem", marginBottom: "0.4rem" }}>
                        {["g", "kg"].map((u) => (
                          <button
                            key={u}
                            type="button"
                            onClick={() => setWeightUnit(u)}
                            style={{
                              padding: "3px 14px", borderRadius: "99px",
                              border: `1.5px solid ${weightUnit === u ? "#3b82f6" : "#cbd5e1"}`,
                              background: weightUnit === u ? "#3b82f6" : "white",
                              color: weightUnit === u ? "white" : "#64748b",
                              fontSize: "0.78rem", fontWeight: 600, cursor: "pointer",
                            }}
                          >
                            {u}
                          </button>
                        ))}
                      </div>
                      <Form.Control
                        type="number"
                        placeholder={weightUnit === "g" ? "e.g. 500" : "e.g. 0.5"}
                        value={
                          weightUnit === "g"
                            ? form.weightInGrams
                            : form.weightInGrams
                              ? (Number(form.weightInGrams) / 1000).toFixed(3).replace(/\.?0+$/, "")
                              : ""
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "" || val === "-") { setForm({ ...form, weightInGrams: "" }); return; }
                          const grams = weightUnit === "g" ? Math.round(Number(val)) : Math.round(Number(val) * 1000);
                          setForm({ ...form, weightInGrams: String(grams) });
                        }}
                        min={weightUnit === "g" ? "1" : "0.001"}
                        step={weightUnit === "g" ? "1" : "0.001"}
                        style={fieldStyle}
                        onFocus={fieldFocus("#3b82f6")}
                        onBlur={fieldBlur}
                      />
                      <Form.Text style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                        {form.weightInGrams
                          ? weightUnit === "g"
                            ? `= ${(Number(form.weightInGrams) / 1000).toFixed(3).replace(/\.?0+$/, "")} kg`
                            : `= ${form.weightInGrams} g`
                          : "Enter weight to auto-calculate shipping charges"}
                      </Form.Text>
                    </Form.Group>
                  </div>
                </div>

                {/* Customizable */}
                <div style={sectionStyle}>
                  <div style={sectionHeaderStyle("#f59e0b", "#d97706")}>
                    ✦ Customizable / Made-to-Order
                  </div>
                  <div style={sectionBodyStyle}>
                    <div
                      style={{
                        display: "flex", alignItems: "flex-start", gap: "0.75rem",
                        background: form.isCustomizable ? "#fef3c7" : "#f8fafc",
                        border: `1.5px solid ${form.isCustomizable ? "#fcd34d" : "#e2e8f0"}`,
                        borderRadius: "10px", padding: "12px 14px", cursor: "pointer",
                        transition: "all 0.2s ease", marginBottom: form.isCustomizable ? "1rem" : 0,
                      }}
                      onClick={() => setForm({ ...form, isCustomizable: !form.isCustomizable })}
                    >
                      <Form.Check
                        type="switch"
                        id="isCustomizable"
                        checked={form.isCustomizable}
                        onChange={() => {}}
                        style={{ pointerEvents: "none", marginTop: "2px" }}
                      />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "0.88rem", color: form.isCustomizable ? "#92400e" : "#374151" }}>
                          Mark as Customizable
                        </div>
                        <div style={{ fontSize: "0.78rem", color: "#6b7280", marginTop: "2px" }}>
                          Customers will see a dispatch notice and processing timeline at checkout
                        </div>
                      </div>
                    </div>

                    {form.isCustomizable && (
                      <Row className="g-3">
                        <Col xs={6}>
                          <Form.Group controlId="formProcessingMin">
                            <Form.Label className="fw-semibold text-dark mb-1" style={{ fontSize: "0.85rem" }}>Min Processing Days</Form.Label>
                            <Form.Control
                              type="number"
                              placeholder="10"
                              value={form.processingDaysMin}
                              onChange={(e) => setForm({ ...form, processingDaysMin: e.target.value })}
                              min="1" max="90"
                              style={fieldStyle}
                              onFocus={fieldFocus("#f59e0b")}
                              onBlur={fieldBlur}
                            />
                            <Form.Text style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Business days to prepare</Form.Text>
                          </Form.Group>
                        </Col>
                        <Col xs={6}>
                          <Form.Group controlId="formProcessingMax">
                            <Form.Label className="fw-semibold text-dark mb-1" style={{ fontSize: "0.85rem" }}>Max Processing Days</Form.Label>
                            <Form.Control
                              type="number"
                              placeholder="12"
                              value={form.processingDaysMax}
                              onChange={(e) => setForm({ ...form, processingDaysMax: e.target.value })}
                              min="1" max="90"
                              style={fieldStyle}
                              onFocus={fieldFocus("#f59e0b")}
                              onBlur={fieldBlur}
                            />
                            <Form.Text style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Max business days</Form.Text>
                          </Form.Group>
                        </Col>
                      </Row>
                    )}
                  </div>
                </div>

                {/* Submit */}
                <div className="d-grid gap-2">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={loading || imageUploading}
                    style={{
                      borderRadius: "12px", fontWeight: 700, padding: "14px",
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      border: "none", fontSize: "1rem",
                      boxShadow: "0 6px 20px rgba(102,126,234,0.35)",
                    }}
                  >
                    {loading || imageUploading ? (
                      <>
                        <DotsLoader size="sm" />
                        {imageUploading ? `Uploading ${imageFiles.length} image${imageFiles.length > 1 ? "s" : ""}…` : editingId ? "Updating…" : "Adding…"}
                      </>
                    ) : (
                      <><FiSave className="me-2" />{editingId ? "Update Product" : "Add Product"}</>
                    )}
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate("/admin/products")}
                    disabled={loading || imageUploading}
                    style={{ borderRadius: "12px", fontWeight: 600, padding: "12px", fontSize: "0.9rem", border: "1.5px solid #e2e8f0" }}
                  >
                    <FiArrowLeft className="me-2" /> Cancel
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>
        </div>
      </Container>
    </>
  );
};

export default AddProduct;
