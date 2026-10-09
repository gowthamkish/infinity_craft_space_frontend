/**
 * Branded, offline image placeholder (inline SVG data URI — no network request, no external
 * placeholder service that can go down). Used whenever a product has no image or its image
 * URL fails to load, so cards never render as blank boxes.
 */
const SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640" viewBox="0 0 640 640">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fff3ee"/><stop offset="1" stop-color="#e3f5f2"/>
    </linearGradient>
    <linearGradient id="ink" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#e8623d"/><stop offset="1" stop-color="#0f9488"/>
    </linearGradient>
  </defs>
  <rect width="640" height="640" fill="url(#bg)"/>
  <path d="M320 320c-34-52-86-80-124-52-34 26-24 82 14 98 40 16 84-14 110-46 26 32 70 62 110 46 38-16 48-72 14-98-38-28-90 0-124 52z"
        fill="none" stroke="url(#ink)" stroke-width="22" stroke-linecap="round" stroke-linejoin="round" opacity=".85"/>
  <text x="320" y="468" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="26" font-weight="600" fill="#8a8c85" letter-spacing="2">IMAGE COMING SOON</text>
</svg>`;

export const PLACEHOLDER_SRC = `data:image/svg+xml;utf8,${encodeURIComponent(SVG)}`;

/**
 * `<img onError={onImgError} />` — swaps a failed image for the placeholder, once
 * (the guard prevents an error loop if the placeholder itself were ever blocked).
 */
export function onImgError(e) {
  const img = e.currentTarget || e.target;
  if (!img || img.dataset.fallbackApplied) return;
  img.dataset.fallbackApplied = "1";
  img.src = PLACEHOLDER_SRC;
}
