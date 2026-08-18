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
const P_LIGHT = "rgba(139,34,82,0.07)";
const BORDER = "rgba(0,0,0,0.08)";

const THUMB_COLORS = [
  ["#10b981", "#059669"], ["#3b82f6", "#1d4ed8"], ["#f59e0b", "#d97706"],
  ["#ef4444", "#dc2626"], ["#8b5cf6", "#7c3aed"], ["#ec4899", "#db2777"],
];

/* ── ProductThumb ──────────────────────────────────────────────────── */
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
        width: dim, height: dim, borderRadius: "10px", flexShrink: 0,
        background: !imgUrl ? `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` : undefined,
        fontSize: dim * 0.38, fontWeight: 700,
        border: `1px solid ${BORDER}`,
      }}
    >
      {!imgUrl ? letter : undefined}
    </Avatar>
  );
}

/* ── Free shipping bar ─────────────────────────────────────────────── */
const FREE_THRESHOLD = 999;

function FreeShippingBar({ subtotal }) {
  const remaining = Math.max(0, FREE_THRESHOLD - subtotal);
  const pct = Math.min(100, (subtotal / FREE_THRESHOLD) * 100);
  const achieved = remaining === 0;

  return (
    <Box sx={{ mb: 2.5 }}>
      <Typography sx={{ fontSize: "0.75rem", mb: 0.75, fontWeight: 500,
        color: achieved ? "#16a34a" : "#6b7280" }}>
        {achieved ? "🎉 You've unlocked free shipping!" : `₹${Math.ceil(remaining)} away from free shipping`}
      </Typography>
      <Box sx={{ height: 4, borderRadius: 99, bgcolor: "#f3ede9", overflow: "hidden" }}>
        <Box sx={{ height: "100%", width: `${pct}%`, borderRadius: 99,
          bgcolor: achieved ? "#16a34a" : P, transition: "width 0.5s ease" }} />
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
      <Box sx={{ display: "flex", gap: 2, py: 2.25, alignItems: "flex-start" }}>
        {/* Thumbnail */}
        <ProductThumb product={item.product} />

        {/* Content — name + controls */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Top row: name + total price */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1, mb: 0.5 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: "0.9rem", fontWeight: 600, lineHeight: 1.35, color: "#1c1917" }}>
                {item.product.name}
              </Typography>
              {isCustomItem(item) && (
                <Chip label="Handcrafted · 10–12 days" size="small"
                  sx={{ mt: 0.5, bgcolor: "#fff7ed", color: "#c2410c",
                    border: "1px solid #fed7aa", height: 18, fontSize: "0.68rem" }} />
              )}
            </Box>
            <Typography sx={{ fontSize: "0.9375rem", fontWeight: 600, color: "#1c1917",
              flexShrink: 0, lineHeight: 1.35 }}>
              ₹{item.totalPrice?.toLocaleString()}
            </Typography>
          </Box>

          {/* Unit price */}
          <Typography sx={{ fontSize: "0.775rem", color: "#9ca3af", mb: lowStock ? 0.25 : 0 }}>
            ₹{item.product.price} per unit
          </Typography>
          {lowStock && (
            <Typography sx={{ fontSize: "0.75rem", color: "#d97706", fontWeight: 500, mb: 0.5 }}>
              Only {item.product.stock} left
            </Typography>
          )}

          {/* Bottom row: stepper + remove */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 1.25 }}>
            {/* Pill stepper */}
            <Stack direction="row" alignItems="stretch" sx={{
              border: `1.5px solid ${P}`, borderRadius: "20px", overflow: "hidden", height: 30,
            }}>
              <IconButton size="small"
                onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                disabled={item.quantity <= 1}
                sx={{ width: 30, height: "100%", borderRadius: 0, color: P,
                  "&:hover": { bgcolor: P_LIGHT }, "&.Mui-disabled": { color: "#d1d5db" } }}>
                <RemoveIcon sx={{ fontSize: 12 }} />
              </IconButton>
              <Typography sx={{
                minWidth: 30, textAlign: "center", fontSize: "0.8125rem", fontWeight: 600,
                color: "#1c1917", display: "flex", alignItems: "center", justifyContent: "center",
                borderLeft: `1px solid rgba(139,34,82,0.15)`, borderRight: `1px solid rgba(139,34,82,0.15)`,
              }}>
                {item.quantity}
              </Typography>
              <IconButton size="small"
                onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                disabled={atMax}
                sx={{ width: 30, height: "100%", borderRadius: 0, color: P,
                  "&:hover": { bgcolor: P_LIGHT }, "&.Mui-disabled": { color: "#d1d5db" } }}>
                <AddIcon sx={{ fontSize: 12 }} />
              </IconButton>
            </Stack>

            {/* Remove */}
            <Button variant="text" size="small"
              startIcon={<DeleteOutlineIcon sx={{ fontSize: "14px !important" }} />}
              onClick={() => handleRemoveItem(item.product._id)}
              sx={{ fontSize: "0.75rem", color: "#9ca3af", p: "2px 8px", borderRadius: "8px",
                textTransform: "none", fontWeight: 400,
                "&:hover": { color: "#ef4444", bgcolor: "#fef2f2" } }}>
              Remove
            </Button>
          </Box>
        </Box>
      </Box>
      {!isLast && <Divider sx={{ borderColor: BORDER }} />}
    </>
  );
}

