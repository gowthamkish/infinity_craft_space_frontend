import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

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
export const useProducts = (forceRefresh = false) => {
  const { fetchProducts } = require('../features/productsSlice');
  return useSmartFetch(
    fetchProducts,
    (state) => ({
      data: state.products.items,
      loading: state.products.loading,
      error: state.products.error,
      lastFetched: state.products.lastFetched,
      isStale: state.products.isStale
    }),
    [forceRefresh]
  );
};

// Hook specifically for dashboard counts
export const useDashboardCounts = (forceRefresh = false) => {
  const { fetchDashboardCounts } = require('../features/adminSlice');
  return useSmartFetch(
    fetchDashboardCounts,
    (state) => ({
      data: state.admin.dashboardCounts,
      loading: state.admin.dashboardLoading,
      error: state.admin.dashboardError,
      lastFetched: state.admin.dashboardLastFetched,
      isStale: state.admin.dashboardIsStale
    }),
    [forceRefresh],
    2 * 60 * 1000 // 2 minutes cache for dashboard
  );
};

// Hook specifically for users
export const useUsers = (forceRefresh = false) => {
  const { fetchUsers } = require('../features/adminSlice');
  return useSmartFetch(
    fetchUsers,
    (state) => ({
      data: state.admin.users,
      loading: state.admin.usersLoading,
      error: state.admin.usersError,
      lastFetched: state.admin.usersLastFetched,
      isStale: state.admin.usersIsStale
    }),
    [forceRefresh]
  );
};