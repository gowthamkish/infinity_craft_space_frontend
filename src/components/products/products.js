import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Modal } from "react-bootstrap";
import { OrbitLoader, DotsLoader } from "../Loader";
import AdminLayout from "../admin/AdminLayout";
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiPackage,
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiCheckCircle,
} from "react-icons/fi";
import { useProducts } from "../../hooks/useSmartFetch";
import { deleteProduct, restockProduct } from "../../features/productsSlice";
import "../admin/admin.css";

const formatDateTime = (dateString) => {
  if (!dateString) return null;
  const d = new Date(dateString);
  return {
    date: d.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" }),
    time: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true }),
  };
};

function StockBadge({ product }) {
  if (product?.trackInventory === false)
    return <span className="adm-badge adm-badge--gray">Unlimited</span>;
  if (product?.stock === undefined || product?.stock === null)
    return <span className="adm-badge adm-badge--blue">Not Set</span>;
  if (product.stock <= 0)
    return <span className="adm-badge adm-badge--red">Out of Stock</span>;
  if (product.stock <= (product.lowStockThreshold || 5))
    return <span className="adm-badge adm-badge--amber">Low · {product.stock}</span>;
  return <span className="adm-badge adm-badge--green">{product.stock} in stock</span>;
}

function ProductThumb({ product }) {
  const src = product?.images?.[0]?.url || product?.image?.url;
  if (src)
    return (
      <div style={{ position: "relative", display: "inline-block" }}>
        <img
          src={src}
          alt={product.name}
          className="adm-product-thumb"
          onError={(e) => { e.target.style.display = "none"; }}
        />
        {(product?.images?.length || 0) > 1 && (
          <span
            style={{
              position: "absolute", bottom: -4, right: -4,
              background: "var(--adm-primary)", color: "white",
              fontSize: "9px", fontWeight: 700, lineHeight: 1,
              padding: "2px 4px", borderRadius: 4, pointerEvents: "none",
            }}
          >
            +{product.images.length - 1}
          </span>
        )}
      </div>
    );
  return (
    <div className="adm-product-thumb-placeholder">
      <FiPackage size={18} />
    </div>
  );
}