/* ── Cross-sell strip ──────────────────────────────────────────────── */
function CrossSellSection({ cartItems, navigate }) {
  const [recs, setRecs] = useState([]);

  useEffect(() => {
    const id = cartItems[0]?.product?._id;
    if (!id) return;
    api.get(`/api/products/${id}/recommendations`)
      .then((res) => setRecs((res.data?.recommendations || res.data?.products || []).slice(0, 3)))
      .catch(() => {});
  }, [cartItems]);

  if (!recs.length) return null;

  return (
    <Paper elevation={0} sx={{
      border: `0.5px solid ${BORDER}`, borderRadius: "12px", mt: 2, overflow: "hidden", bgcolor: "#fff",
    }}>
      <Box sx={{ px: 2.5, py: 1.75, borderBottom: `0.5px solid ${BORDER}` }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <LocalOfferOutlinedIcon sx={{ fontSize: 15, color: P }} />
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
                <Box onClick={() => navigate(`/product/${slug}`)} sx={{
                  p: 1.5, border: `0.5px solid ${BORDER}`, borderRadius: "10px",
                  cursor: "pointer", display: "flex", gap: 1.25, alignItems: "center",
                  bgcolor: "#fff", "&:hover": { borderColor: P, bgcolor: P_LIGHT },
                  transition: "all 0.15s ease",
                }}>
                  {img && (
                    <Box component="img" src={img} alt={product.name}
                      sx={{ width: 40, height: 40, borderRadius: "8px", objectFit: "cover", flexShrink: 0 }} />
                  )}
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: "0.75rem", fontWeight: 500 }} noWrap>{product.name}</Typography>
                    <Typography sx={{ fontSize: "0.75rem", color: P, fontWeight: 600 }}>₹{product.price}</Typography>
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

/* ── Summary price row ─────────────────────────────────────────────── */
function PriceRow({ label, value, labelSx = {}, valueSx = {} }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
      <Typography sx={{ fontSize: "0.875rem", color: "#6b7280", ...labelSx }}>{label}</Typography>
      <Typography sx={{ fontSize: "0.9375rem", fontWeight: 500, ...valueSx }}>{value}</Typography>
    </Box>
  );
}

/* ── Trust badges ──────────────────────────────────────────────────── */
const TRUST = [
  { Icon: VerifiedUserOutlinedIcon, label: "Secure Checkout" },
  { Icon: LocalShippingOutlinedIcon, label: "Fast Delivery" },
  { Icon: ReplayOutlinedIcon, label: "Easy Returns" },
];

/* ══════════════════════════════════════════════════════════════════════
   MAIN — CartReviewStep
   ══════════════════════════════════════════════════════════════════════ */
