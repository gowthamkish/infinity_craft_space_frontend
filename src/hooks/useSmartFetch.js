import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import { fetchProducts } from '../features/productsSlice';
import { fetchDashboardCounts, fetchUsers, fetchOrders } from '../features/adminSlice';

// Custom hook for smart data fetching with caching
export const useSmartFetch = (
  asyncThunk,
  selector,
  dependencies = [],
  cacheTimeout = 5 * 60 * 1000 // 5 minutes default
) => {
  const dispatch = useDispatch();
  const { data, loading, error, lastFetched, isStale } = useSelector(selector);

  useEffect(() => {
    const shouldFetch = 
      isStale || 
      !lastFetched || 
      (Date.now() - lastFetched > cacheTimeout) ||
      dependencies.some(dep => dep);

    if (shouldFetch && !loading) {
      dispatch(asyncThunk());
    }
  }, [dispatch, asyncThunk, isStale, lastFetched, loading, cacheTimeout, ...dependencies]);

  return { data, loading, error };
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
    loading: admin.dashboardCountsLoading,
    error: admin.error,
    lastFetched: admin.dashboardCountsLastFetched,
    isStale: admin.dashboardCountsIsStale
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