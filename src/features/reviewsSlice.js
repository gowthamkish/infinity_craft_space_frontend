import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

// Fetch reviews for a product
export const fetchProductReviews = createAsyncThunk(
  "reviews/fetchProductReviews",
  async (
    { productId, page = 1, limit = 10, sortBy = "newest" },
    { rejectWithValue },
  ) => {
    try {
      const res = await api.get(`/api/reviews/product/${productId}`, {
        params: { page, limit, sortBy },
      });
      return { productId, ...res.data };
    } catch (error) {
      // Return empty data for 404 (reviews endpoint not deployed)
      if (error.response?.status === 404) {
        return {
          productId,
          reviews: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalReviews: 0,
            hasMore: false,
          },
          ratingStats: {
            averageRating: 0,
            reviewCount: 0,
            ratingBreakdown: {},
          },
        };
      }
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch reviews",
      );
    }
  },
);

// Fetch rating summary for a product
export const fetchRatingSummary = createAsyncThunk(
  "reviews/fetchRatingSummary",
  async (productId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/api/reviews/product/${productId}/summary`);
      return { productId, ...res.data };
    } catch (error) {
      // Return empty data for 404
      if (error.response?.status === 404) {
        return {
          productId,
          averageRating: 0,
          reviewCount: 0,
          ratingBreakdown: {},
        };
      }
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch rating summary",
      );
    }
  },
);

// Check if user can review a product
export const checkCanReview = createAsyncThunk(
  "reviews/checkCanReview",
  async (productId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/api/reviews/can-review/${productId}`);
      return { productId, ...res.data };
    } catch (error) {
      // Return default for 404 (allow review attempt, backend will validate)
      if (error.response?.status === 404) {
        return { productId, canReview: true, isVerifiedPurchase: false };
      }
      return rejectWithValue(
        error.response?.data?.error || "Failed to check review eligibility",
      );
    }
  },
);

// Create a new review
export const createReview = createAsyncThunk(
  "reviews/createReview",
  async (reviewData, { rejectWithValue }) => {
    try {
      const res = await api.post("/api/reviews", reviewData);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to create review",
      );
    }
  },
);

// Update a review
export const updateReview = createAsyncThunk(
  "reviews/updateReview",
  async ({ reviewId, reviewData }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/api/reviews/${reviewId}`, reviewData);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update review",
      );
    }
  },
);

// Delete a review
export const deleteReview = createAsyncThunk(
  "reviews/deleteReview",
  async (reviewId, { rejectWithValue }) => {
    try {
      await api.delete(`/api/reviews/${reviewId}`);
      return reviewId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to delete review",
      );
    }
  },
);

// Mark review as helpful
export const markReviewHelpful = createAsyncThunk(
  "reviews/markHelpful",
  async (reviewId, { rejectWithValue }) => {
    try {
      const res = await api.post(`/api/reviews/${reviewId}/helpful`);
      return { reviewId, ...res.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to mark review as helpful",
      );
    }
  },
);

// Fetch user's own reviews
export const fetchMyReviews = createAsyncThunk(
  "reviews/fetchMyReviews",
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const res = await api.get("/api/reviews/my-reviews", {
        params: { page, limit },
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch your reviews",
      );
    }
  },
);

const reviewsSlice = createSlice({
  name: "reviews",
  initialState: {
    // Reviews by product ID
    reviewsByProduct: {},
    // Rating summaries by product ID
    ratingSummaries: {},
    // User's own reviews
    myReviews: [],
    myReviewsPagination: null,
    // Review eligibility by product ID
    canReviewStatus: {},
    // Loading states
    loading: false,
    createLoading: false,
    // Error state
    error: null,
    // Success message
    successMessage: null,
  },
  reducers: {
    clearReviewError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    clearProductReviews: (state, action) => {
      const productId = action.payload;
      delete state.reviewsByProduct[productId];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch product reviews
      .addCase(fetchProductReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        state.loading = false;
        const { productId, reviews, pagination, ratingStats } = action.payload;
        state.reviewsByProduct[productId] = {
          reviews,
          pagination,
          ratingStats,
        };
      })
      .addCase(fetchProductReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch rating summary
      .addCase(fetchRatingSummary.fulfilled, (state, action) => {
        const { productId, averageRating, reviewCount, ratingBreakdown } =
          action.payload;
        state.ratingSummaries[productId] = {
          averageRating,
          reviewCount,
          ratingBreakdown,
        };
      })

      // Check can review
      .addCase(checkCanReview.fulfilled, (state, action) => {
        const {
          productId,
          canReview,
          isVerifiedPurchase,
          reason,
          existingReview,
        } = action.payload;
        state.canReviewStatus[productId] = {
          canReview,
          isVerifiedPurchase,
          reason,
          existingReview,
        };
      })

      // Create review
      .addCase(createReview.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.createLoading = false;
        state.successMessage = "Review submitted successfully!";
        // Clear cached data to force refresh
        const productId = action.payload.review.product;
        delete state.reviewsByProduct[productId];
        delete state.canReviewStatus[productId];
      })
      .addCase(createReview.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
      })

      // Update review
      .addCase(updateReview.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        state.createLoading = false;
        state.successMessage = "Review updated successfully!";
        // Update in my reviews list
        const updatedReview = action.payload.review;
        const index = state.myReviews.findIndex(
          (r) => r._id === updatedReview._id,
        );
        if (index !== -1) {
          state.myReviews[index] = updatedReview;
        }
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
      })

      // Delete review
      .addCase(deleteReview.fulfilled, (state, action) => {
        const reviewId = action.payload;
        state.myReviews = state.myReviews.filter((r) => r._id !== reviewId);
        state.successMessage = "Review deleted successfully!";
      })

      // Mark helpful
      .addCase(markReviewHelpful.fulfilled, (state, action) => {
        const { reviewId, helpfulVotes, hasVoted } = action.payload;
        // Update in all cached reviews
        Object.values(state.reviewsByProduct).forEach((productData) => {
          const review = productData.reviews.find((r) => r._id === reviewId);
          if (review) {
            review.helpfulVotes = helpfulVotes;
            review.userHasVoted = hasVoted;
          }
        });
      })

      // Fetch my reviews
      .addCase(fetchMyReviews.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.myReviews = action.payload.reviews;
        state.myReviewsPagination = action.payload.pagination;
      })
      .addCase(fetchMyReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearReviewError, clearSuccessMessage, clearProductReviews } =
  reviewsSlice.actions;
export default reviewsSlice.reducer;
