import React, { useState, useEffect } from "react";
import { OrbitLoader, DotsLoader } from "../Loader";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Box from "@mui/material/Box";
import MuiCard from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import MuiTable from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MuiAlert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import {
  FiArrowLeft,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiTag,
  FiLayers,
  FiEye,
  FiEyeOff,
  FiX,
  FiAlertTriangle,
} from "react-icons/fi";
import AdminLayout from "../admin/AdminLayout";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  addSubcategory,
  updateSubcategory,
  deleteSubcategory,
  clearCategoriesError,
  clearOperationError,
} from "../../features/categoriesSlice";

const CategoryManagement = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    categories,
    categoriesLoading: loading,
    categoriesError: error,
    creating,
    updating,
    deleting,
    operationError,
  } = useSelector((state) => state.categories);

  const [success, setSuccess] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });
  const [subcategoryForm, setSubcategoryForm] = useState({ name: "", description: "" });
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [deleteItem, setDeleteItem] = useState({
    type: null, categoryId: null, subcategoryId: null, name: "",
  });

  useEffect(() => {
    dispatch(fetchCategories({ includeInactive: true }));
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(t);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => dispatch(clearCategoriesError()), 5000);
      return () => clearTimeout(t);
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (operationError) {
      const t = setTimeout(() => dispatch(clearOperationError()), 5000);
      return () => clearTimeout(t);
    }
  }, [operationError, dispatch]);

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await dispatch(updateCategory({ id: editingCategory._id, ...categoryForm })).unwrap();
        setSuccess("Category updated successfully!");
      } else {
        await dispatch(createCategory(categoryForm)).unwrap();
        setSuccess("Category created successfully!");
      }
      handleCloseCategoryModal();
    } catch (err) {
      console.error("Error saving category:", err);
    }
  };

  const handleSubcategorySubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSubcategory) {
        await dispatch(updateSubcategory({
          categoryId: selectedCategory._id,
          subcategoryId: editingSubcategory._id,
          subcategoryData: subcategoryForm,
        })).unwrap();
        setSuccess("Subcategory updated successfully!");
      } else {
        await dispatch(addSubcategory({
          categoryId: selectedCategory._id,
          subcategoryData: subcategoryForm,
        })).unwrap();
        setSuccess("Subcategory added successfully!");
      }
      handleCloseSubcategoryModal();
    } catch (err) {
      console.error("Error saving subcategory:", err);
    }
  };

  const handleDelete = async () => {
    try {
      if (deleteItem.type === "category") {
        await dispatch(deleteCategory(deleteItem.categoryId)).unwrap();
        setSuccess("Category deleted successfully!");
      } else if (deleteItem.type === "subcategory") {
        await dispatch(deleteSubcategory({
          categoryId: deleteItem.categoryId,
          subcategoryId: deleteItem.subcategoryId,
        })).unwrap();
        setSuccess("Subcategory deleted successfully!");
      }
      setShowDeleteModal(false);
      setDeleteItem({ type: null, categoryId: null, subcategoryId: null, name: "" });
    } catch (err) {
      console.error("Error deleting:", err);
    }
  };

  const toggleCategoryStatus = async (categoryId, currentStatus) => {
    try {
      await dispatch(updateCategory({ id: categoryId, isActive: !currentStatus })).unwrap();
      setSuccess(`Category ${!currentStatus ? "activated" : "deactivated"} successfully!`);
    } catch (err) {
      console.error("Error toggling category status:", err);
    }
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setCategoryForm({ name: "", description: "" });
    setShowCategoryModal(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm({ name: category.name, description: category.description || "" });
    setShowCategoryModal(true);
  };

  const handleAddSubcategory = (category) => {
    setSelectedCategory(category);
    setEditingSubcategory(null);
    setSubcategoryForm({ name: "", description: "" });
    setShowSubcategoryModal(true);
  };

  const handleEditSubcategory = (category, subcategory) => {
    setSelectedCategory(category);
    setEditingSubcategory(subcategory);
    setSubcategoryForm({ name: subcategory.name, description: subcategory.description || "" });
    setShowSubcategoryModal(true);
  };

  const handleDeleteCategory = (category) => {
    setDeleteItem({ type: "category", categoryId: category._id, subcategoryId: null, name: category.name });
    setShowDeleteModal(true);
  };

  const handleDeleteSubcategory = (category, subcategory) => {
    setDeleteItem({ type: "subcategory", categoryId: category._id, subcategoryId: subcategory._id, name: subcategory.name });
    setShowDeleteModal(true);
  };

  const handleCloseCategoryModal = () => {
    setShowCategoryModal(false);
    setEditingCategory(null);
    setCategoryForm({ name: "", description: "" });
  };

  const handleCloseSubcategoryModal = () => {
    setShowSubcategoryModal(false);
    setEditingSubcategory(null);
    setSelectedCategory(null);
    setSubcategoryForm({ name: "", description: "" });
  };

  return (
    <AdminLayout>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs sx={{ mb: 1.5 }}>
          <span
            onClick={() => navigate("/admin/dashboard")}
            style={{ cursor: "pointer", display: "flex", alignItems: "center", color: "#495057" }}
          >
            <FiArrowLeft style={{ marginRight: 4 }} />
            Dashboard
          </span>
          <span>Category Management</span>
        </Breadcrumbs>

        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={2} sx={{ mb: 4 }}>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 0.5 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: "rgba(139,26,74,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#8B1A4A" }}>
                <FiLayers size={18} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#1c1917", letterSpacing: "-0.02em" }}>
                Category Management
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
              Manage product categories and subcategories
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<FiPlus size={15} />}
            onClick={handleAddCategory}
            sx={{
              borderRadius: 2, textTransform: "none", fontWeight: 700, px: 2.5, py: 1.125,
              background: "linear-gradient(135deg, #8B1A4A 0%, #7a1640 100%)",
              boxShadow: "0 4px 12px rgba(139,26,74,0.28)",
              whiteSpace: "nowrap", flexShrink: 0,
              "&:hover": { background: "linear-gradient(135deg, #7a1640 0%, #5e1232 100%)" },
            }}
          >
            Add Category
          </Button>
        </Stack>
      </Box>

      {/* Alerts */}
      {(error || operationError) && (
        <MuiAlert severity="error" onClose={() => { if (error) dispatch(clearCategoriesError()); if (operationError) dispatch(clearOperationError()); }} sx={{ mb: 2 }}>
          {error || operationError}
        </MuiAlert>
      )}
      {success && (
        <MuiAlert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>
          {success}
        </MuiAlert>
      )}

      {/* Categories Table */}
      <MuiCard style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.1)", border: "none", borderRadius: "16px" }}>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ textAlign: "center", py: 6, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <OrbitLoader size="lg" />
              <Box component="p" sx={{ color: "text.secondary", mb: 0 }}>Loading categories…</Box>
            </Box>
          ) : categories.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <FiLayers size={48} style={{ color: "#6c757d", marginBottom: 12 }} />
              <Typography variant="h6" color="text.secondary" fontWeight={600}>No categories found</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Start by adding your first category</Typography>
              <Button variant="contained" startIcon={<FiPlus size={15} />} onClick={handleAddCategory}
                sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700, background: "linear-gradient(135deg, #8B1A4A 0%, #7a1640 100%)" }}>
                Add Category
              </Button>
            </Box>
          ) : (
            <div className="table-responsive">
              <MuiTable>
                <TableHead style={{ background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)" }}>
                  <TableRow>
                    {["Category", "Description", "Subcategories", "Status", "Actions"].map((h) => (
                      <TableCell key={h} component="th" style={{ border: "none", padding: "1rem", fontWeight: "600", color: "#495057", textAlign: h === "Actions" ? "center" : undefined }}>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categories.map((category) => (
                    <React.Fragment key={category._id}>
                      <TableRow style={{ borderLeft: "4px solid var(--primary-color)" }}>
                        <TableCell style={{ padding: "1rem", verticalAlign: "middle" }}>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <div style={{ width: 40, height: 40, borderRadius: 8, background: "linear-gradient(135deg, #8B1A4A 0%, #7a1640 100%)", display: "flex", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                              <FiTag size={18} style={{ color: "white" }} />
                            </div>
                            <div>
                              <div style={{ fontWeight: "600", color: "#343a40" }}>{category.name}</div>
                              <small style={{ color: "#6c757d" }}>Created by {category.createdBy?.username || "Admin"}</small>
                            </div>
                          </Box>
                        </TableCell>
                        <TableCell style={{ padding: "1rem", verticalAlign: "middle" }}>
                          <Box component="span" sx={{ color: "text.secondary" }}>{category.description || "No description"}</Box>
                        </TableCell>
                        <TableCell style={{ padding: "1rem", verticalAlign: "middle" }}>
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, alignItems: "center" }}>
                            {category.subcategories?.filter((sub) => sub.isActive).map((subcategory) => (
                              <Chip key={subcategory._id} label={subcategory.name} size="small"
                                onClick={() => handleEditSubcategory(category, subcategory)}
                                sx={{ cursor: "pointer", fontSize: "0.72rem", fontWeight: 600 }} />
                            ))}
                            <Tooltip title="Add subcategory" arrow>
                              <IconButton size="small" onClick={() => handleAddSubcategory(category)}
                                sx={{ width: 26, height: 26, border: "1.5px dashed #e2e8f0", color: "#94a3b8", borderRadius: "6px",
                                  "&:hover": { borderColor: "#8B1A4A", color: "#8B1A4A", bgcolor: "rgba(139,26,74,0.06)" } }}>
                                <FiPlus size={13} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                        <TableCell style={{ padding: "1rem", verticalAlign: "middle" }}>
                          <Chip label={category.isActive ? "Active" : "Inactive"} size="small"
                            color={category.isActive ? "success" : "error"}
                            sx={{ fontWeight: 600, fontSize: "0.72rem" }} />
                        </TableCell>
                        <TableCell style={{ padding: "1rem", textAlign: "center", verticalAlign: "middle" }}>
                          <Stack direction="row" justifyContent="center" spacing={0.5}>
                            <Tooltip title="Edit category" arrow>
                              <IconButton size="small" onClick={() => handleEditCategory(category)}
                                sx={{ color: "#57534e", "&:hover": { bgcolor: "rgba(139,26,74,0.08)", color: "#8B1A4A" } }}>
                                <FiEdit2 size={15} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={category.isActive ? "Deactivate" : "Activate"} arrow>
                              <IconButton size="small" onClick={() => toggleCategoryStatus(category._id, category.isActive)}
                                sx={{ color: category.isActive ? "#d97706" : "#94a3b8", "&:hover": { bgcolor: category.isActive ? "rgba(217,119,6,0.08)" : "rgba(16,185,129,0.08)", color: category.isActive ? "#b45309" : "#059669" } }}>
                                {category.isActive ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete category" arrow>
                              <IconButton size="small" onClick={() => handleDeleteCategory(category)}
                                sx={{ color: "#94a3b8", "&:hover": { bgcolor: "rgba(220,38,38,0.08)", color: "#dc2626" } }}>
                                <FiTrash2 size={15} />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                      {category.subcategories?.filter((sub) => !sub.isActive).map((subcategory) => (
                        <TableRow key={`${category._id}-${subcategory._id}`} style={{ backgroundColor: "#f8f9fa" }}>
                          <TableCell style={{ padding: "0.8rem 1rem 0.8rem 3rem", verticalAlign: "middle" }}>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <div style={{ width: 24, height: 24, borderRadius: 4, backgroundColor: "#6c757d", display: "flex", alignItems: "center", justifyContent: "center", marginRight: 8 }}>
                                <FiTag size={12} style={{ color: "white" }} />
                              </div>
                              <small style={{ fontWeight: "500", color: "#6c757d" }}>{subcategory.name} (Inactive)</small>
                            </Box>
                          </TableCell>
                          <TableCell style={{ padding: "0.8rem", verticalAlign: "middle" }}>
                            <small style={{ color: "#6c757d" }}>{subcategory.description || "No description"}</small>
                          </TableCell>
                          <TableCell colSpan={2} style={{ padding: "0.8rem", verticalAlign: "middle" }}>
                            <Chip label="Inactive Subcategory" size="small" />
                          </TableCell>
                          <TableCell style={{ padding: "0.8rem", textAlign: "center", verticalAlign: "middle" }}>
                            <Stack direction="row" justifyContent="center" spacing={0.5}>
                              <Tooltip title="Edit subcategory" arrow>
                                <IconButton size="small" onClick={() => handleEditSubcategory(category, subcategory)}
                                  sx={{ color: "#57534e", "&:hover": { bgcolor: "rgba(139,26,74,0.08)", color: "#8B1A4A" } }}>
                                  <FiEdit2 size={14} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete subcategory" arrow>
                                <IconButton size="small" onClick={() => handleDeleteSubcategory(category, subcategory)}
                                  sx={{ color: "#94a3b8", "&:hover": { bgcolor: "rgba(220,38,38,0.08)", color: "#dc2626" } }}>
                                  <FiTrash2 size={14} />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </React.Fragment>
                  ))}
                </TableBody>
              </MuiTable>
            </div>
          )}
        </CardContent>
      </MuiCard>

      {/* ── Category Modal ──────────────────────────────────────── */}
      <Dialog
        open={showCategoryModal}
        onClose={handleCloseCategoryModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: "visible" } }}
      >
        <form onSubmit={handleCategorySubmit}>
          {/* Header */}
          <Box sx={{ px: 3, pt: 3, pb: 2 }}>
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box sx={{
                  width: 40, height: 40, borderRadius: 2,
                  bgcolor: "rgba(139,26,74,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center", color: "#8B1A4A", flexShrink: 0,
                }}>
                  <FiTag size={18} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={700} color="#1c1917" lineHeight={1.2}>
                    {editingCategory ? "Edit Category" : "Add New Category"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {editingCategory ? "Update category details below" : "Fill in the details to create a new category"}
                  </Typography>
                </Box>
              </Stack>
              <Box
                component="button" type="button" onClick={handleCloseCategoryModal}
                sx={{ border: "none", bgcolor: "transparent", cursor: "pointer", color: "#94a3b8", p: 0.5, borderRadius: 1, display: "flex", "&:hover": { color: "#1c1917", bgcolor: "#f1f5f9" } }}
              >
                <FiX size={18} />
              </Box>
            </Stack>
          </Box>

          <Divider />

          <DialogContent sx={{ px: 3, py: 2.5 }}>
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="caption" sx={{ display: "block", mb: 0.75, fontWeight: 600, fontSize: "0.8rem", color: "#374151" }}>
                  Category name <Box component="span" sx={{ color: "#ef4444" }}>*</Box>
                </Typography>
                <TextField
                  fullWidth size="small" required autoFocus
                  placeholder="e.g. Handmade Jewellery"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ display: "block", mb: 0.75, fontWeight: 600, fontSize: "0.8rem", color: "#374151" }}>
                  Description
                </Typography>
                <TextField
                  fullWidth size="small" multiline rows={3}
                  placeholder="Brief description of this category…"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                />
              </Box>
            </Stack>
          </DialogContent>

          <Divider />

          <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
            <Button type="button" variant="outlined" onClick={handleCloseCategoryModal}
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600, borderColor: "#e2e8f0", color: "#6b7280", "&:hover": { borderColor: "#cbd5e1", bgcolor: "#f8fafc" } }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={creating || updating || !categoryForm.name.trim()}
              sx={{
                borderRadius: 2, textTransform: "none", fontWeight: 700,
                background: "linear-gradient(135deg, #8B1A4A 0%, #7a1640 100%)",
                boxShadow: "0 4px 12px rgba(139,26,74,0.28)",
                "&:hover": { background: "linear-gradient(135deg, #7a1640 0%, #5e1232 100%)" },
                minWidth: 140,
              }}>
              {creating || updating ? (
                <Stack direction="row" alignItems="center" spacing={1}>
                  <DotsLoader size="sm" />
                  <span>{editingCategory ? "Updating…" : "Creating…"}</span>
                </Stack>
              ) : (editingCategory ? "Update Category" : "Create Category")}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ── Subcategory Modal ───────────────────────────────────── */}
      <Dialog
        open={showSubcategoryModal}
        onClose={handleCloseSubcategoryModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <form onSubmit={handleSubcategorySubmit}>
          <Box sx={{ px: 3, pt: 3, pb: 2 }}>
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box sx={{
                  width: 40, height: 40, borderRadius: 2,
                  bgcolor: "rgba(139,26,74,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center", color: "#8B1A4A", flexShrink: 0,
                }}>
                  <FiLayers size={18} />
                </Box>
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                    <Typography variant="h6" fontWeight={700} color="#1c1917" lineHeight={1.2}>
                      {editingSubcategory ? "Edit Subcategory" : "Add Subcategory"}
                    </Typography>
                    {selectedCategory && (
                      <Chip label={selectedCategory.name} size="small" color="primary"
                        sx={{ height: 20, fontSize: "0.7rem", fontWeight: 700 }} />
                    )}
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {editingSubcategory ? "Update subcategory details below" : `Adding to "${selectedCategory?.name}"`}
                  </Typography>
                </Box>
              </Stack>
              <Box
                component="button" type="button" onClick={handleCloseSubcategoryModal}
                sx={{ border: "none", bgcolor: "transparent", cursor: "pointer", color: "#94a3b8", p: 0.5, borderRadius: 1, display: "flex", "&:hover": { color: "#1c1917", bgcolor: "#f1f5f9" } }}
              >
                <FiX size={18} />
              </Box>
            </Stack>
          </Box>

          <Divider />

          <DialogContent sx={{ px: 3, py: 2.5 }}>
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="caption" sx={{ display: "block", mb: 0.75, fontWeight: 600, fontSize: "0.8rem", color: "#374151" }}>
                  Subcategory name <Box component="span" sx={{ color: "#ef4444" }}>*</Box>
                </Typography>
                <TextField
                  fullWidth size="small" required autoFocus
                  placeholder="e.g. Bangles"
                  value={subcategoryForm.name}
                  onChange={(e) => setSubcategoryForm({ ...subcategoryForm, name: e.target.value })}
                />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ display: "block", mb: 0.75, fontWeight: 600, fontSize: "0.8rem", color: "#374151" }}>
                  Description
                </Typography>
                <TextField
                  fullWidth size="small" multiline rows={3}
                  placeholder="Brief description of this subcategory…"
                  value={subcategoryForm.description}
                  onChange={(e) => setSubcategoryForm({ ...subcategoryForm, description: e.target.value })}
                />
              </Box>
            </Stack>
          </DialogContent>

          <Divider />

          <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
            <Button type="button" variant="outlined" onClick={handleCloseSubcategoryModal}
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600, borderColor: "#e2e8f0", color: "#6b7280", "&:hover": { borderColor: "#cbd5e1", bgcolor: "#f8fafc" } }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={creating || updating || !subcategoryForm.name.trim()}
              sx={{
                borderRadius: 2, textTransform: "none", fontWeight: 700,
                background: "linear-gradient(135deg, #8B1A4A 0%, #7a1640 100%)",
                boxShadow: "0 4px 12px rgba(139,26,74,0.28)",
                "&:hover": { background: "linear-gradient(135deg, #7a1640 0%, #5e1232 100%)" },
                minWidth: 140,
              }}>
              {creating || updating ? (
                <Stack direction="row" alignItems="center" spacing={1}>
                  <DotsLoader size="sm" />
                  <span>{editingSubcategory ? "Updating…" : "Adding…"}</span>
                </Stack>
              ) : (editingSubcategory ? "Update Subcategory" : "Add Subcategory")}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ── Delete Confirmation Modal ───────────────────────────── */}
      <Dialog
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <Box sx={{ px: 3, pt: 3, pb: 2 }}>
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box sx={{
                width: 40, height: 40, borderRadius: 2,
                bgcolor: "rgba(198,40,40,0.08)",
                display: "flex", alignItems: "center", justifyContent: "center", color: "#c62828", flexShrink: 0,
              }}>
                <FiAlertTriangle size={18} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700} color="#1c1917" lineHeight={1.2}>
                  Confirm Delete
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  This action cannot be undone
                </Typography>
              </Box>
            </Stack>
            <Box
              component="button" type="button" onClick={() => setShowDeleteModal(false)}
              sx={{ border: "none", bgcolor: "transparent", cursor: "pointer", color: "#94a3b8", p: 0.5, borderRadius: 1, display: "flex", "&:hover": { color: "#1c1917", bgcolor: "#f1f5f9" } }}
            >
              <FiX size={18} />
            </Box>
          </Stack>
        </Box>

        <Divider />

        <DialogContent sx={{ px: 3, py: 2.5 }}>
          <Typography variant="body2" color="#374151" sx={{ mb: deleteItem.type === "category" ? 2 : 0 }}>
            Are you sure you want to delete the {deleteItem.type}{" "}
            <Box component="span" fontWeight={700} color="#1c1917">"{deleteItem.name}"</Box>?
          </Typography>
          {deleteItem.type === "category" && (
            <Box sx={{ display: "flex", gap: 1.5, bgcolor: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 2, p: 1.5 }}>
              <FiAlertTriangle size={16} color="#c2410c" style={{ flexShrink: 0, marginTop: 2 }} />
              <Typography variant="caption" color="#9a3412" lineHeight={1.5}>
                <strong>Warning:</strong> This will affect all products in this category. The category will be deactivated rather than permanently deleted.
              </Typography>
            </Box>
          )}
        </DialogContent>

        <Divider />

        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button variant="outlined" onClick={() => setShowDeleteModal(false)}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600, borderColor: "#e2e8f0", color: "#6b7280", "&:hover": { borderColor: "#cbd5e1", bgcolor: "#f8fafc" } }}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={handleDelete} disabled={deleting}
            startIcon={!deleting && <FiTrash2 size={14} />}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700, minWidth: 120 }}>
            {deleting ? (
              <Stack direction="row" alignItems="center" spacing={1}>
                <DotsLoader size="sm" />
                <span>Deleting…</span>
              </Stack>
            ) : `Delete ${deleteItem.type || ""}`}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
};

export default CategoryManagement;
