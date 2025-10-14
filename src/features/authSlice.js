import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

export const loginUser = createAsyncThunk("auth/login", async (creds, { rejectWithValue }) => {
  try {
    const res = await api.post("/api/auth/login", creds);
    return res.data;
  } catch (error) {
    console.error("Login error details:", error.response?.data || error.message);
    // Return the actual error message from backend
    if (error.response?.data?.error) {
      return rejectWithValue(error.response.data.error);
    }
    return rejectWithValue(error.message || "Login failed");
  }
});

export const register = createAsyncThunk("auth/register", async (details, { rejectWithValue }) => {
  try {
    const res = await api.post("/api/auth/register", details);
    return res.data;
  } catch (error) {
    console.error("Registration error details:", error.response?.data || error.message);
    // Return the actual error message from backend
    if (error.response?.data?.error) {
      return rejectWithValue(error.response.data.error);
    }
    return rejectWithValue(error.message || "Registration failed");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: { user: null, token: null, loading: false, error: null },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
    },
    setAuthFromStorage: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
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
        state.token = action.payload.token;
        state.loading = false;
        state.error = null;
        localStorage.setItem('token', action.payload.token);
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
        state.token = action.payload.token;
        state.loading = false;
        state.error = null;
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        // Use the payload from rejectWithValue, fallback to error.message
        state.error = action.payload || action.error?.message || "Registration failed";
      });
  },
});

export const { logout, setAuthFromStorage, clearError } = authSlice.actions;
export default authSlice.reducer;
