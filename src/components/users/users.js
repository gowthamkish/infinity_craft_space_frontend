import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Modal } from "react-bootstrap";
import { OrbitLoader, DotsLoader } from "../Loader";
import AdminLayout from "../admin/AdminLayout";
import {
  FiUsers, FiMail, FiShield, FiUser, FiSearch, FiUserX,
} from "react-icons/fi";
import { useUsers } from "../../hooks/useSmartFetch";
import { updateUserRole } from "../../features/adminSlice";
import "../admin/admin.css";

const UsersList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data: users, loading, error } = useUsers();
  const [searchTerm, setSearchTerm] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [roleActionLoading, setRoleActionLoading] = useState(false);

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
                      <button
                        className={`adm-btn adm-btn-sm ${user.isAdmin ? "adm-btn-secondary" : "adm-btn-secondary"}`}
                        onClick={() => handleRoleChange(user)}
                        disabled={roleActionLoading}
                        style={{
                          borderColor: user.isAdmin ? "var(--adm-warning)" : "var(--adm-success)",
                          color: user.isAdmin ? "var(--adm-warning)" : "var(--adm-success)",
                        }}
                      >
                        {user.isAdmin ? <><FiUser size={12} />Make User</> : <><FiShield size={12} />Make Admin</>}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
