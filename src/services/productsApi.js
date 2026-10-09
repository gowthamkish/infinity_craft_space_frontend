import { baseApi, patchAllCached, undoAll } from "../app/baseApi";

// Backend returns { products, page, pages, total }; tolerate a bare array too.
const normalise = (data) =>
  Array.isArray(data)
    ? { products: data, page: 1, pages: 1, total: data.length }
    : {
        products: data?.products || [],
        page: data?.page ?? 1,
        pages: data?.pages ?? 1,
        total: data?.total ?? data?.products?.length ?? 0,
      };

const productTags = (products = []) => [
  ...products.map((p) => ({ type: "Product", id: p._id })),
  { type: "Product", id: "LIST" },
];

// Apply `mutate(productsArray) → productsArray` to every cached product list,
// regardless of which endpoint/args produced it.
const patchProductLists = (dispatch, getState, mutate) => [
  ...patchAllCached(dispatch, getState, "getProducts", (d) => {
    d.products = mutate(d.products);
  }),
  ...patchAllCached(dispatch, getState, "productFeed", (d) => {
    d.pages.forEach((p) => {
      p.products = mutate(p.products);
    });
  }),
];

const extractProduct = (r) => r?.product || r;

// The recommendation endpoints answer { success, count, data: [...] } (personalised: { products }).
// Always hand components a plain array.
const toList = (r) => r?.data || r?.products || r?.recommendations || (Array.isArray(r) ? r : []);

export const productsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Single page / simple list (home page sections, admin table)
    getProducts: build.query({
      query: (params) => ({ url: "/api/products", params }),
      transformResponse: normalise,
      providesTags: (result) => productTags(result?.products),
    }),

    // Infinite scroll: the cache holds ALL fetched pages for one filter set;
    // `fetchNextPage()` appends — no hand-written merge/append reducer.
    productFeed: build.infiniteQuery({
      infiniteQueryOptions: {
        initialPageParam: 1,
        getNextPageParam: (lastPage, _pages, lastPageParam) =>
          lastPage.page < lastPage.pages ? lastPageParam + 1 : undefined,
      },
      query: ({ queryArg, pageParam }) => ({
        url: "/api/products",
        params: { ...queryArg, page: pageParam },
      }),
      transformResponse: normalise,
      providesTags: (result) => productTags(result?.pages.flatMap((p) => p.products)),
    }),

    getProduct: build.query({
      query: (id) => `/api/products/${id}`,
      transformResponse: extractProduct,
      providesTags: (_r, _e, id) => [{ type: "Product", id }],
    }),

    addProduct: build.mutation({
      query: (body) => ({ url: "/api/products", method: "post", data: body }),
      transformResponse: extractProduct,
      invalidatesTags: [{ type: "Product", id: "LIST" }, "Dashboard"],
    }),

    updateProduct: build.mutation({
      query: ({ id, productData }) => ({ url: `/api/products/${id}`, method: "put", data: productData }),
      transformResponse: extractProduct,
      invalidatesTags: (_r, _e, { id }) => [{ type: "Product", id }, { type: "Product", id: "LIST" }],
    }),

    // Optimistic: row disappears immediately, restored if the server rejects it.
    deleteProduct: build.mutation({
      query: (id) => ({ url: `/api/products/${id}`, method: "delete" }),
      async onQueryStarted(id, { dispatch, getState, queryFulfilled }) {
        const patches = patchProductLists(dispatch, getState, (list) => list.filter((p) => p._id !== id));
        try {
          await queryFulfilled;
        } catch {
          undoAll(patches);
        }
      },
      invalidatesTags: (_r, _e, id) => [{ type: "Product", id }, { type: "Product", id: "LIST" }, "Dashboard"],
    }),

    // Optimistic: stock count goes up instantly, then is replaced by the server's value.
    restockProduct: build.mutation({
      query: ({ id, quantity, note }) => ({
        url: `/api/products/${id}/restock`,
        method: "patch",
        data: { quantity, note },
      }),
      async onQueryStarted({ id, quantity }, { dispatch, getState, queryFulfilled }) {
        const patches = patchProductLists(dispatch, getState, (list) =>
          list.map((p) => (p._id === id ? { ...p, stock: (p.stock || 0) + Number(quantity || 0) } : p)),
        );
        try {
          const { data } = await queryFulfilled;
          const fresh = data?.product;
          if (fresh) patchProductLists(dispatch, getState, (list) => list.map((p) => (p._id === id ? fresh : p)));
        } catch {
          undoAll(patches);
        }
      },
      invalidatesTags: (_r, _e, { id }) => [{ type: "Product", id }],
    }),

    // ── Recommendations (cached per product / type) ──
    getRecommendations: build.query({
      query: ({ productId, limit = 6 }) => ({ url: `/api/products/${productId}/recommendations`, params: { limit } }),
      transformResponse: toList,
      providesTags: (_r, _e, { productId }) => [{ type: "Recommendation", id: productId }],
    }),
    getBoughtTogether: build.query({
      query: ({ productId, limit = 4 }) => ({ url: `/api/products/${productId}/bought-together`, params: { limit } }),
      transformResponse: toList,
      providesTags: (_r, _e, { productId }) => [{ type: "Recommendation", id: productId }],
    }),
    getPopularProducts: build.query({
      query: ({ limit = 6 } = {}) => ({ url: "/api/products/popular/list", params: { limit } }),
      transformResponse: toList,
      providesTags: [{ type: "Recommendation", id: "popular" }],
    }),
    getTrendingProducts: build.query({
      query: ({ limit = 6, days = 7 } = {}) => ({ url: "/api/products/trending/list", params: { limit, days } }),
      transformResponse: toList,
      providesTags: [{ type: "Recommendation", id: "trending" }],
    }),

    notifyBackInStock: build.mutation({
      query: ({ id, email }) => ({ url: `/api/products/${id}/notify`, method: "post", data: { email } }),
    }),
  }),
});

export const {
  useGetProductsQuery,
  useProductFeedInfiniteQuery,
  useGetProductQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useRestockProductMutation,
  useGetRecommendationsQuery,
  useGetBoughtTogetherQuery,
  useGetPopularProductsQuery,
  useGetTrendingProductsQuery,
  useNotifyBackInStockMutation,
} = productsApi;
