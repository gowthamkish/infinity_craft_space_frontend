import { configureStore, createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { baseApi } from "./baseApi";
import authReducer, { logout, autoLogout } from "../features/authSlice";
import cartReducer, { syncCartToBackend } from "../features/cartSlice";

// Cart actions that should trigger a debounced sync to backend
// Note: clearCart is intentionally excluded — logout calls syncCartToBackend
// explicitly before clearing, so we must NOT re-sync an empty cart after clearing.
const CART_SYNC_ACTIONS = [
  "cart/addToCart",
  "cart/removeFromCart",
  "cart/updateCartItemQuantity",
  "cart/removeItemCompletely",
];

// Debounce timer for cart sync
let cartSyncTimeout = null;

// Cart sync middleware - automatically syncs cart to backend after cart changes
const cartSyncMiddleware = (store) => (next) => (action) => {
  // When the cart is being cleared (logout), cancel any pending debounced sync
  // so the stale timeout can't fire later with an empty auth state.
  if (action.type === "cart/clearCart") {
    if (cartSyncTimeout) {
      clearTimeout(cartSyncTimeout);
      cartSyncTimeout = null;
    }
    return next(action);
  }

  const result = next(action);

  // Check if this is a cart-modifying action that requires a backend sync
  if (CART_SYNC_ACTIONS.includes(action.type)) {
    const { auth } = store.getState();

    // Only sync if user is logged in
    if (auth.user?._id) {
      // Debounce sync to prevent excessive API calls
      if (cartSyncTimeout) {
        clearTimeout(cartSyncTimeout);
      }

      cartSyncTimeout = setTimeout(() => {
        store.dispatch(syncCartToBackend());
      }, 500);
    }
  }

  return result;
};

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
    ignoredActions: [],
    // Ignore these field paths in all actions
    ignoredActionsPaths: ["meta.arg", "payload.timestamp"],
    // Ignore these paths in the state
    ignoredPaths: [
      "auth.lastFetched",
    ],
  },
};

// Wipe the entire RTK Query cache whenever the user logs out (manually or via idle
// timeout) so one account's orders / wishlist / admin data can never show up for the next.
const authCacheListener = createListenerMiddleware();
authCacheListener.startListening({
  matcher: isAnyOf(logout, autoLogout),
  effect: (_action, listenerApi) => {
    listenerApi.dispatch(baseApi.util.resetApiState());
  },
});

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
    cart: cartReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      ...serializationMiddleware,
      // Disable immutability and serialization checks in production for better performance
      immutableCheck: import.meta.env.DEV,
    }).prepend(authCacheListener.middleware).concat(
      // RTK Query: caching, de-duplication, invalidation, polling, streaming
      baseApi.middleware,
      // Add cart sync middleware
      cartSyncMiddleware,
      // Add performance monitoring in development
      import.meta.env.DEV ? performanceMiddleware : [],
    ),
  // Enable Redux DevTools only in development
  devTools: import.meta.env.DEV,
});


// Enables refetchOnFocus / refetchOnReconnect for queries that opt in.
setupListeners(store.dispatch);
