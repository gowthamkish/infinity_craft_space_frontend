import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

// Fetch dashboard counts
export const fetchDashboardCounts = createAsyncThunk(
  "admin/fetchDashboardCounts",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/api/admin/dashboard");
      return {
        userCount: res.data.userCount || 0,
        productCount: res.data.productCount || 0,
        orderCount: res.data.orderCount || 0,
      };
    } catch (error) {
      console.error("Dashboard counts error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch dashboard data",
      );
    }
  },
);

// Fetch paginated users list
export const fetchUsers = createAsyncThunk(
  "admin/fetchUsers",
  async ({ page = 1, limit = 50, search = "" } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ page, limit });
      if (search) params.set("search", search);
      const res = await api.get(`/api/admin/users?${params}`);
      return res.data; // { success, users, pagination }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch users",
      );
    }
  },
);

// Fetch fast analytics summary (KPI cards + recent orders, ~100ms)
export const fetchAnalyticsSummary = createAsyncThunk(
  "admin/fetchAnalyticsSummary",
  async (period = "30", { rejectWithValue }) => {
    try {
      const res = await api.get(`/api/admin/analytics/summary?period=${period}`);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch analytics summary",
      );
    }
  },
);

// Fetch heavy analytics charts (aggregation pipelines, cached 5 min)
export const fetchAnalyticsCharts = createAsyncThunk(
  "admin/fetchAnalyticsCharts",
  async (period = "30", { rejectWithValue }) => {
    try {
      const res = await api.get(`/api/admin/analytics/charts?period=${period}`);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch analytics charts",
      );
    }
  },
);

// Fetch orders list (admin - all orders)
export const fetchOrders = createAsyncThunk(
  "admin/fetchOrders",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/api/admin/orders");
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch orders",
      );
    }
  },
);

