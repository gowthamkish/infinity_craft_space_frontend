import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

// Fetch dashboard counts
export const fetchDashboardCounts = createAsyncThunk(
  'admin/fetchDashboardCounts',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      
      // Use the dedicated dashboard endpoint
      const res = await api.get("/api/admin/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return {
        userCount: res.data.userCount || 0,
        productCount: res.data.productCount || 0,
        orderCount: res.data.orderCount || 0
      };
    } catch (error) {
      console.error("Dashboard counts error:", error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard data');
    }
  }
);

// Fetch users list
export const fetchUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  }
);

// Fetch orders list
export const fetchOrders = createAsyncThunk(
  'admin/fetchOrders',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

// Update order status
export const updateOrderStatus = createAsyncThunk(
  'admin/updateOrderStatus',
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.put(`/api/orders/${orderId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update order status');
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    // Dashboard counts
    dashboardCounts: {
      userCount: 0,
      productCount: 0,
      orderCount: 0
    },
    dashboardLoading: false,
    dashboardError: null,
    dashboardLastFetched: null,
    dashboardIsStale: true,
    
    // Users data
    users: [],
    usersLoading: false,
    usersError: null,
    usersLastFetched: null,
    usersIsStale: true,
    
    // Orders data
    orders: { orders: [] },
    ordersLoading: false,
    ordersError: null,
    ordersLastFetched: null,
    ordersIsStale: true
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
    }
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
      // Users
      .addCase(fetchUsers.pending, (state) => {
        state.usersLoading = true;
        state.usersError = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = action.payload;
        state.usersLoading = false;
        state.usersError = null;
        state.usersLastFetched = Date.now();
        state.usersIsStale = false;
        // Update user count in dashboard
        state.dashboardCounts.userCount = action.payload.length;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.usersLoading = false;
        state.usersError = action.payload;
      })
      // Orders
      .addCase(fetchOrders.pending, (state) => {
        state.ordersLoading = true;
        state.ordersError = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        // Handle both array and object responses
        const ordersData = Array.isArray(action.payload) ? action.payload : action.payload.orders || [];
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
        const index = state.orders.orders.findIndex(order => order._id === orderToUpdate._id);
        if (index !== -1) {
          state.orders.orders[index] = orderToUpdate;
        }
        state.ordersLoading = false;
        state.ordersError = null;
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.ordersLoading = false;
        state.ordersError = action.payload;
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
  clearAdminData 
} = adminSlice.actions;

export default adminSlice.reducer;