export const CartReviewStep = ({
  cartItems, subtotal, total, error,
  proceedToCheckout, navigate,
  handleQuantityChange, handleRemoveItem,
  onCouponApplied, onRemoveCoupon, appliedCoupon,
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
        <Paper elevation={0} sx={{
          border: `0.5px solid ${BORDER}`, borderRadius: "14px", bgcolor: "#fff", overflow: "hidden",
        }}>
          {/* Header */}
          <Box sx={{ px: 2.5, py: 2, borderBottom: `0.5px solid ${BORDER}`,
            display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography sx={{ fontSize: "1rem", fontWeight: 600, flex: 1, color: "#1c1917" }}>
              Your Cart
            </Typography>
            <Box sx={{ px: 1.25, py: 0.35, bgcolor: P, borderRadius: "20px",
              display: "inline-flex", alignItems: "center" }}>
              <Typography sx={{ fontSize: "0.6875rem", fontWeight: 600, color: "#fff" }}>
                {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
              </Typography>
            </Box>
          </Box>

          {/* Handcrafted warning */}
          {cartItems.some(isCustomItem) && (
            <Box sx={{ px: 2.5, pt: 2 }}>
              <Alert severity="warning" sx={{ borderRadius: "10px", "& .MuiAlert-icon": { alignItems: "center" } }}>
                <Typography sx={{ fontSize: "0.8125rem" }}>
                  <strong>Handcrafted Items:</strong> Made-to-order items take{" "}
                  <strong>10–12 business days</strong> to prepare before dispatch.
                </Typography>
              </Alert>
            </Box>
          )}

          {/* Items */}
          <Box sx={{ px: 2.5 }}>
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

          {/* Footer */}
          <Box sx={{ px: 2.5, py: 1.5, borderTop: `0.5px solid ${BORDER}`, bgcolor: "#fafaf9" }}>
            <Button variant="text" size="small"
              startIcon={<ArrowBackIcon sx={{ fontSize: "13px !important" }} />}
              onClick={() => navigate("/products")}
              sx={{ fontSize: "0.75rem", color: "#9ca3af", fontWeight: 400, p: 0,
                textTransform: "none", "&:hover": { color: P, bgcolor: "transparent" } }}>
              Continue Shopping
            </Button>
          </Box>
        </Paper>

        <CrossSellSection cartItems={cartItems} navigate={navigate} />
      </Grid>

      {/* ── Right: order summary ─────────────────────────────────────── */}
      <Grid item xs={12} md={5}>
        <Paper elevation={0} sx={{
          border: `0.5px solid ${BORDER}`, borderRadius: "14px", bgcolor: "#fff",
          position: { md: "sticky" }, top: { md: "24px" }, overflow: "hidden",
        }}>
          {/* Header */}
          <Box sx={{ px: 2.5, pt: 2.25, pb: 2, borderBottom: `0.5px solid ${BORDER}` }}>
            <Typography sx={{ fontSize: "1rem", fontWeight: 600, color: "#1c1917" }}>
              Order Summary
            </Typography>
            <Typography sx={{ fontSize: "0.75rem", color: "#9ca3af", mt: 0.25 }}>
              Review your items before checkout
            </Typography>
          </Box>

          <Box sx={{ px: 2.5, pt: 2.25, pb: 2.5 }}>

            {/* Free shipping bar */}
            <FreeShippingBar subtotal={subtotal} />

            {/* Mini item list */}
            <Stack spacing={1.5} sx={{ mb: 2.25 }}>
              {cartItems.map((item) => (
                <Box key={item.product._id}
                  sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                  <ProductThumb product={item.product} size="xs" />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: "0.8125rem", fontWeight: 500, color: "#1c1917" }} noWrap>
                      {item.product.name}
                    </Typography>
                    <Typography sx={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                      Qty {item.quantity} × ₹{item.product.price}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, color: "#1c1917", flexShrink: 0 }}>
                    ₹{item.totalPrice?.toLocaleString()}
                  </Typography>
                </Box>
              ))}
            </Stack>

            <Divider sx={{ borderColor: BORDER, mb: 2.25 }} />

            {/* Price breakdown */}
            <Stack spacing={1.5} sx={{ mb: 2.25 }}>
              <PriceRow label="Subtotal" value={`₹${subtotal.toFixed(2)}`} />
              {discount > 0 && (
                <PriceRow
                  label={`Coupon (${appliedCoupon.code})`}
                  value={`−₹${discount.toFixed(2)}`}
                  labelSx={{ color: "#16a34a" }}
                  valueSx={{ color: "#16a34a" }}
                />
              )}
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                <Typography sx={{ fontSize: "0.875rem", color: "#6b7280" }}>Shipping</Typography>
                <Typography sx={{ fontSize: "0.775rem", color: "#9ca3af", fontStyle: "italic" }}>
                  Calculated next
                </Typography>
              </Box>
            </Stack>

            <Divider sx={{ borderColor: BORDER, mb: 2.25 }} />

            {/* Total */}
            <Box sx={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              mb: 2.5, px: 0,
            }}>
              <Typography sx={{ fontSize: "1rem", fontWeight: 600, color: "#1c1917" }}>Total</Typography>
              <Typography sx={{ fontSize: "1.3125rem", fontWeight: 700, color: P }}>
                ₹{discountedTotal.toFixed(2)}
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2.25, borderRadius: "10px" }}>
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

            {/* CTAs */}
            <Stack spacing={1.25} sx={{ mt: 2.5 }}>
              <Button variant="contained" size="large" fullWidth
                endIcon={<ArrowForwardIcon sx={{ fontSize: "17px !important" }} />}
                onClick={proceedToCheckout}
                disabled={cartItems.length === 0}
                sx={{
                  height: 50, fontSize: "0.9375rem", fontWeight: 600, borderRadius: "12px",
                  bgcolor: P, textTransform: "none",
                  boxShadow: "0 2px 14px rgba(139,34,82,0.26)",
                  "&:hover": { bgcolor: "#7a1d47", boxShadow: "0 4px 20px rgba(139,34,82,0.34)" },
                  "&.Mui-disabled": { bgcolor: "#d1d5db", color: "#fff", boxShadow: "none" },
                }}>
                Proceed to Checkout
              </Button>
            </Stack>
          </Box>

          {/* Trust row */}
          <Box sx={{
            borderTop: `0.5px solid ${BORDER}`, px: 2.5, py: 1.75, bgcolor: "#fafaf9",
            display: "flex", justifyContent: "center", alignItems: "center", gap: 2,
          }}>
            {TRUST.map(({ Icon, label }, i) => (
              <Stack key={label} direction="row" alignItems="center" spacing={0.5}
                sx={{ "&:not(:last-child)::after": {
                  content: '""', display: "block", width: 3, height: 3,
                  borderRadius: "50%", bgcolor: "#d1d5db", ml: 2,
                }}}>
                <Icon sx={{ fontSize: 13, color: "#9ca3af" }} />
                <Typography sx={{ fontSize: "0.6875rem", color: "#9ca3af", whiteSpace: "nowrap" }}>
                  {label}
                </Typography>
              </Stack>
            ))}
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};
