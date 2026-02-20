import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

// Async thunk to fetch user's cart from backend
export const fetchUserCart = createAsyncThunk(
  "cart/fetchUserCart",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      if (!auth.user?._id) {
        return { items: [] };
      }

      const token = localStorage.getItem("token");
      const response = await api.get(`/api/cart/${auth.user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch cart",
      );
    }
  },
);

// Async thunk to sync cart to backend
export const syncCartToBackend = createAsyncThunk(
  "cart/syncToBackend",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth, cart } = getState();
      if (!auth.user?._id) {
        return; // Don't sync if not logged in
      }

      const token = localStorage.getItem("token");
      await api.post(
        "/api/cart/sync",
        { userId: auth.user._id, items: cart.items },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      return { success: true };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to sync cart",
      );
    }
  },
);

// Async thunk to clear cart on backend
export const clearCartOnBackend = createAsyncThunk(
  "cart/clearOnBackend",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      if (!auth.user?._id) {
        return;
      }

      const token = localStorage.getItem("token");
      await api.delete(`/api/cart/${auth.user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return { success: true };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to clear cart",
      );
    }
  },
);

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    loading: false,
    syncing: false,
    error: null,
  },
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity } = action.payload;
      const existing = state.items.find(
        (item) => item.product._id === product._id,
      );
      if (existing) {
        existing.quantity += quantity;
        existing.totalPrice = existing.quantity * existing.product.price;
      } else {
        state.items.push({
          product,
          quantity,
          totalPrice: product.price * quantity,
        });
      }
    },

    removeFromCart: (state, action) => {
      const productId = action.payload.product._id;
      const existing = state.items.find(
        (item) => item.product._id === productId,
      );
      if (existing) {
        if (existing.quantity > 1) {
          existing.quantity -= 1;
          existing.totalPrice = existing.quantity * existing.product.price;
        } else {
          state.items = state.items.filter(
            (item) => item.product._id !== productId,
          );
        }
      }
    },

    updateCartItemQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const existing = state.items.find(
        (item) => item.product._id === productId,
      );
      if (existing) {
        if (quantity <= 0) {
          state.items = state.items.filter(
            (item) => item.product._id !== productId,
          );
        } else {
          existing.quantity = quantity;
          existing.totalPrice = existing.quantity * existing.product.price;
        }
      }
    },

    removeItemCompletely: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter(
        (item) => item.product._id !== productId,
      );
    },

    clearCart: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user cart
      .addCase(fetchUserCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
      })
      .addCase(fetchUserCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Sync cart to backend
      .addCase(syncCartToBackend.pending, (state) => {
        state.syncing = true;
      })
      .addCase(syncCartToBackend.fulfilled, (state) => {
        state.syncing = false;
      })
      .addCase(syncCartToBackend.rejected, (state) => {
        state.syncing = false;
      })
      // Clear cart on backend
      .addCase(clearCartOnBackend.fulfilled, (state) => {
        state.items = [];
      });
  },
});

export const {
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  removeItemCompletely,
  clearCart,
} = cartSlice.actions;
export default cartSlice.reducer;
