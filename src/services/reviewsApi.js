import { baseApi, patchAllCached, undoAll } from "../app/baseApi";

const EMPTY_PAGE = {
  reviews: [],
  pagination: { currentPage: 1, totalPages: 0, totalReviews: 0, hasMore: false },
  ratingStats: { averageRating: 0, reviewCount: 0, ratingBreakdown: {} },
};

// A 404 means "reviews endpoint has nothing for this product" → behave like an empty result.
const withEmptyOn404 = (fallback) => async (baseQuery, args) => {
  const r = await baseQuery(args);
  if (r.error?.status === 404) return { data: fallback };
  return r.error ? { error: r.error } : { data: r.data };
};

export const reviewsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // "Load more" appends pages in the cache (hasMore drives the next page param).
    getProductReviews: build.infiniteQuery({
      infiniteQueryOptions: {
        initialPageParam: 1,
        getNextPageParam: (lastPage) =>
          lastPage?.pagination?.hasMore ? (lastPage.pagination.currentPage || 1) + 1 : undefined,
      },
      queryFn: ({ queryArg, pageParam }, _api, _extra, baseQuery) =>
        withEmptyOn404(EMPTY_PAGE)(baseQuery, {
          url: `/api/reviews/product/${queryArg.productId}`,
          params: { page: pageParam, limit: queryArg.limit ?? 10, sortBy: queryArg.sortBy ?? "newest" },
        }),
      providesTags: (_r, _e, { productId }) => [{ type: "Review", id: productId }],
    }),

    getRatingSummary: build.query({
      queryFn: (productId, _api, _extra, baseQuery) =>
        withEmptyOn404({ averageRating: 0, reviewCount: 0, ratingBreakdown: {} })(baseQuery, {
          url: `/api/reviews/product/${productId}/summary`,
        }),
      providesTags: (_r, _e, productId) => [{ type: "Review", id: productId }],
    }),

    // Can the logged-in user review this product? (404 → let them try; backend validates)
    getCanReview: build.query({
      queryFn: (productId, _api, _extra, baseQuery) =>
        withEmptyOn404({ canReview: true, isVerifiedPurchase: false })(baseQuery, {
          url: `/api/reviews/can-review/${productId}`,
        }),
      providesTags: (_r, _e, productId) => [{ type: "Review", id: productId }],
    }),

    // One invalidation refreshes the list, the rating summary and the "can review" flag.
    createReview: build.mutation({
      query: (body) => ({ url: "/api/reviews", method: "post", data: body }),
      invalidatesTags: (_r, _e, { productId }) => [{ type: "Review", id: productId }],
    }),

    // Optimistic "helpful" toggle: count + highlighted state change instantly,
    // then the server's authoritative numbers replace them.
    markReviewHelpful: build.mutation({
      query: (reviewId) => ({ url: `/api/reviews/${reviewId}/helpful`, method: "post" }),
      async onQueryStarted(reviewId, { dispatch, getState, queryFulfilled }) {
        const forEachReview = (draft, fn) =>
          draft.pages.forEach((page) => {
            const r = page.reviews.find((x) => x._id === reviewId);
            if (r) fn(r);
          });

        const patches = patchAllCached(dispatch, getState, "getProductReviews", (draft) =>
          forEachReview(draft, (r) => {
            r.userHasVoted = !r.userHasVoted;
            r.helpfulVotes = Math.max(0, (r.helpfulVotes || 0) + (r.userHasVoted ? 1 : -1));
          }),
        );
        try {
          const { data } = await queryFulfilled;
          if (data) {
            patchAllCached(dispatch, getState, "getProductReviews", (draft) =>
              forEachReview(draft, (r) => {
                r.helpfulVotes = data.helpfulVotes;
                r.userHasVoted = data.hasVoted;
              }),
            );
          }
        } catch {
          undoAll(patches);
        }
      },
    }),
  }),
});

export const {
  useGetProductReviewsInfiniteQuery,
  useGetRatingSummaryQuery,
  useGetCanReviewQuery,
  useCreateReviewMutation,
  useMarkReviewHelpfulMutation,
} = reviewsApi;
