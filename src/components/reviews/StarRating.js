import React from "react";
import { FiStar } from "react-icons/fi";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";

const GOLD = "#C9A84C";
const GOLD_EMPTY = "#EAD9C5";

export const StarRating = ({ rating, size = "1rem", showValue = false }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <Box sx={{ display: "flex", gap: "2px" }}>
        {[...Array(fullStars)].map((_, i) => (
          <FiStar key={`full-${i}`} style={{ fontSize: size, color: GOLD, fill: GOLD }} />
        ))}
        {hasHalfStar && (
          <FiStar style={{ fontSize: size, color: GOLD, fill: GOLD, opacity: 0.5 }} />
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <FiStar key={`empty-${i}`} style={{ fontSize: size, color: GOLD_EMPTY }} />
        ))}
      </Box>
      {showValue && (
        <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary", ml: 0.5 }}>
          {rating.toFixed(1)}
        </Typography>
      )}
    </Box>
  );
};

export const StarRatingInput = ({ rating, onRatingChange, size = "2rem" }) => {
  const [hoverRating, setHoverRating] = React.useState(0);

  return (
    <Box
      sx={{ display: "flex", gap: "4px", cursor: "pointer" }}
      onMouseLeave={() => setHoverRating(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const active = (hoverRating || rating) >= star;
        return (
          <FiStar
            key={star}
            style={{
              fontSize: size,
              color: active ? GOLD : GOLD_EMPTY,
              fill: active ? GOLD : "none",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={() => setHoverRating(star)}
            onClick={() => onRatingChange(star)}
          />
        );
      })}
    </Box>
  );
};

export const RatingBreakdown = ({ ratingBreakdown, totalReviews }) => {
  if (!ratingBreakdown || totalReviews === 0) return null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
      {[5, 4, 3, 2, 1].map((stars) => {
        const count = ratingBreakdown[stars] || 0;
        const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
        return (
          <Box key={stars} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="caption" sx={{ width: 38, flexShrink: 0, color: "text.secondary" }}>
              {stars} star
            </Typography>
            <LinearProgress
              variant="determinate"
              value={pct}
              sx={{
                flex: 1, height: 7, borderRadius: 9999,
                bgcolor: GOLD_EMPTY,
                "& .MuiLinearProgress-bar": { bgcolor: GOLD },
              }}
            />
            <Typography variant="caption" sx={{ width: 24, flexShrink: 0, textAlign: "right", color: "text.secondary" }}>
              {count}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};

export const RatingSummary = ({ averageRating, reviewCount, ratingBreakdown }) => (
  <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: 4 }}>
    <Box sx={{ textAlign: "center" }}>
      <Typography variant="h2" sx={{ fontWeight: 800, color: "text.primary", lineHeight: 1 }}>
        {averageRating?.toFixed(1) || "0.0"}
      </Typography>
      <Box sx={{ mt: 1 }}>
        <StarRating rating={averageRating || 0} size="1.25rem" />
      </Box>
      <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.5 }}>
        {reviewCount || 0} {reviewCount === 1 ? "review" : "reviews"}
      </Typography>
    </Box>
    <Box sx={{ flex: 1, minWidth: 200 }}>
      <RatingBreakdown ratingBreakdown={ratingBreakdown} totalReviews={reviewCount} />
    </Box>
  </Box>
);

export default StarRating;
