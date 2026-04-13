import React from "react";
import "../styles/skeletonLoaders.css";

export const SkeletonText = ({ lines = 1, width = "100%", className = "" }) => {
  return (
    <>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`skeleton-loader skeleton-text ${className}`}
          style={{ width: i === lines - 1 ? width : "100%" }}
        />
      ))}
    </>
  );
};

export const SkeletonImage = ({ aspect = 1, className = "" }) => {
  return (
    <div
      className={`skeleton-loader skeleton-image ${className}`}
      style={{ aspectRatio: aspect }}
    />
  );
};

export const SkeletonCard = ({ lines = 3, image = true, className = "" }) => {
  return (
    <div className={`skeleton-card ${className}`}>
      {image && <SkeletonImage />}
      <SkeletonText lines={lines} />
    </div>
  );
};

export const SkeletonProductCard = () => {
  return (
    <div className="skeleton-card skeleton-product-card">
      <SkeletonImage className="skeleton-product-image" />
      <div className="skeleton-product-title skeleton-loader" />
      <div className="skeleton-product-description skeleton-loader" />
      <div className="skeleton-product-price skeleton-loader" />
    </div>
  );
};

export const SkeletonListItem = () => {
  return (
    <div className="skeleton-list-item">
      <div className="skeleton-loader skeleton-avatar" />
      <div style={{ flex: 1 }}>
        <SkeletonText lines={2} />
      </div>
    </div>
  );
};

export const SkeletonListLoader = ({ items = 3 }) => {
  return (
    <>
      {Array.from({ length: items }).map((_, i) => (
        <SkeletonListItem key={i} />
      ))}
    </>
  );
};

export const SkeletonProductGrid = ({ count = 4 }) => {
  return (
    <div className="row">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="col-md-6 col-lg-3 mb-4">
          <SkeletonProductCard />
        </div>
      ))}
    </div>
  );
};

export const SkeletonButton = ({ width = "100%", className = "" }) => {
  return (
    <div
      className={`skeleton-loader skeleton-button ${className}`}
      style={{ width }}
    />
  );
};
