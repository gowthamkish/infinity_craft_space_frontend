import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

// Fetch all categories
export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async ({ includeInactive = false } = {}, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get(`/api/categories?includeInactive=${includeInactive}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.categories || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

// Fetch public categories (for product filtering)
export const fetchPublicCategories = createAsyncThunk(
  'categories/fetchPublicCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/categories/public/list');
      return response.data.categories || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

// Create category
export const createCategory = createAsyncThunk(
  'categories/createCategory',
  async (categoryData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.post('/api/categories', categoryData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.category;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create category');
    }
  }
);

// Update category
export const updateCategory = createAsyncThunk(
  'categories/updateCategory',
  async ({ id, ...categoryData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.put(`/api/categories/${id}`, categoryData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.category;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update category');
    }
  }
);

// Delete category (soft delete)
export const deleteCategory = createAsyncThunk(
  'categories/deleteCategory',
  async (categoryId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/api/categories/${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return categoryId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete category');
    }
  }
);

// Add subcategory
export const addSubcategory = createAsyncThunk(
  'categories/addSubcategory',
  async ({ categoryId, subcategoryData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.post(`/api/categories/${categoryId}/subcategories`, subcategoryData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { categoryId, category: response.data.category };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add subcategory');
    }
  }
);

// Update subcategory
export const updateSubcategory = createAsyncThunk(
  'categories/updateSubcategory',
  async ({ categoryId, subcategoryId, subcategoryData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.put(`/api/categories/${categoryId}/subcategories/${subcategoryId}`, subcategoryData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { categoryId, category: response.data.category };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update subcategory');
    }
  }
);

// Delete subcategory
export const deleteSubcategory = createAsyncThunk(
  'categories/deleteSubcategory',
  async ({ categoryId, subcategoryId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/api/categories/${categoryId}/subcategories/${subcategoryId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { categoryId, subcategoryId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete subcategory');
    }
  }
);

const categoriesSlice = createSlice({
  name: 'categories',
  initialState: {
    // All categories (admin view)
    categories: [],
    categoriesLoading: false,
    categoriesError: null,
    categoriesLastFetched: null,
    categoriesIsStale: true,

    // Public categories (for product filtering)
    publicCategories: [],
    publicCategoriesLoading: false,
    publicCategoriesError: null,
    publicCategoriesLastFetched: null,
    publicCategoriesIsStale: true,

    // Operation states
    creating: false,
    updating: false,
    deleting: false,
    operationError: null
  },
  reducers: {
    clearCategoriesError: (state) => {
      state.categoriesError = null;
    },
    clearPublicCategoriesError: (state) => {
      state.publicCategoriesError = null;
    },
    clearOperationError: (state) => {
      state.operationError = null;
    },
    markCategoriesAsStale: (state) => {
      state.categoriesIsStale = true;
    },
    markPublicCategoriesAsStale: (state) => {
      state.publicCategoriesIsStale = true;
    },
    clearCategoriesData: (state) => {
      state.categories = [];
      state.publicCategories = [];
      state.categoriesLastFetched = null;
      state.publicCategoriesLastFetched = null;
      state.categoriesIsStale = true;
      state.publicCategoriesIsStale = true;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch categories
      .addCase(fetchCategories.pending, (state) => {
        state.categoriesLoading = true;
        state.categoriesError = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categoriesLoading = false;
        state.categoriesError = null;
        state.categories = action.payload;
        state.categoriesLastFetched = Date.now();
        state.categoriesIsStale = false;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.categoriesLoading = false;
        state.categoriesError = action.payload;
      })

      // Fetch public categories
      .addCase(fetchPublicCategories.pending, (state) => {
        state.publicCategoriesLoading = true;
        state.publicCategoriesError = null;
      })
      .addCase(fetchPublicCategories.fulfilled, (state, action) => {
        state.publicCategoriesLoading = false;
        state.publicCategoriesError = null;
        state.publicCategories = action.payload;
        state.publicCategoriesLastFetched = Date.now();
        state.publicCategoriesIsStale = false;
      })
      .addCase(fetchPublicCategories.rejected, (state, action) => {
        state.publicCategoriesLoading = false;
        state.publicCategoriesError = action.payload;
      })

      // Create category
      .addCase(createCategory.pending, (state) => {
        state.creating = true;
        state.operationError = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.creating = false;
        state.operationError = null;
        state.categories.unshift(action.payload);
        state.categoriesIsStale = false;
        state.publicCategoriesIsStale = true; // Mark public categories as stale
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.creating = false;
        state.operationError = action.payload;
      })

      // Update category
      .addCase(updateCategory.pending, (state) => {
        state.updating = true;
        state.operationError = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.updating = false;
        state.operationError = null;
        const index = state.categories.findIndex(cat => cat._id === action.payload._id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
        state.publicCategoriesIsStale = true; // Mark public categories as stale
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.updating = false;
        state.operationError = action.payload;
      })

      // Delete category
      .addCase(deleteCategory.pending, (state) => {
        state.deleting = true;
        state.operationError = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.deleting = false;
        state.operationError = null;
        // Mark category as inactive instead of removing
        const category = state.categories.find(cat => cat._id === action.payload);
        if (category) {
          category.isActive = false;
        }
        state.publicCategoriesIsStale = true; // Mark public categories as stale
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.deleting = false;
        state.operationError = action.payload;
      })

      // Add subcategory
      .addCase(addSubcategory.pending, (state) => {
        state.updating = true;
        state.operationError = null;
      })
      .addCase(addSubcategory.fulfilled, (state, action) => {
        state.updating = false;
        state.operationError = null;
        const { categoryId, category } = action.payload;
        const index = state.categories.findIndex(cat => cat._id === categoryId);
        if (index !== -1) {
          state.categories[index] = category;
        }
        state.publicCategoriesIsStale = true; // Mark public categories as stale
      })
      .addCase(addSubcategory.rejected, (state, action) => {
        state.updating = false;
        state.operationError = action.payload;
      })

      // Update subcategory
      .addCase(updateSubcategory.pending, (state) => {
        state.updating = true;
        state.operationError = null;
      })
      .addCase(updateSubcategory.fulfilled, (state, action) => {
        state.updating = false;
        state.operationError = null;
        const { categoryId, category } = action.payload;
        const index = state.categories.findIndex(cat => cat._id === categoryId);
        if (index !== -1) {
          state.categories[index] = category;
        }
        state.publicCategoriesIsStale = true; // Mark public categories as stale
      })
      .addCase(updateSubcategory.rejected, (state, action) => {
        state.updating = false;
        state.operationError = action.payload;
      })

      // Delete subcategory
      .addCase(deleteSubcategory.pending, (state) => {
        state.deleting = true;
        state.operationError = null;
      })
      .addCase(deleteSubcategory.fulfilled, (state, action) => {
        state.deleting = false;
        state.operationError = null;
        const { categoryId, subcategoryId } = action.payload;
        const category = state.categories.find(cat => cat._id === categoryId);
        if (category) {
          category.subcategories = category.subcategories.filter(sub => sub._id !== subcategoryId);
        }
        state.publicCategoriesIsStale = true; // Mark public categories as stale
      })
      .addCase(deleteSubcategory.rejected, (state, action) => {
        state.deleting = false;
        state.operationError = action.payload;
      });
  },
});

export const {
  clearCategoriesError,
  clearPublicCategoriesError,
  clearOperationError,
  markCategoriesAsStale,
  markPublicCategoriesAsStale,
  clearCategoriesData
} = categoriesSlice.actions;

export default categoriesSlice.reducer;