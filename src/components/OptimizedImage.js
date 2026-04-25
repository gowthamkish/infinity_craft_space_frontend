import React, { useState, useCallback, memo } from "react";
import { DotsLoader } from "./Loader";

/**
 * Transforms a Cloudinary URL to serve the optimal format and size.
 * - f_auto  → WebP for Chrome/Edge, JPEG for Safari/IE
 * - q_auto  → Cloudinary chooses best quality/size tradeoff
 * - w_{w}   → resize to requested width (preserves aspect ratio)
 * - c_limit → never upscale, only downscale
 *
 * Non-Cloudinary URLs are returned unchanged.
 */
function buildCloudinaryUrl(src, width) {
  if (!src || typeof src !== "string") return src;
  // Match both res.cloudinary.com and cloudinary.com delivery URLs
  const cloudinaryPattern = /^(https?:\/\/(?:res\.)?cloudinary\.com\/[^/]+\/image\/upload\/)/;
  const match = src.match(cloudinaryPattern);
  if (!match) return src;

  const baseUrl = match[1];
  const remainder = src.slice(baseUrl.length);

  // Strip any existing transformation segment (e.g. "w_800,q_auto/")
  const withoutExistingTransforms = remainder.replace(/^[^/]+\//, (seg) =>
    /^[a-z_,0-9]+$/.test(seg.split("/")[0]) ? "" : seg,
  );

  const transforms = [`f_auto`, `q_auto`, width ? `w_${width},c_limit` : null]
    .filter(Boolean)
    .join(",");

  return `${baseUrl}${transforms}/${withoutExistingTransforms}`;
}

const OptimizedImage = memo(
  ({
    src,
    alt = "Product Image",
    fallbackSrc = "https://placehold.co/400x400?text=No+Image",
    className,
    style,
    loading = "lazy",
    width,        // desired display width in px — used for Cloudinary resize
    onLoad,
    onError,
    ...props
  }) => {
    const optimizedSrc = buildCloudinaryUrl(src, width);
    const [imageLoading, setImageLoading] = useState(true);
    const [imageSrc, setImageSrc] = useState(optimizedSrc || src);
    const [hasError, setHasError] = useState(false);

    const handleImageLoad = useCallback(
      (e) => {
        setImageLoading(false);
        setHasError(false);
        if (onLoad) onLoad(e);
      },
      [onLoad],
    );

    const handleImageError = useCallback(
      (e) => {
        setImageLoading(false);
        setHasError(true);
        setImageSrc(fallbackSrc);
        if (onError) onError(e);
      },
      [fallbackSrc, onError],
    );

    const imageStyle = {
      ...style,
      display: imageLoading ? "none" : "block",
      transition: "opacity 0.3s ease",
    };

    return (
      <div style={{ position: "relative", ...style }}>
        {imageLoading && !hasError && (
          <div
            className="d-flex justify-content-center align-items-center"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "#f8f9fa",
              borderRadius: "12px 12px 0 0",
            }}
          >
            <DotsLoader size="sm" />
          </div>
        )}
        <img
          src={imageSrc}
          alt={alt}
          className={className}
          style={imageStyle}
          loading={loading}
          decoding="async"
          onLoad={handleImageLoad}
          onError={handleImageError}
          {...props}
        />
      </div>
    );
  },
);

OptimizedImage.displayName = "OptimizedImage";

export { buildCloudinaryUrl };
export default OptimizedImage;
