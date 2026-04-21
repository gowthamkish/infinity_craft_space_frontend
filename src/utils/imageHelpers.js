/**
 * Cloudinary URL transformer — generates optimised image URLs.
 * If the URL is not a Cloudinary URL the original is returned unchanged.
 */

/**
 * Add Cloudinary transformations to a URL.
 * @param {string} url - Original Cloudinary URL
 * @param {{ w?: number, h?: number, q?: string, f?: string, crop?: string }} opts
 */
export function cloudinaryUrl(url, { w, h, q = "auto", f = "auto", crop = "limit" } = {}) {
  if (!url || !url.includes("/upload/")) return url;
  const parts = [];
  if (f) parts.push(`f_${f}`);
  if (q) parts.push(`q_${q}`);
  if (w) parts.push(`w_${w}`);
  if (h) parts.push(`h_${h}`);
  if (crop) parts.push(`c_${crop}`);
  return url.replace("/upload/", `/upload/${parts.join(",")}/`);
}

/** Thumbnail — used in product cards, cart items, order history */
export const thumbUrl = (url) => cloudinaryUrl(url, { w: 400, q: "auto", f: "auto" });

/** Medium — used in product detail secondary images */
export const mediumUrl = (url) => cloudinaryUrl(url, { w: 800, q: "auto", f: "auto" });

/** Full — used in lightbox / zoom view */
export const fullUrl = (url) => cloudinaryUrl(url, { q: "auto", f: "auto" });

/**
 * Generate a srcSet string for a Cloudinary image.
 * @param {string} url
 * @param {number[]} widths - e.g. [200, 400, 800]
 */
export function cloudinarySrcSet(url, widths = [200, 400, 800]) {
  if (!url || !url.includes("/upload/")) return undefined;
  return widths
    .map((w) => `${cloudinaryUrl(url, { w, q: "auto", f: "auto" })} ${w}w`)
    .join(", ");
}
