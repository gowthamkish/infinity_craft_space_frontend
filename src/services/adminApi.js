import { baseApi, patchAllCached, undoAll } from "../app/baseApi";

const ORDER_LIST = { type: "Order", id: "LIST" };

export const adminApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // KPI counters — invalidated automatically by product/order changes
    getDashboardCounts: build.query({
      query: () => "/api/admin/dashboard",
      transformResponse: (r) => ({
        userCount: r.userCount || 0,
        productCount: r.productCount || 0,
        orderCount: r.orderCount || 0,
      }),
      providesTags: ["Dashboard"],
    }),

    getUsers: build.query({
      query: ({ page = 1, limit = 50, search = "" } = {}) => ({
        url: "/api/admin/users",
        params: { page, limit, ...(search ? { search } : {}) },
      }),
      transformResponse: (r) => ({
        users: r.users || (Array.isArray(r) ? r : []),
        pagination: r.pagination || { total: 0, page: 1, limit: 50, totalPages: 1 },
      }),
      providesTags: (r) => [
        ...(r?.users || []).map((u) => ({ type: "User", id: u._id })),
        { type: "User", id: "LIST" },
      ],
    }),

    // Optimistic: the role chip flips immediately; rolled back if the server refuses.
    updateUserRole: build.mutation({
      query: ({ userId, isAdmin }) => ({
        url: `/api/admin/users/${userId}/role`,
        method: "put",
        data: { isAdmin },
      }),
      async onQueryStarted({ userId, isAdmin }, { dispatch, getState, queryFulfilled }) {
        const patches = patchAllCached(dispatch, getState, "getUsers", (draft) => {
          const u = draft.users.find((x) => x._id === userId);
          if (u) u.isAdmin = isAdmin;
        });
        try {
          const { data } = await queryFulfilled;
          if (data?.user) {
            patchAllCached(dispatch, getState, "getUsers", (draft) => {
              const i = draft.users.findIndex((x) => x._id === data.user._id);
              if (i !== -1) draft.users[i] = data.user;
            });
          }
        } catch {
          undoAll(patches);
        }
      },
    }),

    updateUser: build.mutation({
      query: ({ userId, ...body }) => ({ url: `/api/admin/users/${userId}`, method: "patch", data: body }),
      invalidatesTags: (_r, _e, { userId }) => [{ type: "User", id: userId }],
    }),

    // Optimistic removal (no more full-page reload); counters refresh via the Dashboard tag.
    deleteUser: build.mutation({
      query: (userId) => ({ url: `/api/admin/users/${userId}`, method: "delete" }),
      async onQueryStarted(userId, { dispatch, getState, queryFulfilled }) {
        const patches = patchAllCached(dispatch, getState, "getUsers", (draft) => {
          draft.users = draft.users.filter((u) => u._id !== userId);
        });
        try {
          await queryFulfilled;
        } catch {
          undoAll(patches);
        }
      },
      invalidatesTags: [{ type: "User", id: "LIST" }, "Dashboard"],
    }),

    // All orders (admin). Polled by the page that shows it.
    getAdminOrders: build.query({
      query: () => "/api/admin/orders",
      transformResponse: (r) => ({ orders: Array.isArray(r) ? r : r.orders || [] }),
      providesTags: (r) => [
        ...(r?.orders || []).map((o) => ({ type: "Order", id: o._id })),
        ORDER_LIST,
      ],
    }),

    // Optimistic status change; also invalidates the customer-facing orders + counters.
    updateOrderStatus: build.mutation({
      query: ({ orderId, status, ...rest }) => ({
        url: `/api/orders/${orderId}/status`,
        method: "put",
        data: { status, ...rest },
      }),
      async onQueryStarted({ orderId, status }, { dispatch, getState, queryFulfilled }) {
        const patches = patchAllCached(dispatch, getState, "getAdminOrders", (draft) => {
          const o = draft.orders.find((x) => x._id === orderId);
          if (o) o.status = status;
        });
        try {
          const { data } = await queryFulfilled;
          const fresh = data?.order || data;
          if (fresh?._id) {
            patchAllCached(dispatch, getState, "getAdminOrders", (draft) => {
              const i = draft.orders.findIndex((x) => x._id === fresh._id);
              if (i !== -1) draft.orders[i] = fresh;
            });
          }
        } catch {
          undoAll(patches);
        }
      },
      invalidatesTags: (_r, _e, { orderId }) => [{ type: "Order", id: orderId }, "Dashboard", "Analytics", "Notification"],
    }),

    getAnalyticsSummary: build.query({
      query: (period = "30") => `/api/admin/analytics/summary?period=${period}`,
      providesTags: ["Analytics"],
    }),
    getAnalyticsCharts: build.query({
      query: (period = "30") => `/api/admin/analytics/charts?period=${period}`,
      providesTags: ["Analytics"],
    }),
    getPredictions: build.query({
      query: () => "/api/admin/predictions",
      providesTags: ["Analytics"],
    }),

    // ── Notifications ──
    getNotifications: build.query({
      query: () => "/api/admin/notifications",
      transformResponse: (r) => r.notifications || [],
      providesTags: [{ type: "Notification", id: "LIST" }],
    }),
    // Header badge — polled every 30s by the Header
    getUnreadCount: build.query({
      query: () => "/api/admin/notifications/unread-count",
      transformResponse: (r) => r.unreadCount || 0,
      providesTags: [{ type: "Notification", id: "COUNT" }],
    }),

    // Optimistic: row turns "read" and the badge drops at once.
    markNotificationRead: build.mutation({
      query: (id) => ({ url: `/api/admin/notifications/${id}/read`, method: "put", data: {} }),
      async onQueryStarted(id, { dispatch, getState, queryFulfilled }) {
        let wasUnread = false;
        const list = patchAllCached(dispatch, getState, "getNotifications", (draft) => {
          const n = draft.find((x) => x._id === id);
          if (n && !n.read) {
            wasUnread = true;
            n.read = true;
          }
        });
        const count = patchAllCached(dispatch, getState, "getUnreadCount", (draft) =>
          wasUnread ? Math.max(0, draft - 1) : draft,
        );
        try {
          await queryFulfilled;
        } catch {
          undoAll([...list, ...count]);
        }
      },
    }),

    markAllNotificationsRead: build.mutation({
      async queryFn(ids, _api, _extra, baseQuery) {
        const results = await Promise.all(
          ids.map((id) => baseQuery({ url: `/api/admin/notifications/${id}/read`, method: "put", data: {} })),
        );
        const failed = results.find((r) => r.error);
        return failed ? { error: failed.error } : { data: { updated: ids.length } };
      },
      async onQueryStarted(_ids, { dispatch, getState, queryFulfilled }) {
        const list = patchAllCached(dispatch, getState, "getNotifications", (draft) => {
          draft.forEach((n) => {
            n.read = true;
          });
        });
        const count = patchAllCached(dispatch, getState, "getUnreadCount", () => 0);
        try {
          await queryFulfilled;
        } catch {
          undoAll([...list, ...count]);
        }
      },
      invalidatesTags: [{ type: "Notification", id: "COUNT" }],
    }),
  }),
});

export const {
  useGetDashboardCountsQuery,
  useGetUsersQuery,
  useUpdateUserRoleMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetAdminOrdersQuery,
  useUpdateOrderStatusMutation,
  useGetAnalyticsSummaryQuery,
  useGetAnalyticsChartsQuery,
  useGetPredictionsQuery,
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} = adminApi;
