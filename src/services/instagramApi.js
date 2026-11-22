import { baseApi } from "../app/baseApi";

const LIST = { type: "Instagram", id: "LIST" };

export const instagramApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Public: the home-page feed with tagged products
    getInstagramFeed: build.query({
      query: (limit = 6) => `/api/instagram?limit=${limit}`,
      transformResponse: (r) => r.posts || [],
      providesTags: [LIST],
      keepUnusedDataFor: 300,
    }),

    // Admin
    getAdminInstagramPosts: build.query({
      query: () => "/api/instagram/admin/all",
      transformResponse: (r) => r.posts || [],
      providesTags: [LIST],
    }),
    createInstagramPost: build.mutation({
      query: (body) => ({ url: "/api/instagram", method: "post", data: body }),
      invalidatesTags: [LIST],
    }),
    updateInstagramPost: build.mutation({
      query: ({ id, ...body }) => ({ url: `/api/instagram/${id}`, method: "put", data: body }),
      invalidatesTags: [LIST],
    }),
    deleteInstagramPost: build.mutation({
      query: (id) => ({ url: `/api/instagram/${id}`, method: "delete" }),
      invalidatesTags: [LIST],
    }),
    searchInstagramProducts: build.query({
      query: (q) => `/api/instagram/admin/products?q=${encodeURIComponent(q)}`,
      transformResponse: (r) => r.products || [],
      keepUnusedDataFor: 60,
    }),
    uploadInstagramImage: build.mutation({
      query: (image) => ({ url: "/api/instagram/upload-image", method: "post", data: { image } }),
      transformResponse: (r) => r.image,
    }),
  }),
});

export const {
  useGetInstagramFeedQuery,
  useGetAdminInstagramPostsQuery,
  useCreateInstagramPostMutation,
  useUpdateInstagramPostMutation,
  useDeleteInstagramPostMutation,
  useUploadInstagramImageMutation,
  useSearchInstagramProductsQuery,
} = instagramApi;
