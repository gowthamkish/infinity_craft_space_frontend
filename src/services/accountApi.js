import { baseApi, patchAllCached, undoAll } from "../app/baseApi";

const WISHLIST = { type: "Wishlist", id: "LIST" };
const ADDRESSES = { type: "Address", id: "LIST" };

const idOf = (item) => (typeof item === "object" ? item?._id : item);

export const accountApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getProfile: build.query({
      query: () => "/api/auth/profile",
      transformResponse: (r) => r.user || r,
      providesTags: [{ type: "Profile", id: "ME" }],
    }),

    // ── Wishlist (single source of truth for hearts on Home / Listing / Detail / Account) ──
    getWishlist: build.query({
      query: () => "/api/auth/wishlist",
      transformResponse: (r) => r.wishlist || [],
      providesTags: [WISHLIST],
    }),

    // Optimistic: the heart fills instantly; rolled back on failure.
    addToWishlist: build.mutation({
      query: ({ product }) => ({
        url: "/api/auth/wishlist",
        method: "post",
        data: { productId: idOf(product) },
      }),
      async onQueryStarted({ product }, { dispatch, getState, queryFulfilled }) {
        const patches = patchAllCached(dispatch, getState, "getWishlist", (draft) => {
          if (!draft.some((p) => idOf(p) === idOf(product))) draft.push(product);
        });
        try {
          await queryFulfilled;
        } catch {
          undoAll(patches);
        }
      },
      invalidatesTags: [WISHLIST],
    }),

    removeFromWishlist: build.mutation({
      query: (productId) => ({ url: `/api/auth/wishlist/${productId}`, method: "delete" }),
      async onQueryStarted(productId, { dispatch, getState, queryFulfilled }) {
        const patches = patchAllCached(dispatch, getState, "getWishlist", (draft) =>
          draft.filter((p) => idOf(p) !== productId),
        );
        try {
          await queryFulfilled;
        } catch {
          undoAll(patches);
        }
      },
      invalidatesTags: [WISHLIST],
    }),

    // ── Addresses ──
    getAddresses: build.query({
      query: () => "/api/auth/addresses",
      transformResponse: (r) => r.addresses || [],
      providesTags: [ADDRESSES],
    }),
    addAddress: build.mutation({
      query: (body) => ({ url: "/api/auth/addresses", method: "post", data: body }),
      transformResponse: (r) => r.addresses || [],
      invalidatesTags: [ADDRESSES],
    }),
    updateAddress: build.mutation({
      query: ({ id, ...body }) => ({ url: `/api/auth/addresses/${id}`, method: "put", data: body }),
      invalidatesTags: [ADDRESSES],
    }),
    setDefaultAddress: build.mutation({
      query: (id) => ({ url: `/api/auth/addresses/${id}/default`, method: "post" }),
      async onQueryStarted(id, { dispatch, getState, queryFulfilled }) {
        const patches = patchAllCached(dispatch, getState, "getAddresses", (draft) => {
          draft.forEach((a) => {
            a.isDefault = a._id === id;
          });
        });
        try {
          await queryFulfilled;
        } catch {
          undoAll(patches);
        }
      },
      invalidatesTags: [ADDRESSES],
    }),
    deleteAddress: build.mutation({
      query: (id) => ({ url: `/api/auth/addresses/${id}`, method: "delete" }),
      transformResponse: (r) => r.addresses || [],
      async onQueryStarted(id, { dispatch, getState, queryFulfilled }) {
        const patches = patchAllCached(dispatch, getState, "getAddresses", (draft) =>
          draft.filter((a) => a._id !== id),
        );
        try {
          await queryFulfilled;
        } catch {
          undoAll(patches);
        }
      },
      invalidatesTags: [ADDRESSES],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useGetAddressesQuery,
  useAddAddressMutation,
  useUpdateAddressMutation,
  useSetDefaultAddressMutation,
  useDeleteAddressMutation,
} = accountApi;
