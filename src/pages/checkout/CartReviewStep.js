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
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";
import CouponInput from "../../components/CouponInput";
import { isCustomItem } from "../../components/CheckoutDeliveryPanel";
import api from "../../api/axios";

const THUMB_COLORS = [
  ["#10b981", "#059669"], ["#3b82f6", "#1d4ed8"], ["#f59e0b", "#d97706"],
  ["#ef4444", "#dc2626"], ["#8b5cf6", "#8B1A4A"], ["#ec4899", "#db2777"],
];

export function ProductThumb({ product, size = "md" }) {
  const imgUrl = product?.images?.[0]?.url || product?.image?.url || product?.image;
  const letter = (product?.name || "?").charAt(0).toUpperCase();
  const colors = THUMB_COLORS[letter.charCodeAt(0) % THUMB_COLORS.length];
  const dim = size === "xs" ? 36 : size === "sm" ? 48 : 68;

  return (
    <Avatar
      src={imgUrl || undefined}
      alt={product?.name || ""}
      variant="rounded"
      sx={{
        width: dim,
        height: dim,
        borderRadius: 2,
        background: !imgUrl ? `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` : undefined,
        fontSize: dim * 0.38,
        fontWeight: 700,
        flexShrink: 0,
        border: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      {!imgUrl ? letter : undefined}
    </Avatar>
  );
}

/* ── Card header shared pattern ──────────────────────────────────────── */
function CardHeader({ icon: Icon, title, subtitle, right }) {
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
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.2 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
      {right}
    </Box>
  );
}

/* ── Free shipping progress bar ─────────────────────────────────────── */
const FREE_THRESHOLD = 999;

function FreeShippingBar({ subtotal }) {
  const remaining = Math.max(0, FREE_THRESHOLD - subtotal);
  const pct = Math.min(100, (subtotal / FREE_THRESHOLD) * 100);
  const achieved = remaining === 0;

  return (
    <Box
      sx={{
        p: 1.75,
        borderRadius: 2,
        bgcolor: achieved ? "#f0fdf4" : "#fdf8f5",
        border: "1px solid",
        borderColor: achieved ? "#86efac" : "#f0e4d8",
        mb: 2.5,
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="caption" fontWeight={700} color={achieved ? "success.main" : "#8B1A4A"}>
          {achieved ? "🎉 Free shipping unlocked!" : `₹${Math.ceil(remaining)} away from free shipping`}
        </Typography>
        <Typography variant="caption" fontWeight={600} color="text.secondary">
          {Math.round(pct)}%
        </Typography>
      </Stack>
      <Box sx={{ height: 7, borderRadius: 4, bgcolor: achieved ? "#bbf7d0" : "#e7e5e4", overflow: "hidden" }}>
        <Box
          sx={{
            height: "100%",
            width: `${pct}%`,
            borderRadius: 4,
            background: achieved
              ? "linear-gradient(90deg, #10b981, #059669)"
              : "linear-gradient(90deg, #8B1A4A, #C9A84C)",
            transition: "width 0.4s ease",
          }}
        />
      </Box>
    </Box>
  );
}

/* ── Cross-sell strip ───────────────────────────────────────────────── */
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
    <Paper
      elevation={0}
      sx={{ border: "1px solid #f0e8e2", borderRadius: 3, mt: 2.5, overflow: "hidden" }}
    >
      <Box sx={{ px: 2.5, py: 2, borderBottom: "1px solid #f0e8e2", bgcolor: "#fdf8f5" }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <LocalOfferOutlinedIcon sx={{ fontSize: 18, color: "#8B1A4A" }} />
          <Typography variant="subtitle2" fontWeight={700}>Complete the set</Typography>
        </Stack>
      </Box>
      <Box sx={{ p: 2 }}>
        <Grid container spacing={1.5}>
          {recs.map((product) => {
            const img = product.images?.[0]?.url || product.image?.url || product.image;
            const slug = product.slug || product._id;
            return (
              <Grid item xs={12} sm={4} key={product._id}>
                <Paper
                  elevation={0}
                  onClick={() => navigate(`/product/${slug}`)}
                  sx={{
                    p: 1.5,
                    border: "1px solid #e7e5e4",
                    borderRadius: 2,
                    cursor: "pointer",
                    display: "flex",
                    gap: 1.25,
                    alignItems: "center",
                    "&:hover": { borderColor: "#8B1A4A", bgcolor: "#fdf2f6" },
                    transition: "all 0.15s ease",
                  }}
                >
                  {img && (
                    <Box
                      component="img"
                      src={img}
                      alt={product.name}
                      sx={{ width: 44, height: 44, borderRadius: 1.5, objectFit: "cover", flexShrink: 0 }}
                    />
                  )}
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="caption" fontWeight={600} display="block" noWrap>
                      {product.name}
                    </Typography>
                    <Typography variant="caption" color="primary" fontWeight={700}>
                      ₹{product.price}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Paper>
  );
}

/* ── Cart item row ─────────────────────────────────────────────────── */
function CartItemRow({ item, handleQuantityChange, handleRemoveItem }) {
  const atMax = item.product.trackInventory !== false && item.quantity >= item.product.stock;
  const lowStock = item.product.trackInventory !== false
    && item.product.stock <= (item.product.lowStockThreshold || 5)
    && item.product.stock > 0;

  return (
    <Box
      sx={{
        p: 2,
        border: "1px solid #f0e8e2",
        borderRadius: 2.5,
        display: "flex",
        gap: 2,
        alignItems: "flex-start",
        bgcolor: "#fff",
        transition: "box-shadow 0.15s",
        "&:hover": { boxShadow: "0 2px 12px rgba(139,26,74,0.08)" },
      }}
    >
      <ProductThumb product={item.product} />

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={700} sx={{ mb: 0.25 }}>
          {item.product.name}
        </Typography>
        {isCustomItem(item) && (
          <Chip
            label="Handcrafted · 10–12 days"
            size="small"
            sx={{ bgcolor: "#fff7ed", color: "#c2410c", border: "1px solid #fed7aa", mb: 0.5, height: 20, fontSize: "0.68rem" }}
          />
        )}
        {item.product.description && (
          <Typography variant="caption" color="text.secondary" display="block" sx={{ lineHeight: 1.4 }}>
            {item.product.description.slice(0, 72)}{item.product.description.length > 72 ? "…" : ""}
          </Typography>
        )}
        <Typography variant="caption" sx={{ color: "#8B1A4A", fontWeight: 600 }}>
          ₹{item.product.price} each
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1.25, flexShrink: 0 }}>
        <Typography variant="subtitle2" fontWeight={800} sx={{ color: "#1c1917" }}>
          ₹{item.totalPrice?.toLocaleString()}
        </Typography>

        {/* Pill quantity stepper */}
        <Stack
          direction="row"
          alignItems="center"
          sx={{
            border: "1px solid #e7e5e4",
            borderRadius: 20,
            overflow: "hidden",
            bgcolor: "#fafaf9",
          }}
        >
          <IconButton
            size="small"
            onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
            disabled={item.quantity <= 1}
            sx={{ borderRadius: 0, p: 0.5, "&:hover": { bgcolor: "#f5f5f4" } }}
          >
            <RemoveIcon sx={{ fontSize: 14 }} />
          </IconButton>
          <Typography variant="body2" fontWeight={700} sx={{ minWidth: 28, textAlign: "center", fontSize: "0.85rem" }}>
            {item.quantity}
          </Typography>
          <IconButton
            size="small"
            onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
            disabled={atMax}
            sx={{ borderRadius: 0, p: 0.5, "&:hover": { bgcolor: "#f5f5f4" } }}
          >
            <AddIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Stack>

        <IconButton
          size="small"
          onClick={() => handleRemoveItem(item.product._id)}
          sx={{
            color: "#ef4444",
            p: 0.5,
            "&:hover": { bgcolor: "#fef2f2" },
            borderRadius: 1.5,
          }}
        >
          <DeleteOutlineIcon sx={{ fontSize: 17 }} />
        </IconButton>

        {lowStock && (
          <Typography variant="caption" sx={{ color: "#d97706", fontWeight: 600 }}>
            Only {item.product.stock} left
          </Typography>
        )}
      </Box>
    </Box>
  );
}

/* ── Trust badges ─────────────────────────────────────────────────── */
const TRUST = [
  { Icon: VerifiedUserOutlinedIcon, label: "Secure Checkout" },
  { Icon: LocalShippingOutlinedIcon, label: "Fast Delivery" },
  { Icon: ReplayOutlinedIcon, label: "Easy Returns" },
];

/* ── CartReviewStep ─────────────────────────────────────────────────── */
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
    <Grid container spacing={3}>
      {/* Main: cart items */}
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
            icon={ShoppingBagOutlinedIcon}
            title="Your Cart"
            subtitle={`${cartItems.length} ${cartItems.length === 1 ? "item" : "items"} ready to order`}
            right={
              <Chip
                label={`${cartItems.length} items`}
                size="small"
                sx={{ bgcolor: "rgba(139,26,74,0.1)", color: "#8B1A4A", fontWeight: 700 }}
              />
            }
          />

          <Box sx={{ p: 2.5 }}>
            {cartItems.some(isCustomItem) && (
              <Alert
                severity="warning"
                sx={{ mb: 2.5, borderRadius: 2, "& .MuiAlert-icon": { alignItems: "center" } }}
              >
                <Typography variant="body2">
                  <strong>Handcrafted Items Notice:</strong> Your order contains made-to-order items that require{" "}
                  <strong>10–12 business days</strong> of preparation before dispatch.
                </Typography>
              </Alert>
            )}

            <Stack spacing={1.5}>
              {cartItems.map((item) => (
                <CartItemRow
                  key={item.product._id}
                  item={item}
                  handleQuantityChange={handleQuantityChange}
                  handleRemoveItem={handleRemoveItem}
                />
              ))}
            </Stack>
          </Box>
        </Paper>

        <CrossSellSection cartItems={cartItems} navigate={navigate} />
      </Grid>

      {/* Sidebar: order summary */}
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
          {/* Summary header with gradient */}
          <Box
            sx={{
              px: 3,
              py: 2.5,
              background: "linear-gradient(135deg, #8B1A4A 0%, #7a1640 100%)",
            }}
          >
            <Typography variant="subtitle1" fontWeight={700} sx={{ color: "white", mb: 0.25 }}>
              Order Summary
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
              Review your items before checkout
            </Typography>
          </Box>

          <Box sx={{ p: 2.5 }}>
            <FreeShippingBar subtotal={subtotal} />

            {/* Item preview */}
            <Stack spacing={1.5} sx={{ mb: 2.5 }}>
              {cartItems.slice(0, 3).map((item) => (
                <Stack key={item.product._id} direction="row" alignItems="center" spacing={1.25}>
                  <ProductThumb product={item.product} size="xs" />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="caption" fontWeight={600} noWrap display="block">
                      {item.product.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Qty: {item.quantity}
                    </Typography>
                  </Box>
                  <Typography variant="caption" fontWeight={700} sx={{ color: "#1c1917" }}>
                    ₹{item.totalPrice?.toLocaleString()}
                  </Typography>
                </Stack>
              ))}
              {cartItems.length > 3 && (
                <Typography variant="caption" color="text.secondary">
                  +{cartItems.length - 3} more item{cartItems.length - 3 !== 1 ? "s" : ""}
                </Typography>
              )}
            </Stack>

            <Divider sx={{ borderColor: "#f0e8e2", mb: 2 }} />

            {/* Price breakdown */}
            <Stack spacing={1.25} sx={{ mb: 2 }}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                <Typography variant="body2" fontWeight={600}>₹{subtotal.toFixed(2)}</Typography>
              </Stack>
              {discount > 0 && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ color: "#16a34a" }}>
                    Coupon ({appliedCoupon.code})
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#16a34a" }} fontWeight={700}>
                    −₹{discount.toFixed(2)}
                  </Typography>
                </Stack>
              )}
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Shipping</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }}>
                  Calculated next
                </Typography>
              </Stack>
            </Stack>

            <Divider sx={{ borderColor: "#f0e8e2", mb: 2 }} />

            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
              <Typography variant="subtitle1" fontWeight={700}>Total</Typography>
              <Typography variant="h6" fontWeight={800} sx={{ color: "#8B1A4A" }}>
                ₹{discountedTotal.toFixed(2)}
              </Typography>
            </Stack>

            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <CouponInput
              cartTotal={subtotal}
              onCouponApplied={onCouponApplied}
              appliedCoupon={appliedCoupon}
              onRemoveCoupon={onRemoveCoupon}
            />

            <Stack spacing={1.5} sx={{ mt: 2.5 }}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                endIcon={<ArrowForwardIcon />}
                onClick={proceedToCheckout}
                disabled={cartItems.length === 0}
                sx={{
                  py: 1.5,
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #8B1A4A, #7a1640)",
                  boxShadow: "0 4px 14px rgba(139,26,74,0.35)",
                  "&:hover": { background: "linear-gradient(135deg, #7a1640, #6b1236)", boxShadow: "0 6px 18px rgba(139,26,74,0.4)" },
                }}
              >
                Proceed to Checkout
              </Button>
              <Button
                variant="outlined"
                size="large"
                fullWidth
                onClick={() => navigate("/products")}
                sx={{
                  py: 1.25,
                  borderColor: "#e7e5e4",
                  color: "text.secondary",
                  "&:hover": { borderColor: "#8B1A4A", color: "#8B1A4A", bgcolor: "#fdf2f6" },
                }}
              >
                Continue Shopping
              </Button>
            </Stack>
          </Box>

          {/* Trust badges */}
          <Box sx={{ borderTop: "1px solid #f0e8e2", bgcolor: "#fafaf9", px: 2.5, py: 2 }}>
            <Stack direction="row" justifyContent="space-around">
              {TRUST.map(({ Icon, label }) => (
                <Box key={label} sx={{ textAlign: "center" }}>
                  <Icon sx={{ fontSize: 20, color: "#8B1A4A", mb: 0.25 }} />
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: "0.65rem" }}>
                    {label}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};
