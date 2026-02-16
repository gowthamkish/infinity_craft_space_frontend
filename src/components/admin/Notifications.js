import React, { useEffect, useState } from "react";
import { Container, Card, Button, Badge } from "../ui";
import Header from "../../components/header";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/api/admin/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markRead = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await api.put(
        `/api/admin/notifications/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
      );
    } catch (err) {
      console.error("Failed to mark read", err);
    }
  };

  return (
    <>
      <Header />
      <div className="main-container" style={{ paddingTop: "110px" }}>
        <Container className="px-3 px-md-4">
          <h2 className="mb-4">Admin Notifications</h2>
          <Card style={{ borderRadius: 12 }}>
            <Card.Body>
              {loading ? (
                <p>Loading...</p>
              ) : notifications.length === 0 ? (
                <p>No notifications</p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    className="d-flex justify-content-between align-items-start mb-3"
                    style={{
                      padding: "0.5rem 0.25rem",
                      borderBottom: "1px solid var(--border-color)",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>{n.message}</div>
                      <div
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: "0.9rem",
                        }}
                      >
                        {n.createdAt
                          ? new Date(n.createdAt).toLocaleString()
                          : ""}
                      </div>
                    </div>
                    <div className="text-end">
                      {!n.read && (
                        <Badge bg="danger" className="mb-2">
                          New
                        </Badge>
                      )}
                      {n.orderId && (
                        <div>
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() =>
                              navigate("/admin/orders", {
                                state: { openOrderId: n.orderId },
                              })
                            }
                            className="me-2"
                          >
                            View Order
                          </Button>
                          {!n.read && (
                            <Button
                              size="sm"
                              variant="outline-success"
                              onClick={() => markRead(n._id)}
                            >
                              Mark Read
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </Card.Body>
          </Card>
        </Container>
      </div>
    </>
  );
}
