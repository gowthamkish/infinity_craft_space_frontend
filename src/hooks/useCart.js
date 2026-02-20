import { useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addToCart as addToCartAction,
  removeFromCart as removeFromCartAction,
  updateCartItemQuantity as updateQuantityAction,
  removeItemCompletely as removeItemAction,
  clearCart as clearCartAction,
  syncCartToBackend,
  clearCartOnBackend,
} from "../features/cartSlice";

/**
 * Custom hook for cart operations with automatic backend sync
 * Debounces sync calls to prevent excessive API requests
 */
export const useCart = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const isAuthenticated = useSelector((state) => !!state.auth.token);
  const syncTimeoutRef = useRef(null);

  // Debounced sync to backend (waits 500ms after last cart change)
  const debouncedSync = useCallback(() => {
    if (!isAuthenticated) return;

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(() => {
      dispatch(syncCartToBackend());
    }, 500);
  }, [dispatch, isAuthenticated]);

  const addToCart = useCallback(
    (product, quantity = 1) => {
      dispatch(addToCartAction({ product, quantity }));
      debouncedSync();
    },
    [dispatch, debouncedSync],
  );

  const removeFromCart = useCallback(
    (product) => {
      dispatch(removeFromCartAction({ product }));
      debouncedSync();
    },
    [dispatch, debouncedSync],
  );

  const updateQuantity = useCallback(
    (productId, quantity) => {
      dispatch(updateQuantityAction({ productId, quantity }));
      debouncedSync();
    },
    [dispatch, debouncedSync],
  );

  const removeItem = useCallback(
    (productId) => {
      dispatch(removeItemAction(productId));
      debouncedSync();
    },
    [dispatch, debouncedSync],
  );

  const clearCart = useCallback(() => {
    dispatch(clearCartAction());
    if (isAuthenticated) {
      dispatch(clearCartOnBackend());
    }
  }, [dispatch, isAuthenticated]);

  // Get quantity of a specific product in cart
  const getItemQuantity = useCallback(
    (productId) => {
      const item = cartItems.find((item) => item.product._id === productId);
      return item?.quantity || 0;
    },
    [cartItems],
  );

  // Calculate totals
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  return {
    cartItems,
    totalItems,
    totalPrice,
    addToCart,
    removeFromCart,
    updateQuantity,
    removeItem,
    clearCart,
    getItemQuantity,
  };
};

export default useCart;
