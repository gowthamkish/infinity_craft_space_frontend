/**
 * Launch-week offer: free shipping on orders above ₹999.
 * Runs for 7 days from the website launch (20 Nov 2026, 08:00 IST) and ends by itself — no redeploy needed.
 * The server (backend/utils/launchOffer.js) is the source of truth for what is charged; keep both in sync.
 */
export const OFFER_START = new Date("2026-11-20T08:00:00+05:30");
export const OFFER_END = new Date("2026-11-27T08:00:00+05:30");
export const FREE_SHIPPING_ABOVE = 999;

export const isOfferActive = (now = Date.now()) => now >= OFFER_START.getTime() && now < OFFER_END.getTime();
export const isFreeShipping = (subtotal) => isOfferActive() && subtotal > FREE_SHIPPING_ABOVE;
