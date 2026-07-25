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

      const response = await api.get("/api/cart/me");

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch cart",
      );
    }
  },
);

// Async thunk to sync cart to backend with merge-on-conflict strategy.
// The server resolves any conflict by merging (max quantity per product) and
// returns the canonical cart, so we apply it directly — no extra fetch needed.
export const syncCartToBackend = createAsyncThunk(
  "cart/syncToBackend",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth, cart } = getState();
      if (!auth.user?._id) return;

      const res = await api.post("/api/cart/sync", {
        items: cart.items,
        clientUpdatedAt: cart.lastSyncedAt || null,
      });

      // Server always returns the resolved cart (merged or replaced).
      return { updatedAt: res.data.updatedAt, items: res.data.items || null };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to sync cart");
    }
  },
);

// Optimistic add to cart: updates UI immediately, syncs to backend, reverts on failure
export const optimisticAddToCart = createAsyncThunk(
  "cart/optimisticAdd",
  async ({ product, quantity = 1 }, { dispatch, rejectWithValue }) => {
    dispatch(addToCart({ product, quantity }));
    try {
      await api.post("/api/cart/add", { productId: product._id, quantity });
      return { success: true };
    } catch (error) {
      dispatch(revertCartItem({ product, quantity }));
      return rejectWithValue(error.response?.data?.error || "Failed to add to cart");
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

      await api.delete("/api/cart/me");

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
    lastSyncedAt: null, // ISO string — used for last-write-wins cart conflict detection
  },
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity, customNote } = action.payload;
      const existing = state.items.find(
        (item) => item.product._id === product._id,
      );
      if (existing) {
        existing.quantity += quantity;
        existing.totalPrice = existing.quantity * existing.product.price;
        if (customNote) existing.customNote = customNote;
      } else {
        state.items.push({
          product,
          quantity,
          totalPrice: product.price * quantity,
          ...(customNote ? { customNote } : {}),
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

    revertCartItem: (state, action) => {
      const { product, quantity } = action.payload;
      const existing = state.items.find((item) => item.product._id === product._id);
      if (existing) {
        existing.quantity -= quantity;
        if (existing.quantity <= 0) {
          state.items = state.items.filter((item) => item.product._id !== product._id);
        } else {
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

    mergeGuestCart: (state, action) => {
      const guestItems = action.payload;
      guestItems.forEach((guestItem) => {
        const existing = state.items.find(
          (item) => item.product._id === guestItem.product._id,
        );
        if (existing) {
          existing.quantity += guestItem.quantity;
          existing.totalPrice = existing.quantity * existing.product.price;
        } else {
          state.items.push(guestItem);
        }
      });
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
      .addCase(syncCartToBackend.fulfilled, (state, action) => {
        state.syncing = false;
        if (!action.payload) return;
        if (action.payload.updatedAt) {
          state.lastSyncedAt = action.payload.updatedAt;
        }
        // If the server merged carts (multi-tab conflict), apply the resolved
        // items so this tab converges to the same state as the server.
        if (action.payload.items) {
          state.items = action.payload.items;
        }
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
  revertCartItem,
  clearCart,
  mergeGuestCart,
} = cartSlice.actions;
export default cartSlice.reducer;
