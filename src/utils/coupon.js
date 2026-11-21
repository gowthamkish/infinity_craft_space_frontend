/**
 * Discount (₹) an applied coupon gives on the current product subtotal.
 * Mirrors backend/utils/coupons.js — the server recalculates it when the order is created, so this is display-only.
 * Recomputed from the coupon rules (not the amount returned at apply time) so it stays right if the cart changes.
 */
export function couponDiscount(coupon, subtotal) {
  if (!coupon) return 0;
  if (coupon.minCartValue && subtotal < coupon.minCartValue) return 0;
  const isPercent = coupon.discountType === "percentage" || coupon.discountType === "percent";
  let d = isPercent ? (subtotal * (coupon.discountValue || 0)) / 100 : coupon.discountValue || 0;
  if (isPercent && coupon.maxDiscount) d = Math.min(d, coupon.maxDiscount);
  return Math.round(Math.max(0, Math.min(d, subtotal)) * 100) / 100;
}
