import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Switch from "@mui/material/Switch";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import InputAdornment from "@mui/material/InputAdornment";
import MuiAlert from "@mui/material/Alert";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Divider from "@mui/material/Divider";
import { DotsLoader } from "../Loader";
import {
  FiArrowLeft, FiPackage, FiSave, FiCamera, FiX, FiHome,
  FiDollarSign, FiTag, FiTruck, FiSettings,
} from "react-icons/fi";
import AdminLayout from "../admin/AdminLayout";
import { addProduct, updateProduct } from "../../features/productsSlice";
import { fetchPublicCategories } from "../../features/categoriesSlice";

/* ── Section card ───────────────────────────────────────────────── */
const SC = ({ children, sx }) => (
  <Card elevation={0} sx={{ border: "1px solid #e7e5e4", borderRadius: 3, bgcolor: "#fff", ...sx }}>
    <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
      {children}
    </CardContent>
  </Card>
);

/* ── Section header: tinted icon box + title + optional badge ───── */
const SH = ({ icon: Icon, children, badge }) => (
  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
    <Stack direction="row" alignItems="center" spacing={1.5}>
      {Icon && (
        <Box sx={{
          width: 32, height: 32, borderRadius: 1.5,
          bgcolor: "rgba(139,26,74,0.08)", flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center", color: "#8B1A4A",
        }}>
          <Icon size={15} />
        </Box>
      )}
      <Typography variant="subtitle1" fontWeight={700} color="#1c1917" sx={{ lineHeight: 1 }}>
        {children}
      </Typography>
    </Stack>
    {badge !== undefined && (
      <Chip label={badge} size="small" variant="outlined"
        sx={{ fontSize: "0.72rem", fontWeight: 600, borderColor: "#e7e5e4", color: "#6b7280", height: 24 }} />
    )}
  </Stack>
);

/* ── Field label ────────────────────────────────────────────────── */
const FL = ({ children, required }) => (
  <Typography variant="caption"
    sx={{ display: "block", mb: 0.75, fontWeight: 600, fontSize: "0.8rem", color: "#374151" }}>
    {children}
    {required && <Box component="span" sx={{ color: "#ef4444", ml: 0.25 }}>*</Box>}
  </Typography>
);

/* ── Description toolbar button ─────────────────────────────────── */
const FmtBtn = ({ children, onClick }) => (
  <Button type="button" size="small" onClick={onClick}
    sx={{
      minWidth: 32, px: 1, py: 0.375, fontSize: "0.8rem", fontWeight: 700,
      border: "1px solid #e2e8f0", color: "#374151", borderRadius: "6px",
      textTransform: "none", lineHeight: 1.4, bgcolor: "transparent",
      "&:hover": { borderColor: "#8B1A4A", color: "#8B1A4A", bgcolor: "rgba(139,26,74,0.04)" },
    }}>
    {children}
  </Button>
);

