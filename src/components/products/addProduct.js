import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Form, Button, Container, Row, Col, Card, Breadcrumb, Alert, Spinner, Image } from "react-bootstrap";
import { FiArrowLeft, FiPackage, FiSave, FiDollarSign, FiFileText, FiTag, FiLayers, FiCamera, FiX } from "react-icons/fi";
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
    publicCategoriesLoading: categoriesLoading 
  } = useSelector(state => state.categories);

  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    subCategory: "",
  });

  const [editingId, setEditingId] = useState(params?.id ?? null);
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
    ? categories.find(cat => cat.name === form.category)?.subcategories?.filter(sub => sub.isActive) || []
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
        variant: "danger" 
      });
      return;
    }

    const validFiles = [];
    const newPreviews = [];

    files.forEach((file) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setAlert({ 
          show: true, 
          message: `${file.name} is not a valid image file`, 
          variant: "warning" 
        });
        return;
      }
      
      // Validate file size
      if (file.size > maxSize) {
        setAlert({ 
          show: true, 
          message: `${file.name} is too large. Maximum size is 10MB`, 
          variant: "warning" 
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
          name: file.name
        });
        
        if (newPreviews.length === validFiles.length) {
          setImageFiles(prev => [...prev, ...validFiles]);
          setImagePreviews(prev => [...prev, ...newPreviews]);
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
      fileInputRef.current.value = '';
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
      reader.onerror = error => reject(error);
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
            console.log(`Processing image ${i + 1}/${imageFiles.length}: ${file.name}`);
            
            const base64Image = await fileToBase64(file);
            imagesData.push({
              base64: base64Image,
              filename: file.name,
              mimetype: file.type,
              size: file.size,
              originalName: file.name
            });
          }
          
          productData.images = imagesData;
          console.log(`Total payload size: ~${JSON.stringify(productData).length / 1024 / 1024} MB`);
        } catch (imageError) {
          console.error('Image processing error:', imageError);
          setAlert({ 
            show: true, 
            message: "Failed to process images. Please try with fewer images or smaller file sizes.", 
            variant: "danger" 
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
          variant: "success" 
        });
      } else {
        await dispatch(addProduct(productData)).unwrap();
        setAlert({ 
          show: true, 
          message: "Product added successfully!", 
          variant: "success" 
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
      
      let errorMessage = err?.message || err || "An error occurred while saving the product";
      
      // Handle specific error types
      if (err?.message?.includes('413') || err?.message?.includes('Payload too large')) {
        errorMessage = "The images are too large. Please try with fewer images or compress them further.";
      } else if (err?.message?.includes('timeout') || err?.message?.includes('TIMEOUT')) {
        errorMessage = "Request timed out. Please try with fewer images.";
      } else if (err?.message?.includes('network') || err?.message?.includes('NETWORK')) {
        errorMessage = "Network error. Please check your connection and try again.";
      }
      
      setAlert({ 
        show: true, 
        message: errorMessage, 
        variant: "danger" 
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
      });
      
      // Set existing images if available
      if (product.images && product.images.length > 0) {
        setExistingImages(product.images);
      } else if (product.image && product.image.url) {
        // Backward compatibility for single image
        setExistingImages([{
          url: product.image.url,
          originalName: product.image.originalName || 'existing-image.jpg',
          isPrimary: true
        }]);
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
      
      <Container fluid className="" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', minHeight: '100vh', paddingTop: '110px' }}>
        {/* Header Section */}
        <div className="mb-4">
          <Breadcrumb className="mb-3">
            <Breadcrumb.Item
              onClick={() => navigate("/admin/dashboard")}
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                color: '#495057'
              }}
            >
              <FiArrowLeft style={{ marginRight: 4 }} />
              Dashboard
            </Breadcrumb.Item>
            <Breadcrumb.Item
              onClick={() => navigate("/admin/products")}
              style={{
                cursor: "pointer",
                color: '#6c757d'
              }}
            >
              Products
            </Breadcrumb.Item>
            <Breadcrumb.Item active style={{ color: '#343a40' }}>
              {editingId ? "Edit Product" : "Add Product"}
            </Breadcrumb.Item>
          </Breadcrumb>

          <div className="text-center mb-4">
            <h1 className="text-dark mb-2" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: '700' }}>
              <FiPackage className="me-3" />
              {editingId ? "Edit Product" : "Add New Product"}
            </h1>
            <p className="text-muted mb-0" style={{ fontSize: 'clamp(0.9rem, 2vw, 1.1rem)' }}>
              {editingId ? "Update product information" : "Create a new product in your inventory"}
            </p>
          </div>
        </div>

        {/* Form Section */}
        <Row className="justify-content-center">
          <Col xs={12} md={10} lg={8} xl={6}>
            <Card className="border-0 shadow-lg" style={{ borderRadius: '20px' }}>
              <Card.Body className="p-4 p-md-5">
                {alert.show && (
                  <Alert variant={alert.variant} className="mb-4" style={{ borderRadius: '12px' }}>
                    {alert.message}
                  </Alert>
                )}

                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                  <Row>
                    <Col md={12}>
                      <Form.Group className="mb-4" controlId="formName">
                        <Form.Label className="fw-semibold text-dark mb-2" style={{ fontSize: '1rem' }}>
                          <FiPackage className="me-2" />
                          Product Name
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter product name"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          required
                          style={{ 
                            borderRadius: '12px', 
                            border: '2px solid #e9ecef',
                            fontSize: '1rem',
                            padding: '12px 16px',
                            transition: 'all 0.3s ease'
                          }}
                          className="form-control-lg"
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
                        <Form.Label className="fw-semibold text-dark mb-2" style={{ fontSize: '1rem' }}>
                          <FiDollarSign className="me-2" />
                          Price (₹)
                        </Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="0.00"
                          value={form.price}
                          onChange={(e) => setForm({ ...form, price: e.target.value })}
                          required
                          min="0"
                          step="0.01"
                          style={{ 
                            borderRadius: '12px', 
                            border: '2px solid #e9ecef',
                            fontSize: '1rem',
                            padding: '12px 16px',
                            transition: 'all 0.3s ease'
                          }}
                          className="form-control-lg"
                        />
                        <Form.Control.Feedback type="invalid">
                          Please provide a valid price.
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    
                    <Col md={6}>
                      <Form.Group className="mb-4" controlId="formCategory">
                        <Form.Label className="fw-semibold text-dark mb-2" style={{ fontSize: '1rem' }}>
                          <FiTag className="me-2" />
                          Category
                        </Form.Label>
                        <Form.Select
                          value={form.category}
                          onChange={handleCategoryChange}
                          required
                          style={{ 
                            borderRadius: '12px', 
                            border: '2px solid #e9ecef',
                            fontSize: '1rem',
                            padding: '12px 16px',
                            transition: 'all 0.3s ease'
                          }}
                          className="form-control-lg"
                        >
                          <option value="">Select Category</option>
                          {categoriesLoading ? (
                            <option disabled>Loading categories...</option>
                          ) : (
                            categories.map((cat) => (
                              <option key={cat._id} value={cat.name}>{cat.name}</option>
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
                        <Form.Label className="fw-semibold text-dark mb-2" style={{ fontSize: '1rem' }}>
                          <FiLayers className="me-2" />
                          Subcategory
                        </Form.Label>
                        <Form.Select
                          value={form.subCategory}
                          onChange={(e) => setForm({ ...form, subCategory: e.target.value })}
                          disabled={!form.category}
                          style={{ 
                            borderRadius: '12px', 
                            border: '2px solid #e9ecef',
                            fontSize: '1rem',
                            padding: '12px 16px',
                            transition: 'all 0.3s ease',
                            backgroundColor: !form.category ? '#f8f9fa' : '#fff'
                          }}
                          className="form-control-lg"
                        >
                          <option value="">Select Subcategory</option>
                          {subCategoryOptions.map((sub) => (
                            <option key={sub._id} value={sub.name}>{sub.name}</option>
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
                        <Form.Label className="fw-semibold text-dark mb-2" style={{ fontSize: '1rem' }}>
                          <FiFileText className="me-2" />
                          Description
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={4}
                          placeholder="Enter product description..."
                          value={form.description}
                          onChange={(e) => setForm({ ...form, description: e.target.value })}
                          style={{ 
                            borderRadius: '12px', 
                            border: '2px solid #e9ecef',
                            fontSize: '1rem',
                            padding: '12px 16px',
                            transition: 'all 0.3s ease',
                            resize: 'vertical'
                          }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Multiple Images Upload Section */}
                  <Row>
                    <Col md={12}>
                      <Form.Group className="mb-4" controlId="formImages">
                        <Form.Label className="fw-semibold text-dark mb-3" style={{ fontSize: '1rem' }}>
                          <FiCamera className="me-2" />
                          Product Images (Maximum 10)
                        </Form.Label>
                        
                        {/* Drag & Drop Zone */}
                        <div
                          className={`border-2 border-dashed rounded-3 p-4 text-center mb-3 ${
                            dragOver ? 'border-primary bg-light' : 'border-secondary'
                          }`}
                          style={{
                            borderStyle: 'dashed',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <FiCamera size={48} className="text-muted mb-2" />
                          <p className="mb-2 text-muted">
                            <strong>Click to upload</strong> or drag and drop images here
                          </p>
                          <small className="text-muted">
                            JPEG, PNG, GIF, WebP up to 10MB each
                          </small>
                        </div>
                        
                        {/* Hidden File Input */}
                        <Form.Control
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageChange}
                          style={{ display: 'none' }}
                        />
                        
                        {/* Image Previews Grid */}
                        {(imagePreviews.length > 0 || existingImages.length > 0) && (
                          <div className="mt-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <h6 className="mb-0 text-dark">
                                Selected Images ({imagePreviews.length + existingImages.length}/10)
                              </h6>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={handleRemoveAllImages}
                                style={{ borderRadius: '8px' }}
                              >
                                <FiX className="me-1" />
                                Remove All
                              </Button>
                            </div>
                            
                            <Row className="g-3">
                              {/* Existing Images */}
                              {existingImages.map((img, index) => (
                                <Col xs={6} sm={4} md={3} key={`existing-${index}`}>
                                  <div className="position-relative">
                                    <Image
                                      src={img.url}
                                      alt={img.originalName || `Existing image ${index + 1}`}
                                      thumbnail
                                      style={{
                                        width: '100%',
                                        height: '120px',
                                        objectFit: 'cover',
                                        borderRadius: '8px'
                                      }}
                                    />
                                    {img.isPrimary && (
                                      <div
                                        className="position-absolute top-0 start-0 bg-primary text-white px-2 py-1"
                                        style={{
                                          fontSize: '0.7rem',
                                          borderRadius: '8px 0 8px 0'
                                        }}
                                      >
                                        Primary
                                      </div>
                                    )}
                                    <div
                                      className="position-absolute bottom-0 start-0 end-0 bg-dark bg-opacity-75 text-white p-1"
                                      style={{
                                        fontSize: '0.7rem',
                                        borderRadius: '0 0 8px 8px'
                                      }}
                                    >
                                      <small className="text-truncate d-block">
                                        {img.originalName || 'Existing'}
                                      </small>
                                    </div>
                                  </div>
                                </Col>
                              ))}
                              
                              {/* New Image Previews */}
                              {imagePreviews.map((imgData, index) => (
                                <Col xs={6} sm={4} md={3} key={`new-${index}`}>
                                  <div className="position-relative">
                                    <Image
                                      src={imgData.preview}
                                      alt={imgData.name}
                                      thumbnail
                                      style={{
                                        width: '100%',
                                        height: '120px',
                                        objectFit: 'cover',
                                        borderRadius: '8px'
                                      }}
                                    />
                                    <Button
                                      variant="danger"
                                      size="sm"
                                      className="position-absolute"
                                      style={{
                                        top: '5px',
                                        right: '5px',
                                        borderRadius: '50%',
                                        width: '25px',
                                        height: '25px',
                                        padding: '0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                      }}
                                      onClick={() => handleRemoveImage(index)}
                                    >
                                      <FiX size={12} />
                                    </Button>
                                    {index === 0 && existingImages.length === 0 && (
                                      <div
                                        className="position-absolute top-0 start-0 bg-success text-white px-2 py-1"
                                        style={{
                                          fontSize: '0.7rem',
                                          borderRadius: '8px 0 8px 0'
                                        }}
                                      >
                                        Primary
                                      </div>
                                    )}
                                    <div
                                      className="position-absolute bottom-0 start-0 end-0 bg-dark bg-opacity-75 text-white p-1"
                                      style={{
                                        fontSize: '0.7rem',
                                        borderRadius: '0 0 8px 8px'
                                      }}
                                    >
                                      <small className="text-truncate d-block">{imgData.name}</small>
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
                          <br />
                          • First image will be set as primary
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="d-grid gap-2 mt-4">
                    <Button 
                      variant="primary" 
                      type="submit" 
                      disabled={loading || imageUploading}
                      size="lg"
                      style={{
                        borderRadius: '12px',
                        fontWeight: '600',
                        padding: '16px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        fontSize: '1.1rem',
                        transition: 'all 0.3s ease'
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
                          {imageUploading ? `Uploading ${imageFiles.length} image${imageFiles.length > 1 ? 's' : ''}...` : 
                           loading ? (editingId ? "Updating..." : "Adding...") : ""}
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
                        borderRadius: '12px',
                        fontWeight: '500',
                        padding: '16px',
                        fontSize: '1rem'
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