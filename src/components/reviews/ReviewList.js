import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import MuiLink from "@mui/material/Link";
import CloseIcon from "@mui/icons-material/Close";
import { DotsLoader } from "../Loader";
import { FiMessageSquare, FiAlertCircle } from "react-icons/fi";
import {
  fetchProductReviews,
  checkCanReview,
} from "../../features/reviewsSlice";
import { RatingSummary } from "./StarRating";
import ReviewCard from "./ReviewCard";
import AddReviewForm from "./AddReviewForm";
import "./reviews.css";

const SORT_OPTIONS = [
  { value: "verified", label: "Verified Purchases First" },
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "highest", label: "Highest Rated" },
  { value: "lowest", label: "Lowest Rated" },
  { value: "helpful", label: "Most Helpful" },
];

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
  const reviews =
    sortBy === "verified"
      ? [...rawReviews].sort((a, b) => {
          const scoreA =
            (a.verifiedPurchase ? 2 : 0) + (a.images?.length > 0 ? 1 : 0);
          const scoreB =
            (b.verifiedPurchase ? 2 : 0) + (b.images?.length > 0 ? 1 : 0);
          if (scoreB !== scoreA) return scoreB - scoreA;
          return b.rating - a.rating;
        })
      : rawReviews;

  const ratingStats = productReviews?.ratingStats || {};
  const pagination = productReviews?.pagination;

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2.5,
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          Customer Reviews
        </Typography>
        {isAuthenticated &&
          canReviewInfo?.reason !== "already_reviewed" &&
          !showAddReview && (
            <Button
              variant="contained"
              size="small"
              onClick={() => setShowAddReview(true)}
              sx={{ flexShrink: 0, ml: 2 }}
            >
              Write a Review
            </Button>
          )}
      </Box>

      {/* Rating summary */}
      {ratingStats && (
        <RatingSummary
          averageRating={ratingStats.averageRating}
          reviewCount={ratingStats.reviewCount}
          ratingBreakdown={ratingStats.ratingBreakdown}
        />
      )}

      {/* Already reviewed notice */}
      {canReviewInfo?.reason === "already_reviewed" && (
        <Alert
          severity="info"
          icon={<FiAlertCircle size={18} />}
          sx={{ mb: 2, borderRadius: 2 }}
        >
          You have already reviewed this product. Thank you for your feedback!
        </Alert>
      )}

      {/* Add review form */}
      {showAddReview && (
        <Box sx={{ mb: 3 }}>
          <AddReviewForm
            productId={productId}
            productName={productName}
            onReviewSubmitted={handleReviewSubmitted}
          />
          <Button
            variant="outlined"
            size="small"
            onClick={() => setShowAddReview(false)}
            sx={{ mt: 1.5 }}
          >
            Cancel
          </Button>
        </Box>
      )}

      {/* Sort + count row */}
      {reviews.length > 0 && (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
          gap={1}
          sx={{ mb: 2 }}
        >
          <Typography variant="body2" color="text.secondary">
            Showing {reviews.length} of {pagination?.totalReviews || 0} reviews
          </Typography>
          <TextField
            select
            size="small"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            {SORT_OPTIONS.map(({ value, label }) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      )}

      {/* Loading */}
      {loading && reviews.length === 0 && (
        <Stack alignItems="center" gap={2} sx={{ py: 5 }}>
          <CircularProgress size={32} />
          <Typography variant="body2" color="text.secondary">
            Loading reviews…
          </Typography>
        </Stack>
      )}

      {/* Reviews */}
      {reviews.length > 0 ? (
        <>
          {reviews.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
              onImageClick={handleImageClick}
            />
          ))}
          {pagination?.hasMore && (
            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Button
                variant="outlined"
                onClick={handleLoadMore}
                disabled={loading}
                startIcon={
                  loading ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : null
                }
              >
                {loading
                  ? "Loading…"
                  : `Load More (${pagination.totalReviews - reviews.length} remaining)`}
              </Button>
            </Box>
          )}
        </>
      ) : (
        !loading && (
          <Stack alignItems="center" gap={1.5} sx={{ py: 5 }}>
            <FiMessageSquare size={36} color="#94a3b8" />
            <Typography
              variant="subtitle1"
              fontWeight={700}
              color="text.secondary"
            >
              No reviews yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Be the first to share your experience with this product!
            </Typography>

            {!isAuthenticated && (
              <Typography variant="body2" color="text.secondary">
                <MuiLink href="/login" sx={{ fontWeight: 600 }}>
                  Login
                </MuiLink>{" "}
                to write a review
              </Typography>
            )}
          </Stack>
        )
      )}

      {/* Image lightbox dialog */}
      <Dialog
        open={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { m: { xs: 1, sm: 2 } } }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            py: 1.5,
          }}
        >
          Review Photo
          <IconButton
            onClick={() => setImageModalOpen(false)}
            size="small"
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center", p: 0 }}>
          {selectedImages.length > 0 && (
            <>
              <Box
                component="img"
                src={selectedImages[selectedImageIndex]?.url}
                alt="Review"
                sx={{
                  maxWidth: "100%",
                  maxHeight: "70vh",
                  objectFit: "contain",
                }}
              />
              {selectedImages.length > 1 && (
                <Stack
                  direction="row"
                  justifyContent="center"
                  gap={1}
                  sx={{ p: 2 }}
                >
                  {selectedImages.map((img, idx) => (
                    <Box
                      key={idx}
                      component="img"
                      src={img.url}
                      alt={`Thumbnail ${idx + 1}`}
                      onClick={() => setSelectedImageIndex(idx)}
                      sx={{
                        width: 60,
                        height: 60,
                        objectFit: "cover",
                        borderRadius: 1.5,
                        cursor: "pointer",
                        border: "2px solid",
                        borderColor:
                          idx === selectedImageIndex
                            ? "primary.main"
                            : "transparent",
                        transition: "border-color 0.15s ease",
                      }}
                    />
                  ))}
                </Stack>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ReviewList;
