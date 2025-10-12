import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

// Fetch all products
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts', 
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get('/api/products', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);

// Add new product
export const addProduct = createAsyncThunk(
  'products/addProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.post('/api/products', productData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add product');
    }
  }
);

// Update product
export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.put(`/api/products/${id}`, productData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update product');
    }
  }
);

// Delete product
export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (productId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return productId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete product');
    }
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState: { 
    items: [], 
    loading: false, 
    error: null,
    lastFetched: null,
    isStale: true
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
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
        state.error = null;
        state.lastFetched = Date.now();
        state.isStale = false;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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
        const index = state.items.findIndex(item => item._id === action.payload._id);
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
      // Delete product
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item._id !== action.payload);
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
