import { useEffect, useRef, useCallback } from 'react';

// Performance monitoring hook
export const usePerformanceMonitor = (componentName, enabled = process.env.NODE_ENV === 'development') => {
  const renderStartTime = useRef(Date.now());
  const renderCount = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    renderCount.current += 1;
    const renderTime = Date.now() - renderStartTime.current;
    
    if (renderTime > 16) { // More than one frame (60fps = ~16.67ms per frame)
      console.warn(`[Performance] ${componentName} render took ${renderTime}ms (render #${renderCount.current})`);
    }
    
    renderStartTime.current = Date.now();
  });

  const measureAsync = useCallback(async (operationName, asyncOperation) => {
    if (!enabled) return await asyncOperation();

    const start = performance.now();
    try {
      const result = await asyncOperation();
      const end = performance.now();
      console.log(`[Performance] ${componentName}.${operationName} took ${end - start}ms`);
      return result;
    } catch (error) {
      const end = performance.now();
      console.error(`[Performance] ${componentName}.${operationName} failed after ${end - start}ms`, error);
      throw error;
    }
  }, [componentName, enabled]);

  const measure = useCallback((operationName, operation) => {
    if (!enabled) return operation();

    const start = performance.now();
    try {
      const result = operation();
      const end = performance.now();
      if (end - start > 5) { // Log operations taking more than 5ms
        console.log(`[Performance] ${componentName}.${operationName} took ${end - start}ms`);
      }
      return result;
    } catch (error) {
      const end = performance.now();
      console.error(`[Performance] ${componentName}.${operationName} failed after ${end - start}ms`, error);
      throw error;
    }
  }, [componentName, enabled]);

  return { measureAsync, measure, renderCount: renderCount.current };
};

// Memory usage monitoring
export const useMemoryMonitor = (componentName, enabled = process.env.NODE_ENV === 'development') => {
  useEffect(() => {
    if (!enabled || !performance.memory) return;

    const logMemoryUsage = () => {
      const memory = performance.memory;
      const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
      const totalMB = Math.round(memory.totalJSHeapSize / 1024 / 1024);
      const limitMB = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);
      
      console.log(`[Memory] ${componentName} - Used: ${usedMB}MB, Total: ${totalMB}MB, Limit: ${limitMB}MB`);
      
      // Warn if memory usage is high
      if (usedMB > limitMB * 0.9) {
        console.warn(`[Memory] High memory usage detected in ${componentName}!`);
      }
    };

    const interval = setInterval(logMemoryUsage, 10000); // Log every 10 seconds
    return () => clearInterval(interval);
  }, [componentName, enabled]);
};

// Bundle size analyzer helper
export const analyzeBundleSize = () => {
  if (process.env.NODE_ENV !== 'development') return;

  // This will help identify large dependencies
  const modules = [];
  if (window.__webpack_require__ && window.__webpack_require__.cache) {
    Object.keys(window.__webpack_require__.cache).forEach(moduleId => {
      const module = window.__webpack_require__.cache[moduleId];
      if (module && module.exports) {
        modules.push({
          id: moduleId,
          size: JSON.stringify(module.exports).length
        });
      }
    });
    
    modules.sort((a, b) => b.size - a.size);
    console.table(modules.slice(0, 10)); // Show top 10 largest modules
  }
};

export default { usePerformanceMonitor, useMemoryMonitor, analyzeBundleSize };