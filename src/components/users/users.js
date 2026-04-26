import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Modal } from "react-bootstrap";
import { OrbitLoader, DotsLoader } from "../Loader";
import AdminLayout from "../admin/AdminLayout";
import {
  FiUsers, FiMail, FiShield, FiUser, FiSearch, FiUserX, FiEdit2, FiEye, FiEyeOff,
} from "react-icons/fi";
import { useUsers } from "../../hooks/useSmartFetch";
import { updateUserRole } from "../../features/adminSlice";
import api from "../../api/axios";
import "../admin/admin.css";

const UsersList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data: users, loading, error } = useUsers();
  const [searchTerm, setSearchTerm] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [roleActionLoading, setRoleActionLoading] = useState(false);

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
      setShowConfirmModal(false); setSelectedUser(null);
    } catch { /* handled by redux */ } finally {
      setRoleActionLoading(false);
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
      setEditSuccess("User updated successfully.");
      setTimeout(() => setShowEditModal(false), 1200);
    } catch (err) {
      setEditError(err.response?.data?.error || "Failed to update user.");
    } finally {
      setEditLoading(false);
    }
  };

  const initials = (user) => (user.username || user.email || "?").slice(0, 2).toUpperCase();

  return (
    <AdminLayout>
      {/* Page header */}
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">
            <FiUsers size={22} style={{ color: "var(--adm-primary)" }} />
            Users
          </h1>
          <p className="adm-page-sub">{users.length} registered accounts</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="adm-card" style={{ marginBottom: "var(--adm-space-4)" }}>
        <div style={{ padding: "var(--adm-space-4) var(--adm-space-5)" }}>
          <div className="adm-filter-bar">
            <div className="adm-search-wrap">
              <FiSearch className="adm-search-icon" size={15} />
              <input
                className="adm-search-input"
                placeholder="Search by name or email…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {searchTerm && (
              <span style={{ fontSize: "var(--adm-font-xs)", color: "var(--adm-text-tertiary)" }}>
                {filteredUsers.length} result{filteredUsers.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Users table */}
      <div className="adm-card">
        {loading ? (
          <div className="adm-loading"><OrbitLoader size="lg" /><span>Loading users…</span></div>
        ) : error ? (
          <div className="adm-empty">
            <div className="adm-empty-icon"><FiUserX size={28} /></div>
            <p className="adm-empty-title" style={{ color: "var(--adm-danger)" }}>Error loading users</p>
            <p className="adm-empty-sub">{error}</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="adm-empty">
            <div className="adm-empty-icon"><FiUsers size={28} /></div>
            <p className="adm-empty-title">No users found</p>
            <p className="adm-empty-sub">
              {searchTerm ? "Try adjusting your search terms." : "No users are registered yet."}
            </p>
          </div>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id || user.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "var(--adm-space-3)" }}>
                        <div
                          className="adm-avatar"
                          style={{ background: user.isAdmin ? "linear-gradient(135deg, #f59e0b, #d97706)" : "var(--adm-primary-gradient)" }}
                        >
                          {initials(user)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: "var(--adm-text-primary)" }}>{user.username}</div>
                          <div className="adm-td-muted">#{(user._id || user.id || "").toString().slice(-6)}</div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "var(--adm-space-2)", color: "var(--adm-text-secondary)" }}>
                        <FiMail size={13} style={{ color: "var(--adm-success)", flexShrink: 0 }} />
                        {user.email}
                      </div>
                    </td>

                    <td>
                      {user.isAdmin
                        ? <span className="adm-badge adm-badge--amber"><FiShield size={10} />Admin</span>
                        : <span className="adm-badge adm-badge--green"><FiUser size={10} />User</span>
                      }
                    </td>

                    <td>
                      <span className="adm-badge adm-badge--green">Active</span>
                    </td>

                    <td style={{ textAlign: "center" }}>
                      <div style={{ display: "flex", gap: "var(--adm-space-2)", justifyContent: "center" }}>
                        <button
                          className="adm-btn adm-btn-sm adm-btn-secondary"
                          onClick={() => openEditModal(user)}
                          title="Edit email / password"
                          style={{ borderColor: "var(--adm-primary)", color: "var(--adm-primary)" }}
                        >
                          <FiEdit2 size={12} /> Edit
                        </button>
                        <button
                          className="adm-btn adm-btn-sm adm-btn-secondary"
                          onClick={() => handleRoleChange(user)}
                          disabled={roleActionLoading}
                          style={{
                            borderColor: user.isAdmin ? "var(--adm-warning)" : "var(--adm-success)",
                            color: user.isAdmin ? "var(--adm-warning)" : "var(--adm-success)",
                          }}
                        >
                          {user.isAdmin ? <><FiUser size={12} />Make User</> : <><FiShield size={12} />Make Admin</>}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit user modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered className="adm-modal">
        <Modal.Header closeButton>
          <Modal.Title>
            <FiEdit2 size={16} style={{ color: "var(--adm-primary)", marginRight: 8 }} />
            Edit User
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editUser && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--adm-space-3)", background: "var(--adm-surface-raised)", borderRadius: "var(--adm-radius-md)", padding: "var(--adm-space-3)", marginBottom: "var(--adm-space-4)" }}>
                <div className="adm-avatar">{initials(editUser)}</div>
                <div>
                  <div style={{ fontWeight: 700 }}>{editUser.username}</div>
                  <div style={{ fontSize: "var(--adm-font-sm)", color: "var(--adm-text-secondary)" }}>#{(editUser._id || "").slice(-6)}</div>
                </div>
              </div>

              {editError && (
                <div className="adm-alert adm-alert--error" style={{ marginBottom: "var(--adm-space-3)" }}>
                  {editError}
                </div>
              )}
              {editSuccess && (
                <div className="adm-alert adm-alert--success" style={{ marginBottom: "var(--adm-space-3)" }}>
                  {editSuccess}
                </div>
              )}

              <div style={{ marginBottom: "var(--adm-space-3)" }}>
                <label style={{ display: "block", fontSize: "var(--adm-font-sm)", fontWeight: 600, marginBottom: "var(--adm-space-1)", color: "var(--adm-text-secondary)" }}>
                  Email address
                </label>
                <input
                  type="email"
                  className="adm-input"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="Enter new email"
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "var(--adm-font-sm)", fontWeight: 600, marginBottom: "var(--adm-space-1)", color: "var(--adm-text-secondary)" }}>
                  New password <span style={{ fontWeight: 400, color: "var(--adm-text-tertiary)" }}>(leave blank to keep current)</span>
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showEditPw ? "text" : "password"}
                    className="adm-input"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Enter new password"
                    style={{ width: "100%", paddingRight: "2.5rem" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPw((v) => !v)}
                    style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--adm-text-tertiary)", padding: 0 }}
                    aria-label={showEditPw ? "Hide password" : "Show password"}
                  >
                    {showEditPw ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                </div>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button className="adm-btn adm-btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
          <button
            className="adm-btn"
            style={{ background: "var(--adm-primary)", color: "white" }}
            onClick={handleEditSave}
            disabled={editLoading}
          >
            {editLoading ? <><DotsLoader size="sm" /> Saving…</> : <><FiEdit2 size={14} /> Save Changes</>}
          </button>
        </Modal.Footer>
      </Modal>

      {/* Role change confirmation modal */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered className="adm-modal">
        <Modal.Header closeButton>
          <Modal.Title>
            <FiShield size={16} style={{ color: "var(--adm-warning)", marginRight: 8 }} />
            {selectedUser?.isAdmin ? "Remove Admin Access" : "Grant Admin Access"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--adm-space-3)", background: "var(--adm-surface-raised)", borderRadius: "var(--adm-radius-md)", padding: "var(--adm-space-3)", marginBottom: "var(--adm-space-4)" }}>
                <div className="adm-avatar">{initials(selectedUser)}</div>
                <div>
                  <div style={{ fontWeight: 700 }}>{selectedUser.username}</div>
                  <div style={{ fontSize: "var(--adm-font-sm)", color: "var(--adm-text-secondary)" }}>{selectedUser.email}</div>
                </div>
              </div>
              <div className="adm-alert adm-alert--info">
                <FiShield size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                <div>
                  <strong style={{ display: "block", marginBottom: 4 }}>
                    {selectedUser.isAdmin ? "Remove Admin Privileges" : "Grant Admin Privileges"}
                  </strong>
                  <span style={{ fontSize: "var(--adm-font-xs)" }}>
                    {selectedUser.isAdmin
                      ? "This user will lose admin access and become a regular user."
                      : "This user will gain full admin access to manage products, orders, and users."}
                  </span>
                </div>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button className="adm-btn adm-btn-secondary" onClick={() => setShowConfirmModal(false)}>Cancel</button>
          <button
            className="adm-btn"
            style={{ background: selectedUser?.isAdmin ? "var(--adm-warning)" : "var(--adm-success)", color: "white" }}
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
        </Modal.Footer>
      </Modal>
    </AdminLayout>
  );
};

export default UsersList;
