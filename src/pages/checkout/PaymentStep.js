import { useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Stack,
  Divider,
  Chip,
  Alert,
  CircularProgress,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import CheckIcon from "@mui/icons-material/Check";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import CheckoutDeliveryPanel from "../../components/CheckoutDeliveryPanel";
import { ProductThumb } from "./CartReviewStep";

const PAYMENT_METHODS = [
  {
    id: "razorpay",
    title: "Card / UPI / NetBanking",
    subtitle: "Powered by Razorpay · Instant & Secure",
    badge: "Recommended",
  },
];

const SECURITY_FEATURES = [
  { icon: "🔐", label: "256-bit SSL Encryption" },
  { icon: "🏦", label: "PCI DSS Compliant" },
  { icon: "🚫", label: "No Card Details Stored" },
  { icon: "🛡️", label: "Bank-Level Security" },
];

const ACCEPTED_PAYMENTS = ["Visa", "Mastercard", "UPI", "Paytm", "GPay", "PhonePe"];

/* ── Card header shared pattern ──────────────────────────────────────── */
function CardHeader({ icon: Icon, title, subtitle }) {
  return (
    <Box
      sx={{
        px: 3,
        py: 2.25,
        display: "flex",
        alignItems: "center",
        gap: 2,
        borderBottom: "1px solid #f0ebe8",
        background: "linear-gradient(135deg, #fdf6f0 0%, #fdf2f6 100%)",
      }}
    >
      <Box
        sx={{
          width: 38,
          height: 38,
          borderRadius: 2,
          background: "linear-gradient(135deg, #8B1A4A, #C9A84C)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxShadow: "0 2px 8px rgba(139,26,74,0.25)",
        }}
      >
        <Icon sx={{ color: "white", fontSize: 20 }} />
      </Box>
      <Box>
        <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.2 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
        )}
      </Box>
    </Box>
  );
}