// Update order status
export const updateOrderStatus = createAsyncThunk(
  "admin/updateOrderStatus",
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/api/orders/${orderId}/status`, { status });
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update order status",
      );
    }
  },
);

// Update user role (make admin/user)
export const updateUserRole = createAsyncThunk(
  "admin/updateUserRole",
  async ({ userId, isAdmin }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/api/admin/users/${userId}/role`, { isAdmin });
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update user role",
      );
    }
  },
);

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    // Dashboard counts
    dashboardCounts: {
      userCount: 0,
      productCount: 0,
      orderCount: 0,
    },
    dashboardLoading: false,
    dashboardError: null,
    dashboardLastFetched: null,
    dashboardIsStale: true,

    // Users data (paginated)
    users: [],
    usersPagination: { total: 0, page: 1, limit: 50, totalPages: 1 },
    usersLoading: false,
    usersError: null,
    usersLastFetched: null,
    usersIsStale: true,

    // Orders data
    orders: { orders: [] },
    ordersLoading: false,
    ordersError: null,
    ordersLastFetched: null,
    ordersIsStale: true,

    // Analytics — split into fast summary and heavy charts
    analyticsSummary: null,
    analyticsSummaryLoading: false,
    analyticsSummaryError: null,
    analyticsCharts: null,
    analyticsChartsLoading: false,
    analyticsChartsError: null,
  },
  reducers: {
    clearDashboardError: (state) => {
      state.dashboardError = null;
    },
    clearUsersError: (state) => {
      state.usersError = null;
    },
    clearOrdersError: (state) => {
      state.ordersError = null;
    },
    markDashboardAsStale: (state) => {
      state.dashboardIsStale = true;
    },
    markUsersAsStale: (state) => {
      state.usersIsStale = true;
    },
    markOrdersAsStale: (state) => {
      state.ordersIsStale = true;
    },
    clearAdminData: (state) => {
      state.dashboardCounts = { userCount: 0, productCount: 0, orderCount: 0 };
      state.users = [];
      state.orders = { orders: [] };
      state.dashboardLastFetched = null;
      state.usersLastFetched = null;
      state.ordersLastFetched = null;
      state.dashboardIsStale = true;
      state.usersIsStale = true;
      state.ordersIsStale = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Dashboard counts
      .addCase(fetchDashboardCounts.pending, (state) => {
        state.dashboardLoading = true;
        state.dashboardError = null;
      })
      .addCase(fetchDashboardCounts.fulfilled, (state, action) => {
        state.dashboardCounts = action.payload;
        state.dashboardLoading = false;
        state.dashboardError = null;
        state.dashboardLastFetched = Date.now();
        state.dashboardIsStale = false;
      })
      .addCase(fetchDashboardCounts.rejected, (state, action) => {
        state.dashboardLoading = false;
        state.dashboardError = action.payload;
      })
      // Users (paginated)
      .addCase(fetchUsers.pending, (state) => {
        state.usersLoading = true;
        state.usersError = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        // Server returns { success, users, pagination }
        state.users = action.payload.users || action.payload;
        state.usersPagination = action.payload.pagination || state.usersPagination;
        state.usersLoading = false;
        state.usersError = null;
        state.usersLastFetched = Date.now();
        state.usersIsStale = false;
        // Sync total user count to dashboard
        if (action.payload.pagination?.total != null) {
          state.dashboardCounts.userCount = action.payload.pagination.total;
        }
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.usersLoading = false;
        state.usersError = action.payload;
      })
      // Analytics summary (fast)
      .addCase(fetchAnalyticsSummary.pending, (state) => {
        state.analyticsSummaryLoading = true;
        state.analyticsSummaryError = null;
      })
      .addCase(fetchAnalyticsSummary.fulfilled, (state, action) => {
        state.analyticsSummary = action.payload;
        state.analyticsSummaryLoading = false;
      })
      .addCase(fetchAnalyticsSummary.rejected, (state, action) => {
        state.analyticsSummaryLoading = false;
        state.analyticsSummaryError = action.payload;
      })
      // Analytics charts (heavy, lazy-loaded)
      .addCase(fetchAnalyticsCharts.pending, (state) => {
        state.analyticsChartsLoading = true;
        state.analyticsChartsError = null;
      })
      .addCase(fetchAnalyticsCharts.fulfilled, (state, action) => {
        state.analyticsCharts = action.payload;
        state.analyticsChartsLoading = false;
      })
      .addCase(fetchAnalyticsCharts.rejected, (state, action) => {
        state.analyticsChartsLoading = false;
        state.analyticsChartsError = action.payload;
      })
      // Orders
      .addCase(fetchOrders.pending, (state) => {
        state.ordersLoading = true;
        state.ordersError = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        // Handle both array and object responses
        const ordersData = Array.isArray(action.payload)
          ? action.payload
          : action.payload.orders || [];
        state.orders = { orders: ordersData };
        state.ordersLoading = false;
        state.ordersError = null;
        state.ordersLastFetched = Date.now();
        state.ordersIsStale = false;
        // Update order count in dashboard
        state.dashboardCounts.orderCount = ordersData.length;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.ordersLoading = false;
        state.ordersError = action.payload;
      })
      // Update order status
      .addCase(updateOrderStatus.pending, (state) => {
        state.ordersLoading = true;
        state.ordersError = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const updatedOrder = action.payload;
        // Ensure orders is properly structured
        if (!state.orders.orders) {
          state.orders = { orders: [] };
        }

        // Find and update the order
        const orderToUpdate = updatedOrder.order || updatedOrder;
        const index = state.orders.orders.findIndex(
          (order) => order._id === orderToUpdate._id,
        );
        if (index !== -1) {
          state.orders.orders[index] = orderToUpdate;
        }
        state.ordersLoading = false;
        state.ordersError = null;
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.ordersLoading = false;
        state.ordersError = action.payload;
      })
      // Update user role
      .addCase(updateUserRole.pending, (state) => {
        state.usersLoading = true;
        state.usersError = null;
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const updatedUser = action.payload.user;
        // Find and update the user in the users array
        const index = state.users.findIndex(
          (user) => user._id === updatedUser._id,
        );
        if (index !== -1) {
          state.users[index] = updatedUser;
        }
        state.usersLoading = false;
        state.usersError = null;
      })
      .addCase(updateUserRole.rejected, (state, action) => {
        state.usersLoading = false;
        state.usersError = action.payload;
      });
  },
});

export const {
  clearDashboardError,
  clearUsersError,
  clearOrdersError,
  markDashboardAsStale,
  markUsersAsStale,
  markOrdersAsStale,
  clearAdminData,
} = adminSlice.actions;

export default adminSlice.reducer;
