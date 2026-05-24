import { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  IconButton,
  Stack,
  Divider,
  Avatar,
  Chip,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteOutlineIcon from "@mui/icons-material/DeleteForeverOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";
import CouponInput from "../../components/CouponInput";
import { isCustomItem } from "../../components/CheckoutDeliveryPanel";
import api from "../../api/axios";

const P = "#8b2252";
const P_LIGHT = "rgba(139,34,82,0.08)";
const BORDER = "rgba(0,0,0,0.09)";

const THUMB_COLORS = [
  ["#10b981", "#059669"], ["#3b82f6", "#1d4ed8"], ["#f59e0b", "#d97706"],
  ["#ef4444", "#dc2626"], ["#8b5cf6", "#7c3aed"], ["#ec4899", "#db2777"],
];

/* ── ProductThumb (exported for use in other steps) ─────────────────── */
export function ProductThumb({ product, size = "md" }) {
  const imgUrl = product?.images?.[0]?.url || product?.image?.url || product?.image;
  const letter = (product?.name || "?").charAt(0).toUpperCase();
  const colors = THUMB_COLORS[letter.charCodeAt(0) % THUMB_COLORS.length];
  const dim = size === "xs" ? 36 : size === "sm" ? 44 : 56;

  return (
    <Avatar
      src={imgUrl || undefined}
      alt={product?.name || ""}
      variant="rounded"
      sx={{
        width: dim,
        height: dim,
        borderRadius: "8px",
        background: !imgUrl ? `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` : undefined,
        fontSize: dim * 0.38,
        fontWeight: 700,
        flexShrink: 0,
        border: `1px solid ${BORDER}`,
      }}
    >
      {!imgUrl ? letter : undefined}
    </Avatar>
  );
}

/* ── Free shipping progress bar ─────────────────────────────────────── */
const FREE_THRESHOLD = 999;

function FreeShippingBar({ subtotal }) {
  const remaining = Math.max(0, FREE_THRESHOLD - subtotal);
  const pct = Math.min(100, (subtotal / FREE_THRESHOLD) * 100);
  const achieved = remaining === 0;

  return (
    <Box sx={{ mb: 2.5 }}>
      <Typography
        sx={{ fontSize: "0.75rem", mb: 0.75, color: achieved ? "#16a34a" : "#6b7280", fontWeight: 500 }}
      >
        {achieved
          ? "🎉 You've unlocked free shipping!"
          : `₹${Math.ceil(remaining)} away from free shipping`}
      </Typography>
      <Box sx={{ height: 4, borderRadius: 4, bgcolor: "#f0e8e2", overflow: "hidden" }}>
        <Box
          sx={{
            height: "100%",
            width: `${pct}%`,
            borderRadius: 4,
            bgcolor: achieved ? "#16a34a" : P,
            transition: "width 0.5s ease",
          }}
        />
      </Box>
    </Box>
  );
}

/* ── Cart item row ─────────────────────────────────────────────────── */
function CartItemRow({ item, handleQuantityChange, handleRemoveItem, isLast }) {
  const atMax = item.product.trackInventory !== false && item.quantity >= item.product.stock;
  const lowStock =
    item.product.trackInventory !== false &&
    item.product.stock <= (item.product.lowStockThreshold || 5) &&
    item.product.stock > 0;

  return (
    <>
      <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", py: 2 }}>
        <ProductThumb product={item.product} />

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: "0.875rem", fontWeight: 500, mb: 0.25, lineHeight: 1.4 }}>
            {item.product.name}
          </Typography>
          {isCustomItem(item) && (
            <Chip
              label="Handcrafted · 10–12 days"
              size="small"
              sx={{ bgcolor: "#fff7ed", color: "#c2410c", border: "1px solid #fed7aa", mb: 0.5, height: 18, fontSize: "0.68rem" }}
            />
          )}
          <Typography sx={{ fontSize: "0.75rem", color: "#9ca3af" }}>
            ₹{item.product.price} per unit
          </Typography>
          {lowStock && (
            <Typography sx={{ fontSize: "0.72rem", color: "#d97706", fontWeight: 500, mt: 0.25 }}>
              Only {item.product.stock} left
            </Typography>
          )}
        </Box>

        <Stack alignItems="flex-end" spacing={1} sx={{ flexShrink: 0 }}>
          <Typography sx={{ fontSize: "0.9375rem", fontWeight: 500, color: "#1c1917" }}>
            ₹{item.totalPrice?.toLocaleString()}
          </Typography>

          {/* Pill stepper */}
          <Stack
            direction="row"
            alignItems="center"
            sx={{
              border: `1.5px solid ${P}`,
              borderRadius: "20px",
              overflow: "hidden",
              height: 32,
            }}
          >
            <IconButton
              size="small"
              onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              sx={{
                width: 28,
                height: 28,
                borderRadius: 0,
                color: P,
                "&:hover": { bgcolor: P_LIGHT },
                "&.Mui-disabled": { color: "#d1d5db" },
              }}
            >
              <RemoveIcon sx={{ fontSize: 13 }} />
            </IconButton>
            <Typography
              sx={{ minWidth: 28, textAlign: "center", fontSize: "0.8125rem", fontWeight: 600, color: "#1c1917" }}
            >
              {item.quantity}
            </Typography>
            <IconButton
              size="small"
              onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
              disabled={atMax}
              sx={{
                width: 28,
                height: 28,
                borderRadius: 0,
                color: P,
                "&:hover": { bgcolor: P_LIGHT },
                "&.Mui-disabled": { color: "#d1d5db" },
              }}
            >
              <AddIcon sx={{ fontSize: 13 }} />
            </IconButton>
          </Stack>

          <IconButton
            size="small"
            onClick={() => handleRemoveItem(item.product._id)}
            sx={{
              width: 28,
              height: 28,
              color: "#9ca3af",
              "&:hover": { color: "#ef4444", bgcolor: "#fef2f2" },
              borderRadius: "6px",
            }}
          >
            <DeleteOutlineIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Stack>
      </Box>
      {!isLast && <Divider sx={{ borderColor: BORDER }} />}
    </>
  );
}

