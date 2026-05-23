import { useEffect, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Divider,
  Chip,
  Grid,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import InventoryOutlinedIcon from "@mui/icons-material/InventoryOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

function Confetti({ container }) {
  useEffect(() => {
    if (!container.current) return;
    const COLORS = ["#8B1A4A", "#C9A84C", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"];
    const pieces = [];
    for (let i = 0; i < 60; i++) {
      const el = document.createElement("div");
      el.style.cssText = `
        position: absolute;
        left: ${Math.random() * 100}%;
        top: -${Math.random() * 20 + 10}px;
        background: ${COLORS[Math.floor(Math.random() * COLORS.length)]};
        width: ${Math.random() * 8 + 5}px;
        height: ${Math.random() * 8 + 5}px;
        border-radius: ${Math.random() > 0.5 ? "50%" : "2px"};
        animation: confettiFall ${Math.random() * 2 + 1.5}s ease-in ${Math.random() * 1}s forwards;
        pointer-events: none;
        opacity: 0.85;
      `;
      container.current.appendChild(el);
      pieces.push(el);
    }
    const styleId = "confetti-keyframes";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        @keyframes confettiFall {
          to { transform: translateY(500px) rotate(720deg); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
    const timer = setTimeout(() => { pieces.forEach((p) => p.remove()); }, 5000);
    return () => { clearTimeout(timer); pieces.forEach((p) => p.remove()); };
  }, [container]);
  return null;
}

function estimatedDelivery(backendOrder, orderData) {
  const shipping = backendOrder?.shippingDetails || orderData?.shippingDetails;
  const days = shipping?.estimatedDays;
  if (!days) return null;
  const parts = String(days).split("–").map(Number);
  const minDays = (parts[0] || 5) + 2;
  const maxDays = (parts[1] || minDays + 3) + 2;
  const fmt = (d) => d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
  const from = new Date(); from.setDate(from.getDate() + minDays);
  const to = new Date(); to.setDate(to.getDate() + maxDays);
  return `${fmt(from)} – ${fmt(to)}`;
}

/* ── Detail card ─────────────────────────────────────────────────────── */
function DetailCard({ icon: Icon, iconColor, title, children }) {
  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid #f0e8e2",
        borderRadius: 3,
        overflow: "hidden",
        height: "100%",
        boxShadow: "0 2px 12px rgba(139,26,74,0.06)",
      }}
    >
      <Box
        sx={{
          px: 2.5,
          py: 1.75,
          borderBottom: "1px solid #f0e8e2",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          background: "linear-gradient(135deg, #fdf6f0 0%, #fdf2f6 100%)",
        }}
      >
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1.5,
            bgcolor: iconColor + "18",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon sx={{ fontSize: 18, color: iconColor }} />
        </Box>
        <Typography variant="subtitle2" fontWeight={700}>{title}</Typography>
      </Box>
      <Box sx={{ p: 2.5 }}>{children}</Box>
    </Paper>
  );
}

export const ConfirmationStep = ({
  orderData,
  paymentData,
  shippingAddress,
  total,
  navigate,
  backendOrder,
}) => {
  const wrapRef = useRef(null);
  const orderId = backendOrder?._id || orderData?.orderId || orderData?.id || orderData?._id;
  const orderTotal = (backendOrder?.totalAmount ?? orderData?.total ?? total ?? 0).toFixed(2);
  const items = backendOrder?.items || orderData?.items || [];
  const deliveryRange = estimatedDelivery(backendOrder, orderData);

  return (
    <Box ref={wrapRef} sx={{ position: "relative", overflow: "hidden" }} aria-live="polite">
      <Confetti container={wrapRef} />

      {/* Hero banner */}
      <Box
        sx={{
          textAlign: "center",
          py: { xs: 5, md: 7 },
          px: 2,
          background: "linear-gradient(135deg, #fdf2f6 0%, #fdf6ec 50%, #f0fdf4 100%)",
          borderRadius: 4,
          mb: 4,
          position: "relative",
          border: "1px solid #f0e8e2",
          overflow: "hidden",
        }}
      >
        {/* Decorative circles */}
        <Box sx={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", bgcolor: "rgba(139,26,74,0.05)" }} />
        <Box sx={{ position: "absolute", bottom: -30, left: -30, width: 120, height: 120, borderRadius: "50%", bgcolor: "rgba(201,168,76,0.08)" }} />

        <Box
          sx={{
            width: 90,
            height: 90,
            borderRadius: "50%",
            bgcolor: "#f0fdf4",
            border: "3px solid #86efac",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 2.5,
            boxShadow: "0 8px 24px rgba(16,185,129,0.2)",
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 52, color: "#10b981" }} />
        </Box>

        <Typography variant="h4" fontWeight={800} sx={{ mb: 1, color: "#1c1917" }}>
          Order Confirmed! 🎉
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 480, mx: "auto", mb: 2 }}>
          Thank you for shopping with us! Your order has been received and we'll start processing it right away.
        </Typography>

        {orderId && (
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              px: 2.5,
              py: 1,
              bgcolor: "rgba(139,26,74,0.08)",
              border: "1px solid rgba(139,26,74,0.2)",
              borderRadius: 20,
            }}
          >
            <Typography variant="caption" fontWeight={600} sx={{ color: "#8B1A4A" }}>
              Order ID:
            </Typography>
            <Typography variant="caption" fontWeight={800} sx={{ color: "#8B1A4A", wordBreak: "break-all" }}>
              {orderId}
            </Typography>
          </Box>
        )}
      </Box>

      {orderData && (
        <Box sx={{ maxWidth: 960, mx: "auto", px: { xs: 1, sm: 0 } }}>

          {/* Delivery estimate banner */}
          {deliveryRange && (
            <Box
              sx={{
                p: 2.5,
                border: "1.5px solid #86efac",
                bgcolor: "#f0fdf4",
                borderRadius: 3,
                mb: 3,
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: "#dcfce7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <LocalShippingOutlinedIcon sx={{ color: "#16a34a", fontSize: 26 }} />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                  Estimated Delivery
                </Typography>
                <Typography variant="h6" fontWeight={800} sx={{ color: "#15803d", lineHeight: 1.2 }}>
                  {deliveryRange}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  You'll receive tracking updates via WhatsApp &amp; email
                </Typography>
              </Box>
            </Box>
          )}

          {/* Detail cards */}
          <Grid container spacing={2.5} sx={{ mb: 3 }}>
            {/* Order details */}
            <Grid item xs={12} md={4}>
              <DetailCard icon={InventoryOutlinedIcon} iconColor="#8B1A4A" title="Order Details">
                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>Order Total</Typography>
                    <Typography variant="h6" fontWeight={800} sx={{ color: "#8B1A4A" }}>₹{orderTotal}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>Items Ordered</Typography>
                    <Typography variant="body2" fontWeight={600}>{items.length} item{items.length !== 1 ? "s" : ""}</Typography>
                  </Box>
                  {items.length > 0 && (
                    <>
                      <Divider sx={{ borderColor: "#f0e8e2" }} />
                      <Stack spacing={1}>
                        {items.map((it, idx) => (
                          <Stack key={idx} direction="row" justifyContent="space-between">
                            <Typography variant="caption" sx={{ flex: 1, pr: 1, color: "#57534e" }}>
                              {it.productName || it.name || it.product?.name} × {it.quantity}
                            </Typography>
                            <Typography variant="caption" fontWeight={700}>
                              ₹{(it.totalPrice ?? it.unitPrice * it.quantity).toFixed(2)}
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>
                    </>
                  )}
                </Stack>
              </DetailCard>
            </Grid>

            {/* Payment info */}
            <Grid item xs={12} md={4}>
              <DetailCard icon={CreditCardOutlinedIcon} iconColor="#C9A84C" title="Payment">
                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>Status</Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip
                        label="Payment Successful"
                        size="small"
                        sx={{
                          bgcolor: "#f0fdf4",
                          color: "#16a34a",
                          border: "1px solid #86efac",
                          fontWeight: 700,
                        }}
                      />
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>Payment ID</Typography>
                    <Typography variant="caption" display="block" sx={{ wordBreak: "break-all", color: "#44403c", fontWeight: 500 }}>
                      {paymentData?.razorpay_payment_id || paymentData?.payment_id || "N/A"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>Method</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {orderData.paymentDetails?.method || "Online Payment"}
                    </Typography>
                  </Box>
                </Stack>
              </DetailCard>
            </Grid>

            {/* Shipping address */}
            <Grid item xs={12} md={4}>
              <DetailCard icon={LocationOnOutlinedIcon} iconColor="#10b981" title="Shipping To">
                <Typography variant="body2" sx={{ lineHeight: 1.9, color: "#44403c" }}>
                  {shippingAddress.street || orderData.shippingAddress?.street}<br />
                  {shippingAddress.city || orderData.shippingAddress?.city},{" "}
                  {shippingAddress.state || orderData.shippingAddress?.state}<br />
                  PIN: {shippingAddress.zipCode || orderData.shippingAddress?.zipCode}<br />
                  {shippingAddress.country || orderData.shippingAddress?.country || "India"}
                </Typography>
                {shippingAddress.phone && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                    📞 {shippingAddress.phone}
                  </Typography>
                )}
              </DetailCard>
            </Grid>
          </Grid>

          {/* CTAs */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 3 }}>
            {orderId && (
              <Button
                variant="contained"
                size="large"
                startIcon={<LocalShippingOutlinedIcon />}
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate(`/track/${orderId}`)}
                sx={{
                  flex: 1,
                  py: 1.5,
                  fontWeight: 700,
                  borderRadius: 2,
                  background: "linear-gradient(135deg, #8B1A4A, #7a1640)",
                  boxShadow: "0 4px 14px rgba(139,26,74,0.35)",
                  "&:hover": { background: "linear-gradient(135deg, #7a1640, #6b1236)" },
                }}
              >
                Track My Order
              </Button>
            )}
            <Button
              variant="outlined"
              size="large"
              startIcon={<InventoryOutlinedIcon />}
              onClick={() => navigate("/orders")}
              sx={{
                flex: 1,
                py: 1.5,
                fontWeight: 700,
                borderRadius: 2,
                borderColor: "#e7e5e4",
                color: "#44403c",
                "&:hover": { borderColor: "#8B1A4A", color: "#8B1A4A", bgcolor: "#fdf2f6" },
              }}
            >
              View Order History
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<ShoppingBagOutlinedIcon />}
              onClick={() => navigate("/products")}
              sx={{
                flex: 1,
                py: 1.5,
                fontWeight: 700,
                borderRadius: 2,
                borderColor: "#e7e5e4",
                color: "#44403c",
                "&:hover": { borderColor: "#8B1A4A", color: "#8B1A4A", bgcolor: "#fdf2f6" },
              }}
            >
              Continue Shopping
            </Button>
          </Stack>

          {/* Share strip */}
          <Box
            sx={{
              p: 2.5,
              border: "1px solid #f0e8e2",
              borderRadius: 3,
              mb: 4,
              bgcolor: "#fafaf9",
              display: "flex",
              gap: 1.5,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <Box sx={{ flex: 1, minWidth: 140 }}>
              <Typography variant="body2" fontWeight={700} sx={{ color: "#1c1917" }}>
                Loved your experience?
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Share your order with friends and family
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="success"
              component="a"
              href={`https://wa.me/?text=${encodeURIComponent(`I just ordered from InfinityCraftSpace! 🎁 Order ID: ${orderId ?? ""}\nTrack my order: ${window.location.origin}/track/${orderId ?? ""}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ borderRadius: 2, fontWeight: 700, py: 1 }}
            >
              💬 Share on WhatsApp
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: "My order from InfinityCraftSpace", text: "Just ordered a handcrafted gift! 🎁", url: window.location.origin });
                } else {
                  navigator.clipboard.writeText(`${window.location.origin}/track/${orderId ?? ""}`);
                  alert("Order link copied!");
                }
              }}
              sx={{
                borderRadius: 2,
                fontWeight: 700,
                py: 1,
                borderColor: "#e7e5e4",
                color: "#44403c",
                "&:hover": { borderColor: "#8B1A4A", color: "#8B1A4A" },
              }}
            >
              🔗 Share Order
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};
