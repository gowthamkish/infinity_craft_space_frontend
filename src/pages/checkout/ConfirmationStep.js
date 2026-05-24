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
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";

const P = "#8b2252";
const P_LIGHT = "rgba(139,34,82,0.08)";
const BORDER = "rgba(0,0,0,0.09)";

/* ── Confetti ────────────────────────────────────────────────────────── */
function Confetti({ container }) {
  useEffect(() => {
    if (!container.current) return;
    const COLORS = [P, "#C9A84C", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"];
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
      style.textContent = `@keyframes confettiFall { to { transform: translateY(500px) rotate(720deg); opacity: 0; } }`;
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

/* ── Info card ───────────────────────────────────────────────────────── */
function InfoCard({ icon: Icon, iconColor, title, children }) {
  return (
    <Paper
      elevation={0}
      sx={{
        border: `0.5px solid ${BORDER}`,
        borderRadius: "12px",
        overflow: "hidden",
        height: "100%",
        bgcolor: "#fff",
      }}
    >
      <Box
        sx={{
          px: 2.5,
          py: 1.75,
          borderBottom: `0.5px solid ${BORDER}`,
          display: "flex",
          alignItems: "center",
          gap: 1.25,
        }}
      >
        <Box
          sx={{
            width: 30,
            height: 30,
            borderRadius: "8px",
            bgcolor: iconColor + "18",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon sx={{ fontSize: 17, color: iconColor }} />
        </Box>
        <Typography sx={{ fontSize: "0.875rem", fontWeight: 500 }}>{title}</Typography>
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

      {/* ── Success hero ─────────────────────────────────────────────── */}
      <Box sx={{ textAlign: "center", py: { xs: 5, md: 7 }, px: 2 }}>
        {/* Checkmark circle */}
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            bgcolor: P,
            border: `4px solid ${P_LIGHT}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 3,
            boxShadow: `0 8px 28px rgba(139,34,82,0.35)`,
            animation: "checkPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
            "@keyframes checkPop": {
              "0%": { transform: "scale(0.5)", opacity: 0 },
              "100%": { transform: "scale(1)", opacity: 1 },
            },
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 46, color: "#fff" }} />
        </Box>

        <Typography sx={{ fontSize: "1.5rem", fontWeight: 500, mb: 1, color: "#1c1917" }}>
          Order Confirmed! 🎉
        </Typography>
        <Typography sx={{ fontSize: "0.875rem", color: "#6b7280", lineHeight: 1.7, maxWidth: 440, mx: "auto", mb: 2.5 }}>
          Thank you for shopping with us! Your order has been received and we'll start processing it right away.
        </Typography>

        {orderId && (
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.75,
              px: 2,
              py: 0.75,
              bgcolor: P_LIGHT,
              border: `1px solid rgba(139,34,82,0.2)`,
              borderRadius: "20px",
            }}
          >
            <Typography sx={{ fontSize: "0.8125rem", fontFamily: "monospace", color: P, fontWeight: 500 }}>
              Order #{orderId}
            </Typography>
          </Box>
        )}
      </Box>

      {orderData && (
        <Box sx={{ maxWidth: 900, mx: "auto" }}>

          {/* Delivery estimate */}
          {deliveryRange && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                border: "1.5px solid #86efac",
                bgcolor: "#f0fdf4",
                borderRadius: "12px",
                mb: 2.5,
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "10px",
                  bgcolor: "#dcfce7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <LocalShippingOutlinedIcon sx={{ color: "#16a34a", fontSize: 24 }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 500, display: "block" }}>
                  Expected delivery
                </Typography>
                <Typography sx={{ fontSize: "1rem", fontWeight: 600, color: "#15803d" }}>
                  {deliveryRange}
                </Typography>
                <Typography sx={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                  Tracking updates via WhatsApp & email
                </Typography>
              </Box>
            </Paper>
          )}

          {/* Detail cards */}
          <Grid container spacing={2} sx={{ mb: 2.5 }}>
            <Grid item xs={12} md={4}>
              <InfoCard icon={InventoryOutlinedIcon} iconColor={P} title="Order Details">
                <Stack spacing={1.5}>
                  <Box>
                    <Typography sx={{ fontSize: "0.75rem", color: "#9ca3af", fontWeight: 500, mb: 0.25 }}>
                      Order Total
                    </Typography>
                    <Typography sx={{ fontSize: "1.25rem", fontWeight: 600, color: P }}>
                      ₹{orderTotal}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: "0.75rem", color: "#9ca3af", fontWeight: 500, mb: 0.25 }}>
                      Items Ordered
                    </Typography>
                    <Typography sx={{ fontSize: "0.875rem", fontWeight: 500 }}>
                      {items.length} item{items.length !== 1 ? "s" : ""}
                    </Typography>
                  </Box>
                  {items.length > 0 && (
                    <>
                      <Divider sx={{ borderColor: BORDER }} />
                      <Stack spacing={1}>
                        {items.map((it, idx) => (
                          <Stack key={idx} direction="row" justifyContent="space-between">
                            <Typography sx={{ fontSize: "0.75rem", flex: 1, pr: 1, color: "#57534e" }}>
                              {it.productName || it.name || it.product?.name} × {it.quantity}
                            </Typography>
                            <Typography sx={{ fontSize: "0.75rem", fontWeight: 600 }}>
                              ₹{(it.totalPrice ?? it.unitPrice * it.quantity).toFixed(2)}
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>
                    </>
                  )}
                </Stack>
              </InfoCard>
            </Grid>

            <Grid item xs={12} md={4}>
              <InfoCard icon={CreditCardOutlinedIcon} iconColor="#C9A84C" title="Payment">
                <Stack spacing={1.5}>
                  <Box>
                    <Typography sx={{ fontSize: "0.75rem", color: "#9ca3af", fontWeight: 500, mb: 0.5 }}>
                      Status
                    </Typography>
                    <Chip
                      label="Payment Successful"
                      size="small"
                      sx={{ bgcolor: "#f0fdf4", color: "#16a34a", border: "1px solid #86efac", fontWeight: 600 }}
                    />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: "0.75rem", color: "#9ca3af", fontWeight: 500, mb: 0.25 }}>
                      Payment ID
                    </Typography>
                    <Typography sx={{ fontSize: "0.72rem", wordBreak: "break-all", color: "#374151", fontFamily: "monospace" }}>
                      {paymentData?.razorpay_payment_id || paymentData?.payment_id || "N/A"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: "0.75rem", color: "#9ca3af", fontWeight: 500, mb: 0.25 }}>
                      Method
                    </Typography>
                    <Typography sx={{ fontSize: "0.875rem", fontWeight: 500 }}>
                      {orderData.paymentDetails?.method || "Online Payment"}
                    </Typography>
                  </Box>
                </Stack>
              </InfoCard>
            </Grid>

            <Grid item xs={12} md={4}>
              <InfoCard icon={LocationOnOutlinedIcon} iconColor="#10b981" title="Shipping To">
                <Typography sx={{ fontSize: "0.875rem", lineHeight: 1.9, color: "#374151" }}>
                  {shippingAddress.street || orderData.shippingAddress?.street}<br />
                  {shippingAddress.city || orderData.shippingAddress?.city},{" "}
                  {shippingAddress.state || orderData.shippingAddress?.state}<br />
                  PIN: {shippingAddress.zipCode || orderData.shippingAddress?.zipCode}<br />
                  {shippingAddress.country || orderData.shippingAddress?.country || "India"}
                </Typography>
                {shippingAddress.phone && (
                  <Typography sx={{ fontSize: "0.75rem", color: "#9ca3af", mt: 1, display: "block" }}>
                    📞 {shippingAddress.phone}
                  </Typography>
                )}
              </InfoCard>
            </Grid>
          </Grid>

          {/* CTAs */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 2.5 }}>
            {orderId && (
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                startIcon={<LocalShippingOutlinedIcon />}
                onClick={() => navigate(`/track/${orderId}`)}
                sx={{
                  flex: 1,
                  height: 48,
                  fontWeight: 500,
                  fontSize: "0.875rem",
                  borderRadius: "10px",
                  bgcolor: P,
                  textTransform: "none",
                  boxShadow: "0 2px 12px rgba(139,34,82,0.28)",
                  "&:hover": { bgcolor: "#7a1d47" },
                }}
              >
                Track My Order
              </Button>
            )}
            <Button
              variant="outlined"
              size="large"
              startIcon={<ShoppingBagOutlinedIcon />}
              onClick={() => navigate("/products")}
              sx={{
                flex: 1,
                height: 48,
                fontWeight: 500,
                fontSize: "0.875rem",
                borderRadius: "10px",
                borderColor: P,
                color: P,
                textTransform: "none",
                "&:hover": { bgcolor: P_LIGHT, borderColor: P },
              }}
            >
              Continue Shopping
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<InventoryOutlinedIcon />}
              onClick={() => navigate("/orders")}
              sx={{
                flex: 1,
                height: 48,
                fontWeight: 500,
                fontSize: "0.875rem",
                borderRadius: "10px",
                borderColor: "#e5e7eb",
                color: "#374151",
                textTransform: "none",
                "&:hover": { borderColor: P, color: P, bgcolor: P_LIGHT },
              }}
            >
              View Orders
            </Button>
          </Stack>

          {/* Share strip */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              border: `0.5px solid ${BORDER}`,
              borderRadius: "12px",
              mb: 3,
              bgcolor: "#fff",
              display: "flex",
              gap: 1.5,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <Box sx={{ flex: 1, minWidth: 140 }}>
              <Typography sx={{ fontSize: "0.875rem", fontWeight: 500, color: "#1c1917", mb: 0.25 }}>
                Loved your experience?
              </Typography>
              <Typography sx={{ fontSize: "0.75rem", color: "#9ca3af" }}>
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
              sx={{ borderRadius: "10px", fontWeight: 500, fontSize: "0.875rem", height: 40, textTransform: "none" }}
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
                borderRadius: "10px",
                fontWeight: 500,
                fontSize: "0.875rem",
                height: 40,
                textTransform: "none",
                borderColor: "#e5e7eb",
                color: "#374151",
                "&:hover": { borderColor: P, color: P },
              }}
            >
              🔗 Share Order
            </Button>
          </Paper>

          {/* Email note */}
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.75} sx={{ mb: 4 }}>
            <EmailOutlinedIcon sx={{ fontSize: 14, color: "#9ca3af" }} />
            <Typography sx={{ fontSize: "0.75rem", color: "#9ca3af" }}>
              You'll receive a confirmation email with your order details shortly
            </Typography>
          </Stack>
        </Box>
      )}
    </Box>
  );
};