/* ── Cross-sell strip ───────────────────────────────────────────────── */
function CrossSellSection({ cartItems, navigate }) {
  const [recs, setRecs] = useState([]);

  useEffect(() => {
    const id = cartItems[0]?.product?._id;
    if (!id) return;
    api
      .get(`/api/products/${id}/recommendations`)
      .then((res) => setRecs((res.data?.recommendations || res.data?.products || []).slice(0, 3)))
      .catch(() => {});
  }, [cartItems]);

  if (!recs.length) return null;

  return (
    <Paper
      elevation={0}
      sx={{
        border: `0.5px solid ${BORDER}`,
        borderRadius: "12px",
        mt: 2,
        overflow: "hidden",
        bgcolor: "#fff",
      }}
    >
      <Box sx={{ px: 2.5, py: 1.75, borderBottom: `0.5px solid ${BORDER}` }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <LocalOfferOutlinedIcon sx={{ fontSize: 16, color: P }} />
          <Typography sx={{ fontSize: "0.875rem", fontWeight: 500 }}>You might also like</Typography>
        </Stack>
      </Box>
      <Box sx={{ p: 2 }}>
        <Grid container spacing={1.5}>
          {recs.map((product) => {
            const img = product.images?.[0]?.url || product.image?.url || product.image;
            const slug = product.slug || product._id;
            return (
              <Grid item xs={12} sm={4} key={product._id}>
                <Box
                  onClick={() => navigate(`/product/${slug}`)}
                  sx={{
                    p: 1.5,
                    border: `0.5px solid ${BORDER}`,
                    borderRadius: "10px",
                    cursor: "pointer",
                    display: "flex",
                    gap: 1.25,
                    alignItems: "center",
                    bgcolor: "#fff",
                    "&:hover": { borderColor: P, bgcolor: P_LIGHT },
                    transition: "all 0.15s ease",
                  }}
                >
                  {img && (
                    <Box
                      component="img"
                      src={img}
                      alt={product.name}
                      sx={{ width: 40, height: 40, borderRadius: "8px", objectFit: "cover", flexShrink: 0 }}
                    />
                  )}
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: "0.75rem", fontWeight: 500 }} noWrap>
                      {product.name}
                    </Typography>
                    <Typography sx={{ fontSize: "0.75rem", color: P, fontWeight: 600 }}>
                      ₹{product.price}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Paper>
  );
}

/* ── Trust row ──────────────────────────────────────────────────────── */
const TRUST = [
  { Icon: VerifiedUserOutlinedIcon, label: "Secure Checkout" },
  { Icon: LocalShippingOutlinedIcon, label: "Fast Delivery" },
  { Icon: ReplayOutlinedIcon, label: "Easy Returns" },
];

/* ══════════════════════════════════════════════════════════════════════
   MAIN — CartReviewStep
   ══════════════════════════════════════════════════════════════════════ */
export const CartReviewStep = ({
  cartItems,
  subtotal,
  total,
  error,
  proceedToCheckout,
  navigate,
  handleQuantityChange,
  handleRemoveItem,
  onCouponApplied,
  onRemoveCoupon,
  appliedCoupon,
}) => {
  const discount = appliedCoupon
    ? appliedCoupon.discountType === "percent"
      ? (subtotal * appliedCoupon.discountValue) / 100
      : appliedCoupon.discountValue
    : 0;
  const discountedTotal = Math.max(0, total - discount);

  return (
    <Grid container spacing={3} alignItems="flex-start">
      {/* ── Left: cart items ─────────────────────────────────────────── */}
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
          {/* Header */}
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
            <Typography sx={{ fontSize: "1rem", fontWeight: 500, flex: 1 }}>Your Cart</Typography>
            <Box
              sx={{
                px: 1.25,
                py: 0.25,
                bgcolor: P,
                borderRadius: "20px",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              <Typography sx={{ fontSize: "0.6875rem", fontWeight: 500, color: "#fff" }}>
                {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
              </Typography>
            </Box>
          </Box>

          {/* Item list */}
          <Box sx={{ px: 2.5 }}>
            {cartItems.some(isCustomItem) && (
              <Alert
                severity="warning"
                sx={{ mt: 2, borderRadius: "10px", "& .MuiAlert-icon": { alignItems: "center" } }}
              >
                <Typography sx={{ fontSize: "0.875rem" }}>
                  <strong>Handcrafted Items:</strong> Your order includes made-to-order items that take{" "}
                  <strong>10–12 business days</strong> to prepare before dispatch.
                </Typography>
              </Alert>
            )}

            {cartItems.map((item, idx) => (
              <CartItemRow
                key={item.product._id}
                item={item}
                handleQuantityChange={handleQuantityChange}
                handleRemoveItem={handleRemoveItem}
                isLast={idx === cartItems.length - 1}
              />
            ))}
          </Box>

          {/* Continue shopping link */}
          <Box sx={{ px: 2.5, py: 1.75, borderTop: `0.5px solid ${BORDER}` }}>
            <Button
              variant="text"
              size="small"
              startIcon={<ArrowBackIcon sx={{ fontSize: "14px !important" }} />}
              onClick={() => navigate("/products")}
              sx={{ fontSize: "0.75rem", color: "#9ca3af", fontWeight: 400, p: 0, "&:hover": { color: P, bgcolor: "transparent" } }}
            >
              Continue Shopping
            </Button>
          </Box>
        </Paper>

        <CrossSellSection cartItems={cartItems} navigate={navigate} />
      </Grid>

      {/* ── Right: order summary ─────────────────────────────────────── */}
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
          {/* Heading */}
          <Box sx={{ px: 2.5, pt: 2.5, pb: 2, borderBottom: `0.5px solid ${BORDER}` }}>
            <Typography sx={{ fontSize: "1rem", fontWeight: 500, mb: 0.25 }}>Order Summary</Typography>
            <Typography sx={{ fontSize: "0.75rem", color: "#9ca3af" }}>
              Review your items before checkout
            </Typography>
          </Box>

          <Box sx={{ px: 2.5, pt: 2, pb: 2.5 }}>
            <FreeShippingBar subtotal={subtotal} />

            {/* Item list */}
            <Stack spacing={1.5} sx={{ mb: 2 }}>
              {cartItems.map((item) => (
                <Stack key={item.product._id} direction="row" alignItems="center" spacing={1.25}>
                  <ProductThumb product={item.product} size="xs" />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: "0.8125rem", fontWeight: 500 }} noWrap>
                      {item.product.name}
                    </Typography>
                    <Typography sx={{ fontSize: "0.75rem", color: "#9ca3af", display: "block" }}>
                      Qty {item.quantity} × ₹{item.product.price}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: "0.8125rem", fontWeight: 500, color: "#1c1917", flexShrink: 0 }}>
                    ₹{item.totalPrice?.toLocaleString()}
                  </Typography>
                </Stack>
              ))}
            </Stack>

            <Divider sx={{ borderColor: BORDER, mb: 2 }} />

            {/* Price breakdown */}
            <Stack spacing={1.25} sx={{ mb: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: "100%" }}>
                <Typography sx={{ fontSize: "0.875rem", color: "#6b7280" }}>Subtotal</Typography>
                <Typography sx={{ fontSize: "0.9375rem", fontWeight: 500 }}>
                  ₹{subtotal.toFixed(2)}
                </Typography>
              </Stack>
              {discount > 0 && (
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: "100%" }}>
                  <Typography sx={{ fontSize: "0.875rem", color: "#16a34a" }}>
                    Coupon ({appliedCoupon.code})
                  </Typography>
                  <Typography sx={{ fontSize: "0.9375rem", fontWeight: 500, color: "#16a34a" }}>
                    −₹{discount.toFixed(2)}
                  </Typography>
                </Stack>
              )}
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: "100%" }}>
                <Typography sx={{ fontSize: "0.875rem", color: "#6b7280" }}>Shipping</Typography>
                <Typography sx={{ fontSize: "0.75rem", color: "#9ca3af", fontStyle: "italic" }}>
                  Calculated next
                </Typography>
              </Stack>
            </Stack>

            <Divider sx={{ borderColor: BORDER, mb: 2 }} />

            {/* Total */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
              <Typography sx={{ fontSize: "1rem", fontWeight: 500 }}>Total</Typography>
              <Typography sx={{ fontSize: "1.25rem", fontWeight: 600, color: P }}>
                ₹{discountedTotal.toFixed(2)}
              </Typography>
            </Stack>

            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: "10px" }}>
                {error}
              </Alert>
            )}

            {/* Coupon */}
            <CouponInput
              cartTotal={subtotal}
              onCouponApplied={onCouponApplied}
              appliedCoupon={appliedCoupon}
              onRemoveCoupon={onRemoveCoupon}
            />

            <Stack spacing={1.25} sx={{ mt: 2.5 }}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                endIcon={<ArrowForwardIcon sx={{ fontSize: "18px !important" }} />}
                onClick={proceedToCheckout}
                disabled={cartItems.length === 0}
                sx={{
                  height: 48,
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  borderRadius: "10px",
                  bgcolor: P,
                  boxShadow: "0 2px 12px rgba(139,34,82,0.28)",
                  "&:hover": { bgcolor: "#7a1d47", boxShadow: "0 4px 16px rgba(139,34,82,0.36)" },
                  textTransform: "none",
                }}
              >
                Proceed to Checkout
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate("/products")}
                sx={{
                  height: 40,
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  borderRadius: "10px",
                  borderColor: P,
                  color: P,
                  textTransform: "none",
                  "&:hover": { bgcolor: P_LIGHT, borderColor: P },
                }}
              >
                Continue Shopping
              </Button>
            </Stack>
          </Box>

          {/* Trust row */}
          <Box sx={{ borderTop: `0.5px solid ${BORDER}`, px: 2.5, py: 1.75, bgcolor: "#fafaf9" }}>
            <Stack direction="row" justifyContent="center" alignItems="center" spacing={1.5}>
              {TRUST.map(({ Icon, label }, i) => (
                <Stack key={label} direction="row" alignItems="center" spacing={0.5}>
                  {i > 0 && (
                    <Box
                      sx={{ width: 3, height: 3, borderRadius: "50%", bgcolor: "#d1d5db", mr: 1 }}
                    />
                  )}
                  <Icon sx={{ fontSize: 14, color: "#9ca3af" }} />
                  <Typography sx={{ fontSize: "0.6875rem", color: "#9ca3af" }}>{label}</Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};
