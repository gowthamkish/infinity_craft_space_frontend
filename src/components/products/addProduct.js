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
import InputAdornment from "@mui/material/InputAdornment";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import { DotsLoader } from "../Loader";
import {
  FiArrowLeft, FiPackage, FiSave, FiCamera, FiX, FiHome,
  FiDollarSign, FiTag, FiTruck, FiSettings, FiEdit3, FiInfo,
} from "react-icons/fi";
import AdminLayout from "../admin/AdminLayout";
import { addProduct, updateProduct } from "../../features/productsSlice";
import { fetchPublicCategories } from "../../features/categoriesSlice";

/* ── Design tokens ─────────────────────────────────────────────── */
const P       = "#8b2252";
const P_DARK  = "#6b1238";
const P_LIGHT = "rgba(139,34,82,0.07)";
const BORDER  = "rgba(0,0,0,0.08)";

/* ── Shared field sx ────────────────────────────────────────────── */
const FIELD_SX = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    "& fieldset": { borderColor: BORDER },
    "&:hover fieldset": { borderColor: "rgba(139,34,82,0.35)" },
    "&.Mui-focused fieldset": { borderColor: P, boxShadow: `0 0 0 3px rgba(139,34,82,0.1)` },
  },
};

/* ── Section card ───────────────────────────────────────────────── */
function SC({ children, sx }) {
  return (
    <Card elevation={0} sx={{
      border: `1px solid ${BORDER}`, borderRadius: "16px",
      bgcolor: "#fff", overflow: "visible", ...sx,
    }}>
      <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
        {children}
      </CardContent>
    </Card>
  );
}

/* ── Section header ─────────────────────────────────────────────── */
function SH({ icon: Icon, color = P, children, badge }) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
      <Stack direction="row" alignItems="center" spacing={1.25}>
        <Box sx={{
          width: 34, height: 34, borderRadius: "9px", flexShrink: 0,
          bgcolor: `${color}12`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon size={15} style={{ color }} />
        </Box>
        <Typography sx={{ fontWeight: 700, fontSize: "0.9375rem", color: "#0f172a", lineHeight: 1 }}>
          {children}
        </Typography>
      </Stack>
      {badge !== undefined && (
        <Box sx={{
          px: 1.25, height: 24, display: "inline-flex", alignItems: "center",
          border: `1px solid ${BORDER}`, borderRadius: "20px",
        }}>
          <Typography sx={{ fontSize: "0.72rem", fontWeight: 600, color: "#6b7280" }}>{badge}</Typography>
        </Box>
      )}
    </Stack>
  );
}

/* ── Field label ────────────────────────────────────────────────── */
function FL({ children, required, hint }) {
  return (
    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.75 }}>
      <Typography sx={{ fontWeight: 600, fontSize: "0.8125rem", color: "#374151" }}>
        {children}
        {required && <Box component="span" sx={{ color: "#ef4444", ml: 0.25 }}>*</Box>}
      </Typography>
      {hint && (
        <Tooltip title={hint} arrow placement="top">
          <Box sx={{ display: "inline-flex", color: "#94a3b8", cursor: "help" }}>
            <FiInfo size={13} />
          </Box>
        </Tooltip>
      )}
    </Stack>
  );
}

