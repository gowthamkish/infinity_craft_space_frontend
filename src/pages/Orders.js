import { useEffect, useState, useMemo, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Chip,
  Alert,
  Stack,
  Divider,
  CircularProgress,
  Paper,
  Select,
  MenuItem,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  FiPackage,
  FiSearch,
  FiShoppingBag,
  FiTruck,
  FiRotateCcw,
  FiX,
  FiUploadCloud,
  FiImage,
  FiXCircle,
} from "react-icons/fi";
import api from "../api/axios";
import SEOHead, { SEO_CONFIG } from "../components/SEOHead";
import { ToastContext } from "../context/ToastContext";
import { getStatusBadgeVariant } from "../utils/statusHelpers";
import { formatDate, formatOrderId } from "../utils/formatters";

// Statuses where Track Order button is shown
const TRACKABLE_STATUSES = ["confirmed", "processing", "shipped", "delivered"];

// Statuses where the customer can cancel
const CANCELLABLE_STATUSES = ["confirmed", "processing"];

// Return window: 3 days after delivery
const RETURN_WINDOW_DAYS = 3;

const RETURN_REASONS = [
  { value: "defective", label: "Defective / Damaged product" },
  { value: "wrong_item", label: "Wrong item received" },
  { value: "not_as_described", label: "Not as described" },
  { value: "size_mismatch", label: "Size mismatch" },
  { value: "quality_issue", label: "Quality issue" },
  { value: "changed_mind", label: "Changed my mind" },
  { value: "duplicate_order", label: "Duplicate order" },
  { value: "other", label: "Other" },
];

function isReturnEligible(order) {
  if (order.status !== "delivered") return false;
  if (order.hasReturnRequest) return false;
  const deliveredAt = order.deliveredAt || order.updatedAt;
  const daysSince =
    (Date.now() - new Date(deliveredAt)) / (1000 * 60 * 60 * 24);
  return daysSince <= RETURN_WINDOW_DAYS;
}

function daysLeftToReturn(order) {
  const deliveredAt = order.deliveredAt || order.updatedAt;
  const daysSince =
    (Date.now() - new Date(deliveredAt)) / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.ceil(RETURN_WINDOW_DAYS - daysSince));
}

const STATUS_COLOR_MAP = {
  delivered: "success",
  confirmed: "primary",
  pending: "warning",
  processing: "info",
  shipped: "default",
  cancelled: "error",
};

function toLabel(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "Unknown";
}

function StatusBadge({ status }) {
  const variant = getStatusBadgeVariant(status);
  const colorMap = {
    success: "success",
    primary: "primary",
    warning: "warning",
    info: "info",
    secondary: "default",
    danger: "error",
  };
  const color = colorMap[variant] || "default";
  return (
    <Chip
      label={toLabel(status)}
      size="small"
      color={color}
      sx={{ fontWeight: 600, fontSize: "0.75rem" }}
    />
  );
}

function TrackButton({ status, onClick }) {
  const isTrackable = TRACKABLE_STATUSES.includes(status);
  const isDelivered = status === "delivered";

  if (!isTrackable) return null;

  return (
    <Button
      variant="contained"
      size="small"
      fullWidth
      disabled={isDelivered}
      onClick={!isDelivered ? onClick : undefined}
      title={isDelivered ? "Order already delivered" : "Track your order"}
      startIcon={<FiTruck size={13} />}
      sx={{
        textTransform: "none",
        fontSize: "0.8rem",
        bgcolor: isDelivered ? "grey.500" : "primary.main",
        "&:hover": { bgcolor: isDelivered ? "grey.500" : "primary.dark" },
      }}
    >
      {isDelivered ? "Delivered" : "Track Order"}
    </Button>
  );
}

function ReturnButton({ order, onClick }) {
  if (order.status !== "delivered") return null;

  if (order.hasReturnRequest) {
    return (
      <Button
        variant="contained"
        size="small"
        fullWidth
        disabled
        startIcon={<FiRotateCcw size={13} />}
        sx={{
          textTransform: "none",
          fontSize: "0.8rem",
          mt: 0.5,
          bgcolor: "secondary.main",
        }}
        title="Return already requested"
      >
        Return Requested
      </Button>
    );
  }

  const eligible = isReturnEligible(order);
  const daysLeft = daysLeftToReturn(order);

  if (!eligible) {
    return (
      <Button
        variant="contained"
        size="small"
        fullWidth
        disabled
        startIcon={<FiRotateCcw size={13} />}
        sx={{
          textTransform: "none",
          fontSize: "0.8rem",
          mt: 0.5,
          bgcolor: "grey.500",
        }}
        title="Return window has expired (3 days after delivery)"
      >
        Return Expired
      </Button>
    );
  }

  return (
    <Button
      variant="contained"
      size="small"
      fullWidth
      onClick={onClick}
      startIcon={<FiRotateCcw size={13} />}
      sx={{
        textTransform: "none",
        fontSize: "0.8rem",
        mt: 0.5,
        bgcolor: "warning.main",
        "&:hover": { bgcolor: "warning.dark" },
      }}
      title={`${daysLeft} day${daysLeft !== 1 ? "s" : ""} left to return`}
    >
      Return ({daysLeft}d left)
    </Button>
  );
}

