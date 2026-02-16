import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import Header from "../header";
import {
  Table,
  Container,
  Spinner,
  Card,
  Row,
  Col,
  Badge,
  InputGroup,
  Form,
  Button,
  Modal,
} from "../ui";
import {
  FiArrowLeft,
  FiUsers,
  FiMail,
  FiShield,
  FiUser,
  FiSearch,
  FiUserCheck,
  FiUserX,
  FiCrosshair,
  FiSettings,
} from "react-icons/fi";
import { useUsers } from "../../hooks/useSmartFetch";
import { updateUserRole } from "../../features/adminSlice";

const UsersList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data: users, loading, error } = useUsers();
  const [searchTerm, setSearchTerm] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [roleActionLoading, setRoleActionLoading] = useState(false);

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Handle role change
  const handleRoleChange = (user) => {
    setSelectedUser(user);
    setShowConfirmModal(true);
  };

  // Confirm role change
  const confirmRoleChange = async () => {
    if (!selectedUser) return;

    setRoleActionLoading(true);
    try {
      await dispatch(
        updateUserRole({
          userId: selectedUser._id,
          isAdmin: !selectedUser.isAdmin,
        }),
      ).unwrap();

      setShowConfirmModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Failed to update user role:", error);
    } finally {
      setRoleActionLoading(false);
    }
  };

  const getUserIcon = (user) => {
    if (user.isAdmin) {
      return <FiCrosshair size={18} style={{ color: "#f59e0b" }} />;
    }
    return <FiUser size={18} style={{ color: "#6b7280" }} />;
  };

  const getStatusBadge = (user) => {
    if (user.isAdmin) {
      return (
        <Badge
          bg="warning"
          className="d-flex align-items-center"
          style={{
            borderRadius: "8px",
            fontSize: "0.75rem",
            padding: "0.4rem 0.6rem",
            gap: "0.25rem",
          }}
        >
          <FiShield size={12} />
          Admin
        </Badge>
      );
    }
    return (
      <Badge
        bg="success"
        className="d-flex align-items-center"
        style={{
          borderRadius: "8px",
          fontSize: "0.75rem",
          padding: "0.4rem 0.6rem",
          gap: "0.25rem",
        }}
      >
        <FiUserCheck size={12} />
        User
      </Badge>
    );
  };

  return (
    <>
      <Header />

      <Container
        fluid
        className=""
        style={{
          background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
          minHeight: "100vh",
          paddingTop: "110px",
        }}
      >
        {/* Header Section */}
        <div className="mb-4">
          <Breadcrumb className="mb-3">
            <Breadcrumb.Item
              onClick={() => navigate("/admin/dashboard")}
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                color: "#495057",
              }}
            >
              <FiArrowLeft style={{ marginRight: 4 }} />
              Dashboard
            </Breadcrumb.Item>
            <Breadcrumb.Item active style={{ color: "#343a40" }}>
              Users
            </Breadcrumb.Item>
          </Breadcrumb>

          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
            <div className="mb-3 mb-md-0">
              <h1
                className="text-dark mb-2"
                style={{
                  fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
                  fontWeight: "700",
                }}
              >
                <FiUsers className="me-3" style={{ color: "#4f46e5" }} />
                User Management
              </h1>
              <p
                className="text-muted mb-0"
                style={{ fontSize: "clamp(0.9rem, 2vw, 1.1rem)" }}
              >
                Manage registered users and their roles
              </p>
            </div>
            <Badge
              bg="primary"
              className="d-flex align-items-center"
              style={{
                fontSize: "1rem",
                padding: "0.75rem 1.25rem",
                borderRadius: "12px",
                gap: "0.5rem",
              }}
            >
              <FiUsers size={16} />
              {filteredUsers.length}{" "}
              {filteredUsers.length === 1 ? "User" : "Users"}
            </Badge>
          </div>
        </div>

        {/* Search Section */}
        <Card
          className="mb-4 border-0 shadow-sm"
          style={{ borderRadius: "16px" }}
        >
          <Card.Body>
            <Row>
              <Col md={6}>
                <InputGroup>
                  <InputGroup.Text
                    style={{
                      backgroundColor: "transparent",
                      border: "2px solid #e9ecef",
                      borderRight: "none",
                      borderRadius: "12px 0 0 12px",
                    }}
                  >
                    <FiSearch style={{ color: "#6b7280" }} />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      border: "2px solid #e9ecef",
                      borderLeft: "none",
                      borderRadius: "0 12px 12px 0",
                      fontSize: "1rem",
                      padding: "12px",
                    }}
                  />
                </InputGroup>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Users Content */}
        {loading ? (
          <Card className="border-0 shadow-sm" style={{ borderRadius: "16px" }}>
            <Card.Body>
              <div
                className="d-flex justify-content-center align-items-center"
                style={{ minHeight: "300px" }}
              >
                <div className="text-center">
                  <Spinner
                    animation="border"
                    role="status"
                    style={{ width: "3rem", height: "3rem", color: "#4f46e5" }}
                  />
                  <p className="mt-3 text-muted">Loading users...</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        ) : error ? (
          <Card className="border-0 shadow-sm" style={{ borderRadius: "16px" }}>
            <Card.Body>
              <div className="text-center py-5">
                <FiUserX size={64} className="text-danger mb-3" />
                <h4 className="text-danger">Error Loading Users</h4>
                <p className="text-muted">{error}</p>
              </div>
            </Card.Body>
          </Card>
        ) : (
          <Card className="border-0 shadow-sm" style={{ borderRadius: "16px" }}>
            <Card.Body className="p-0">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-5">
                  <FiUsers size={64} className="text-muted mb-3" />
                  <h4 className="text-muted">No users found</h4>
                  <p className="text-muted">
                    {searchTerm
                      ? "Try adjusting your search terms"
                      : "No users are registered yet"}
                  </p>
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="d-none d-lg-block">
                    <Table responsive className="mb-0">
                      <thead
                        style={{
                          background:
                            "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                        }}
                      >
                        <tr>
                          <th
                            style={{
                              border: "none",
                              padding: "1rem",
                              fontWeight: "600",
                              color: "#495057",
                            }}
                          >
                            <FiUser
                              className="me-2"
                              style={{ color: "#6b7280" }}
                            />
                            User
                          </th>
                          <th
                            style={{
                              border: "none",
                              padding: "1rem",
                              fontWeight: "600",
                              color: "#495057",
                            }}
                          >
                            <FiMail
                              className="me-2"
                              style={{ color: "#10b981" }}
                            />
                            Email
                          </th>
                          <th
                            style={{
                              border: "none",
                              padding: "1rem",
                              fontWeight: "600",
                              color: "#495057",
                            }}
                          >
                            <FiShield
                              className="me-2"
                              style={{ color: "#f59e0b" }}
                            />
                            Role
                          </th>
                          <th
                            style={{
                              border: "none",
                              padding: "1rem",
                              fontWeight: "600",
                              color: "#495057",
                            }}
                          >
                            Status
                          </th>
                          <th
                            style={{
                              border: "none",
                              padding: "1rem",
                              fontWeight: "600",
                              color: "#495057",
                              textAlign: "center",
                            }}
                          >
                            <FiSettings
                              className="me-2"
                              style={{ color: "#6366f1" }}
                            />
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((user, index) => (
                          <tr
                            key={user._id || user.id}
                            style={{ borderBottom: "1px solid #f1f3f4" }}
                          >
                            <td style={{ border: "none", padding: "1rem" }}>
                              <div className="d-flex align-items-center">
                                <div
                                  className="me-3 d-flex align-items-center justify-content-center"
                                  style={{
                                    width: "40px",
                                    height: "40px",
                                    backgroundColor: user.isAdmin
                                      ? "#fef3c7"
                                      : "#e0f2fe",
                                    borderRadius: "10px",
                                  }}
                                >
                                  {getUserIcon(user)}
                                </div>
                                <div>
                                  <h6
                                    className="mb-0"
                                    style={{
                                      fontWeight: "600",
                                      color: "#212529",
                                    }}
                                  >
                                    {user.username}
                                  </h6>
                                  <small className="text-muted">
                                    ID:{" "}
                                    {user._id?.slice(-6) ||
                                      user.id?.toString().slice(-6)}
                                  </small>
                                </div>
                              </div>
                            </td>
                            <td style={{ border: "none", padding: "1rem" }}>
                              <div className="d-flex align-items-center">
                                <FiMail
                                  className="me-2"
                                  style={{ color: "#10b981" }}
                                />
                                <span style={{ color: "#374151" }}>
                                  {user.email}
                                </span>
                              </div>
                            </td>
                            <td style={{ border: "none", padding: "1rem" }}>
                              {getStatusBadge(user)}
                            </td>
                            <td style={{ border: "none", padding: "1rem" }}>
                              <Badge
                                bg="success"
                                className="d-flex align-items-center"
                                style={{
                                  borderRadius: "8px",
                                  fontSize: "0.75rem",
                                  padding: "0.4rem 0.6rem",
                                  gap: "0.25rem",
                                  width: "fit-content",
                                }}
                              >
                                <div
                                  style={{
                                    width: "6px",
                                    height: "6px",
                                    backgroundColor: "#10b981",
                                    borderRadius: "50%",
                                  }}
                                />
                                Active
                              </Badge>
                            </td>
                            <td
                              style={{
                                border: "none",
                                padding: "1rem",
                                textAlign: "center",
                              }}
                            >
                              <Button
                                size="sm"
                                variant={
                                  user.isAdmin
                                    ? "outline-warning"
                                    : "outline-success"
                                }
                                onClick={() => handleRoleChange(user)}
                                disabled={roleActionLoading}
                                style={{
                                  borderRadius: "8px",
                                  fontWeight: "500",
                                  padding: "0.4rem 0.8rem",
                                  border: "2px solid",
                                  fontSize: "0.75rem",
                                }}
                                className="d-flex align-items-center gap-1"
                              >
                                {user.isAdmin ? (
                                  <>
                                    <FiUser size={12} />
                                    Make User
                                  </>
                                ) : (
                                  <>
                                    <FiShield size={12} />
                                    Make Admin
                                  </>
                                )}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="d-lg-none">
                    <div className="p-3">
                      {filteredUsers.map((user, index) => (
                        <Card
                          key={user._id || user.id}
                          className="mb-3 border-0 shadow-sm"
                          style={{ borderRadius: "12px" }}
                        >
                          <Card.Body>
                            <div className="d-flex align-items-start mb-3">
                              <div
                                className="me-3 d-flex align-items-center justify-content-center flex-shrink-0"
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  backgroundColor: user.isAdmin
                                    ? "#fef3c7"
                                    : "#e0f2fe",
                                  borderRadius: "12px",
                                }}
                              >
                                {getUserIcon(user)}
                              </div>
                              <div className="flex-grow-1">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <h6
                                    className="mb-0"
                                    style={{
                                      fontWeight: "600",
                                      color: "#212529",
                                    }}
                                  >
                                    {user.username}
                                  </h6>
                                  {getStatusBadge(user)}
                                </div>
                                <div className="d-flex align-items-center mb-2">
                                  <FiMail
                                    className="me-2"
                                    style={{ color: "#10b981" }}
                                  />
                                  <span className="text-muted small">
                                    {user.email}
                                  </span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                  <small className="text-muted">
                                    ID:{" "}
                                    {user._id?.slice(-6) ||
                                      user.id?.toString().slice(-6)}
                                  </small>
                                  <Badge
                                    bg="success"
                                    className="d-flex align-items-center"
                                    style={{
                                      borderRadius: "6px",
                                      fontSize: "0.7rem",
                                      padding: "0.3rem 0.5rem",
                                      gap: "0.25rem",
                                    }}
                                  >
                                    <div
                                      style={{
                                        width: "4px",
                                        height: "4px",
                                        backgroundColor: "#10b981",
                                        borderRadius: "50%",
                                      }}
                                    />
                                    Active
                                  </Badge>
                                </div>
                                <div className="d-flex justify-content-end">
                                  <Button
                                    size="sm"
                                    variant={
                                      user.isAdmin
                                        ? "outline-warning"
                                        : "outline-success"
                                    }
                                    onClick={() => handleRoleChange(user)}
                                    disabled={roleActionLoading}
                                    style={{
                                      borderRadius: "6px",
                                      fontWeight: "500",
                                      padding: "0.3rem 0.6rem",
                                      border: "2px solid",
                                      fontSize: "0.7rem",
                                    }}
                                    className="d-flex align-items-center gap-1"
                                  >
                                    {user.isAdmin ? (
                                      <>
                                        <FiUser size={10} />
                                        Make User
                                      </>
                                    ) : (
                                      <>
                                        <FiShield size={10} />
                                        Make Admin
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        )}
      </Container>

      {/* Role Change Confirmation Modal */}
      <Modal
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        centered
      >
        <Modal.Header closeButton style={{ border: "none", paddingBottom: 0 }}>
          <Modal.Title className="d-flex align-items-center gap-2">
            <FiShield style={{ color: "#f59e0b" }} />
            {selectedUser?.isAdmin
              ? "Remove Admin Access"
              : "Grant Admin Access"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ paddingTop: "1rem" }}>
          {selectedUser && (
            <div>
              <div
                className="d-flex align-items-center gap-3 mb-3 p-3"
                style={{ backgroundColor: "#f8f9fa", borderRadius: "12px" }}
              >
                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    width: "40px",
                    height: "40px",
                    backgroundColor: selectedUser.isAdmin
                      ? "#fef3c7"
                      : "#e0f2fe",
                    borderRadius: "10px",
                  }}
                >
                  {getUserIcon(selectedUser)}
                </div>
                <div>
                  <h6 className="mb-0" style={{ fontWeight: "600" }}>
                    {selectedUser.username}
                  </h6>
                  <small className="text-muted">{selectedUser.email}</small>
                </div>
              </div>

              <div
                className="alert alert-info d-flex align-items-start gap-2"
                style={{ border: "none", borderRadius: "12px" }}
              >
                <FiShield
                  style={{ color: "#0ea5e9", marginTop: "2px", flexShrink: 0 }}
                />
                <div>
                  <strong className="d-block mb-1">
                    {selectedUser.isAdmin
                      ? "Remove Admin Privileges"
                      : "Grant Admin Privileges"}
                  </strong>
                  <small>
                    {selectedUser.isAdmin
                      ? "This user will lose admin access and become a regular user. They will no longer be able to access the admin dashboard."
                      : "This user will gain admin access and be able to manage products, orders, and other users through the admin dashboard."}
                  </small>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer style={{ border: "none", paddingTop: 0 }}>
          <Button
            variant="outline-secondary"
            onClick={() => setShowConfirmModal(false)}
            style={{ borderRadius: "8px" }}
          >
            Cancel
          </Button>
          <Button
            variant={selectedUser?.isAdmin ? "warning" : "success"}
            onClick={confirmRoleChange}
            disabled={roleActionLoading}
            style={{ borderRadius: "8px" }}
            className="d-flex align-items-center gap-2"
          >
            {roleActionLoading ? (
              <>
                <Spinner size="sm" />
                Updating...
              </>
            ) : (
              <>
                {selectedUser?.isAdmin ? (
                  <>
                    <FiUser size={14} />
                    Make User
                  </>
                ) : (
                  <>
                    <FiShield size={14} />
                    Make Admin
                  </>
                )}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default UsersList;
