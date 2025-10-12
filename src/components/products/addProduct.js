import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Form, Button, Container, Row, Col, Card, Breadcrumb, Alert, Spinner } from "react-bootstrap";
import { FiArrowLeft, FiPackage, FiSave, FiDollarSign, FiFileText, FiTag, FiLayers } from "react-icons/fi";
import Header from "../header";
import { addProduct, updateProduct } from "../../features/productsSlice";

const CATEGORY_OPTIONS = [
  "Embroidery hoop",
  "Emboidery with hoop",
  "Bangles",
  "Necklace",
];

// Map category to subcategories
const SUBCATEGORY_MAP = {
  "Embroidery hoop": ["Round", "Square", "Oval", "Custom"],
  "Emboidery with hoop": ["Round", "Square"],
  "Bangles": ["Gold", "Silver", "Custom"],
  "Necklace": ["Choker", "Pendant", "Custom"],
};

const AddProduct = () => {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

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

  // Get subcategories for selected category
  const subCategoryOptions = form.category ? SUBCATEGORY_MAP[form.category] || [] : [];

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
      if (editingId) {
        await dispatch(updateProduct({ id: editingId, productData: form })).unwrap();
        setAlert({ 
          show: true, 
          message: "Product updated successfully!", 
          variant: "success" 
        });
      } else {
        await dispatch(addProduct(form)).unwrap();
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
        setValidated(false);
      }

      // Navigate after delay to show success message
      setTimeout(() => {
        navigate("/admin/products");
      }, 1500);

    } catch (err) {
      console.error("Error submitting form:", err);
      setAlert({ 
        show: true, 
        message: err || "An error occurred while saving the product", 
        variant: "danger" 
      });
    } finally {
      setLoading(false);
    }
  };

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
      
      <Container fluid className="py-4" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', minHeight: '100vh' }}>
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
                          {CATEGORY_OPTIONS.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
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
                            <option key={sub} value={sub}>{sub}</option>
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

                  <div className="d-grid gap-2 mt-4">
                    <Button 
                      variant="primary" 
                      type="submit" 
                      disabled={loading}
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
                      {loading ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-2"
                          />
                          {editingId ? "Updating..." : "Adding..."}
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
                      disabled={loading}
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