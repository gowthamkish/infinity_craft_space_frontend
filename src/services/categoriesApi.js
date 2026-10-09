import { baseApi, patchAllCached, undoAll } from "../app/baseApi";

const CAT_LIST = { type: "Category", id: "LIST" };

// Replace one category in every cached admin list with the server's version.
const upsertCategory = (dispatch, getState, category) =>
  patchAllCached(dispatch, getState, "getCategories", (draft) => {
    const i = draft.findIndex((c) => c._id === category._id);
    if (i !== -1) draft[i] = category;
  });

export const categoriesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Public list (product filters). Rarely changes → long cache.
    getPublicCategories: build.query({
      query: () => "/api/categories/public/list",
      transformResponse: (r) => r.categories || [],
      providesTags: [CAT_LIST],
      keepUnusedDataFor: 900,
    }),

    // Admin list (optionally including inactive)
    getCategories: build.query({
      query: ({ includeInactive = false } = {}) => `/api/categories?includeInactive=${includeInactive}`,
      transformResponse: (r) => r.categories || [],
      providesTags: [CAT_LIST],
    }),

    createCategory: build.mutation({
      query: (body) => ({ url: "/api/categories", method: "post", data: body }),
      transformResponse: (r) => r.category,
      invalidatesTags: [CAT_LIST],
    }),

    updateCategory: build.mutation({
      query: ({ id, ...body }) => ({ url: `/api/categories/${id}`, method: "put", data: body }),
      transformResponse: (r) => r.category,
      async onQueryStarted({ id, ...changes }, { dispatch, getState, queryFulfilled }) {
        const patches = patchAllCached(dispatch, getState, "getCategories", (draft) => {
          const c = draft.find((x) => x._id === id);
          if (c) Object.assign(c, changes);
        });
        try {
          await queryFulfilled;
        } catch {
          undoAll(patches);
        }
      },
      invalidatesTags: [CAT_LIST],
    }),

    // Soft delete → optimistic isActive=false
    deleteCategory: build.mutation({
      query: (id) => ({ url: `/api/categories/${id}`, method: "delete" }),
      async onQueryStarted(id, { dispatch, getState, queryFulfilled }) {
        const patches = patchAllCached(dispatch, getState, "getCategories", (draft) => {
          const c = draft.find((x) => x._id === id);
          if (c) c.isActive = false;
        });
        try {
          await queryFulfilled;
        } catch {
          undoAll(patches);
        }
      },
      invalidatesTags: [CAT_LIST],
    }),

    addSubcategory: build.mutation({
      query: ({ categoryId, subcategoryData }) => ({
        url: `/api/categories/${categoryId}/subcategories`,
        method: "post",
        data: subcategoryData,
      }),
      transformResponse: (r) => r.category,
      async onQueryStarted(_arg, { dispatch, getState, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) upsertCategory(dispatch, getState, data);
        } catch { /* nothing was applied */ }
      },
      invalidatesTags: [CAT_LIST],
    }),

    updateSubcategory: build.mutation({
      query: ({ categoryId, subcategoryId, subcategoryData }) => ({
        url: `/api/categories/${categoryId}/subcategories/${subcategoryId}`,
        method: "put",
        data: subcategoryData,
      }),
      transformResponse: (r) => r.category,
      async onQueryStarted(_arg, { dispatch, getState, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) upsertCategory(dispatch, getState, data);
        } catch { /* nothing was applied */ }
      },
      invalidatesTags: [CAT_LIST],
    }),

    deleteSubcategory: build.mutation({
      query: ({ categoryId, subcategoryId }) => ({
        url: `/api/categories/${categoryId}/subcategories/${subcategoryId}`,
        method: "delete",
      }),
      async onQueryStarted({ categoryId, subcategoryId }, { dispatch, getState, queryFulfilled }) {
        const patches = patchAllCached(dispatch, getState, "getCategories", (draft) => {
          const c = draft.find((x) => x._id === categoryId);
          if (c) c.subcategories = (c.subcategories || []).filter((s) => s._id !== subcategoryId);
        });
        try {
          await queryFulfilled;
        } catch {
          undoAll(patches);
        }
      },
      invalidatesTags: [CAT_LIST],
    }),
  }),
});

export const {
  useGetPublicCategoriesQuery,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useAddSubcategoryMutation,
  useUpdateSubcategoryMutation,
  useDeleteSubcategoryMutation,
} = categoriesApi;
