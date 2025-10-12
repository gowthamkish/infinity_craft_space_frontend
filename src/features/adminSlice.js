import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

// Fetch dashboard counts
export const fetchDashboardCounts = createAsyncThunk(
  'admin/fetchDashboardCounts',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      
      // Fetch users count
      let userCount = 0;
      try {
        const userRes = await api.get("/api/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        userCount = userRes.data.length;
      } catch (error) {
        console.log("Users API not available:", error.message);
      }

      // Fetch products count
      let productCount = 0;
      try {
        const productRes = await api.get("/api/products", {
          headers: { Authorization: `Bearer ${token}` },
        });
        productCount = productRes.data.length;
      } catch (error) {
        console.log("Products API error:", error.message);
      }

      // Fetch orders count (with fallback)
      let orderCount = 0;
      try {
        const orderRes = await api.get("/api/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        orderCount = orderRes.data.length;
      } catch (error) {
        console.log("Orders API not available:", error.message);
      }

      return {
        userCount,
        productCount,
        orderCount
      };
    } catch (error) {
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
    usersIsStale: true
  },
  reducers: {
    clearDashboardError: (state) => {
      state.dashboardError = null;
    },
    clearUsersError: (state) => {
      state.usersError = null;
    },
    markDashboardAsStale: (state) => {
      state.dashboardIsStale = true;
    },
    markUsersAsStale: (state) => {
      state.usersIsStale = true;
    },
    clearAdminData: (state) => {
      state.dashboardCounts = { userCount: 0, productCount: 0, orderCount: 0 };
      state.users = [];
      state.dashboardLastFetched = null;
      state.usersLastFetched = null;
      state.dashboardIsStale = true;
      state.usersIsStale = true;
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
      });
  },
});

export const { 
  clearDashboardError, 
  clearUsersError, 
  markDashboardAsStale, 
  markUsersAsStale, 
  clearAdminData 
} = adminSlice.actions;

export default adminSlice.reducer;