function CancelButton({ order, onCancel, cancelling }) {
  const isCancellable = CANCELLABLE_STATUSES.includes(order.status);
  if (!isCancellable) return null;

  return (
    <Button
      variant="contained"
      size="small"
      fullWidth
      color="error"
      onClick={() => onCancel(order)}
      disabled={cancelling}
      startIcon={
        cancelling ? <CircularProgress size={13} color="inherit" /> : <FiXCircle size={13} />
      }
      sx={{ textTransform: "none", fontSize: "0.8rem", mt: 0.5 }}
      title="Cancel this order"
    >
      {cancelling ? "Cancelling…" : "Cancel Order"}
    </Button>
  );
}

const MAX_IMAGES = 5;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function ReturnModal({ order, onClose, onSuccess }) {
  const [reason, setReason] = useState("");
  const [reasonDetails, setReasonDetails] = useState("");
  const [returnType, setReturnType] = useState("return");
  const [imageFiles, setImageFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    return () => previews.forEach((url) => URL.revokeObjectURL(url));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImageChange = (e) => {
    const selected = Array.from(e.target.files || []);
    const valid = selected.filter((f) => ACCEPTED_TYPES.includes(f.type));
    const combined = [...imageFiles, ...valid].slice(0, MAX_IMAGES);
    setImageFiles(combined);
    setPreviews((prev) => {
      prev.forEach((u) => URL.revokeObjectURL(u));
      return combined.map((f) => URL.createObjectURL(f));
    });
    e.target.value = "";
  };

  const removeImage = (idx) => {
    URL.revokeObjectURL(previews[idx]);
    setImageFiles((f) => f.filter((_, i) => i !== idx));
    setPreviews((p) => p.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) {
      setError("Please select a reason.");
      return;
    }
    if (imageFiles.length === 0) {
      setError("Please upload at least one product image.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const items = (order.items || []).map((item) => ({
        productId: item.product?._id,
        productName: item.product?.name || item.name || "Product",
        quantity: item.quantity,
        reason,
      }));

      const formData = new FormData();
      formData.append("orderId", order._id);
      formData.append("reason", reason);
      formData.append("reasonDetails", reasonDetails);
      formData.append("returnType", returnType);
      formData.append("items", JSON.stringify(items));
      imageFiles.forEach((file) => formData.append("images", file));

      await api.post("/api/returns", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onSuccess();
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Failed to submit return request. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const daysLeft = daysLeftToReturn(order);

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1}>
            <FiRotateCcw style={{ color: "#f59e0b" }} />
            <Typography variant="subtitle1" fontWeight={700}>
              Request Return / Refund
            </Typography>
          </Stack>
          <IconButton onClick={onClose} size="small">
            <FiX size={20} />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        {/* Order summary strip */}
        <Box
          sx={{
            fontSize: "0.85rem",
            color: "text.secondary",
            mb: 2,
            p: 1.5,
            bgcolor: "grey.50",
            borderRadius: 1,
            borderLeft: "4px solid #f59e0b",
          }}
        >
          <strong>Order:</strong> {formatOrderId(String(order._id))}&nbsp;·&nbsp;
          <strong>{(order.items || []).length}</strong> item
          {(order.items || []).length !== 1 ? "s" : ""}&nbsp;·&nbsp;
          <Box
            component="span"
            sx={{ color: daysLeft <= 1 ? "error.main" : "success.main", fontWeight: 600 }}
          >
            {daysLeft} day{daysLeft !== 1 ? "s" : ""} left to return
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" id="return-form" onSubmit={handleSubmit}>
          {/* Return type */}
          <Typography variant="body2" fontWeight={600} sx={{ mb: 0.75 }}>
            Return Type <Box component="span" sx={{ color: "error.main" }}>*</Box>
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
            {[["return", "↩ Return"], ["refund", "💳 Refund"], ["exchange", "🔁 Exchange"]].map(([val, lbl]) => (
              <Chip
                key={val}
                label={lbl}
                clickable
                onClick={() => setReturnType(val)}
                variant={returnType === val ? "filled" : "outlined"}
                color={returnType === val ? "warning" : "default"}
                sx={{ fontWeight: returnType === val ? 700 : 400 }}
              />
            ))}
          </Stack>

          {/* Reason */}
          <Typography variant="body2" fontWeight={600} sx={{ mb: 0.75 }}>
            Reason <Box component="span" sx={{ color: "error.main" }}>*</Box>
          </Typography>
          <Select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            displayEmpty
            fullWidth
            size="small"
            sx={{ mb: 2 }}
          >
            <MenuItem value="" disabled>
              Select a reason…
            </MenuItem>
            {RETURN_REASONS.map((r) => (
              <MenuItem key={r.value} value={r.value}>
                {r.label}
              </MenuItem>
            ))}
          </Select>

          {/* Additional details */}
          <Typography variant="body2" fontWeight={600} sx={{ mb: 0.75 }}>
            Additional Details{" "}
            <Box component="span" sx={{ color: "text.secondary", fontWeight: 400 }}>
              (optional)
            </Box>
          </Typography>
          <TextField
            multiline
            rows={2}
            fullWidth
            size="small"
            placeholder="Describe the issue in more detail…"
            value={reasonDetails}
            onChange={(e) => setReasonDetails(e.target.value)}
            sx={{ mb: 2 }}
          />

          {/* Image upload */}
          <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
            Product Images{" "}
            <Box component="span" sx={{ color: "error.main" }}>*</Box>
            <Box component="span" sx={{ color: "text.secondary", fontWeight: 400, ml: 0.5 }}>
              (all angles — up to {MAX_IMAGES})
            </Box>
          </Typography>

          <Alert severity="warning" icon={false} sx={{ mb: 1.5, fontSize: "0.82rem" }}>
            📸 Please photograph the product from{" "}
            <strong>front, back, sides, and the damaged area</strong>. Our team uses these to
            validate your return.
          </Alert>

          {previews.length > 0 && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
                gap: 1,
                mb: 1.5,
              }}
            >
              {previews.map((url, idx) => (
                <Box
                  key={idx}
                  sx={{
                    position: "relative",
                    borderRadius: 1,
                    overflow: "hidden",
                    aspectRatio: "1",
                    border: "2px solid",
                    borderColor: "divider",
                  }}
                >
                  <Box
                    component="img"
                    src={url}
                    alt={`preview-${idx}`}
                    sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => removeImage(idx)}
                    sx={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      bgcolor: "rgba(0,0,0,0.65)",
                      color: "white",
                      width: 22,
                      height: 22,
                      p: 0,
                      "&:hover": { bgcolor: "rgba(0,0,0,0.85)" },
                    }}
                  >
                    <FiX size={12} />
                  </IconButton>
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      bgcolor: "rgba(0,0,0,0.45)",
                      color: "white",
                      fontSize: "0.65rem",
                      textAlign: "center",
                      py: 0.25,
                    }}
                  >
                    {idx === 0 ? "Front" : idx === 1 ? "Back" : idx === 2 ? "Side" : idx === 3 ? "Detail" : "Extra"}
                  </Box>
                </Box>
              ))}
            </Box>
          )}

          {imageFiles.length < MAX_IMAGES && (
            <Box
              component="label"
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                p: 1.5,
                borderRadius: 1.5,
                border: "2px dashed #d97706",
                bgcolor: "#fffbeb",
                color: "#d97706",
                fontWeight: 600,
                fontSize: "0.88rem",
                cursor: "pointer",
                "&:hover": { bgcolor: "#fef3c7" },
              }}
            >
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
              <FiUploadCloud size={18} />
              {imageFiles.length === 0
                ? "Upload product photos"
                : `Add more (${imageFiles.length}/${MAX_IMAGES})`}
            </Box>
          )}

          {imageFiles.length > 0 && (
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.5 }}>
              <FiImage size={12} />
              <Typography variant="caption" color="text.secondary">
                {imageFiles.length} image{imageFiles.length !== 1 ? "s" : ""} selected
              </Typography>
            </Stack>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button variant="outlined" onClick={onClose} sx={{ textTransform: "none", flex: 1 }}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="return-form"
          variant="contained"
          disabled={submitting}
          sx={{
            textTransform: "none",
            flex: 2,
            bgcolor: "warning.main",
            "&:hover": { bgcolor: "warning.dark" },
          }}
        >
          {submitting ? "Submitting…" : "🔄 Submit Return Request"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function Orders() {
  const navigate = useNavigate();
  const { addToast } = useContext(ToastContext);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [returnOrder, setReturnOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await api.get("/api/orders");
      const fetched =
        res.data.success && Array.isArray(res.data.orders)
          ? res.data.orders
          : [];
      setOrders(fetched);
    } catch {
      setError("Failed to load orders. Please try again later.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = useMemo(() => {
    if (!search) return orders;
    const q = search.toLowerCase().trim();
    return orders.filter((order) => {
      if (!order) return false;
      if (String(order._id || "").toLowerCase().includes(q)) return true;
      if (String(order.status || "").toLowerCase().includes(q)) return true;
      if (String(order.totalAmount ?? "").includes(q)) return true;
      if (order.shippingAddress) {
        const addr = [
          order.shippingAddress.street,
          order.shippingAddress.city,
          order.shippingAddress.state,
          order.shippingAddress.zipCode,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (addr.includes(q)) return true;
      }
      if (Array.isArray(order.items)) {
        for (const item of order.items) {
          if (
            String(item.product?.name || item.name || "")
              .toLowerCase()
              .includes(q)
          )
            return true;
        }
      }
      return false;
    });
  }, [orders, search]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const current = Math.min(currentPage, totalPages);
  const pagedOrders = filteredOrders.slice(
    (current - 1) * pageSize,
    current * pageSize,
  );

  const [cancellingId, setCancellingId] = useState(null);

  const handleCancelOrder = useCallback(
    async (order) => {
      if (
        !window.confirm(
          `Cancel order ${formatOrderId(String(order._id))}? This cannot be undone.`,
        )
      )
        return;
      setCancellingId(order._id);
      try {
        await api.post(`/api/shipping/cancel/${order._id}`);
        addToast("Order cancelled successfully.", {
          type: "success",
          title: "❌ Order Cancelled",
          duration: 5000,
        });
        fetchOrders();
      } catch (err) {
        addToast(err.response?.data?.error || "Failed to cancel order.", {
          type: "error",
          title: "Error",
          duration: 5000,
        });
      } finally {
        setCancellingId(null);
      }
    },
    [addToast, fetchOrders],
  );

  const handleReturnSuccess = () => {
    setReturnOrder(null);
    addToast(
      "Return request submitted successfully! Our team will review it shortly.",
      {
        type: "success",
        title: "🔄 Return Requested",
        duration: 6000,
      },
    );
    fetchOrders();
  };

  if (loading) {
    return (
      <>
        <Header />
        <Box
          sx={{
            minHeight: "80vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
          }}
        >
          <CircularProgress size={48} />
          <Typography variant="h6">Loading your orders…</Typography>
          <Typography color="text.secondary">
            Please wait while we fetch your order history
          </Typography>
        </Box>
      </>
    );
  }

  return (
    <>
      <SEOHead
        title={`My Orders - ${SEO_CONFIG.SITE_NAME}`}
        description="View and track all your craft supply orders."
        noindex={true}
        canonical={`${SEO_CONFIG.SITE_URL}/orders`}
      />
      <Header />

      {returnOrder && (
        <ReturnModal
          order={returnOrder}
          onClose={() => setReturnOrder(null)}
          onSuccess={handleReturnSuccess}
        />
      )}

      <Box sx={{ maxWidth: 1100, mx: "auto", px: { xs: 2, md: 3 }, py: 4 }}>
        {/* Hero */}
        <Stack alignItems="center" sx={{ mb: 4, textAlign: "center" }}>
          <Box sx={{ color: "primary.main", mb: 1 }}>
            <FiShoppingBag size={40} />
          </Box>
          <Typography variant="h4" fontWeight={800}>
            My Orders
          </Typography>
          <Typography color="text.secondary">
            Track and manage all your orders in one place
          </Typography>
        </Stack>

        {/* Search */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search by order ID, status, item name, or address…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <FiSearch size={16} />
                </InputAdornment>
              ),
              endAdornment: search ? (
                <InputAdornment position="end">
                  <Button
                    size="small"
                    onClick={() => {
                      setSearch("");
                      setCurrentPage(1);
                    }}
                    sx={{ textTransform: "none", minWidth: "auto" }}
                  >
                    Clear
                  </Button>
                </InputAdornment>
              ) : null,
            },
          }}
          sx={{ mb: 3 }}
        />

        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {orders.length === 0 && !error ? (
          <Box sx={{ textAlign: "center", py: 10 }}>
            <Box sx={{ color: "text.secondary", mb: 2 }}>
              <FiShoppingBag size={72} />
            </Box>
            <Typography variant="h6" sx={{ mb: 1 }}>
              No orders found
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              You haven't placed any orders yet. Start shopping to see your orders here!
            </Typography>
            <Button
              variant="contained"
              startIcon={<FiPackage size={16} />}
              onClick={() => (window.location.href = "/products")}
              sx={{ textTransform: "none" }}
            >
              Start Shopping
            </Button>
          </Box>
        ) : (
          <>
            {/* Order cards */}
            <Stack spacing={2}>
              {pagedOrders.map((order) => {
                const oid = String(order._id || "");
                const status = String(order.status || "unknown");
                const total = Number(order.totalAmount ?? 0).toFixed(2);

                return (
                  <Paper
                    key={oid || Math.random()}
                    variant="outlined"
                    sx={{ borderRadius: 2, overflow: "hidden" }}
                  >
                    {/* Order header */}
                    <Box
                      sx={{
                        px: 2.5,
                        py: 1.5,
                        bgcolor: "grey.50",
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 1,
                        borderBottom: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Stack spacing={0.25}>
                        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                          Order ID
                        </Typography>
                        <Typography variant="body2" fontWeight={700} sx={{ fontFamily: "monospace" }}>
                          {formatOrderId(oid)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {order.createdAt ? formatDate(order.createdAt) : "—"}
                        </Typography>
                      </Stack>
                      <StatusBadge status={status} />
                    </Box>

                    {/* Order body */}
                    <Box sx={{ px: 2.5, py: 2 }}>
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={3}
                        justifyContent="space-between"
                      >
                        {/* Items */}
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                            Items Ordered
                          </Typography>
                          <Box
                            component="ul"
                            sx={{ m: 0, pl: 2, mt: 0.5, maxHeight: 120, overflowY: "auto" }}
                          >
                            {(order.items || []).map((item, idx) => {
                              const qty = Number(item.quantity || 1);
                              const price = Number(
                                item.totalPrice ?? (item.product?.price || 0) * qty,
                              ).toFixed(2);
                              return (
                                <Box component="li" key={idx} sx={{ fontSize: "0.85rem", mb: 0.25 }}>
                                  <strong>
                                    {item.product?.name || item.name || "Product"}
                                  </strong>{" "}
                                  × {qty} — ₹{price}
                                </Box>
                              );
                            })}
                          </Box>
                        </Box>

                        {/* Summary */}
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                            Summary
                          </Typography>
                          <Typography variant="h6" fontWeight={700} sx={{ mt: 0.5 }}>
                            ₹{total}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {(order.items || []).length} item
                            {(order.items || []).length !== 1 ? "s" : ""}
                          </Typography>
                        </Box>

                        {/* Shipping */}
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                            Shipping Address
                          </Typography>
                          {order.shippingAddress ? (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 180 }}>
                              {order.shippingAddress.street}
                              <br />
                              {order.shippingAddress.city},{" "}
                              {order.shippingAddress.state}{" "}
                              {order.shippingAddress.zipCode}
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="text.secondary">—</Typography>
                          )}
                        </Box>

                        {/* Actions */}
                        <Box sx={{ minWidth: 140 }}>
                          <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: "uppercase", letterSpacing: 0.5, display: "block", mb: 0.5 }}>
                            Actions
                          </Typography>
                          <TrackButton
                            status={status}
                            onClick={() => navigate(`/track/${oid}`)}
                          />
                          <ReturnButton
                            order={order}
                            onClick={() => setReturnOrder(order)}
                          />
                          <CancelButton
                            order={order}
                            onCancel={handleCancelOrder}
                            cancelling={cancellingId === order._id}
                          />
                        </Box>
                      </Stack>
                    </Box>
                  </Paper>
                );
              })}
            </Stack>

            {/* Pagination */}
            {orders.length > 0 && (
              <Stack
                direction={{ xs: "column", sm: "row" }}
                alignItems="center"
                justifyContent="space-between"
                spacing={2}
                sx={{ mt: 3 }}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    Rows per page:
                  </Typography>
                  <Select
                    value={pageSize}
                    size="small"
                    onChange={(e) => {
                      setPageSize(parseInt(e.target.value, 10));
                      setCurrentPage(1);
                    }}
                    sx={{ minWidth: 72 }}
                  >
                    {[5, 10, 25, 50].map((n) => (
                      <MenuItem key={n} value={n}>
                        {n}
                      </MenuItem>
                    ))}
                  </Select>
                </Stack>

                <Typography variant="body2" color="text.secondary">
                  Page {current} of {totalPages}
                </Typography>

                <Pagination
                  count={totalPages}
                  page={current}
                  onChange={(_, page) => setCurrentPage(page)}
                  size="small"
                  color="primary"
                />
              </Stack>
            )}
          </>
        )}
      </Box>
    </>
  );
}
