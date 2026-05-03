import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

// Fetch products — supports optional pagination params { page, limit, category, search, sort }
// When page > 1, items are appended (infinite scroll). Page 1 replaces the list.
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await api.get("/api/products", { params });
      const data = res.data;
      return {
        products: data.products || data,
        pagination: data.pages != null
          ? { page: data.page, totalPages: data.pages, total: data.total }
          : null,
        append: (params?.page ?? 1) > 1,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch products",
      );
    }
  },
);

// Add new product
export const addProduct = createAsyncThunk(
  "products/addProduct",
  async (productData, { rejectWithValue }) => {
    try {
      const res = await api.post("/api/products", productData);
      return res.data.product || res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to add product",
      );
    }
  },
);

// Update product
export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/api/products/${id}`, productData);
      return res.data.product || res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to update product",
      );
    }
  },
);

// Restock product (admin)
export const restockProduct = createAsyncThunk(
  "products/restockProduct",
  async ({ id, quantity, note }, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/api/products/${id}/restock`, { quantity, note });
      return res.data.product;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to restock product",
      );
    }
  },
);

// Delete product
export const deleteProduct = createAsyncThunk(
  "products/deleteProduct",
  async (productId, { rejectWithValue }) => {
    try {
      await api.delete(`/api/products/${productId}`);
      return productId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete product",
      );
    }
  },
);

const productsSlice = createSlice({
  name: "products",
  initialState: {
    items: [],
    loading: false,
    error: null,
    lastFetched: null,
    isStale: true,
    pagination: null, // { page, totalPages, total } when using server-side pagination
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    markAsStale: (state) => {
      state.isStale = true;
    },
    clearProducts: (state) => {
      state.items = [];
      state.lastFetched = null;
      state.isStale = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        const { products, pagination, append } = action.payload;
        state.items = append ? [...state.items, ...products] : products;
        state.pagination = pagination ?? state.pagination;
        state.loading = false;
        state.error = null;
        state.lastFetched = Date.now();
        state.isStale = false;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isStale = false; // Prevent infinite retry loop on error
        state.lastFetched = Date.now(); // Mark as fetched to prevent immediate retry
      })
      // Add product
      .addCase(addProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.loading = false;
        state.error = null;
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update product
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item._id === action.payload._id,
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Restock product
      .addCase(restockProduct.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;
      })
      // Delete product
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload);
        state.loading = false;
        state.error = null;
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, markAsStale, clearProducts } = productsSlice.actions;
export default productsSlice.reducer;
