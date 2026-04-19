import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

export const loginUser = createAsyncThunk(
  "auth/login",
  async (creds, { rejectWithValue }) => {
    try {
      const res = await api.post("/api/auth/login", creds);
      return res.data;
    } catch (error) {
      console.error(
        "Login error details:",
        error.response?.data || error.message,
      );
      // Return the actual error message from backend
      if (error.response?.data?.error) {
        return rejectWithValue(error.response.data.error);
      }
      return rejectWithValue(error.message || "Login failed");
    }
  },
);

export const register = createAsyncThunk(
  "auth/register",
  async (details, { rejectWithValue }) => {
    try {
      const res = await api.post("/api/auth/register", details);
      return res.data;
    } catch (error) {
      console.error(
        "Registration error details:",
        error.response?.data || error.message,
      );
      // Return the full error response to handle validation errors
      if (error.response?.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({ error: error.message || "Registration failed" });
    }
  },
);

// Fetch current authenticated user's profile using stored token
export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/api/auth/profile");
      return res.data;
    } catch (error) {
      console.error(
        "Failed to fetch current user:",
        error.response?.data || error.message,
      );
      return rejectWithValue(
        error.response?.data?.error || error.message || "Failed to fetch user",
      );
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    // Tokens are stored in httpOnly cookies — NOT in state or localStorage
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.error = null;
      // Token cookies are cleared by the backend /api/auth/logout endpoint
    },
    autoLogout: (state, action) => {
      console.log(
        "Auto-logout triggered:",
        action.payload?.reason || "Inactivity",
      );
      state.user = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.loading = false;
        state.error = null;
        // Tokens are set as httpOnly cookies by the backend — nothing to store here
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        // Use the payload from rejectWithValue, fallback to error.message
        state.error = action.payload || action.error?.message || "Login failed";
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.loading = false;
        state.error = null;
        // Tokens are set as httpOnly cookies by the backend — nothing to store here
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        // Use the payload from rejectWithValue, fallback to error.message
        state.error =
          action.payload || action.error?.message || "Registration failed";
      })
      // Handle fetchCurrentUser
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.loading = false;
        // Do NOT clear state.user here — if the user just logged in and this fires
        // due to a cookie timing/mobile ITP issue, wiping user causes instant logout.
        // The axios interceptor + refresh-token flow handles true auth failures.
        // Only clear on initial hydration (user was already null).
        if (!state.user) {
          state.user = null; // already null — no-op, just for clarity
        }
      });
  },
});

export const { logout, autoLogout, clearError } = authSlice.actions;
export default authSlice.reducer;
