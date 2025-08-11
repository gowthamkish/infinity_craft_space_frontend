import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import Header from "../header";
const ProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState({});

  useEffect(() => {
    const fetchProducts = async () => {
      const token = localStorage.getItem("token");
      const res = await api.get("/api/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data);
    };
    fetchProducts();
  }, []);

  const handleEdit = (product) => [
    navigate(`/admin/addProduct/${product?._id}`, {
      state: { product },
    }),
  ];

  return (
    <div>
      <Header />

      <h1>Product List</h1>

      <button onClick={() => navigate("/admin/addProduct")}>Add Product</button>

      <table border={1}>
        <thead>
          <th>Product Name</th>
          <th>Price</th>
          <th>Description</th>
          <th>Category</th>
          <th>Sub category</th>
          <th>Action</th>
          <th>Remove</th>
        </thead>

        <tbody>
          {products.length > 0 &&
            products.map((product) => {
              return (
                <tr>
                  <td>{product?.name}</td>
                  <td>{product?.price}</td>
                  <td>{product?.description}</td>
                  <td>{product?.category}</td>
                  <td>{product?.subCategory}</td>
                  <td>
                    <a onClick={() => handleEdit(product)}>Edit</a>
                  </td>
                  <td>
                    <a>Delete</a>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
};

export default ProductList;
