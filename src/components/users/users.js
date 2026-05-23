import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ToastContext } from "../../context/ToastContext";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Alert,
  Stack,
  Avatar,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { OrbitLoader, DotsLoader } from "../Loader";
import AdminLayout from "../admin/AdminLayout";
import {
  FiUsers, FiMail, FiShield, FiUser, FiSearch, FiUserX, FiEdit2, FiEye, FiEyeOff, FiTrash2,
} from "react-icons/fi";
import { useUsers } from "../../hooks/useSmartFetch";
import { updateUserRole } from "../../features/adminSlice";
import api from "../../api/axios";
import "../admin/admin.css";

const UsersList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { addSuccess, addError } = useContext(ToastContext);
  const { data: users, loading, error } = useUsers();
  const [searchTerm, setSearchTerm] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [roleActionLoading, setRoleActionLoading] = useState(false);

  // Delete user state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteUser, setDeleteUser] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Edit user state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [showEditPw, setShowEditPw] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");

  const filteredUsers = users.filter(
    (u) =>
      u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleRoleChange = (user) => { setSelectedUser(user); setShowConfirmModal(true); };

  const confirmRoleChange = async () => {
    if (!selectedUser) return;
    setRoleActionLoading(true);
    try {
      await dispatch(updateUserRole({ userId: selectedUser._id, isAdmin: !selectedUser.isAdmin })).unwrap();
      addSuccess(
        `${selectedUser.username} is now ${selectedUser.isAdmin ? "a regular user" : "an admin"}.`,
        "Role Updated"
      );
      setShowConfirmModal(false); setSelectedUser(null);
    } catch (err) {
      addError(err?.message || "Failed to update user role.", "Role Update Failed");
    } finally {
      setRoleActionLoading(false);
    }
  };

  const openDeleteModal = (user) => {
    setDeleteUser(user);
    setDeleteError("");
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteUser) return;
    setDeleteLoading(true);
    setDeleteError("");
    try {
      await api.delete(`/api/admin/users/${deleteUser._id}`);
      addSuccess(`${deleteUser.username} has been deleted.`, "User Deleted");
      setShowDeleteModal(false);
      setDeleteUser(null);
      window.location.reload();
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to delete user.";
      setDeleteError(msg);
      addError(msg, "Delete Failed");
    } finally {
      setDeleteLoading(false);
    }
  };

  const openEditModal = (user) => {
    setEditUser(user);
    setEditEmail(user.email || "");
    setEditPassword("");
    setShowEditPw(false);
    setEditError("");
    setEditSuccess("");
    setShowEditModal(true);
  };

  const handleEditSave = async () => {
    if (!editEmail.trim()) { setEditError("Email cannot be empty."); return; }
    setEditLoading(true);
    setEditError("");
    setEditSuccess("");
    try {
      const payload = { email: editEmail.trim() };
      if (editPassword) payload.password = editPassword;
      await api.patch(`/api/admin/users/${editUser._id}`, payload);
      addSuccess("User details updated successfully.", "User Updated");
      setShowEditModal(false);
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to update user.";
      setEditError(msg);
      addError(msg, "Update Failed");
    } finally {
      setEditLoading(false);
    }
  };

  const initials = (user) => (user.username || user.email || "?").slice(0, 2).toUpperCase();

  return (
    <AdminLayout>
      {/* Page header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FiUsers size={22} style={{ color: "#8B1A4A" }} />
            Users
          </Typography>
          <Typography variant="body2" color="text.secondary">{users.length} registered accounts</Typography>
        </Box>
      </Box>

      {/* Filter bar */}
      <Card elevation={0} sx={{ mb: 2, border: "1px solid #e2e8f0", borderRadius: 2 }}>
        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              size="small"
              placeholder="Search by name or email…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start"><FiSearch size={15} color="#94a3b8" /></InputAdornment>
                  ),
                },
              }}
              sx={{ minWidth: 280, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
            {searchTerm && (
              <Typography variant="caption" color="text.secondary">
                {filteredUsers.length} result{filteredUsers.length !== 1 ? "s" : ""}
              </Typography>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Users table */}
      <Card elevation={0} sx={{ border: "1px solid #e2e8f0", borderRadius: 2 }}>
        {loading ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 8, gap: 2 }}>
            <OrbitLoader size="lg" />
            <Typography color="text.secondary">Loading users…</Typography>
          </Box>
        ) : error ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 8, gap: 1 }}>
            <Box sx={{ color: "#cbd5e1", mb: 1 }}><FiUserX size={36} /></Box>
            <Typography fontWeight={600} color="error.main">Error loading users</Typography>
            <Typography variant="body2" color="text.secondary">{error}</Typography>
          </Box>
        ) : filteredUsers.length === 0 ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 8, gap: 1 }}>
            <Box sx={{ color: "#cbd5e1", mb: 1 }}><FiUsers size={36} /></Box>
            <Typography fontWeight={600} color="text.primary">No users found</Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm ? "Try adjusting your search terms." : "No users are registered yet."}
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "#f8fafc" }}>
                  {["User", "Email", "Role", "Status", "Actions"].map((h, i) => (
                    <TableCell
                      key={h}
                      align={h === "Actions" ? "center" : "left"}
                      sx={{ fontWeight: 700, color: "#64748b", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.04em" }}
                    >
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user._id || user.id} sx={{ "&:hover": { bgcolor: "#faf5ff" }, transition: "background 150ms" }}>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar
                          sx={{
                            width: 36, height: 36, fontSize: "0.85rem", fontWeight: 700,
                            background: user.isAdmin
                              ? "linear-gradient(135deg, #f59e0b, #d97706)"
                              : "linear-gradient(135deg, #8B1A4A, #6b1238)",
                          }}
                        >
                          {initials(user)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600} color="text.primary">{user.username}</Typography>
                          <Typography variant="caption" color="text.secondary">#{(user._id || user.id || "").toString().slice(-6)}</Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, color: "text.secondary" }}>
                        <FiMail size={13} style={{ color: "#059669", flexShrink: 0 }} />
                        <Typography variant="body2">{user.email}</Typography>
                      </Box>
                    </TableCell>

                    <TableCell>
                      {user.isAdmin ? (
                        <Chip
                          icon={<FiShield size={10} />}
                          label="Admin"
                          size="small"
                          sx={{ bgcolor: "#fef3c7", color: "#92400e", fontWeight: 600, fontSize: "0.72rem" }}
                        />
                      ) : (
                        <Chip
                          icon={<FiUser size={10} />}
                          label="User"
                          size="small"
                          sx={{ bgcolor: "#d1fae5", color: "#065f46", fontWeight: 600, fontSize: "0.72rem" }}
                        />
                      )}
                    </TableCell>

                    <TableCell>
                      <Chip label="Active" size="small" sx={{ bgcolor: "#d1fae5", color: "#065f46", fontWeight: 600, fontSize: "0.72rem" }} />
                    </TableCell>

                    <TableCell align="center">
                      <Stack direction="row" spacing={0.75} justifyContent="center">
                        <button
                          className="adm-btn adm-btn-sm adm-btn-secondary"
                          onClick={() => openEditModal(user)}
                          title="Edit email / password"
                          style={{ borderColor: "#8B1A4A", color: "#8B1A4A" }}
                        >
                          <FiEdit2 size={12} /> Edit
                        </button>
                        <button
                          className="adm-btn adm-btn-sm adm-btn-secondary"
                          onClick={() => handleRoleChange(user)}
                          disabled={roleActionLoading}
                          style={{
                            borderColor: user.isAdmin ? "#f59e0b" : "#059669",
                            color: user.isAdmin ? "#f59e0b" : "#059669",
                          }}
                        >
                          {user.isAdmin ? <><FiUser size={12} />Make User</> : <><FiShield size={12} />Make Admin</>}
                        </button>
                        <button
                          className="adm-btn adm-btn-sm adm-btn-secondary"
                          onClick={() => openDeleteModal(user)}
                          title="Delete user"
                          style={{ borderColor: "#dc2626", color: "#dc2626" }}
                        >
                          <FiTrash2 size={12} /> Delete
                        </button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Edit user modal */}
      <Dialog open={showEditModal} onClose={() => setShowEditModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, pb: 1 }}>
          <FiEdit2 size={16} style={{ color: "#8B1A4A" }} />
          Edit User
        </DialogTitle>
        <DialogContent>
          {editUser && (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, bgcolor: "#f8fafc", borderRadius: 2, p: 1.5 }}>
                <Avatar sx={{ width: 36, height: 36, fontSize: "0.85rem", fontWeight: 700, background: "linear-gradient(135deg, #8B1A4A, #6b1238)" }}>
                  {initials(editUser)}
                </Avatar>
                <Box>
                  <Typography fontWeight={700}>{editUser.username}</Typography>
                  <Typography variant="caption" color="text.secondary">#{(editUser._id || "").slice(-6)}</Typography>
                </Box>
              </Box>

              {editError && <Alert severity="error">{editError}</Alert>}
              {editSuccess && <Alert severity="success">{editSuccess}</Alert>}

              <TextField
                label="Email address"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="Enter new email"
                size="small"
                fullWidth
              />

              <TextField
                label="New password"
                helperText="Leave blank to keep current password"
                type={showEditPw ? "text" : "password"}
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                placeholder="Enter new password"
                size="small"
                fullWidth
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setShowEditPw((v) => !v)} aria-label={showEditPw ? "Hide password" : "Show password"}>
                          {showEditPw ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <button className="adm-btn adm-btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
          <button
            className="adm-btn"
            style={{ background: "#8B1A4A", color: "white" }}
            onClick={handleEditSave}
            disabled={editLoading}
          >
            {editLoading ? <><DotsLoader size="sm" /> Saving…</> : <><FiEdit2 size={14} /> Save Changes</>}
          </button>
        </DialogActions>
      </Dialog>

      {/* Delete user confirmation modal */}
      <Dialog open={showDeleteModal} onClose={() => setShowDeleteModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, pb: 1 }}>
          <FiTrash2 size={16} style={{ color: "#dc2626" }} />
          Delete User
        </DialogTitle>
        <DialogContent>
          {deleteUser && (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, bgcolor: "#f8fafc", borderRadius: 2, p: 1.5 }}>
                <Avatar sx={{ width: 36, height: 36, fontSize: "0.85rem", fontWeight: 700, background: "linear-gradient(135deg, #8B1A4A, #6b1238)" }}>
                  {initials(deleteUser)}
                </Avatar>
                <Box>
                  <Typography fontWeight={700}>{deleteUser.username}</Typography>
                  <Typography variant="body2" color="text.secondary">{deleteUser.email}</Typography>
                </Box>
              </Box>
              {deleteError && <Alert severity="error">{deleteError}</Alert>}
              <Alert severity="error" icon={<FiTrash2 size={14} style={{ marginTop: 1 }} />}>
                <strong style={{ display: "block", marginBottom: 4 }}>This action is permanent</strong>
                <span style={{ fontSize: "0.78rem" }}>
                  Deleting this user will permanently remove their account and all associated data. This cannot be undone.
                </span>
              </Alert>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <button className="adm-btn adm-btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
          <button
            className="adm-btn"
            style={{ background: "#dc2626", color: "white" }}
            onClick={confirmDelete}
            disabled={deleteLoading}
          >
            {deleteLoading ? <><DotsLoader size="sm" /> Deleting…</> : <><FiTrash2 size={14} /> Delete User</>}
          </button>
        </DialogActions>
      </Dialog>

      {/* Role change confirmation modal */}
      <Dialog open={showConfirmModal} onClose={() => setShowConfirmModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, pb: 1 }}>
          <FiShield size={16} style={{ color: "#f59e0b" }} />
          {selectedUser?.isAdmin ? "Remove Admin Access" : "Grant Admin Access"}
        </DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, bgcolor: "#f8fafc", borderRadius: 2, p: 1.5 }}>
                <Avatar sx={{ width: 36, height: 36, fontSize: "0.85rem", fontWeight: 700, background: "linear-gradient(135deg, #8B1A4A, #6b1238)" }}>
                  {initials(selectedUser)}
                </Avatar>
                <Box>
                  <Typography fontWeight={700}>{selectedUser.username}</Typography>
                  <Typography variant="body2" color="text.secondary">{selectedUser.email}</Typography>
                </Box>
              </Box>
              <Alert severity="info" icon={<FiShield size={14} style={{ marginTop: 1 }} />}>
                <strong style={{ display: "block", marginBottom: 4 }}>
                  {selectedUser.isAdmin ? "Remove Admin Privileges" : "Grant Admin Privileges"}
                </strong>
                <span style={{ fontSize: "0.78rem" }}>
                  {selectedUser.isAdmin
                    ? "This user will lose admin access and become a regular user."
                    : "This user will gain full admin access to manage products, orders, and users."}
                </span>
              </Alert>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <button className="adm-btn adm-btn-secondary" onClick={() => setShowConfirmModal(false)}>Cancel</button>
          <button
            className="adm-btn"
            style={{ background: selectedUser?.isAdmin ? "#f59e0b" : "#059669", color: "white" }}
            onClick={confirmRoleChange}
            disabled={roleActionLoading}
          >
            {roleActionLoading ? (
              <><DotsLoader size="sm" /> Updating…</>
            ) : selectedUser?.isAdmin ? (
              <><FiUser size={14} /> Make User</>
            ) : (
              <><FiShield size={14} /> Make Admin</>
            )}
          </button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
};

export default UsersList;
