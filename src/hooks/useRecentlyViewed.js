import { useState, useEffect } from "react";

// Hook for managing recently viewed products in localStorage
export const useRecentlyViewed = () => {
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  const STORAGE_KEY = "recentlyViewedProducts";
  const MAX_ITEMS = 10;

  useEffect(() => {
    // Load from localStorage on mount
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setRecentlyViewed(JSON.parse(stored));
      } catch (error) {
        console.error("Error loading recently viewed products:", error);
      }
    }
  }, []);

  const addProduct = (product) => {
    setRecentlyViewed((prev) => {
      // Remove if already in list
      const filtered = prev.filter((item) => item._id !== product._id);

      // Add to front
      const updated = [product, ...filtered].slice(0, MAX_ITEMS);

      // Persist to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      return updated;
    });
  };

  const clearAll = () => {
    setRecentlyViewed([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const removeProduct = (productId) => {
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((item) => item._id !== productId);
      if (filtered.length === 0) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      }
      return filtered;
    });
  };

  return {
    recentlyViewed,
    addProduct,
    removeProduct,
    clearAll,
  };
};

// Hook for managing wishlist (favorites)
export const useWishlist = (userId) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  const STORAGE_KEY = `wishlist_${userId}`;

  useEffect(() => {
    if (!userId) return;

    // Load from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setWishlist(JSON.parse(stored));
      } catch (error) {
        console.error("Error loading wishlist:", error);
      }
    }
  }, [userId, STORAGE_KEY]);

  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.some((item) => item._id === product._id);
      const updated = exists
        ? prev.filter((item) => item._id !== product._id)
        : [...prev, product];

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => item._id === productId);
  };

  return {
    wishlist,
    toggleWishlist,
    isInWishlist,
    loading,
  };
};