export const PaymentStep = ({
  cartItems,
  shippingAddress,
  subtotal,
  shipping,
  tax,
  total,
  error,
  loading,
  handlePayment,
  setCurrentStep,
}) => {
  const [selectedMethod, setSelectedMethod] = useState("razorpay");

  const handlePay = () => {
    if (selectedMethod === "razorpay") handlePayment();
  };

  return (
    <Grid container spacing={3}>
      {/* Left: payment method */}
      <Grid item xs={12} md={8}>
        <Paper
          elevation={0}
          sx={{
            border: "1px solid #f0e8e2",
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: "0 2px 16px rgba(139,26,74,0.07)",
          }}
        >
          <CardHeader
            icon={LockOutlinedIcon}
            title="Secure Payment"
            subtitle="Bank-level encryption · No card details stored"
          />

          <Box sx={{ p: 2.5 }}>
            <Typography variant="body2" fontWeight={700} sx={{ mb: 2, color: "#44403c" }}>
              Choose Payment Method
            </Typography>

            {/* Payment method card */}
            <Stack spacing={1.5} sx={{ mb: 3 }}>
              {PAYMENT_METHODS.map((method) => {
                const selected = selectedMethod === method.id;
                return (
                  <Box
                    key={method.id}
                    role="radio"
                    aria-checked={selected}
                    tabIndex={0}
                    onClick={() => setSelectedMethod(method.id)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedMethod(method.id); }}
                    sx={{
                      p: 2.5,
                      border: "2px solid",
                      borderColor: selected ? "#8B1A4A" : "#e7e5e4",
                      borderRadius: 2.5,
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      cursor: "pointer",
                      bgcolor: selected ? "#fdf2f6" : "#fff",
                      transition: "all 0.15s ease",
                      "&:hover": { borderColor: "#8B1A4A" },
                    }}
                  >
                    {/* Radio circle */}
                    <Box
                      sx={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        border: "2px solid",
                        borderColor: selected ? "#8B1A4A" : "#c4c4c4",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: selected ? "#8B1A4A" : "transparent",
                        flexShrink: 0,
                        transition: "all 0.15s",
                      }}
                    >
                      {selected && <CheckIcon sx={{ color: "white", fontSize: 13 }} />}
                    </Box>

                    {/* Payment icon */}
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 2,
                        background: "linear-gradient(135deg, #8B1A4A, #C9A84C)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        boxShadow: "0 2px 8px rgba(139,26,74,0.25)",
                      }}
                    >
                      <CreditCardOutlinedIcon sx={{ color: "white", fontSize: 24 }} />
                    </Box>

                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={700}>{method.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{method.subtitle}</Typography>
                    </Box>

                    {method.badge && (
                      <Chip
                        label={method.badge}
                        size="small"
                        sx={{
                          bgcolor: "#f0fdf4",
                          color: "#16a34a",
                          border: "1px solid #86efac",
                          fontWeight: 700,
                          height: 22,
                        }}
                      />
                    )}
                  </Box>
                );
              })}
            </Stack>

            {/* Accepted payments */}
            <Box
              sx={{
                p: 2,
                bgcolor: "#fafaf9",
                border: "1px solid #f0e8e2",
                borderRadius: 2,
                mb: 2.5,
              }}
            >
              <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ mb: 1 }}>
                Accepted Payment Methods
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={0.75}>
                {ACCEPTED_PAYMENTS.map((p) => (
                  <Chip
                    key={p}
                    label={p}
                    size="small"
                    variant="outlined"
                    sx={{ borderColor: "#e7e5e4", fontSize: "0.72rem", height: 22 }}
                  />
                ))}
              </Stack>
            </Box>

            {/* Security box */}
            <Box
              sx={{
                p: 2,
                bgcolor: "#f0fdf4",
                border: "1px solid #86efac",
                borderRadius: 2,
                mb: 2.5,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                <VerifiedUserOutlinedIcon sx={{ fontSize: 18, color: "#16a34a" }} />
                <Typography variant="body2" fontWeight={700} sx={{ color: "#15803d" }}>
                  Your Payment is Protected
                </Typography>
              </Stack>
              <Grid container spacing={1}>
                {SECURITY_FEATURES.map(({ icon, label }) => (
                  <Grid item xs={12} sm={6} key={label}>
                    <Stack direction="row" alignItems="center" spacing={0.75}>
                      <Typography fontSize={14}>{icon}</Typography>
                      <Typography variant="caption" sx={{ color: "#166534" }}>{label}</Typography>
                    </Stack>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <Stack direction="row" spacing={1.5}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => setCurrentStep(2)}
                disabled={loading}
                sx={{
                  minWidth: 100,
                  py: 1.25,
                  borderRadius: 2,
                  borderColor: "#e7e5e4",
                  color: "text.secondary",
                  "&:hover": { borderColor: "#8B1A4A", color: "#8B1A4A" },
                }}
              >
                Back
              </Button>
              <Button
                variant="contained"
                size="large"
                startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <LockOutlinedIcon />}
                onClick={handlePay}
                disabled={loading}
                sx={{
                  flex: 1,
                  py: 1.5,
                  fontSize: "1rem",
                  fontWeight: 700,
                  borderRadius: 2,
                  background: "linear-gradient(135deg, #8B1A4A, #7a1640)",
                  boxShadow: "0 4px 14px rgba(139,26,74,0.35)",
                  "&:hover": { background: "linear-gradient(135deg, #7a1640, #6b1236)", boxShadow: "0 6px 18px rgba(139,26,74,0.4)" },
                }}
                aria-label={`Pay ₹${total.toFixed(2)} securely`}
              >
                {loading ? "Processing Payment…" : `Pay ₹${total.toFixed(2)} Securely`}
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Grid>

      {/* Right: payment summary */}
      <Grid item xs={12} md={4}>
        <Paper
          elevation={0}
          sx={{
            border: "1px solid #f0e8e2",
            borderRadius: 3,
            overflow: "hidden",
            position: { md: "sticky" },
            top: { md: 80 },
            boxShadow: "0 4px 24px rgba(139,26,74,0.10)",
          }}
        >
          {/* Rose gradient header */}
          <Box
            sx={{
              px: 3,
              py: 2.5,
              background: "linear-gradient(135deg, #8B1A4A 0%, #7a1640 100%)",
            }}
          >
            <Typography variant="subtitle1" fontWeight={700} sx={{ color: "white", mb: 0.25 }}>
              Payment Summary
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
              Final order review
            </Typography>
          </Box>

          <Box sx={{ p: 2.5 }}>
            {/* Items preview */}
            <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ mb: 1.5, display: "block", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Order Items ({cartItems.length})
            </Typography>
            <Stack spacing={1.5} sx={{ mb: 2.5 }}>
              {cartItems.slice(0, 3).map((item) => (
                <Stack key={item.product._id} direction="row" alignItems="center" spacing={1.25}>
                  <ProductThumb product={item.product} size="xs" />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="caption" fontWeight={600} noWrap display="block">
                      {item.product.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Qty {item.quantity} × ₹{item.product.price}
                    </Typography>
                  </Box>
                  <Typography variant="caption" fontWeight={700}>₹{item.totalPrice}</Typography>
                </Stack>
              ))}
              {cartItems.length > 3 && (
                <Typography variant="caption" color="text.secondary">
                  +{cartItems.length - 3} more items
                </Typography>
              )}
            </Stack>

            {/* Shipping address */}
            <Box
              sx={{
                p: 1.75,
                bgcolor: "#fafaf9",
                borderRadius: 2,
                border: "1px solid #f0e8e2",
                mb: 2,
              }}
            >
              <Stack direction="row" alignItems="flex-start" spacing={1}>
                <LocationOnOutlinedIcon sx={{ fontSize: 16, color: "#8B1A4A", mt: 0.25, flexShrink: 0 }} />
                <Box>
                  <Typography variant="caption" fontWeight={700} sx={{ color: "#8B1A4A", display: "block", mb: 0.25 }}>
                    Shipping to
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {shippingAddress.street}<br />
                    {shippingAddress.city}, {shippingAddress.state} – {shippingAddress.zipCode}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <CheckoutDeliveryPanel cartItems={cartItems} pincode={shippingAddress.zipCode} />

            <Divider sx={{ borderColor: "#f0e8e2", my: 2 }} />

            <Stack spacing={1.25}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                <Typography variant="body2" fontWeight={600}>₹{subtotal.toFixed(2)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="body2" color="text.secondary">Shipping</Typography>
                  {shipping === 0 && (
                    <Chip label="FREE" size="small" sx={{ height: 18, bgcolor: "#f0fdf4", color: "#16a34a", border: "1px solid #86efac", fontSize: "0.65rem" }} />
                  )}
                </Stack>
                <Typography variant="body2" fontWeight={600}>₹{shipping.toFixed(2)}</Typography>
              </Stack>
              {tax > 0 && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Tax (18% GST)</Typography>
                  <Typography variant="body2" fontWeight={600}>₹{tax.toFixed(2)}</Typography>
                </Stack>
              )}
            </Stack>

            <Divider sx={{ borderColor: "#f0e8e2", my: 2 }} />

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1" fontWeight={700}>Total to Pay</Typography>
              <Typography variant="h6" fontWeight={800} sx={{ color: "#8B1A4A" }}>
                ₹{total.toFixed(2)}
              </Typography>
            </Stack>
          </Box>

          <Box sx={{ borderTop: "1px solid #f0e8e2", bgcolor: "#fafaf9", px: 2.5, py: 2 }}>
            <Stack direction="row" justifyContent="space-around">
              {["🔒 Encrypted", "🏦 PCI-DSS", "✅ Verified"].map((t) => (
                <Typography key={t} variant="caption" color="text.secondary" sx={{ fontSize: "0.72rem" }}>
                  {t}
                </Typography>
              ))}
            </Stack>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};
