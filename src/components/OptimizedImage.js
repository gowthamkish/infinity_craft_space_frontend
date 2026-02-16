import React, { useState, useCallback, memo } from "react";
import { Spinner } from "./ui";

const OptimizedImage = memo(
  ({
    src,
    alt = "Product Image",
    fallbackSrc = "https://via.placeholder.com/200x200?text=No+Image",
    className,
    style,
    loading = "lazy",
    onLoad,
    onError,
    ...props
  }) => {
    const [imageLoading, setImageLoading] = useState(true);
    const [imageSrc, setImageSrc] = useState(src);
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
            <Spinner animation="border" size="sm" variant="primary" />
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

export default OptimizedImage;