/* ── Description toolbar button ─────────────────────────────────── */
function FmtBtn({ children, onClick, title }) {
  return (
    <Tooltip title={title || ""} arrow>
      <Button type="button" size="small" onClick={onClick}
        sx={{
          minWidth: 34, px: 1, py: 0.5, fontSize: "0.82rem", fontWeight: 700,
          border: `1px solid ${BORDER}`, color: "#475569", borderRadius: "7px",
          textTransform: "none", lineHeight: 1.4, bgcolor: "#fff",
          "&:hover": { borderColor: P, color: P, bgcolor: P_LIGHT },
          transition: "all 0.15s",
        }}>
        {children}
      </Button>
    </Tooltip>
  );
}

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

  /* ── Image helpers ─────────────────────────────────────────────── */
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
  const removeImage     = (i) => { setImageFiles((p) => p.filter((_, idx) => idx !== i)); setImagePreviews((p) => p.filter((_, idx) => idx !== i)); };
  const removeAllImages = () => { setImageFiles([]); setImagePreviews([]); setExistingImages([]); if (fileInputRef.current) fileInputRef.current.value = ""; };
  const handleDragOver  = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setDragOver(false); };
  const handleDrop      = (e) => { e.preventDefault(); setDragOver(false); handleFiles(Array.from(e.dataTransfer.files)); };

  /* ── Description toolbar ───────────────────────────────────────── */
  const insertFormat = (type) => {
    const ta = descRef.current; if (!ta) return;
    const s = ta.selectionStart, e = ta.selectionEnd, sel = form.description.slice(s, e);
    const map = { bold: `**${sel || "bold"}**`, italic: `_${sel || "italic"}_`, underline: `<u>${sel || "text"}</u>`, list: `\n• ${sel || "item"}` };
    const ins = map[type];
    const next = form.description.slice(0, s) + ins + form.description.slice(e);
    set("description", next);
    setTimeout(() => { ta.focus(); ta.setSelectionRange(s + ins.length, s + ins.length); }, 0);
  };

  /* ── Submit ────────────────────────────────────────────────────── */
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

  /* ── Data loading ──────────────────────────────────────────────── */
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
  const totalImages = imagePreviews.length + existingImages.length;
  const discountPct = form.price && form.compareAtPrice && Number(form.compareAtPrice) > Number(form.price)
    ? Math.round((1 - Number(form.price) / Number(form.compareAtPrice)) * 100) : 0;

  /* ── Render ────────────────────────────────────────────────────── */
  return (
    <AdminLayout>
      <Box sx={{ width: "100%", bgcolor: "#f8f9fc", minHeight: "100vh", p: { xs: 2, md: 3 } }}>

        {/* ── Page header ─────────────────────────────────────────── */}
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
          <Box sx={{ fontSize: "0.78rem", color: "#94a3b8", display: "flex", alignItems: "center", gap: 0.5, cursor: "pointer" }}
            onClick={() => navigate("/")}>
            <FiHome size={13} /> Home
          </Box>
          <Box sx={{ fontSize: "0.78rem", color: "#94a3b8" }}>/</Box>
          <Box sx={{ fontSize: "0.78rem", color: "#94a3b8", display: "flex", alignItems: "center", gap: 0.5, cursor: "pointer" }}
            onClick={() => navigate("/admin/products")}>
            <FiPackage size={13} /> Products
          </Box>
          <Box sx={{ fontSize: "0.78rem", color: "#94a3b8" }}>/</Box>
          <Box sx={{ fontSize: "0.78rem", color: P, fontWeight: 600 }}>
            {editingId ? "Edit Product" : "Add Product"}
          </Box>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <Button variant="outlined" size="small" startIcon={<FiArrowLeft size={13} />}
            onClick={() => navigate("/admin/products")}
            sx={{
              borderRadius: "10px", textTransform: "none", fontWeight: 600,
              borderColor: BORDER, color: "#64748b", height: 36,
              "&:hover": { borderColor: P, color: P, bgcolor: P_LIGHT },
            }}>
            Products
          </Button>
          <Box sx={{ height: 24, width: 1, bgcolor: BORDER }} />
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: "1.25rem", color: "#0f172a", lineHeight: 1.2 }}>
              {editingId ? "Edit Product" : "Add New Product"}
            </Typography>
            <Typography sx={{ fontSize: "0.8125rem", color: "#94a3b8", mt: 0.25 }}>
              {editingId ? "Update product details and save changes" : "Fill in the details to create a new listing"}
            </Typography>
          </Box>
        </Stack>

        {alert.show && (
          <Alert severity={alertSeverity} onClose={() => setAlert({ show: false, message: "", variant: "" })}
            sx={{ borderRadius: "12px", mb: 2.5, fontWeight: 600 }}>
            {alert.message}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3} alignItems="flex-start">

            {/* ════ LEFT COLUMN (8/12) ════════════════════════════════ */}
            <Grid size={{ xs: 12, lg: 8 }}>
              <Stack spacing={3}>

                {/* ── Basic Information ─────────────────────────────── */}
                <SC>
                  <SH icon={FiPackage}>Basic Information</SH>

                  <FL required>Product name</FL>
                  <TextField fullWidth size="small"
                    placeholder="e.g. Handmade Ceramic Mug"
                    value={form.name} onChange={(e) => set("name", e.target.value)} required
                    sx={{ ...FIELD_SX, mb: 2.5 }} />

                  <Grid container spacing={2} sx={{ mb: 2.5 }}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <FL required>Category</FL>
                      <FormControl fullWidth size="small" required sx={FIELD_SX}>
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
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <FL>Subcategory</FL>
                      <FormControl fullWidth size="small" disabled={!form.category || subCategoryOptions.length === 0} sx={FIELD_SX}>
                        <Select value={form.subCategory} onChange={(e) => set("subCategory", e.target.value)}
                          displayEmpty
                          renderValue={(v) => v || <Box component="span" sx={{ color: "#94a3b8" }}>Select subcategory</Box>}>
                          <MenuItem value=""><em>None</em></MenuItem>
                          {subCategoryOptions.map((sub) => <MenuItem key={sub._id} value={sub.name}>{sub.name}</MenuItem>)}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <FL hint="Stock Keeping Unit — your internal product code">SKU / Product code</FL>
                      <TextField fullWidth size="small" placeholder="e.g. MUG-001"
                        value={form.sku} onChange={(e) => set("sku", e.target.value)} sx={FIELD_SX} />
                    </Grid>
                  </Grid>

                  {/* Description editor */}
                  <FL>Description</FL>
                  <Box sx={{
                    border: `1px solid ${BORDER}`, borderRadius: "12px", overflow: "hidden",
                    transition: "border-color 0.15s, box-shadow 0.15s",
                    "&:focus-within": { borderColor: P, boxShadow: `0 0 0 3px rgba(139,34,82,0.1)` },
                  }}>
                    <Stack direction="row" spacing={0.75} sx={{ px: 1.5, py: 1, borderBottom: `1px solid ${BORDER}`, bgcolor: "#f8fafc" }}>
                      <FmtBtn onClick={() => insertFormat("bold")} title="Bold"><b>B</b></FmtBtn>
                      <FmtBtn onClick={() => insertFormat("italic")} title="Italic"><i>I</i></FmtBtn>
                      <FmtBtn onClick={() => insertFormat("underline")} title="Underline"><u>U</u></FmtBtn>
                      <FmtBtn onClick={() => insertFormat("list")} title="Bullet list">• List</FmtBtn>
                      <Box sx={{ flex: 1 }} />
                      <Typography sx={{ fontSize: "0.72rem", color: "#94a3b8", alignSelf: "center" }}>
                        {form.description.length} chars
                      </Typography>
                    </Stack>
                    <Box component="textarea" ref={descRef} rows={6}
                      placeholder="Describe your product — materials, dimensions, care instructions…"
                      value={form.description} onChange={(e) => set("description", e.target.value)}
                      sx={{
                        width: "100%", border: "none", outline: "none", resize: "vertical",
                        p: 1.75, fontFamily: "Inter, sans-serif", fontSize: "0.875rem",
                        color: "#1c1917", bgcolor: "#fff", lineHeight: 1.65,
                        display: "block", boxSizing: "border-box", minHeight: 120,
                      }} />
                  </Box>
                </SC>

                {/* ── Product Images ────────────────────────────────── */}
                <SC>
                  <SH icon={FiCamera} badge={`${totalImages} / 10 uploaded`}>
                    Product Images
                  </SH>

                  {/* Drop zone */}
                  <Box onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    sx={{
                      border: `2px dashed ${dragOver ? P : BORDER}`,
                      borderRadius: "14px", p: { xs: 4, sm: 6 }, textAlign: "center", cursor: "pointer",
                      bgcolor: dragOver ? P_LIGHT : "#fdfaf8",
                      transition: "all 0.2s ease",
                      mb: totalImages > 0 ? 2.5 : 0,
                      "&:hover": { borderColor: "rgba(139,34,82,0.4)", bgcolor: P_LIGHT },
                    }}>
                    <Box sx={{
                      width: 56, height: 56, borderRadius: "50%", mx: "auto", mb: 2,
                      background: `linear-gradient(135deg, rgba(139,34,82,0.12), rgba(139,34,82,0.22))`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <FiCamera size={24} style={{ color: P }} />
                    </Box>
                    <Typography sx={{ fontWeight: 700, color: "#0f172a", mb: 0.5, fontSize: "0.9375rem" }}>
                      Click to upload or drag &amp; drop
                    </Typography>
                    <Typography sx={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                      JPEG, PNG, WebP · max 10 MB each · up to 10 images
                    </Typography>
                    {totalImages === 0 && (
                      <Box sx={{
                        display: "inline-flex", alignItems: "center", gap: 0.75, mt: 2,
                        px: 2, height: 32, borderRadius: "20px",
                        bgcolor: P_LIGHT, border: `1px solid rgba(139,34,82,0.2)`,
                      }}>
                        <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: P }}>Browse files</Typography>
                      </Box>
                    )}
                  </Box>

                  <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageChange} style={{ display: "none" }} />

                  {totalImages > 0 && (
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", color: "#374151" }}>
                          Selected ({totalImages})
                          {totalImages > 0 && (
                            <Box component="span" sx={{ ml: 1, fontSize: "0.72rem", color: "#94a3b8", fontWeight: 400 }}>
                              First image is the primary listing photo
                            </Box>
                          )}
                        </Typography>
                        <Button type="button" size="small" startIcon={<FiX size={12} />} onClick={removeAllImages}
                          sx={{
                            borderRadius: "8px", textTransform: "none", fontSize: "0.78rem",
                            color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)",
                            "&:hover": { bgcolor: "rgba(239,68,68,0.06)", borderColor: "#ef4444" },
                          }}>
                          Remove all
                        </Button>
                      </Stack>
                      <Grid container spacing={1.5}>
                        {existingImages.map((img, i) => (
                          <Grid size={{ xs: 6, sm: 4, md: 3 }} key={`ex-${i}`}>
                            <Box sx={{ position: "relative", borderRadius: "12px", overflow: "hidden",
                              border: `2px solid ${i === 0 ? P : BORDER}`, aspectRatio: "1/1" }}>
                              <Box component="img" src={img.url} alt={img.originalName || `Image ${i + 1}`}
                                sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                              {img.isPrimary && (
                                <Box sx={{
                                  position: "absolute", top: 6, left: 6,
                                  px: 1, py: 0.25, borderRadius: "6px",
                                  background: "linear-gradient(135deg,#10b981,#059669)",
                                  fontSize: "0.6rem", color: "#fff", fontWeight: 800,
                                }}>⭐ Primary</Box>
                              )}
                            </Box>
                          </Grid>
                        ))}
                        {imagePreviews.map((img, i) => (
                          <Grid size={{ xs: 6, sm: 4, md: 3 }} key={img.id}>
                            <Box sx={{ position: "relative", borderRadius: "12px", overflow: "hidden",
                              border: `2px solid ${i === 0 && existingImages.length === 0 ? P : BORDER}`, aspectRatio: "1/1" }}>
                              <Box component="img" src={img.preview} alt={img.name}
                                sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                              <Box component="button" type="button" onClick={() => removeImage(i)}
                                sx={{
                                  position: "absolute", top: 6, right: 6, width: 26, height: 26,
                                  borderRadius: "50%", border: "none", cursor: "pointer",
                                  background: "linear-gradient(135deg,#ef4444,#dc2626)",
                                  color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                                  p: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                                  "&:hover": { transform: "scale(1.1)" }, transition: "transform 0.15s",
                                }}>
                                <FiX size={12} />
                              </Box>
                              {i === 0 && existingImages.length === 0 && (
                                <Box sx={{
                                  position: "absolute", top: 6, left: 6,
                                  px: 1, py: 0.25, borderRadius: "6px",
                                  background: "linear-gradient(135deg,#10b981,#059669)",
                                  fontSize: "0.6rem", color: "#fff", fontWeight: 800,
                                }}>⭐ Primary</Box>
                              )}
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}
                </SC>

              </Stack>
            </Grid>

            {/* ════ RIGHT COLUMN (4/12) ════════════════════════════════ */}
            <Grid size={{ xs: 12, lg: 4 }}>
              <Stack spacing={3}>

                {/* ── Pricing & Stock ───────────────────────────────── */}
                <SC>
                  <SH icon={FiDollarSign} color="#10b981">Pricing &amp; Stock</SH>

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid size={{ xs: 12, sm: 6, lg: 12 }}>
                      <FL required>Price (₹)</FL>
                      <TextField fullWidth size="small" type="number" placeholder="0.00"
                        value={form.price} onChange={(e) => set("price", e.target.value)} required
                        slotProps={{
                          input: { startAdornment: <InputAdornment position="start"><Typography sx={{ color: "#6b7280", fontWeight: 700 }}>₹</Typography></InputAdornment> },
                          htmlInput: { min: 0, step: 0.01 },
                        }}
                        sx={FIELD_SX} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, lg: 12 }}>
                      <FL hint="Will appear as a crossed-out price on the product page">Compare at price</FL>
                      <TextField fullWidth size="small" type="number" placeholder="0.00"
                        value={form.compareAtPrice} onChange={(e) => set("compareAtPrice", e.target.value)}
                        slotProps={{
                          input: { startAdornment: <InputAdornment position="start"><Typography sx={{ color: "#6b7280", fontWeight: 700 }}>₹</Typography></InputAdornment> },
                          htmlInput: { min: 0, step: 0.01 },
                        }}
                        sx={FIELD_SX} />
                      {discountPct > 0 && (
                        <Box sx={{
                          display: "inline-flex", alignItems: "center", mt: 0.75,
                          px: 1.25, height: 22, borderRadius: "20px",
                          bgcolor: "#f0fdf4", border: "1px solid #bbf7d0",
                        }}>
                          <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#059669" }}>
                            {discountPct}% off applied
                          </Typography>
                        </Box>
                      )}
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2, borderColor: BORDER }} />

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid size={{ xs: 12, sm: 6, lg: 12 }}>
                      <FL>Stock quantity</FL>
                      <TextField fullWidth size="small" type="number" placeholder="0"
                        value={form.stock} onChange={(e) => set("stock", e.target.value)}
                        slotProps={{ htmlInput: { min: 0 } }} sx={FIELD_SX} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, lg: 12 }}>
                      <FL hint='Shows "Only X left!" warning on product page when stock drops below this'>Low stock alert</FL>
                      <TextField fullWidth size="small" type="number" placeholder="5"
                        value={form.lowStockThreshold} onChange={(e) => set("lowStockThreshold", e.target.value)}
                        slotProps={{ htmlInput: { min: 0 } }} sx={FIELD_SX} />
                    </Grid>
                  </Grid>

                  {/* Track inventory toggle */}
                  <Box sx={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    bgcolor: "#f8fafc", border: `1px solid ${BORDER}`, borderRadius: "12px", px: 2, py: 1.5,
                    transition: "all 0.2s",
                    "&:hover": { borderColor: "rgba(139,34,82,0.2)" },
                  }}>
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#0f172a" }}>Track inventory</Typography>
                      <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8" }}>Auto-update stock on each sale</Typography>
                    </Box>
                    <Switch checked={form.trackInventory} onChange={(e) => set("trackInventory", e.target.checked)}
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": { color: P },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: P },
                      }} />
                  </Box>
                </SC>

                {/* ── Shipping ──────────────────────────────────────── */}
                <SC>
                  <SH icon={FiTruck} color="#3b82f6">Shipping</SH>

                  <FL hint="Used to calculate shipping rates at checkout">
                    Product weight
                    <Box component="span" sx={{ fontWeight: 400, color: "#94a3b8", ml: 0.5 }}>(for shipping)</Box>
                  </FL>

                  <Stack direction="row" spacing={0.75} sx={{ mb: 1.5 }}>
                    {["g", "kg"].map((u) => (
                      <Button key={u} type="button" size="small"
                        variant={weightUnit === u ? "contained" : "outlined"}
                        onClick={() => setWeightUnit(u)}
                        sx={{
                          minWidth: 44, height: 32, px: 2, fontSize: "0.82rem", fontWeight: 700,
                          borderRadius: "8px", textTransform: "none",
                          ...(weightUnit === u
                            ? { bgcolor: P, "&:hover": { bgcolor: P_DARK } }
                            : { borderColor: BORDER, color: "#374151", "&:hover": { borderColor: P, color: P, bgcolor: P_LIGHT } }),
                        }}>
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
                      input: { endAdornment: <InputAdornment position="end"><Typography sx={{ color: "#94a3b8", fontWeight: 600, fontSize: "0.85rem" }}>{weightUnit}</Typography></InputAdornment> },
                      htmlInput: { min: weightUnit === "g" ? "1" : "0.001", step: weightUnit === "g" ? "1" : "0.001" },
                    }}
                    helperText={form.weightInGrams
                      ? weightUnit === "g" ? `≈ ${(Number(form.weightInGrams) / 1000).toFixed(3).replace(/\.?0+$/, "")} kg` : `≈ ${form.weightInGrams} g`
                      : "Enter weight to estimate shipping"}
                    sx={FIELD_SX} />
                </SC>

                {/* ── Customisable ──────────────────────────────────── */}
                <SC>
                  <SH icon={FiSettings} color="#d97706">Customisable / Made-to-Order</SH>

                  <Box
                    onClick={() => set("isCustomizable", !form.isCustomizable)}
                    sx={{
                      display: "flex", alignItems: "flex-start", gap: 1.5, cursor: "pointer",
                      bgcolor: form.isCustomizable ? "rgba(217,119,6,0.06)" : "#f8fafc",
                      border: `1.5px solid ${form.isCustomizable ? "#fcd34d" : BORDER}`,
                      borderRadius: "12px", px: 2, py: 1.5,
                      transition: "all 0.2s ease",
                      mb: form.isCustomizable ? 2.5 : 0,
                      "&:hover": { borderColor: form.isCustomizable ? "#f59e0b" : "rgba(139,34,82,0.2)" },
                    }}>
                    <Checkbox checked={form.isCustomizable}
                      onChange={(e) => { e.stopPropagation(); set("isCustomizable", e.target.checked); }}
                      onClick={(e) => e.stopPropagation()} size="small"
                      sx={{ p: 0, mt: 0.25, "&.Mui-checked": { color: "#d97706" } }} />
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: "0.875rem", color: form.isCustomizable ? "#92400e" : "#0f172a" }}>
                        Mark as customisable
                      </Typography>
                      <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8", mt: 0.25 }}>
                        Customers see dispatch notice &amp; processing timeline at checkout
                      </Typography>
                    </Box>
                  </Box>

                  {form.isCustomizable && (
                    <Grid container spacing={2}>
                      <Grid size={6}>
                        <FL>Min days</FL>
                        <TextField fullWidth size="small" type="number" placeholder="10"
                          value={form.processingDaysMin} onChange={(e) => set("processingDaysMin", e.target.value)}
                          slotProps={{ htmlInput: { min: 1, max: 90 } }}
                          helperText="Min business days" sx={FIELD_SX} />
                      </Grid>
                      <Grid size={6}>
                        <FL>Max days</FL>
                        <TextField fullWidth size="small" type="number" placeholder="12"
                          value={form.processingDaysMax} onChange={(e) => set("processingDaysMax", e.target.value)}
                          slotProps={{ htmlInput: { min: 1, max: 90 } }}
                          helperText="Max business days" sx={FIELD_SX} />
                      </Grid>
                    </Grid>
                  )}
                </SC>

                {/* ── Action buttons ────────────────────────────────── */}
                <Box sx={{
                  bgcolor: "#fff", border: `1px solid ${BORDER}`, borderRadius: "16px", p: 2.5,
                  position: { lg: "sticky" }, bottom: { lg: 24 },
                  boxShadow: { lg: "0 -4px 24px rgba(0,0,0,0.06)" },
                }}>
                  <Button type="submit" variant="contained" fullWidth
                    disabled={loading || imageUploading}
                    startIcon={!loading && !imageUploading ? <FiSave size={16} /> : undefined}
                    sx={{
                      borderRadius: "12px", fontWeight: 700, py: 1.625, fontSize: "0.9375rem",
                      textTransform: "none", mb: 1.25,
                      background: `linear-gradient(135deg, ${P} 0%, ${P_DARK} 100%)`,
                      boxShadow: `0 4px 16px rgba(139,34,82,0.3)`,
                      "&:hover": { background: `linear-gradient(135deg, ${P_DARK} 0%, #5e1232 100%)`, boxShadow: `0 6px 20px rgba(139,34,82,0.4)` },
                      "&:disabled": { opacity: 0.65 },
                    }}>
                    {loading || imageUploading ? (
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <DotsLoader size="sm" />
                        <span>{imageUploading ? `Uploading ${imageFiles.length} image${imageFiles.length > 1 ? "s" : ""}…` : editingId ? "Updating…" : "Adding…"}</span>
                      </Stack>
                    ) : (editingId ? "Update Product" : "Add Product")}
                  </Button>
                  <Button type="button" variant="outlined" fullWidth startIcon={<FiArrowLeft size={15} />}
                    onClick={() => navigate("/admin/products")} disabled={loading || imageUploading}
                    sx={{
                      borderRadius: "12px", fontWeight: 600, py: 1.375, fontSize: "0.875rem",
                      textTransform: "none", borderColor: BORDER, color: "#64748b",
                      "&:hover": { borderColor: P, color: P, bgcolor: P_LIGHT },
                    }}>
                    Cancel
                  </Button>

                  {/* Quick tips */}
                  <Divider sx={{ my: 2, borderColor: BORDER }} />
                  <Stack spacing={1}>
                    {[
                      "Required: name, price, and category",
                      "First image becomes the primary listing photo",
                      "Use Compare price to show a discount badge",
                    ].map((tip) => (
                      <Stack key={tip} direction="row" spacing={1} alignItems="flex-start">
                        <Box sx={{ width: 4, height: 4, borderRadius: "50%", bgcolor: "#94a3b8", flexShrink: 0, mt: 0.875 }} />
                        <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8", lineHeight: 1.5 }}>{tip}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>

              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </AdminLayout>
  );
};

export default AddProduct;
