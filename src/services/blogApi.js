import { baseApi } from "../app/baseApi";

const LIST = { type: "Blog", id: "LIST" };

export const blogApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // ── Public ──
    getBlogPosts: build.query({
      query: ({ page = 1, tag = "", limit = 9 } = {}) =>
        `/api/blog?page=${page}&limit=${limit}${tag ? `&tag=${encodeURIComponent(tag)}` : ""}`,
      providesTags: [LIST],
      keepUnusedDataFor: 120,
    }),
    getBlogTags: build.query({
      query: () => "/api/blog/tags",
      transformResponse: (r) => r.tags || [],
      providesTags: [LIST],
      keepUnusedDataFor: 300,
    }),
    getBlogPost: build.query({
      query: (slug) => `/api/blog/${encodeURIComponent(slug)}`,
      providesTags: (_r, _e, slug) => [{ type: "Blog", id: slug }],
    }),

    // ── Admin ──
    getAdminBlogPosts: build.query({
      query: () => "/api/blog/admin/all",
      transformResponse: (r) => r.posts || [],
      providesTags: [LIST],
    }),
    getAdminBlogPost: build.query({
      query: (id) => `/api/blog/admin/${id}`,
      transformResponse: (r) => r.post,
      providesTags: (_r, _e, id) => [{ type: "Blog", id }],
    }),
    createBlogPost: build.mutation({
      query: (body) => ({ url: "/api/blog", method: "post", data: body }),
      transformResponse: (r) => r.post,
      invalidatesTags: [LIST],
    }),
    updateBlogPost: build.mutation({
      query: ({ id, ...body }) => ({ url: `/api/blog/${id}`, method: "put", data: body }),
      transformResponse: (r) => r.post,
      invalidatesTags: (_r, _e, { id }) => [LIST, { type: "Blog", id }],
    }),
    deleteBlogPost: build.mutation({
      query: (id) => ({ url: `/api/blog/${id}`, method: "delete" }),
      invalidatesTags: [LIST],
    }),
    // ── Blog agent ──
    getBlogAgentConfig: build.query({
      query: () => "/api/blog-agent/config",
      transformResponse: (r) => r.config,
      providesTags: [{ type: "Blog", id: "AGENT" }],
    }),
    updateBlogAgentConfig: build.mutation({
      query: (body) => ({ url: "/api/blog-agent/config", method: "put", data: body }),
      transformResponse: (r) => r.config,
      invalidatesTags: [{ type: "Blog", id: "AGENT" }],
    }),
    runBlogAgent: build.mutation({
      query: () => ({ url: "/api/blog-agent/run", method: "post" }),
      invalidatesTags: [{ type: "Blog", id: "AGENT" }, { type: "Blog", id: "AGENT_RUNS" }],
    }),
    getBlogAgentRuns: build.query({
      query: () => "/api/blog-agent/runs",
      transformResponse: (r) => r.runs || [],
      providesTags: [{ type: "Blog", id: "AGENT_RUNS" }],
    }),
    uploadBlogImage: build.mutation({
      query: (image) => ({ url: "/api/blog/upload-image", method: "post", data: { image } }),
      transformResponse: (r) => r.image,
    }),
  }),
});

export const {
  useGetBlogPostsQuery,
  useGetBlogTagsQuery,
  useGetBlogPostQuery,
  useGetAdminBlogPostsQuery,
  useGetAdminBlogPostQuery,
  useCreateBlogPostMutation,
  useUpdateBlogPostMutation,
  useDeleteBlogPostMutation,
  useUploadBlogImageMutation,
  useGetBlogAgentConfigQuery,
  useUpdateBlogAgentConfigMutation,
  useRunBlogAgentMutation,
  useGetBlogAgentRunsQuery,
} = blogApi;
