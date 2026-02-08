import React from "react";
import { FiStar } from "react-icons/fi";

// Star Rating Display Component
export const StarRating = ({ rating, size = "1rem", showValue = false }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="d-flex align-items-center gap-1">
      <div className="d-flex" style={{ gap: "2px" }}>
        {/* Full stars */}
        {[...Array(fullStars)].map((_, i) => (
          <FiStar
            key={`full-${i}`}
            style={{ fontSize: size, color: "#fbbf24", fill: "#fbbf24" }}
          />
        ))}
        {/* Half star */}
        {hasHalfStar && (
          <FiStar
            style={{
              fontSize: size,
              color: "#fbbf24",
              fill: "#fbbf24",
              opacity: 0.5,
            }}
          />
        )}
        {/* Empty stars */}
        {[...Array(emptyStars)].map((_, i) => (
          <FiStar
            key={`empty-${i}`}
            style={{ fontSize: size, color: "#e9ecef" }}
          />
        ))}
      </div>
      {showValue && (
        <span
          style={{
            fontSize: "0.9rem",
            fontWeight: "600",
            color: "var(--text-primary)",
            marginLeft: "0.25rem",
          }}
        >
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

// Star Rating Input Component
export const StarRatingInput = ({ rating, onRatingChange, size = "2rem" }) => {
  const [hoverRating, setHoverRating] = React.useState(0);

  return (
    <div className="star-rating-input" onMouseLeave={() => setHoverRating(0)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <FiStar
          key={star}
          className={`star ${(hoverRating || rating) >= star ? "filled" : ""}`}
          style={{
            fontSize: size,
            color: (hoverRating || rating) >= star ? "#fbbf24" : "#e9ecef",
            fill: (hoverRating || rating) >= star ? "#fbbf24" : "none",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={() => setHoverRating(star)}
          onClick={() => onRatingChange(star)}
        />
      ))}
    </div>
  );
};

// Rating Breakdown Component
export const RatingBreakdown = ({ ratingBreakdown, totalReviews }) => {
  if (!ratingBreakdown || totalReviews === 0) return null;

  return (
    <div className="rating-breakdown">
      {[5, 4, 3, 2, 1].map((stars) => {
        const count = ratingBreakdown[stars] || 0;
        const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

        return (
          <div key={stars} className="rating-bar-row">
            <span className="rating-bar-label">{stars} star</span>
            <div className="rating-bar-container">
              <div
                className="rating-bar-fill"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="rating-bar-count">{count}</span>
          </div>
        );
      })}
    </div>
  );
};

// Rating Summary Component
export const RatingSummary = ({
  averageRating,
  reviewCount,
  ratingBreakdown,
}) => {
  return (
    <div className="rating-summary">
      <div className="d-flex flex-wrap align-items-start gap-4">
        <div className="rating-overview">
          <div>
            <span className="rating-number">
              {averageRating?.toFixed(1) || "0.0"}
            </span>
            <div className="mt-2">
              <StarRating rating={averageRating || 0} size="1.25rem" />
            </div>
            <div className="rating-count">
              {reviewCount || 0} {reviewCount === 1 ? "review" : "reviews"}
            </div>
          </div>
        </div>

        <div className="flex-grow-1" style={{ minWidth: "200px" }}>
          <RatingBreakdown
            ratingBreakdown={ratingBreakdown}
            totalReviews={reviewCount}
          />
        </div>
      </div>
    </div>
  );
};

export default StarRating;
