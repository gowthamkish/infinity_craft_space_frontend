/**
 * RTK Query base API.
 *
 * Every endpoint in /services is injected into this one `baseApi`, so there is a
 * single cache, a single middleware and a single reducer slice (`state.api`).
 *
 * The base query delegates to the existing axios instance (api/axios.js) on purpose:
 * its interceptors already handle CSRF tokens, the Bearer fallback for iOS Safari,
 * 401 → refresh-token → retry, and 429/413 messaging. RTK Query adds caching,
 * request de-duplication, tag invalidation, polling and streaming on top.
 */
import { createApi } from "@reduxjs/toolkit/query/react";
import api from "../api/axios";

const axiosBaseQuery =
  () =>
  async (args, { signal }) => {
    // Endpoints may return a bare URL string (`query: () => "/api/orders"`) or an options object.
    const { url, method = "get", data, params, headers } = typeof args === "string" ? { url: args } : args;
    try {
      const res = await api({ url, method, data, params, headers, signal });
      return { data: res.data };
    } catch (err) {
      return {
        error: {
          status: err.response?.status ?? (err.code === "ERR_CANCELED" ? "CANCELED" : "FETCH_ERROR"),
          data: err.response?.data,
          message:
            err.response?.data?.error ||
            err.response?.data?.message ||
            err.message ||
            "Request failed",
        },
      };
    }
  };

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery(),
  tagTypes: [
    "Product",
    "Category",
    "Review",
    "Order",
    "User",
    "Wishlist",
    "Address",
    "Profile",
    "Notification",
    "Dashboard",
    "Analytics",
    "Qna",
    "Recommendation",
  ],
  // Keep unused data 5 min so navigating back is instant.
  keepUnusedDataFor: 300,
  // Window-focus / reconnect refetching is OPT-IN per query (live data only),
  // because the backend rate-limits to 100 requests / 15 min / IP.
  refetchOnFocus: false,
  refetchOnReconnect: true,
  endpoints: () => ({}),
});

/** Human-readable message from a baseQuery error (what `.unwrap()` throws). */
export const errMsg = (err, fallback = "Something went wrong") =>
  err?.data?.error || err?.data?.message || err?.message || fallback;

/**
 * Apply `recipe` to EVERY cached entry of `endpointName` (all arg variants) —
 * the building block for optimistic updates across list/filter/page variants.
 * Returns the patch results; call `undoAll(patches)` to roll back on failure.
 */
export const patchAllCached = (dispatch, getState, endpointName, recipe) => {
  const patches = [];
  for (const arg of baseApi.util.selectCachedArgsForQuery(getState(), endpointName)) {
    patches.push(dispatch(baseApi.util.updateQueryData(endpointName, arg, recipe)));
  }
  return patches;
};

export const undoAll = (patches) => patches.forEach((p) => p.undo());
