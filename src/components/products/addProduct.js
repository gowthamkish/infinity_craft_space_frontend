import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Form, Button, Container, Row, Col, Card } from "react-bootstrap";

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

  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    subCategory: "",
  });

  const [editingId, setEditingId] = useState(params?.id ?? null);

  // Get subcategories for selected category
  const subCategoryOptions = form.category ? SUBCATEGORY_MAP[form.category] || [] : [];

  const handleSubmit = async (e) => {
    const token = localStorage.getItem("token");

    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/api/products/${editingId}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEditingId(null);
      } else {
        await api.post("/api/products", form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setForm({
        name: "",
        price: "",
        description: "",
        category: "",
        subCategory: "",
      });

      navigate("/admin/products");
    } catch (err) {
      console.error("Error submitting form:", err);
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
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6}>
          <Card>
            <Card.Body>
              <Card.Title className="mb-4">
                {editingId ? "Update" : "Add"} Product
              </Card.Title>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formName">
                  <Form.Label style={{ textAlign: "left", display: "block" }}>Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formPrice">
                  <Form.Label style={{ textAlign: "left", display: "block" }}>Price</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Price"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formDescription">
                  <Form.Label style={{ textAlign: "left", display: "block" }}>Description</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Description"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formCategory">
                  <Form.Label style={{ textAlign: "left", display: "block" }}>Category</Form.Label>
                  <Form.Select
                    value={form.category}
                    onChange={handleCategoryChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formSubCategory">
                  <Form.Label style={{ textAlign: "left", display: "block" }}>Subcategory</Form.Label>
                  <Form.Select
                    value={form.subCategory}
                    onChange={(e) => setForm({ ...form, subCategory: e.target.value })}
                    disabled={!form.category}
                  >
                    <option value="">Select Subcategory</option>
                    {subCategoryOptions.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Button variant="primary" type="submit" className="w-100">
                  {editingId ? "Update" : "Add"} Product
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AddProduct;