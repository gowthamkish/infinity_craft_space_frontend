import { useEffect, useMemo, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import { fetchProducts } from '../features/productsSlice';
import { fetchDashboardCounts, fetchUsers, fetchOrders } from '../features/adminSlice';

// Request deduplication cache
const requestCache = new Map();

// Custom hook for smart data fetching with enhanced caching and request deduplication
export const useSmartFetch = (
  asyncThunk,
  selector,
  dependencies = [],
  cacheTimeout = 5 * 60 * 1000, // 5 minutes default
  requestDeduplication = true
) => {
  const dispatch = useDispatch();
  const { data, loading, error, lastFetched, isStale } = useSelector(selector);
  const fetchTimeoutRef = useRef(null);
  const thunkKey = asyncThunk.typePrefix;

  // Debounced fetch function to prevent rapid successive calls
  const debouncedFetch = useCallback((delay = 100) => {
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }
    
    fetchTimeoutRef.current = setTimeout(() => {
      // Check if request is already in progress (deduplication)
      if (requestDeduplication && requestCache.has(thunkKey)) {
        return;
      }

      if (requestDeduplication) {
        requestCache.set(thunkKey, true);
      }

      const promise = dispatch(asyncThunk());
      
      // Clear cache after request completes
      if (requestDeduplication && promise && typeof promise.finally === 'function') {
        promise.finally(() => {
          requestCache.delete(thunkKey);
        });
      }
      
      return promise;
    }, delay);
  }, [dispatch, asyncThunk, thunkKey, requestDeduplication]);

  useEffect(() => {
    const shouldFetch = 
      isStale || 
      !lastFetched || 
      (Date.now() - lastFetched > cacheTimeout) ||
      dependencies.some(dep => dep);

    if (shouldFetch && !loading) {
      debouncedFetch();
    }

    // Cleanup timeout on unmount
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [debouncedFetch, isStale, lastFetched, loading, cacheTimeout, ...dependencies]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (requestDeduplication) {
        requestCache.delete(thunkKey);
      }
    };
  }, [thunkKey, requestDeduplication]);

  return useMemo(() => ({ 
    data: data || [], 
    loading: Boolean(loading), 
    error 
  }), [data, loading, error]);
};

// Hook specifically for products
// Memoized selector for products
const selectProductsData = createSelector(
  [(state) => state.products],
  (products) => ({
    data: products.items || [],
    loading: products.loading,
    error: products.error,
    lastFetched: products.lastFetched,
    isStale: products.isStale
  })
);

// Hook for products data
export const useProducts = (dependencies = []) => {
  return useSmartFetch(
    fetchProducts,
    selectProductsData,
    dependencies
  );
};

// Hook specifically for dashboard counts
// Memoized selector for dashboard counts
const selectDashboardCounts = createSelector(
  [(state) => state.admin],
  (admin) => ({
    data: admin.dashboardCounts,
    loading: admin.dashboardLoading,
    error: admin.dashboardError,
    lastFetched: admin.dashboardLastFetched,
    isStale: admin.dashboardIsStale
  })
);

// Hook for dashboard counts
export const useDashboardCounts = (dependencies = []) => {
  return useSmartFetch(
    fetchDashboardCounts,
    selectDashboardCounts,
    dependencies
  );
};

// Hook specifically for users
// Memoized selector for users
const selectUsersData = createSelector(
  [(state) => state.admin],
  (admin) => ({
    data: admin.users,
    loading: admin.usersLoading,
    error: admin.error,
    lastFetched: admin.usersLastFetched,
    isStale: admin.usersIsStale
  })
);

// Hook for users data
export const useUsers = (dependencies = []) => {
  return useSmartFetch(
    fetchUsers,
    selectUsersData,
    dependencies
  );
};

// Hook specifically for orders
// Memoized selector for orders
const selectOrdersData = createSelector(
  [(state) => state.admin],
  (admin) => ({
    data: admin.orders,
    loading: admin.ordersLoading,
    error: admin.error,
    lastFetched: admin.ordersLastFetched,
    isStale: admin.ordersIsStale
  })
);

// Hook for orders data
export const useOrders = (dependencies = []) => {
  return useSmartFetch(
    fetchOrders,
    selectOrdersData,
    dependencies
  );
};