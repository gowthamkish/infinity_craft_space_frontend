import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import Header from "../header";
import Table from "react-bootstrap/Table";
import { Container, Breadcrumb, Button, Spinner } from "react-bootstrap";
import { FiArrowLeft } from "react-icons/fi";

const ProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleEdit = (product) => {
    navigate(`/admin/addProduct/${product?._id}`, {
      state: { product },
    });
  };

  return (
    <div>
      <Header />

      <Container fluid className="mt-4">
        <div className="d-flex align-items-center mb-3">
          <Breadcrumb className="mb-0">
            <Breadcrumb.Item
              onClick={() => navigate("/admin/dashboard")}
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <FiArrowLeft style={{ marginRight: 4 }} />
              Dashboard
            </Breadcrumb.Item>
            <Breadcrumb.Item active>Products</Breadcrumb.Item>
          </Breadcrumb>
        </div>

        <h1 style={{ textAlign: "left" }} className="ms-3 mb-4">
          Product List
        </h1>

        {loading ? (
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ minHeight: "200px" }}
          >
            <Spinner animation="border" role="status" />
          </div>
        ) : (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Price</th>
                <th>Description</th>
                <th>Category</th>
                <th>Sub category</th>
                <th>Action</th>
                <th>Remove</th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 &&
                products.map((product) => (
                  <tr key={product._id || product.id}>
                    <td>{product?.name}</td>
                    <td>{product?.price}</td>
                    <td>{product?.description}</td>
                    <td>{product?.category}</td>
                    <td>{product?.subCategory}</td>
                    <td>
                      <Button
                        variant="link"
                        onClick={() => handleEdit(product)}
                        style={{ padding: 0 }}
                      >
                        Edit
                      </Button>
                    </td>
                    <td>
                      <Button variant="link" style={{ padding: 0 }}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </Table>
        )}

        <Button
          variant="primary"
          className="mb-3"
          onClick={() => navigate("/admin/addProduct")}
        >
          Add Product
        </Button>
      </Container>
    </div>
  );
};

export default ProductList;
