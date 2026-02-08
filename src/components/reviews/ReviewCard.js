import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FiThumbsUp, FiCheckCircle, FiMessageCircle } from "react-icons/fi";
import { markReviewHelpful } from "../../features/reviewsSlice";
import { StarRating } from "./StarRating";
import "./reviews.css";

const ReviewCard = ({ review, onImageClick }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => !!state.auth.token);
  const [helpfulLoading, setHelpfulLoading] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getInitials = (username) => {
    if (!username) return "U";
    return username.charAt(0).toUpperCase();
  };

  const handleHelpfulClick = async () => {
    if (!isAuthenticated) {
      // Could redirect to login or show a message
      return;
    }

    setHelpfulLoading(true);
    try {
      await dispatch(markReviewHelpful(review._id)).unwrap();
    } catch (error) {
      console.error("Error marking review as helpful:", error);
    } finally {
      setHelpfulLoading(false);
    }
  };

  return (
    <div className="review-card">
      {/* Review Header */}
      <div className="review-header">
        <div className="reviewer-info">
          <div className="reviewer-avatar">
            {getInitials(review.user?.username)}
          </div>
          <div>
            <div className="reviewer-name">
              {review.user?.username || "Anonymous"}
            </div>
            <div className="review-date">{formatDate(review.createdAt)}</div>
          </div>
        </div>

        {review.isVerifiedPurchase && (
          <div className="verified-badge">
            <FiCheckCircle size={12} />
            Verified Purchase
          </div>
        )}
      </div>

      {/* Rating and Title */}
      <div className="review-rating">
        <StarRating rating={review.rating} size="1rem" />
      </div>

      <h6 className="review-title">{review.title}</h6>

      {/* Review Comment */}
      <p className="review-comment">{review.comment}</p>

      {/* Review Images */}
      {review.images && review.images.length > 0 && (
        <div className="review-images">
          {review.images.map((image, index) => (
            <img
              key={index}
              src={image.url}
              alt={`Review image ${index + 1}`}
              className="review-image"
              onClick={() => onImageClick && onImageClick(review.images, index)}
              loading="lazy"
            />
          ))}
        </div>
      )}

      {/* Admin Response */}
      {review.adminResponse && review.adminResponse.comment && (
        <div className="admin-response">
          <div className="admin-response-header">
            <FiMessageCircle size={14} />
            <span className="admin-response-label">
              Response from Infinity Craft Space
            </span>
          </div>
          <p className="admin-response-text">{review.adminResponse.comment}</p>
        </div>
      )}

      {/* Review Actions */}
      <div className="review-actions">
        <button
          className={`helpful-button ${review.userHasVoted ? "voted" : ""}`}
          onClick={handleHelpfulClick}
          disabled={helpfulLoading || !isAuthenticated}
          title={!isAuthenticated ? "Login to mark as helpful" : ""}
        >
          <FiThumbsUp size={14} />
          Helpful ({review.helpfulVotes || 0})
        </button>
      </div>
    </div>
  );
};

export default ReviewCard;
