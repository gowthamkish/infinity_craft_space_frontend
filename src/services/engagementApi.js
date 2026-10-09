import { baseApi, patchAllCached, undoAll } from "../app/baseApi";

const QNA_LIST = { type: "Qna", id: "LIST" };

export const engagementApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Coupon validation — a POST with no cacheable result, so a mutation.
    validateCoupon: build.mutation({
      query: ({ code, cartTotal }) => ({ url: "/api/coupons/validate", method: "post", data: { code, cartTotal } }),
    }),

    // ── Product Q&A (paginated; each page/sort combination is cached separately) ──
    getQnA: build.query({
      query: ({ productId, page = 1, limit = 10, sort = "latest" }) => ({
        url: `/api/qna/product/${productId}`,
        params: { page, limit, sort },
      }),
      providesTags: (_r, _e, { productId }) => [{ type: "Qna", id: productId }, QNA_LIST],
    }),

    // Posting a question refreshes that product's Q&A list automatically.
    postQuestion: build.mutation({
      query: ({ productId, question }) => ({
        url: `/api/qna/product/${productId}/question`,
        method: "post",
        data: { question },
      }),
      invalidatesTags: (_r, _e, { productId }) => [{ type: "Qna", id: productId }],
    }),

    postAnswer: build.mutation({
      query: ({ qnaId, content }) => ({ url: `/api/qna/${qnaId}/answer`, method: "post", data: { content } }),
      invalidatesTags: [QNA_LIST],
    }),

    // Optimistic: the "helpful" counter goes up instantly; rolled back if the request fails.
    markQnaHelpful: build.mutation({
      query: (qnaId) => ({ url: `/api/qna/${qnaId}/helpful`, method: "post" }),
      async onQueryStarted(qnaId, { dispatch, getState, queryFulfilled }) {
        const patches = patchAllCached(dispatch, getState, "getQnA", (draft) => {
          const item = draft.data?.find((q) => q._id === qnaId);
          if (item) item.helpful = (item.helpful || 0) + 1;
        });
        try {
          await queryFulfilled;
        } catch {
          undoAll(patches);
        }
      },
    }),
  }),
});

export const {
  useValidateCouponMutation,
  useGetQnAQuery,
  usePostQuestionMutation,
  usePostAnswerMutation,
  useMarkQnaHelpfulMutation,
} = engagementApi;
