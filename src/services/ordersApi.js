import { baseApi, patchAllCached } from "../app/baseApi";

export const ordersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Customer's orders. Polled (as a fallback) + refetched on window focus by its consumers.
    getMyOrders: build.query({
      query: () => "/api/orders",
      transformResponse: (r) => (r?.success && Array.isArray(r.orders) ? r.orders : []),
      providesTags: (orders) => [
        ...(orders || []).map((o) => ({ type: "Order", id: o._id })),
        { type: "Order", id: "MINE" },
      ],
    }),

    // Optimistic: the order shows as cancelled immediately; rolled back if the server refuses.
    cancelOrder: build.mutation({
      query: (orderId) => ({ url: `/api/shipping/cancel/${orderId}`, method: "post" }),
      async onQueryStarted(orderId, { dispatch, getState, queryFulfilled }) {
        const patches = patchAllCached(dispatch, getState, "getMyOrders", (draft) => {
          const o = draft.find((x) => String(x._id) === String(orderId));
          if (o) o.status = "cancelled";
        });
        try {
          await queryFulfilled;
        } catch {
          patches.forEach((p) => p.undo());
        }
      },
      // Also refreshes the admin order list, dashboard counters and product stock
      invalidatesTags: (_r, _e, orderId) => [{ type: "Order", id: orderId }, "Dashboard", "Product"],
    }),

    /**
     * STREAMING: real-time order updates over Server-Sent Events.
     *
     * The cache entry's data is just connection state + the latest event; the real
     * work happens in onCacheEntryAdded, which opens an EventSource for as long as
     * at least one component subscribes, and closes it when the last one unmounts.
     * Each ORDER_UPDATE is also written straight into the cached `getMyOrders` list,
     * so every screen showing orders updates without any refetch.
     */
    streamOrderEvents: build.query({
      queryFn: () => ({ data: { status: "connecting", lastEvent: null } }),
      keepUnusedDataFor: 5,
      async onCacheEntryAdded(_arg, { cacheDataLoaded, cacheEntryRemoved, updateCachedData, dispatch, getState }) {
        if (typeof EventSource === "undefined") return;
        try {
          await cacheDataLoaded;
        } catch {
          return; // cache entry was removed before the first value
        }

        const baseURL = import.meta.env.VITE_API_URL || "";
        let es = null;
        let retryTimer = null;
        let retryDelay = 2000;
        let closed = false;

        const setStatus = (status) => {
          if (!closed) updateCachedData((d) => { d.status = status; });
        };

        const applyToOrdersCache = (order) =>
          patchAllCached(dispatch, getState, "getMyOrders", (draft) => {
            const i = draft.findIndex((o) => String(o._id) === String(order._id));
            if (i !== -1) Object.assign(draft[i], order);
            else draft.unshift(order);
          });

        const connect = () => {
          if (closed) return;
          es = new EventSource(`${baseURL}/api/sse/stream`, { withCredentials: true });

          es.addEventListener("open", () => {
            retryDelay = 2000; // reset backoff
            setStatus("open");
          });

          es.addEventListener("ORDER_UPDATE", (e) => {
            let payload;
            try {
              payload = JSON.parse(e.data);
            } catch {
              return;
            }
            const { order, previousStatus } = payload || {};
            if (!order?._id || !order.status || closed) return;
            applyToOrdersCache(order);
            updateCachedData((d) => {
              d.lastEvent = { order, previousStatus: previousStatus ?? null, receivedAt: Date.now() };
            });
          });

          es.onerror = () => {
            es.close();
            setStatus("reconnecting");
            if (!closed) {
              retryTimer = setTimeout(() => {
                retryDelay = Math.min(retryDelay * 2, 30000); // exponential backoff, capped at 30s
                connect();
              }, retryDelay);
            }
          };
        };

        connect();

        await cacheEntryRemoved; // last subscriber gone → tear down
        closed = true;
        clearTimeout(retryTimer);
        if (es) es.close();
      },
    }),
  }),
});

export const { useGetMyOrdersQuery, useCancelOrderMutation, useStreamOrderEventsQuery } = ordersApi;
