import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { fetchProducts } from "../../features/productsSlice";
import { useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";

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

  console.log(params);

  const [editingId, setEditingId] = useState(params?.id ?? null); // for tracking update mode

  const handleSubmit = async (e) => {
    const token = localStorage.getItem("token");

    e.preventDefault();
    debugger;
    try {
      if (editingId) {
        // Update product
        await api.put(`/api/products/${editingId}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEditingId(null); // Exit edit mode
      } else {
        // Add new product
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
    console.log(product)
    if (editingId) {
      setForm({
        name: product.name,
        price: product.price,
        description: product.description,
        category: product.category,
        subCategory: product.subCategory,
      });
    }
  }, [editingId]);

  return (
    <div>
      <h1>{editingId ? "Update" : "Add"} Product</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          placeholder="Price"
          type="number"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          required
        />
        <input
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <input
          placeholder="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />
        <input
          placeholder="Subcategory"
          value={form.subCategory}
          onChange={(e) => setForm({ ...form, subCategory: e.target.value })}
        />
        <button type="submit">{editingId ? "Update" : "Add"} Product</button>
      </form>
    </div>
  );
};

export default AddProduct;
