import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  Chip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  InputAdornment,
  CircularProgress,
  Alert,
  Stack,
  Divider,
  Avatar,
  Tooltip,
} from "@mui/material";
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
    return <Chip label="Unlimited" size="small" sx={{ bgcolor: "#e2e8f0", color: "#475569", fontWeight: 600, fontSize: "0.72rem" }} />;
  if (product?.stock === undefined || product?.stock === null)
    return <Chip label="Not Set" size="small" color="primary" variant="outlined" sx={{ fontWeight: 600, fontSize: "0.72rem" }} />;
  if (product.stock <= 0)
    return <Chip label="Out of Stock" size="small" sx={{ bgcolor: "#fee2e2", color: "#dc2626", fontWeight: 600, fontSize: "0.72rem" }} />;
  if (product.stock <= (product.lowStockThreshold || 5))
    return <Chip label={`Low · ${product.stock}`} size="small" sx={{ bgcolor: "#fef3c7", color: "#92400e", fontWeight: 600, fontSize: "0.72rem" }} />;
  return <Chip label={`${product.stock} in stock`} size="small" sx={{ bgcolor: "#d1fae5", color: "#065f46", fontWeight: 600, fontSize: "0.72rem" }} />;
}

function ProductThumb({ product }) {
  const src = product?.images?.[0]?.url || product?.image?.url;
  if (src)
    return (
      <Box sx={{ position: "relative", display: "inline-block" }}>
        <Avatar
          src={src}
          alt={product.name}
          variant="rounded"
          sx={{ width: 44, height: 44 }}
          imgProps={{ onError: (e) => { e.target.style.display = "none"; } }}
        />
        {(product?.images?.length || 0) > 1 && (
          <Box
            sx={{
              position: "absolute", bottom: -4, right: -4,
              bgcolor: "primary.main", color: "white",
              fontSize: "9px", fontWeight: 700, lineHeight: 1,
              px: "4px", py: "2px", borderRadius: "4px", pointerEvents: "none",
            }}
          >
            +{product.images.length - 1}
          </Box>
        )}
      </Box>
    );
  return (
    <Avatar variant="rounded" sx={{ width: 44, height: 44, bgcolor: "#f1f5f9", color: "#94a3b8" }}>
      <FiPackage size={18} />
    </Avatar>
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
  const [restockQty, setRestockQty] = useState("");
  const [restockNote, setRestockNote] = useState("");
  const [restockLoading, setRestockLoading] = useState(false);
  const [restockError, setRestockError] = useState(null);
  const [restockDone, setRestockDone] = useState(null);

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
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FiPackage size={22} style={{ color: "#8B1A4A" }} />
            Products
          </Typography>
          <Typography variant="body2" color="text.secondary">{products.length} total products</Typography>
        </Box>
        <button className="adm-btn adm-btn-primary adm-btn-lg" onClick={() => navigate("/admin/addProduct")}>
          <FiPlus size={16} />
          Add Product
        </button>
      </Box>

      {/* Filter bar */}
      <Card elevation={0} sx={{ mb: 2, border: "1px solid #e2e8f0", borderRadius: 2 }}>
        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
            <TextField
              size="small"
              placeholder="Search products…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start"><FiSearch size={15} color="#94a3b8" /></InputAdornment>
                  ),
                },
              }}
              sx={{ minWidth: 220, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
            <Stack direction="row" spacing={1} alignItems="center">
              <FiFilter size={14} color="#94a3b8" />
              <Select
                size="small"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                sx={{ minWidth: 160, borderRadius: 2 }}
              >
                <MenuItem value="all">All Categories</MenuItem>
                {categories.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
            </Stack>
            {(searchTerm || selectedCategory !== "all") && (
              <Typography variant="caption" color="text.secondary">
                {filteredProducts.length} result{filteredProducts.length !== 1 ? "s" : ""}
              </Typography>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Table card */}
      <Card elevation={0} sx={{ border: "1px solid #e2e8f0", borderRadius: 2 }}>
        {loading ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 8, gap: 2 }}>
            <OrbitLoader size="lg" />
            <Typography color="text.secondary">Loading products…</Typography>
          </Box>
        ) : filteredProducts.length === 0 ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 8, gap: 1 }}>
            <Box sx={{ color: "#cbd5e1", mb: 1 }}><FiPackage size={36} /></Box>
            <Typography fontWeight={600} color="text.primary">No products found</Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm || selectedCategory !== "all"
                ? "Try adjusting your search or filters."
                : "Add your first product to get started."}
            </Typography>
            {!(searchTerm || selectedCategory !== "all") && (
              <button className="adm-btn adm-btn-primary" onClick={() => navigate("/admin/addProduct")} style={{ marginTop: 8 }}>
                <FiPlus size={14} /> Add Product
              </button>
            )}
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "#f8fafc" }}>
                  <TableCell sx={{ fontWeight: 700, color: "#64748b", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.04em", width: 60 }}>Img</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#64748b", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>Product</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#64748b", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>Price</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#64748b", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#64748b", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>Stock</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#64748b", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>Weight</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#64748b", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>Last Edited</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: "#64748b", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProducts.map((product) => {
                  const edited = formatDateTime(product.lastEditedAt);
                  return (
                    <TableRow key={product._id || product.id} sx={{ "&:hover": { bgcolor: "#faf5ff" }, transition: "background 150ms" }}>
                      <TableCell><ProductThumb product={product} /></TableCell>

                      <TableCell>
                        <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ mb: 0.25 }}>
                          {product.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", maxWidth: 280 }}
                        >
                          {product.description}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" fontWeight={700} sx={{ color: "#059669", fontSize: "0.9375rem" }}>
                          ₹{product.price}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Stack spacing={0.5}>
                          <Chip label={product.category} size="small" color="primary" variant="outlined" sx={{ fontWeight: 600, fontSize: "0.72rem" }} />
                          {product.subCategory && (
                            <Chip label={product.subCategory} size="small" sx={{ bgcolor: "#e2e8f0", color: "#475569", fontWeight: 600, fontSize: "0.72rem" }} />
                          )}
                        </Stack>
                      </TableCell>

                      <TableCell><StockBadge product={product} /></TableCell>

                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {product.weightInGrams
                            ? product.weightInGrams >= 1000
                              ? `${(product.weightInGrams / 1000).toFixed(2).replace(/\.?0+$/, "")} kg`
                              : `${product.weightInGrams} g`
                            : "—"}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        {edited ? (
                          <Box>
                            <Typography variant="body2" fontWeight={500}>{edited.date}</Typography>
                            <Typography variant="caption" color="text.secondary">{edited.time}</Typography>
                            {product.lastEditedBy?.name && (
                              <Typography variant="caption" color="text.secondary" display="block">{product.lastEditedBy.name}</Typography>
                            )}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">—</Typography>
                        )}
                      </TableCell>

                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title="Edit">
                            <button className="adm-btn-icon" onClick={() => handleEdit(product)} style={{ color: "#8B1A4A" }}>
                              <FiEdit2 size={14} />
                            </button>
                          </Tooltip>
                          {product.trackInventory !== false && (
                            <Tooltip title="Restock">
                              <button className="adm-btn-icon" onClick={() => openRestockModal(product)} style={{ color: "#059669" }}>
                                <FiRefreshCw size={14} />
                              </button>
                            </Tooltip>
                          )}
                          <Tooltip title="Delete">
                            <button
                              className="adm-btn-icon danger"
                              onClick={() => { setSelectedProduct(product); setShowDeleteModal(true); }}
                            >
                              <FiTrash2 size={14} />
                            </button>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Restock Modal */}
      <Dialog open={!!restockTarget} onClose={closeRestockModal} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FiRefreshCw size={16} style={{ color: "#059669" }} />
          Restock Product
        </DialogTitle>

        <DialogContent>
          {restockDone ? (
            <Box sx={{ textAlign: "center", py: 1 }}>
              <FiCheckCircle size={44} style={{ color: "#059669", marginBottom: 12 }} />
              <Typography fontWeight={700} sx={{ mb: 0.5 }}>Restock Successful!</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{restockTarget?.name}</Typography>
              <Alert severity="success" sx={{ textAlign: "left" }}>
                <Stack spacing={0.5}>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2">Previous stock</Typography>
                    <Typography variant="body2" fontWeight={600}>{restockDone.prev}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2">Added</Typography>
                    <Typography variant="body2" fontWeight={600}>+{restockDone.added}</Typography>
                  </Box>
                  <Divider sx={{ my: 0.5 }} />
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" fontWeight={700}>New stock</Typography>
                    <Typography variant="body1" fontWeight={700}>{restockDone.newStock}</Typography>
                  </Box>
                </Stack>
              </Alert>
            </Box>
          ) : (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Adding stock to <strong>{restockTarget?.name}</strong>.{" "}
                {restockTarget?.trackInventory && <>Current: <strong>{restockTarget?.stock ?? 0}</strong></>}
              </Typography>
              {restockError && <Alert severity="error">{restockError}</Alert>}
              <TextField
                label={<>Quantity to Add <span style={{ color: "#dc2626" }}>*</span></>}
                type="number"
                slotProps={{ htmlInput: { min: 1 } }}
                value={restockQty}
                onChange={(e) => setRestockQty(e.target.value)}
                placeholder="e.g. 50"
                size="small"
                autoFocus
                fullWidth
              />
              <TextField
                label="Note (optional)"
                type="text"
                value={restockNote}
                onChange={(e) => setRestockNote(e.target.value)}
                placeholder="e.g. Supplier batch #42"
                size="small"
                fullWidth
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
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
        </DialogActions>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={showDeleteModal} onClose={() => setShowDeleteModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FiTrash2 size={16} />
          Delete Product
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{selectedProduct?.name}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <button className="adm-btn adm-btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
          <button className="adm-btn adm-btn-danger" onClick={handleDeleteConfirm} disabled={deleteLoading}>
            {deleteLoading ? <><DotsLoader size="sm" /> Deleting…</> : <><FiTrash2 size={14} /> Delete</>}
          </button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
};

export default ProductList;
