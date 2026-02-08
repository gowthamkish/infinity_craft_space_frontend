import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/authSlice";
import productsReducer from "../features/productsSlice";
import cartReducer from "../features/cartSlice";
import adminReducer from "../features/adminSlice";
import categoriesReducer from "../features/categoriesSlice";
import reviewsReducer from "../features/reviewsSlice";

// Performance monitoring middleware
const performanceMiddleware = (store) => (next) => (action) => {
  if (import.meta.env.DEV) {
    const start = performance.now();
    const result = next(action);
    const end = performance.now();

    // Log slow actions (> 10ms)
    if (end - start > 10) {
      console.warn(
        `[Redux Performance] Action "${action.type}" took ${end - start}ms`,
      );
    }

    return result;
  }
  return next(action);
};

// Serialization check middleware for development
const serializationMiddleware = {
  serializableCheck: {
    // Ignore these action types
    ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
    // Ignore these field paths in all actions
    ignoredActionsPaths: ["meta.arg", "payload.timestamp"],
    // Ignore these paths in the state
    ignoredPaths: [
      "auth.lastFetched",
      "products.lastFetched",
      "admin.dashboardLastFetched",
    ],
  },
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
    cart: cartReducer,
    admin: adminReducer,
    categories: categoriesReducer,
    reviews: reviewsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      ...serializationMiddleware,
      // Disable immutability and serialization checks in production for better performance
      immutableCheck: import.meta.env.DEV,
    }).concat(
      // Add performance monitoring in development
      import.meta.env.DEV ? performanceMiddleware : [],
    ),
  // Enable Redux DevTools only in development
  devTools: import.meta.env.DEV,
});

// Performance monitoring for store updates
if (import.meta.env.DEV) {
  let lastStateChange = performance.now();

  store.subscribe(() => {
    const now = performance.now();
    const timeSinceLastChange = now - lastStateChange;

    if (timeSinceLastChange < 16) {
      // Less than one frame
      console.warn(
        "[Redux Performance] Frequent state changes detected - consider batching updates",
      );
    }

    lastStateChange = now;
  });
}
