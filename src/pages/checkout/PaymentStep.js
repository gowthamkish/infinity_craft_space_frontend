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
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CheckoutDeliveryPanel from "../../components/CheckoutDeliveryPanel";
import { ProductThumb } from "./CartReviewStep";

const P = "#8b2252";
const P_LIGHT = "rgba(139,34,82,0.08)";
const BORDER = "rgba(0,0,0,0.09)";

const PAYMENT_METHODS = [
  {
    id: "razorpay",
    title: "Card / UPI / NetBanking",
    subtitle: "Powered by Razorpay · Instant & Secure",
    badge: "Recommended",
  },
];

const ACCEPTED_PAYMENTS = [
  "Visa",
  "Mastercard",
  "UPI",
  "Paytm",
  "GPay",
  "PhonePe",
];

const SECURITY_FEATURES = [
  { icon: "🔐", label: "256-bit SSL Encryption" },
  { icon: "🏦", label: "PCI-DSS Compliant" },
  { icon: "🚫", label: "No Card Details Stored" },
  { icon: "🛡️", label: "Bank-Level Security" },
];

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
    <Grid container spacing={3} alignItems="flex-start">
      {/* ── Left: payment method ──────────────────────────────────────── */}
      <Grid item xs={12} md={7}>
        <Paper
          elevation={0}
          sx={{
            border: `0.5px solid ${BORDER}`,
            borderRadius: "12px",
            bgcolor: "#fff",
            overflow: "hidden",
          }}
        >
          {/* Card header */}
          <Box
            sx={{
              px: 2.5,
              py: 2,
              borderBottom: `0.5px solid ${BORDER}`,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "8px",
                bgcolor: P_LIGHT,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <LockOutlinedIcon sx={{ fontSize: 20, color: P }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "1rem", fontWeight: 500 }}>
                Secure Payment
              </Typography>
              <Typography sx={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                Bank-level encryption · No card details stored
              </Typography>
            </Box>
          </Box>

          <Box sx={{ p: 2.5 }}>
            <Typography
              sx={{
                fontSize: "0.8125rem",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                color: "#6b7280",
                mb: 1.5,
              }}
            >
              Choose Payment Method
            </Typography>

            {/* Payment method cards */}
            <Stack spacing={1.25} sx={{ mb: 2.5 }}>
              {PAYMENT_METHODS.map((method) => {
                const selected = selectedMethod === method.id;
                return (
                  <Box
                    key={method.id}
                    role="radio"
                    aria-checked={selected}
                    tabIndex={0}
                    onClick={() => setSelectedMethod(method.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ")
                        setSelectedMethod(method.id);
                    }}
                    sx={{
                      p: 2,
                      border: "1.5px solid",
                      borderColor: selected ? P : "#e5e7eb",
                      borderLeft: selected
                        ? `4px solid ${P}`
                        : "1.5px solid #e5e7eb",
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      cursor: "pointer",
                      bgcolor: selected ? P_LIGHT : "#fff",
                      transition: "all 0.15s ease",
                      "&:hover": { borderColor: P },
                      position: "relative",
                    }}
                  >
                    {/* Checkmark */}
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        border: "1.5px solid",
                        borderColor: selected ? P : "#d1d5db",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: selected ? P : "transparent",
                        flexShrink: 0,
                        transition: "all 0.15s",
                      }}
                    >
                      {selected && (
                        <CheckIcon sx={{ color: "#fff", fontSize: 12 }} />
                      )}
                    </Box>

                    {/* Payment icon */}
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "8px",
                        bgcolor: P_LIGHT,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <CreditCardOutlinedIcon sx={{ color: P, fontSize: 22 }} />
                    </Box>

                    <Box sx={{ flex: 1 }}>
                      <Typography
                        sx={{
                          fontSize: "0.9375rem",
                          fontWeight: 500,
                          lineHeight: 1.3,
                        }}
                      >
                        {method.title}
                      </Typography>
                      <Typography
                        sx={{ fontSize: "0.75rem", color: "#9ca3af" }}
                      >
                        {method.subtitle}
                      </Typography>
                    </Box>

                    {method.badge && (
                      <Chip
                        label={method.badge}
                        size="small"
                        sx={{
                          bgcolor: "#f0fdf4",
                          color: "#16a34a",
                          border: "1px solid #86efac",
                          fontWeight: 500,
                          height: 20,
                          fontSize: "0.6875rem",
                        }}
                      />
                    )}
                  </Box>
                );
              })}
            </Stack>

            {/* Accepted payment methods */}
            <Box sx={{ mb: 2.5 }}>
              <Typography sx={{ fontSize: "0.75rem", color: "#9ca3af", mb: 1 }}>
                Accepted via:
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={0.75}>
                {ACCEPTED_PAYMENTS.map((p) => (
                  <Box
                    key={p}
                    sx={{
                      px: 1.25,
                      height: 24,
                      display: "inline-flex",
                      alignItems: "center",
                      border: `1px solid #e5e7eb`,
                      borderRadius: "20px",
                      fontSize: "0.6875rem",
                      fontWeight: 500,
                      color: "#6b7280",
                    }}
                  >
                    {p}
                  </Box>
                ))}
              </Stack>
            </Box>

            {/* Security card */}
            <Box
              sx={{
                p: 2,
                bgcolor: "#f0fdf4",
                border: "1px solid #86efac",
                borderRadius: "10px",
                mb: 2.5,
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={0.75}
                sx={{ mb: 1.25 }}
              >
                <CheckCircleIcon sx={{ fontSize: 16, color: "#16a34a" }} />
                <Typography
                  sx={{
                    fontSize: "0.8125rem",
                    fontWeight: 500,
                    color: "#15803d",
                  }}
                >
                  Your Payment is Protected
                </Typography>
              </Stack>
              <Stack
                direction="row"
                flexWrap="wrap"
                gap={0}
                divider={
                  <Box
                    component="span"
                    sx={{ mx: 1, color: "#86efac", fontSize: "0.75rem" }}
                  >
                    ·
                  </Box>
                }
              >
                {SECURITY_FEATURES.map(({ icon, label }) => (
                  <Stack
                    key={label}
                    direction="row"
                    alignItems="center"
                    spacing={0.5}
                  >
                    <Typography sx={{ fontSize: 12 }}>{icon}</Typography>
                    <Typography
                      sx={{ fontSize: "0.6875rem", color: "#166534" }}
                    >
                      {label}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2.5, borderRadius: "10px" }}>
                {error}
              </Alert>
            )}

            <Stack direction="row" spacing={1.5} justifyContent="space-between">
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => setCurrentStep(2)}
                disabled={loading}
                sx={{
                  height: 48,
                  px: 3,
                  borderRadius: "10px",
                  borderColor: P,
                  color: P,
                  fontWeight: 500,
                  fontSize: "0.875rem",
                  textTransform: "none",
                  "&:hover": { bgcolor: P_LIGHT, borderColor: P },
                }}
              >
                Back
              </Button>
              <Button
                variant="contained"
                size="large"
                startIcon={
                  loading ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <LockOutlinedIcon />
                  )
                }
                onClick={handlePay}
                disabled={loading}
                sx={{
                  flex: 1,
                  height: 48,
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  borderRadius: "10px",
                  bgcolor: P,
                  textTransform: "none",
                  boxShadow: "0 2px 12px rgba(139,34,82,0.28)",
                  "&:hover": {
                    bgcolor: "#7a1d47",
                    boxShadow: "0 4px 16px rgba(139,34,82,0.36)",
                  },
                }}
                aria-label={`Pay ₹${total.toFixed(2)} securely`}
              >
                {loading
                  ? "Processing Payment…"
                  : `Pay ₹${total.toFixed(2)} Securely`}
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Grid>

      {/* ── Right: payment summary ────────────────────────────────────── */}
      <Grid item xs={12} md={5}>
        <Paper
          elevation={0}
          sx={{
            border: `0.5px solid ${BORDER}`,
            borderRadius: "12px",
            bgcolor: "#fff",
            position: { md: "sticky" },
            top: { md: "24px" },
            overflow: "hidden",
          }}
        >
          {/* Dark maroon header */}
          <Box sx={{ px: 2.5, py: 2.25, bgcolor: "#3d1a2e" }}>
            <Typography
              sx={{
                fontSize: "1rem",
                fontWeight: 500,
                color: "#fff",
                mb: 0.25,
              }}
            >
              Payment Summary
            </Typography>
            <Typography
              sx={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)" }}
            >
              Final order review
            </Typography>
          </Box>

          <Box sx={{ p: 2.5 }}>
            {/* Item list */}
            <Typography
              sx={{
                fontSize: "0.6875rem",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "#9ca3af",
                mb: 1.25,
              }}
            >
              Order Items ({cartItems.length})
            </Typography>
            <Stack spacing={1.5} sx={{ mb: 2 }}>
              {cartItems.map((item) => (
                <Stack
                  key={item.product._id}
                  direction="row"
                  alignItems="center"
                  spacing={1.25}
                >
                  <ProductThumb product={item.product} size="xs" />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{ fontSize: "0.8125rem", fontWeight: 500 }}
                      noWrap
                    >
                      {item.product.name}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.75rem",
                        color: "#9ca3af",
                        display: "block",
                      }}
                    >
                      Qty {item.quantity} × ₹{item.product.price}
                    </Typography>
                  </Box>
                  <Typography
                    sx={{
                      fontSize: "0.8125rem",
                      fontWeight: 500,
                      flexShrink: 0,
                    }}
                  >
                    ₹{item.totalPrice?.toLocaleString()}
                  </Typography>
                </Stack>
              ))}
            </Stack>

            {/* Shipping address */}
            <Box
              sx={{
                p: 1.5,
                bgcolor: "#f9fafb",
                borderRadius: "10px",
                border: `0.5px solid ${BORDER}`,
                mb: 2,
              }}
            >
              <Stack direction="row" alignItems="flex-start" spacing={1}>
                <LocationOnOutlinedIcon
                  sx={{ fontSize: 15, color: P, mt: 0.25, flexShrink: 0 }}
                />
                <Box>
                  <Typography
                    sx={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: P,
                      mb: 0.25,
                    }}
                  >
                    Shipping to
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.75rem",
                      color: "#6b7280",
                      lineHeight: 1.6,
                    }}
                  >
                    {shippingAddress.street}
                    <br />
                    {shippingAddress.city}, {shippingAddress.state} –{" "}
                    {shippingAddress.zipCode}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <CheckoutDeliveryPanel
              cartItems={cartItems}
              pincode={shippingAddress.zipCode}
            />

            <Divider sx={{ borderColor: BORDER, my: 2 }} />

            <Stack spacing={1.25} sx={{ width: "100%" }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography sx={{ fontSize: "0.875rem", color: "#6b7280" }}>Subtotal</Typography>
                <Typography sx={{ fontSize: "0.9375rem", fontWeight: 500 }}>
                  ₹{subtotal.toFixed(2)}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" alignItems="center" spacing={0.75}>
                  <Typography sx={{ fontSize: "0.875rem", color: "#6b7280" }}>Shipping</Typography>
                  {shipping === 0 && (
                    <Chip
                      label="FREE"
                      size="small"
                      sx={{
                        height: 18,
                        bgcolor: "#f0fdf4",
                        color: "#16a34a",
                        border: "1px solid #86efac",
                        fontSize: "0.65rem",
                        fontWeight: 600,
                      }}
                    />
                  )}
                </Stack>
                <Typography sx={{ fontSize: "0.9375rem", fontWeight: 500 }}>
                  ₹{shipping.toFixed(2)}
                </Typography>
              </Stack>
              {tax > 0 && (
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography sx={{ fontSize: "0.875rem", color: "#6b7280" }}>Tax (18% GST)</Typography>
                  <Typography sx={{ fontSize: "0.9375rem", fontWeight: 500 }}>
                    ₹{tax.toFixed(2)}
                  </Typography>
                </Stack>
              )}
            </Stack>

            <Divider sx={{ borderColor: BORDER, my: 2 }} />

            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: "100%" }}>
              <Typography sx={{ fontSize: "1rem", fontWeight: 500 }}>Total to Pay</Typography>
              <Typography sx={{ fontSize: "1.25rem", fontWeight: 600, color: P }}>
                ₹{total.toFixed(2)}
              </Typography>
            </Stack>
          </Box>

          {/* Bottom trust row */}
          <Box
            sx={{
              borderTop: `0.5px solid ${BORDER}`,
              bgcolor: "#f9fafb",
              px: 2.5,
              py: 1.5,
            }}
          >
            <Stack
              direction="row"
              justifyContent="center"
              alignItems="center"
              spacing={1.5}
            >
              {["🔒 Encrypted", "🏦 PCI-DSS", "✅ Verified"].map((t, i) => (
                <Stack
                  key={t}
                  direction="row"
                  alignItems="center"
                  spacing={0.5}
                >
                  {i > 0 && (
                    <Box
                      sx={{
                        width: 3,
                        height: 3,
                        borderRadius: "50%",
                        bgcolor: "#d1d5db",
                        mr: 1,
                      }}
                    />
                  )}
                  <Typography sx={{ fontSize: "0.6875rem", color: "#9ca3af" }}>
                    {t}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};