const ProductList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data: products = [], loading = false } = useProducts() || {};

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [restockTarget, setRestockTarget] = useState(null);
  const [restockQty, setRestockQty]       = useState("");
  const [restockNote, setRestockNote]     = useState("");
  const [restockLoading, setRestockLoading] = useState(false);
  const [restockError, setRestockError]   = useState(null);
  const [restockDone, setRestockDone]     = useState(null);

  const handleEdit = (product) =>
    navigate(`/admin/addProduct/${product._id}`, { state: { product } });

  const openRestockModal = (product) => {
    setRestockTarget(product);
    setRestockQty(""); setRestockNote(""); setRestockError(null); setRestockDone(null);
  };
  const closeRestockModal = () => {
    setRestockTarget(null); setRestockDone(null); setRestockError(null);
  };

  const handleRestockSubmit = async () => {
    const qty = parseInt(restockQty, 10);
    if (!qty || qty <= 0) { setRestockError("Please enter a valid quantity greater than 0."); return; }
    setRestockLoading(true); setRestockError(null);
    try {
      const result = await dispatch(restockProduct({ id: restockTarget._id, quantity: qty, note: restockNote })).unwrap();
      setRestockDone({ prev: result.stock - qty, added: qty, newStock: result.stock });
    } catch (err) {
      setRestockError(err || "Failed to restock. Please try again.");
    } finally {
      setRestockLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await dispatch(deleteProduct(selectedProduct._id)).unwrap();
      setShowDeleteModal(false); setSelectedProduct(null);
    } catch { /* handled by redux */ } finally {
      setDeleteLoading(false);
    }
  };

  const categories = products && Array.isArray(products)
    ? [...new Set(products.map((p) => p?.category).filter(Boolean))]
    : [];

  const filteredProducts = products && Array.isArray(products)
    ? products.filter((p) => {
        const q = searchTerm.toLowerCase();
        const match = p?.name?.toLowerCase().includes(q) || p?.category?.toLowerCase().includes(q);
        const cat = selectedCategory === "all" || p?.category === selectedCategory;
        return match && cat;
      })
    : [];

  return (
    <AdminLayout>
      {/* Page header */}
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">
            <FiPackage size={22} style={{ color: "var(--adm-primary)" }} />
            Products
          </h1>
          <p className="adm-page-sub">{products.length} total products</p>
        </div>
        <button className="adm-btn adm-btn-primary adm-btn-lg" onClick={() => navigate("/admin/addProduct")}>
          <FiPlus size={16} />
          Add Product
        </button>
      </div>

      {/* Filter bar */}
      <div className="adm-card" style={{ marginBottom: "var(--adm-space-4)" }}>
        <div className="adm-card-body" style={{ padding: "var(--adm-space-4) var(--adm-space-5) !important" }}>
          <div className="adm-filter-bar">
            <div className="adm-search-wrap">
              <FiSearch className="adm-search-icon" size={15} />
              <input
                className="adm-search-input"
                placeholder="Search products…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FiFilter size={14} style={{ color: "var(--adm-text-tertiary)" }} />
              <select
                className="adm-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {(searchTerm || selectedCategory !== "all") && (
              <span style={{ fontSize: "var(--adm-font-xs)", color: "var(--adm-text-tertiary)" }}>
                {filteredProducts.length} result{filteredProducts.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Table card */}
      <div className="adm-card">
        {loading ? (
          <div className="adm-loading"><OrbitLoader size="lg" /><span>Loading products…</span></div>
        ) : filteredProducts.length === 0 ? (
          <div className="adm-empty">
            <div className="adm-empty-icon"><FiPackage size={28} /></div>
            <p className="adm-empty-title">No products found</p>
            <p className="adm-empty-sub">
              {searchTerm || selectedCategory !== "all"
                ? "Try adjusting your search or filters."
                : "Add your first product to get started."}
            </p>
            {!(searchTerm || selectedCategory !== "all") && (
              <button className="adm-btn adm-btn-primary" onClick={() => navigate("/admin/addProduct")}>
                <FiPlus size={14} /> Add Product
              </button>
            )}
          </div>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th style={{ width: 60 }}>Img</th>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Category</th>
                  <th>Stock</th>
                  <th>Weight</th>
                  <th>Last Edited</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const edited = formatDateTime(product.lastEditedAt);
                  return (
                    <tr key={product._id || product.id}>
                      <td><ProductThumb product={product} /></td>

                      <td>
                        <div style={{ fontWeight: 600, color: "var(--adm-text-primary)", marginBottom: 2 }}>
                          {product.name}
                        </div>
                        <div
                          className="adm-td-muted"
                          style={{
                            display: "-webkit-box", WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical", overflow: "hidden",
                            maxWidth: 280,
                          }}
                        >
                          {product.description}
                        </div>
                      </td>

                      <td>
                        <span style={{ fontWeight: 700, color: "var(--adm-success)", fontSize: "0.9375rem" }}>
                          ₹{product.price}
                        </span>
                      </td>

                      <td>
                        <span className="adm-badge adm-badge--blue" style={{ marginBottom: 3, display: "inline-flex" }}>
                          {product.category}
                        </span>
                        {product.subCategory && (
                          <span className="adm-badge adm-badge--gray" style={{ display: "block", marginTop: 3 }}>
                            {product.subCategory}
                          </span>
                        )}
                      </td>

                      <td><StockBadge product={product} /></td>

                      <td className="adm-td-muted">
                        {product.weightInGrams
                          ? product.weightInGrams >= 1000
                            ? `${(product.weightInGrams / 1000).toFixed(2).replace(/\.?0+$/, "")} kg`
                            : `${product.weightInGrams} g`
                          : "—"}
                      </td>

                      <td>
                        {edited ? (
                          <>
                            <div style={{ fontWeight: 500, fontSize: "var(--adm-font-sm)" }}>{edited.date}</div>
                            <div className="adm-td-muted">{edited.time}</div>
                            {product.lastEditedBy?.name && (
                              <div className="adm-td-muted">{product.lastEditedBy.name}</div>
                            )}
                          </>
                        ) : (
                          <span className="adm-td-muted">—</span>
                        )}
                      </td>

                      <td>
                        <div className="adm-row-actions" style={{ justifyContent: "center" }}>
                          <button
                            className="adm-btn-icon"
                            title="Edit"
                            onClick={() => handleEdit(product)}
                            style={{ color: "var(--adm-primary)" }}
                          >
                            <FiEdit2 size={14} />
                          </button>
                          {product.trackInventory !== false && (
                            <button
                              className="adm-btn-icon"
                              title="Restock"
                              onClick={() => openRestockModal(product)}
                              style={{ color: "var(--adm-success)" }}
                            >
                              <FiRefreshCw size={14} />
                            </button>
                          )}
                          <button
                            className="adm-btn-icon danger"
                            title="Delete"
                            onClick={() => { setSelectedProduct(product); setShowDeleteModal(true); }}
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Restock Modal */}
      <Modal show={!!restockTarget} onHide={closeRestockModal} centered size="sm" className="adm-modal">
        <Modal.Header closeButton>
          <Modal.Title><FiRefreshCw size={16} style={{ color: "var(--adm-success)", marginRight: 8 }} />Restock Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {restockDone ? (
            <div style={{ textAlign: "center", padding: "0.5rem 0 1rem" }}>
              <FiCheckCircle size={44} style={{ color: "var(--adm-success)", marginBottom: 12 }} />
              <p style={{ fontWeight: 700, marginBottom: 4 }}>Restock Successful!</p>
              <p style={{ color: "var(--adm-text-secondary)", fontSize: "var(--adm-font-sm)", marginBottom: 16 }}>{restockTarget?.name}</p>
              <div className="adm-alert adm-alert--success" style={{ flexDirection: "column", gap: 6, textAlign: "left" }}>
                <div className="adm-kv-row"><span className="adm-kv-label">Previous stock</span><span className="adm-kv-value">{restockDone.prev}</span></div>
                <div className="adm-kv-row"><span className="adm-kv-label">Added</span><span className="adm-kv-value">+{restockDone.added}</span></div>
                <div className="adm-kv-row" style={{ borderTop: "1px solid #a7f3d0", paddingTop: 6, marginTop: 2 }}><span className="adm-kv-label" style={{ fontWeight: 700 }}>New stock</span><span className="adm-kv-value" style={{ fontSize: "1rem" }}>{restockDone.newStock}</span></div>
              </div>
            </div>
          ) : (
            <>
              <p style={{ color: "var(--adm-text-secondary)", fontSize: "var(--adm-font-sm)", marginBottom: 16 }}>
                Adding stock to <strong>{restockTarget?.name}</strong>.{" "}
                {restockTarget?.trackInventory && <>Current: <strong>{restockTarget?.stock ?? 0}</strong></>}
              </p>
              {restockError && <div className="adm-alert adm-alert--error">{restockError}</div>}
              <div className="adm-form-group">
                <label className="adm-label">Quantity to Add <span style={{ color: "var(--adm-danger)" }}>*</span></label>
                <input className="adm-input" type="number" min="1" value={restockQty} onChange={(e) => setRestockQty(e.target.value)} placeholder="e.g. 50" autoFocus />
              </div>
              <div className="adm-form-group" style={{ marginBottom: 0 }}>
                <label className="adm-label">Note <span style={{ fontWeight: 400, color: "var(--adm-text-tertiary)" }}>(optional)</span></label>
                <input className="adm-input" type="text" value={restockNote} onChange={(e) => setRestockNote(e.target.value)} placeholder="e.g. Supplier batch #42" />
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          {restockDone ? (
            <button className="adm-btn adm-btn-success" style={{ width: "100%" }} onClick={closeRestockModal}>Done</button>
          ) : (
            <>
              <button className="adm-btn adm-btn-secondary" onClick={closeRestockModal}>Cancel</button>
              <button className="adm-btn adm-btn-success" onClick={handleRestockSubmit} disabled={restockLoading} style={{ flex: 1 }}>
                {restockLoading ? <><DotsLoader size="sm" /> Adding…</> : <><FiRefreshCw size={14} /> Add Stock</>}
              </button>
            </>
          )}
        </Modal.Footer>
      </Modal>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered className="adm-modal">
        <Modal.Header closeButton>
          <Modal.Title style={{ color: "var(--adm-danger)" }}><FiTrash2 size={16} style={{ marginRight: 8 }} />Delete Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p style={{ margin: 0 }}>
            Are you sure you want to delete <strong>{selectedProduct?.name}</strong>? This action cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <button className="adm-btn adm-btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
          <button className="adm-btn adm-btn-danger" onClick={handleDeleteConfirm} disabled={deleteLoading}>
            {deleteLoading ? <><DotsLoader size="sm" /> Deleting…</> : <><FiTrash2 size={14} /> Delete</>}
          </button>
        </Modal.Footer>
      </Modal>
    </AdminLayout>
  );
};

export default ProductList;