/* ══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════════ */
const AddProduct = () => {
  const params   = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const descRef      = useRef(null);

  const { publicCategories: categories = [], publicCategoriesLoading: categoriesLoading } =
    useSelector((s) => s.categories);

  const [form, setForm] = useState({
    name: "", sku: "", price: "", compareAtPrice: "",
    description: "", category: "", subCategory: "",
    stock: "", lowStockThreshold: "5", trackInventory: true,
    estimatedDelivery: "5", weightInGrams: "500",
    isCustomizable: false, processingDaysMin: "10", processingDaysMax: "12",
  });
  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const [weightUnit,     setWeightUnit]     = useState("g");
  const [editingId]                         = useState(params?.id ?? null);
  const [loading,        setLoading]        = useState(false);
  const [alert,          setAlert]          = useState({ show: false, message: "", variant: "" });
  const [imageFiles,     setImageFiles]     = useState([]);
  const [imagePreviews,  setImagePreviews]  = useState([]);
  const [imageUploading, setImageUploading] = useState(false);
  const [existingImages, setExistingImages] = useState([]);
  const [dragOver,       setDragOver]       = useState(false);

  const subCategoryOptions = form.category
    ? categories.find((c) => c.name === form.category)?.subcategories?.filter((s) => s.isActive) || []
    : [];

  /* ── Image helpers ────────────────────────────────────────────── */
  const handleImageChange = (e) => handleFiles(Array.from(e.target.files));
  const handleFiles = (files) => {
    if (imageFiles.length + files.length > 10) {
      setAlert({ show: true, message: "Maximum 10 images allowed", variant: "warning" }); return;
    }
    const validFiles = [], newPreviews = [];
    files.forEach((file) => {
      if (!file.type.startsWith("image/")) { setAlert({ show: true, message: `${file.name} is not a valid image`, variant: "warning" }); return; }
      if (file.size > 10 * 1024 * 1024) { setAlert({ show: true, message: `${file.name} is too large. Max 10 MB`, variant: "warning" }); return; }
      validFiles.push(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push({ id: Date.now() + Math.random(), file, preview: reader.result, name: file.name });
        if (newPreviews.length === validFiles.length) {
          setImageFiles((p) => [...p, ...validFiles]);
          setImagePreviews((p) => [...p, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };
  const removeImage    = (i) => { setImageFiles((p) => p.filter((_, idx) => idx !== i)); setImagePreviews((p) => p.filter((_, idx) => idx !== i)); };
  const removeAllImages = () => { setImageFiles([]); setImagePreviews([]); setExistingImages([]); if (fileInputRef.current) fileInputRef.current.value = ""; };
  const handleDragOver  = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setDragOver(false); };
  const handleDrop      = (e) => { e.preventDefault(); setDragOver(false); handleFiles(Array.from(e.dataTransfer.files)); };

  /* ── Description toolbar ──────────────────────────────────────── */
  const insertFormat = (type) => {
    const ta = descRef.current; if (!ta) return;
    const s = ta.selectionStart, e = ta.selectionEnd, sel = form.description.slice(s, e);
    const map = { bold: `**${sel || "bold"}**`, italic: `_${sel || "italic"}_`, underline: `<u>${sel || "text"}</u>`, list: `\n• ${sel || "item"}` };
    const ins = map[type];
    const next = form.description.slice(0, s) + ins + form.description.slice(e);
    set("description", next);
    setTimeout(() => { ta.focus(); ta.setSelectionRange(s + ins.length, s + ins.length); }, 0);
  };

  /* ── Submit ───────────────────────────────────────────────────── */
  const fileToBase64 = (file) => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file); });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price || !form.category) {
      setAlert({ show: true, message: "Please fill in all required fields", variant: "warning" }); return;
    }
    setLoading(true); setAlert({ show: false, message: "", variant: "" });
    try {
      let productData = { ...form };
      if (imageFiles.length > 0) {
        setImageUploading(true);
        try {
          const imagesData = [];
          for (const file of imageFiles) {
            const b64 = await fileToBase64(file);
            imagesData.push({ base64: b64, filename: file.name, mimetype: file.type, size: file.size, originalName: file.name });
          }
          productData.images = imagesData;
        } catch {
          setAlert({ show: true, message: "Failed to process images. Try fewer or smaller images.", variant: "error" });
          setImageUploading(false); setLoading(false); return;
        }
      }
      if (editingId) {
        await dispatch(updateProduct({ id: editingId, productData })).unwrap();
        setAlert({ show: true, message: "Product updated successfully!", variant: "success" });
      } else {
        await dispatch(addProduct(productData)).unwrap();
        setAlert({ show: true, message: "Product added successfully!", variant: "success" });
      }
      if (!editingId) {
        setForm({ name: "", sku: "", price: "", compareAtPrice: "", description: "", category: "", subCategory: "", stock: "", lowStockThreshold: "5", trackInventory: true, estimatedDelivery: "5", weightInGrams: "500", isCustomizable: false, processingDaysMin: "10", processingDaysMax: "12" });
        removeAllImages();
      }
      setTimeout(() => navigate("/admin/products"), 1500);
    } catch (err) {
      let msg = err?.message || "An error occurred while saving the product";
      if (msg.includes("413") || msg.includes("Payload too large")) msg = "Images are too large. Try fewer or compress them.";
      else if (msg.includes("timeout")) msg = "Request timed out. Try fewer images.";
      setAlert({ show: true, message: msg, variant: "error" });
    } finally { setLoading(false); setImageUploading(false); }
  };

  /* ── Data loading ─────────────────────────────────────────────── */
  useEffect(() => { dispatch(fetchPublicCategories()); }, [dispatch]);
  useEffect(() => {
    const product = location.state?.product;
    if (editingId && product) {
      setForm({
        name: product.name, sku: product.sku || "", price: product.price,
        compareAtPrice: product.compareAtPrice || "", description: product.description,
        category: product.category, subCategory: product.subCategory,
        stock: product.stock !== undefined ? product.stock : "",
        lowStockThreshold: product.lowStockThreshold !== undefined ? product.lowStockThreshold : "5",
        trackInventory: product.trackInventory !== undefined ? product.trackInventory : true,
        estimatedDelivery: product.estimatedDelivery !== undefined ? String(product.estimatedDelivery) : "5",
        weightInGrams: product.weightInGrams !== undefined ? String(product.weightInGrams) : "500",
        isCustomizable: product.isCustomizable ?? false,
        processingDaysMin: product.processingDaysMin !== undefined ? String(product.processingDaysMin) : "10",
        processingDaysMax: product.processingDaysMax !== undefined ? String(product.processingDaysMax) : "12",
      });
      if (product.images?.length > 0) setExistingImages(product.images);
      else if (product.image?.url) setExistingImages([{ url: product.image.url, originalName: product.image.originalName || "image.jpg", isPrimary: true }]);
    }
  }, [editingId, location.state]);

  const alertSeverity = alert.variant === "danger" ? "error" : alert.variant === "warning" ? "warning" : alert.variant === "success" ? "success" : "info";

  /* ── Render ───────────────────────────────────────────────────── */
  return (
    <AdminLayout>
      <Box sx={{ width: "100%" }}>

        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link underline="hover" color="inherit" onClick={() => navigate("/")} sx={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 0.5 }}>
            <FiHome size={14} /> Home
          </Link>
          <Link underline="hover" color="inherit" onClick={() => navigate("/admin/products")} sx={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 0.5 }}>
            <FiPackage size={14} /> Products
          </Link>
          <Typography color="text.primary">{editingId ? "Edit Product" : "Add Product"}</Typography>
        </Breadcrumbs>

        {/* Page header */}
        <Stack direction="row" alignItems="flex-start" gap={2} sx={{ mb: 3 }}>
          <Button variant="outlined" size="small" startIcon={<FiArrowLeft size={14} />}
            onClick={() => navigate("/admin/products")}
            sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 600, flexShrink: 0, mt: 0.25 }}>
            Products
          </Button>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#1e293b", lineHeight: 1.2 }}>
              {editingId ? "Edit Product" : "Add New Product"}
            </Typography>
            <Typography variant="body2" sx={{ color: "#94a3b8", mt: 0.25 }}>
              {editingId ? "Update product details" : "Fill in the details to create a new listing"}
            </Typography>
          </Box>
        </Stack>

        {alert.show && (
          <MuiAlert severity={alertSeverity} onClose={() => setAlert({ show: false, message: "", variant: "" })}
            sx={{ borderRadius: 2, mb: 2.5, fontWeight: 600 }}>
            {alert.message}
          </MuiAlert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3} alignItems="flex-start">

            {/* ════════════════════════════════════
                LEFT COLUMN  — main content (8/12)
                ════════════════════════════════════ */}
            <Grid item xs={12} lg={8}>

              {/* Basic Information */}
              <SC sx={{ mb: 3 }}>
                <SH icon={FiPackage}>Basic Information</SH>

                <FL required>Product name</FL>
                <TextField fullWidth size="small" placeholder="e.g. Handmade Ceramic Mug"
                  value={form.name} onChange={(e) => set("name", e.target.value)} required sx={{ mb: 2.5 }} />

                <Grid container spacing={2} sx={{ mb: 2.5 }}>
                  <Grid item xs={12} sm={4}>
                    <FL required>Category</FL>
                    <FormControl fullWidth size="small" required>
                      <Select value={form.category}
                        onChange={(e) => setForm((f) => ({ ...f, category: e.target.value, subCategory: "" }))}
                        displayEmpty
                        renderValue={(v) => v || <Box component="span" sx={{ color: "#94a3b8" }}>Select category</Box>}>
                        <MenuItem value=""><em>Select category</em></MenuItem>
                        {categoriesLoading ? <MenuItem disabled>Loading…</MenuItem>
                          : categories.map((cat) => <MenuItem key={cat._id} value={cat.name}>{cat.name}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FL>Subcategory</FL>
                    <FormControl fullWidth size="small" disabled={!form.category || subCategoryOptions.length === 0}>
                      <Select value={form.subCategory} onChange={(e) => set("subCategory", e.target.value)}
                        displayEmpty
                        renderValue={(v) => v || <Box component="span" sx={{ color: "#94a3b8" }}>Select subcategory</Box>}>
                        <MenuItem value=""><em>None</em></MenuItem>
                        {subCategoryOptions.map((sub) => <MenuItem key={sub._id} value={sub.name}>{sub.name}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FL>SKU / Product code</FL>
                    <TextField fullWidth size="small" placeholder="e.g. MUG-001"
                      value={form.sku} onChange={(e) => set("sku", e.target.value)} />
                  </Grid>
                </Grid>

                {/* Description with toolbar */}
                <FL>Description</FL>
                <Box sx={{
                  border: "1px solid #e2e8f0", borderRadius: "10px", overflow: "hidden",
                  transition: "border-color 0.15s", "&:focus-within": { borderColor: "#8B1A4A" },
                }}>
                  <Stack direction="row" spacing={0.75} sx={{ px: 1.5, py: 1, borderBottom: "1px solid #e2e8f0", bgcolor: "#f8fafc" }}>
                    <FmtBtn onClick={() => insertFormat("bold")}><b>B</b></FmtBtn>
                    <FmtBtn onClick={() => insertFormat("italic")}><i>I</i></FmtBtn>
                    <FmtBtn onClick={() => insertFormat("underline")}><u>U</u></FmtBtn>
                    <FmtBtn onClick={() => insertFormat("list")}>• List</FmtBtn>
                  </Stack>
                  <Box component="textarea" ref={descRef} rows={5}
                    placeholder="Describe your product — materials, dimensions, care instructions…"
                    value={form.description} onChange={(e) => set("description", e.target.value)}
                    sx={{
                      width: "100%", border: "none", outline: "none", resize: "vertical",
                      p: 1.5, fontFamily: "Inter, sans-serif", fontSize: "0.875rem",
                      color: "#1c1917", bgcolor: "transparent", lineHeight: 1.6, display: "block", boxSizing: "border-box",
                    }} />
                </Box>
              </SC>

              {/* Product Images */}
              <SC>
                <SH icon={FiCamera} badge={`${imagePreviews.length + existingImages.length} / 10 uploaded`}>
                  Product Images
                </SH>

                {/* Drop zone */}
                <Box onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    border: dragOver ? "2px dashed #8B1A4A" : "2px dashed #e2e8f0",
                    borderRadius: "12px", p: { xs: 3, sm: 5 }, textAlign: "center", cursor: "pointer",
                    bgcolor: dragOver ? "rgba(139,26,74,0.04)" : "#fdf6ec",
                    transition: "all 0.2s ease",
                    mb: (imagePreviews.length + existingImages.length) > 0 ? 2.5 : 0,
                  }}>
                  <Box sx={{
                    width: 52, height: 52, borderRadius: "50%",
                    background: "linear-gradient(135deg, rgba(139,26,74,0.15) 0%, rgba(139,26,74,0.25) 100%)",
                    display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 1.5,
                  }}>
                    <FiCamera size={22} color="#8B1A4A" />
                  </Box>
                  <Typography sx={{ fontWeight: 700, color: "#1e293b", mb: 0.5 }}>
                    Click to upload or drag &amp; drop
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                    JPEG, PNG, WebP · max 10 MB each · up to 10 images
                  </Typography>
                </Box>

                <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageChange} style={{ display: "none" }} />

                {(imagePreviews.length > 0 || existingImages.length > 0) && (
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "#374151" }}>
                        Selected ({imagePreviews.length + existingImages.length})
                      </Typography>
                      <Button type="button" size="small" variant="outlined" startIcon={<FiX size={12} />} onClick={removeAllImages}
                        sx={{ borderRadius: "8px", textTransform: "none", fontSize: "0.78rem", py: 0.4 }}>
                        Remove all
                      </Button>
                    </Stack>
                    <Grid container spacing={1.5}>
                      {existingImages.map((img, i) => (
                        <Grid item xs={6} sm={4} md={3} key={`ex-${i}`}>
                          <Box sx={{ position: "relative", borderRadius: "10px", overflow: "hidden" }}>
                            <Box component="img" src={img.url} alt={img.originalName || `Image ${i + 1}`}
                              sx={{ width: "100%", height: 100, objectFit: "cover", display: "block", border: "2px solid #e2e8f0", borderRadius: "10px" }} />
                            {img.isPrimary && (
                              <Box sx={{ position: "absolute", top: 0, left: 0, fontSize: "0.65rem", background: "linear-gradient(135deg,#10b981,#059669)", color: "#fff", px: "6px", py: "2px", borderRadius: "10px 0 10px 0", fontWeight: 700 }}>
                                ⭐ Primary
                              </Box>
                            )}
                          </Box>
                        </Grid>
                      ))}
                      {imagePreviews.map((img, i) => (
                        <Grid item xs={6} sm={4} md={3} key={img.id}>
                          <Box sx={{ position: "relative", borderRadius: "10px", overflow: "hidden" }}>
                            <Box component="img" src={img.preview} alt={img.name}
                              sx={{ width: "100%", height: 100, objectFit: "cover", display: "block", border: "2px solid #e2e8f0", borderRadius: "10px" }} />
                            <Box component="button" type="button" onClick={() => removeImage(i)}
                              sx={{ position: "absolute", top: 5, right: 5, width: 24, height: 24, borderRadius: "50%", border: "none", cursor: "pointer", background: "linear-gradient(135deg,#ef4444,#dc2626)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", p: 0 }}>
                              <FiX size={12} />
                            </Box>
                            {i === 0 && existingImages.length === 0 && (
                              <Box sx={{ position: "absolute", top: 0, left: 0, fontSize: "0.65rem", background: "linear-gradient(135deg,#10b981,#059669)", color: "#fff", px: "6px", py: "2px", borderRadius: "10px 0 10px 0", fontWeight: 700 }}>
                                ⭐ Primary
                              </Box>
                            )}
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </SC>
            </Grid>

            {/* ════════════════════════════════════
                RIGHT COLUMN  — sidebar (4/12)
                ════════════════════════════════════ */}
            <Grid item xs={12} lg={4}>
              <Stack spacing={3}>

                {/* Pricing */}
                <SC>
                  <SH icon={FiDollarSign}>Pricing &amp; Stock</SH>

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={6} lg={12}>
                      <FL required>Price (₹)</FL>
                      <TextField fullWidth size="small" type="number" placeholder="0.00"
                        value={form.price} onChange={(e) => set("price", e.target.value)} required
                        slotProps={{ input: { startAdornment: <InputAdornment position="start"><Box sx={{ color: "#6b7280", fontWeight: 600 }}>₹</Box></InputAdornment> }, htmlInput: { min: 0, step: 0.01 } }} />
                    </Grid>
                    <Grid item xs={12} sm={6} lg={12}>
                      <FL>Compare at price</FL>
                      <TextField fullWidth size="small" type="number" placeholder="0.00"
                        value={form.compareAtPrice} onChange={(e) => set("compareAtPrice", e.target.value)}
                        helperText="Shown as strikethrough price"
                        slotProps={{ input: { startAdornment: <InputAdornment position="start"><Box sx={{ color: "#6b7280", fontWeight: 600 }}>₹</Box></InputAdornment> }, htmlInput: { min: 0, step: 0.01 } }} />
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={6} lg={12}>
                      <FL>Stock quantity</FL>
                      <TextField fullWidth size="small" type="number" placeholder="0"
                        value={form.stock} onChange={(e) => set("stock", e.target.value)}
                        slotProps={{ htmlInput: { min: 0 } }} />
                    </Grid>
                    <Grid item xs={12} sm={6} lg={12}>
                      <FL>Low stock alert</FL>
                      <TextField fullWidth size="small" type="number" placeholder="5"
                        value={form.lowStockThreshold} onChange={(e) => set("lowStockThreshold", e.target.value)}
                        helperText='Show "Only X left" warning'
                        slotProps={{ htmlInput: { min: 0 } }} />
                    </Grid>
                  </Grid>

                  {/* Track inventory row */}
                  <Box sx={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    bgcolor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", px: 2, py: 1.25,
                  }}>
                    <Box>
                      <Typography variant="body2" fontWeight={700} color="#1c1917">Track inventory</Typography>
                      <Typography variant="caption" color="text.secondary">Update stock on each sale</Typography>
                    </Box>
                    <Switch checked={form.trackInventory} onChange={(e) => set("trackInventory", e.target.checked)} color="primary" />
                  </Box>
                </SC>

                {/* Shipping */}
                <SC>
                  <SH icon={FiTruck}>Shipping</SH>

                  <FL>Product weight <Box component="span" sx={{ fontWeight: 400, color: "#94a3b8" }}>(used for shipping cost)</Box></FL>

                  <Stack direction="row" spacing={0.75} sx={{ mb: 1.5 }}>
                    {["g", "kg"].map((u) => (
                      <Button key={u} type="button" size="small"
                        variant={weightUnit === u ? "contained" : "outlined"}
                        onClick={() => setWeightUnit(u)}
                        sx={{ minWidth: 0, px: 2, py: 0.5, fontSize: "0.8rem", fontWeight: 700, borderRadius: "8px", textTransform: "none", ...(weightUnit !== u && { borderColor: "#e2e8f0", color: "#374151" }) }}>
                        {u}
                      </Button>
                    ))}
                  </Stack>

                  <TextField fullWidth size="small" type="number"
                    placeholder={weightUnit === "g" ? "e.g. 500" : "e.g. 0.5"}
                    value={weightUnit === "g" ? form.weightInGrams : form.weightInGrams ? (Number(form.weightInGrams) / 1000).toFixed(3).replace(/\.?0+$/, "") : ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || val === "-") { set("weightInGrams", ""); return; }
                      const g = weightUnit === "g" ? Math.round(Number(val)) : Math.round(Number(val) * 1000);
                      set("weightInGrams", String(g));
                    }}
                    slotProps={{
                      input: { endAdornment: <InputAdornment position="end"><Box sx={{ color: "#6b7280", fontWeight: 600, fontSize: "0.85rem" }}>{weightUnit}</Box></InputAdornment> },
                      htmlInput: { min: weightUnit === "g" ? "1" : "0.001", step: weightUnit === "g" ? "1" : "0.001" },
                    }}
                    helperText={form.weightInGrams
                      ? weightUnit === "g" ? `= ${(Number(form.weightInGrams) / 1000).toFixed(3).replace(/\.?0+$/, "")} kg` : `= ${form.weightInGrams} g`
                      : "Enter weight to calculate shipping"} />
                </SC>

                {/* Customisable */}
                <SC>
                  <SH icon={FiSettings}>Customisable / Made-to-Order</SH>

                  <Box
                    onClick={() => set("isCustomizable", !form.isCustomizable)}
                    sx={{
                      display: "flex", alignItems: "flex-start", gap: 1.5, cursor: "pointer",
                      bgcolor: form.isCustomizable ? "#fef3c7" : "#f8fafc",
                      border: `1.5px solid ${form.isCustomizable ? "#fcd34d" : "#e2e8f0"}`,
                      borderRadius: "10px", px: 2, py: 1.5, transition: "all 0.2s ease",
                      mb: form.isCustomizable ? 2.5 : 0,
                    }}>
                    <Checkbox checked={form.isCustomizable}
                      onChange={(e) => { e.stopPropagation(); set("isCustomizable", e.target.checked); }}
                      onClick={(e) => e.stopPropagation()} size="small"
                      sx={{ p: 0, mt: 0.25, "&.Mui-checked": { color: "#d97706" } }} />
                    <Box>
                      <Typography variant="body2" fontWeight={700} color={form.isCustomizable ? "#92400e" : "#1c1917"}>
                        Mark as customisable
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Customers see dispatch notice and processing timeline at checkout
                      </Typography>
                    </Box>
                  </Box>

                  {form.isCustomizable && (
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <FL>Min days</FL>
                        <TextField fullWidth size="small" type="number" placeholder="10"
                          value={form.processingDaysMin} onChange={(e) => set("processingDaysMin", e.target.value)}
                          slotProps={{ htmlInput: { min: 1, max: 90 } }} helperText="Min business days" />
                      </Grid>
                      <Grid item xs={6}>
                        <FL>Max days</FL>
                        <TextField fullWidth size="small" type="number" placeholder="12"
                          value={form.processingDaysMax} onChange={(e) => set("processingDaysMax", e.target.value)}
                          slotProps={{ htmlInput: { min: 1, max: 90 } }} helperText="Max business days" />
                      </Grid>
                    </Grid>
                  )}
                </SC>

                {/* Action buttons */}
                <Stack spacing={1.5}>
                  <Button type="submit" variant="contained" fullWidth disabled={loading || imageUploading}
                    startIcon={!loading && !imageUploading ? <FiSave size={16} /> : undefined}
                    sx={{
                      borderRadius: "12px", fontWeight: 700, py: 1.625, fontSize: "0.95rem",
                      textTransform: "none",
                      background: "linear-gradient(135deg, #8B1A4A 0%, #7a1640 100%)",
                      boxShadow: "0 4px 14px rgba(139,26,74,0.3)",
                      "&:hover": { background: "linear-gradient(135deg, #7a1640 0%, #5e1232 100%)" },
                    }}>
                    {loading || imageUploading ? (
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <DotsLoader size="sm" />
                        <span>{imageUploading ? `Uploading ${imageFiles.length} image${imageFiles.length > 1 ? "s" : ""}…` : editingId ? "Updating…" : "Adding…"}</span>
                      </Stack>
                    ) : (editingId ? "Update Product" : "Add Product")}
                  </Button>
                  <Button type="button" variant="outlined" fullWidth startIcon={<FiArrowLeft size={16} />}
                    onClick={() => navigate("/admin/products")} disabled={loading || imageUploading}
                    sx={{
                      borderRadius: "12px", fontWeight: 600, py: 1.5, fontSize: "0.9rem",
                      textTransform: "none", borderColor: "#e2e8f0", color: "#6b7280",
                      "&:hover": { borderColor: "#cbd5e1", bgcolor: "#f8fafc" },
                    }}>
                    Cancel
                  </Button>
                </Stack>

              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </AdminLayout>
  );
};

export default AddProduct;
