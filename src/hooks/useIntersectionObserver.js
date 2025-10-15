import { useEffect, useRef, useState, useCallback } from 'react';

// Intersection Observer hook for lazy loading and animations
export const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const targetRef = useRef(null);

  const defaultOptions = {
    threshold: 0.1,
    rootMargin: '50px',
    triggerOnce: true,
    ...options
  };

  useEffect(() => {
    const target = targetRef.current;
    if (!target || typeof IntersectionObserver === 'undefined') {
      setIsIntersecting(true);
      setHasIntersected(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting;
        setIsIntersecting(isVisible);
        
        if (isVisible && !hasIntersected) {
          setHasIntersected(true);
          if (defaultOptions.triggerOnce) {
            observer.disconnect();
          }
        }
      },
      {
        threshold: defaultOptions.threshold,
        rootMargin: defaultOptions.rootMargin,
      }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [defaultOptions.threshold, defaultOptions.rootMargin, defaultOptions.triggerOnce, hasIntersected]);

  return { targetRef, isIntersecting, hasIntersected };
};

// Lazy loading hook for images
export const useLazyImage = (src, placeholder = '') => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { targetRef, hasIntersected } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px'
  });

  useEffect(() => {
    if (hasIntersected && src) {
      const img = new Image();
      img.onload = () => {
        setImageSrc(src);
        setImageLoaded(true);
      };
      img.onerror = () => {
        setImageSrc(placeholder || 'https://via.placeholder.com/300x200?text=Error');
        setImageLoaded(true);
      };
      img.src = src;
    }
  }, [hasIntersected, src, placeholder]);

  return { targetRef, imageSrc, imageLoaded, hasIntersected };
};

// Lazy component loading hook
export const useLazyComponent = (loadComponent, fallback = null) => {
  const [Component, setComponent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { targetRef, hasIntersected } = useIntersectionObserver();

  useEffect(() => {
    if (hasIntersected && !Component && !loading) {
      setLoading(true);
      loadComponent()
        .then((module) => {
          setComponent(() => module.default || module);
          setLoading(false);
        })
        .catch((err) => {
          setError(err);
          setLoading(false);
        });
    }
  }, [hasIntersected, Component, loading, loadComponent]);

  const render = useCallback(() => {
    if (error) {
      return <div>Error loading component: {error.message}</div>;
    }
    if (loading) {
      return fallback || <div>Loading component...</div>;
    }
    if (Component) {
      return <Component />;
    }
    return fallback;
  }, [Component, loading, error, fallback]);

  return { targetRef, Component, loading, error, render };
};

// Visibility tracking hook
export const useVisibility = (threshold = 0.5) => {
  const [isVisible, setIsVisible] = useState(false);
  const [visibilityTime, setVisibilityTime] = useState(0);
  const targetRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting;
        setIsVisible(visible);
        
        if (visible) {
          startTimeRef.current = Date.now();
        } else if (startTimeRef.current) {
          const duration = Date.now() - startTimeRef.current;
          setVisibilityTime(prev => prev + duration);
          startTimeRef.current = null;
        }
      },
      { threshold }
    );

    observer.observe(target);

    return () => {
      if (startTimeRef.current) {
        const duration = Date.now() - startTimeRef.current;
        setVisibilityTime(prev => prev + duration);
      }
      observer.disconnect();
    };
  }, [threshold]);

  return { targetRef, isVisible, visibilityTime };
};

// Progressive loading hook for lists
export const useProgressiveLoading = (items = [], batchSize = 10, delay = 100) => {
  const [visibleItems, setVisibleItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { targetRef, hasIntersected } = useIntersectionObserver({
    rootMargin: '200px'
  });

  useEffect(() => {
    if (items.length === 0) return;
    
    // Initialize with first batch
    setVisibleItems(items.slice(0, batchSize));
  }, [items, batchSize]);

  const loadMore = useCallback(() => {
    if (loading || visibleItems.length >= items.length) return;
    
    setLoading(true);
    setTimeout(() => {
      const nextBatch = items.slice(0, visibleItems.length + batchSize);
      setVisibleItems(nextBatch);
      setLoading(false);
    }, delay);
  }, [items, visibleItems.length, batchSize, delay, loading]);

  useEffect(() => {
    if (hasIntersected && visibleItems.length < items.length) {
      loadMore();
    }
  }, [hasIntersected, loadMore, visibleItems.length, items.length]);

  const hasMore = visibleItems.length < items.length;

  return {
    targetRef,
    visibleItems,
    loading,
    hasMore,
    loadMore
  };
};

export default {
  useIntersectionObserver,
  useLazyImage,
  useLazyComponent,
  useVisibility,
  useProgressiveLoading
};