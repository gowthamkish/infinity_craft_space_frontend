import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Form, Modal } from "react-bootstrap";
import { OrbitLoader, DotsLoader } from "../Loader";
import { FiMessageSquare, FiAlertCircle } from "react-icons/fi";
import {
  fetchProductReviews,
  checkCanReview,
} from "../../features/reviewsSlice";
import { RatingSummary } from "./StarRating";
import ReviewCard from "./ReviewCard";
import AddReviewForm from "./AddReviewForm";
import "./reviews.css";

const ReviewList = ({ productId, productName }) => {
  const dispatch = useDispatch();
  const { reviewsByProduct, canReviewStatus, loading } = useSelector(
    (state) => state.reviews,
  );
  const isAuthenticated = useSelector((state) => !!state.auth.user);

  const [sortBy, setSortBy] = useState("verified");
  const [showAddReview, setShowAddReview] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const productReviews = reviewsByProduct[productId];
  const canReviewInfo = canReviewStatus[productId];

  const loadReviews = useCallback(
    (page = 1) => {
      dispatch(fetchProductReviews({ productId, page, limit: 10, sortBy }));
    },
    [dispatch, productId, sortBy],
  );

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(checkCanReview(productId));
    }
  }, [dispatch, productId, isAuthenticated]);

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
  };

  const handleLoadMore = () => {
    if (productReviews?.pagination?.hasMore) {
      const nextPage = productReviews.pagination.currentPage + 1;
      dispatch(
        fetchProductReviews({ productId, page: nextPage, limit: 10, sortBy }),
      );
    }
  };

  const handleReviewSubmitted = () => {
    setShowAddReview(false);
    loadReviews();
    dispatch(checkCanReview(productId));
  };

  const handleImageClick = (images, index) => {
    setSelectedImages(images);
    setSelectedImageIndex(index);
    setImageModalOpen(true);
  };

  const rawReviews = productReviews?.reviews || [];

  // "verified" sort: verified purchases + photo reviews first, then by rating desc
  const reviews = sortBy === "verified"
    ? [...rawReviews].sort((a, b) => {
        const scoreA = (a.verifiedPurchase ? 2 : 0) + (a.images?.length > 0 ? 1 : 0);
        const scoreB = (b.verifiedPurchase ? 2 : 0) + (b.images?.length > 0 ? 1 : 0);
        if (scoreB !== scoreA) return scoreB - scoreA;
        return b.rating - a.rating;
      })
    : rawReviews;

  const ratingStats = productReviews?.ratingStats || {};
  const pagination = productReviews?.pagination;

  return (
    <div className="reviews-section">
      <div className="reviews-header d-flex flex-wrap justify-content-between align-items-center gap-3">
        <h4
          style={{
            fontWeight: "700",
            color: "var(--text-primary)",
            margin: 0,
          }}
        >
          Customer Reviews
        </h4>

        {/* Show Write a Review button for authenticated users who haven't reviewed yet */}
        {isAuthenticated &&
          canReviewInfo?.reason !== "already_reviewed" &&
          !showAddReview && (
            <button
              className="ics-btn ics-btn--primary ics-btn--sm"
              onClick={() => setShowAddReview(true)}
            >
              Write a Review
            </button>
          )}
      </div>

      {/* Rating Summary */}
      {ratingStats && (
        <RatingSummary
          averageRating={ratingStats.averageRating}
          reviewCount={ratingStats.reviewCount}
          ratingBreakdown={ratingStats.ratingBreakdown}
        />
      )}

      {/* Already Reviewed Message */}
      {canReviewInfo?.reason === "already_reviewed" && (
        <div
          className="d-flex align-items-center gap-2 p-3 mb-3"
          style={{
            background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
            borderRadius: "12px",
            border: "1px solid #bae6fd",
          }}
        >
          <FiAlertCircle size={20} style={{ color: "#0284c7" }} />
          <span style={{ color: "#0369a1" }}>
            You have already reviewed this product. Thank you for your feedback!
          </span>
        </div>
      )}

      {/* Add Review Form Modal */}
      {showAddReview && (
        <div className="mb-4">
          <AddReviewForm
            productId={productId}
            productName={productName}
            onReviewSubmitted={handleReviewSubmitted}
          />
          <button
            className="ics-btn ics-btn--outline ics-btn--sm mt-3"
            onClick={() => setShowAddReview(false)}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Sort Options */}
      {reviews.length > 0 && (
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Showing {reviews.length} of {pagination?.totalReviews || 0} reviews
          </span>

          <div className="sort-dropdown">
            <span
              style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}
            >
              Sort by:
            </span>
            <Form.Select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="sort-select"
              style={{ width: "auto" }}
            >
              <option value="verified">Verified Purchases First</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
              <option value="helpful">Most Helpful</option>
            </Form.Select>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && reviews.length === 0 && (
        <div className="text-center py-5 d-flex flex-column align-items-center gap-3">
          <OrbitLoader />
          <p className="text-muted mb-0">Loading reviews…</p>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <>
          {reviews.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
              onImageClick={handleImageClick}
            />
          ))}

          {/* Load More Button */}
          {pagination?.hasMore && (
            <button
              className="load-more-btn"
              onClick={handleLoadMore}
              disabled={loading}
            >
              {loading ? (
                <>
                  <DotsLoader size="sm" />
                  Loading…
                </>
              ) : (
                `Load More Reviews (${pagination.totalReviews - reviews.length} remaining)`
              )}
            </button>
          )}
        </>
      ) : (
        !loading && (
          <div className="no-reviews">
            <FiMessageSquare className="no-reviews-icon" />
            <div className="no-reviews-text">No reviews yet</div>
            <div className="no-reviews-subtext">
              Be the first to share your experience with this product!
            </div>
            {isAuthenticated &&
              canReviewInfo?.reason !== "already_reviewed" &&
              !showAddReview && (
                <button
                  className="ics-btn ics-btn--primary mt-3"
                  onClick={() => setShowAddReview(true)}
                >
                  Write the First Review
                </button>
              )}
            {!isAuthenticated && (
              <div className="mt-3 text-muted">
                <a
                  href="/login"
                  style={{ color: "var(--primary-color)", fontWeight: "600" }}
                >
                  Login
                </a>{" "}
                to write a review
              </div>
            )}
          </div>
        )
      )}

      {/* Image Modal */}
      <Modal
        show={imageModalOpen}
        onHide={() => setImageModalOpen(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Review Photo</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center p-0">
          {selectedImages.length > 0 && (
            <>
              <img
                src={selectedImages[selectedImageIndex]?.url}
                alt="Review"
                style={{
                  maxWidth: "100%",
                  maxHeight: "70vh",
                  objectFit: "contain",
                }}
              />
              {selectedImages.length > 1 && (
                <div className="d-flex justify-content-center gap-2 p-3">
                  {selectedImages.map((img, idx) => (
                    <img
                      key={idx}
                      src={img.url}
                      alt={`Thumbnail ${idx + 1}`}
                      onClick={() => setSelectedImageIndex(idx)}
                      style={{
                        width: "60px",
                        height: "60px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        cursor: "pointer",
                        border:
                          idx === selectedImageIndex
                            ? "2px solid var(--primary-color)"
                            : "2px solid transparent",
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ReviewList;
