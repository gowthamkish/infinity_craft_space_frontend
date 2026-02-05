// Performance testing utilities
export class PerformanceTester {
  constructor() {
    this.metrics = new Map();
    this.observers = new Map();
  }

  // Start measuring a performance metric
  startMeasurement(name) {
    this.metrics.set(name, {
      startTime: performance.now(),
      startMemory: this.getMemoryUsage(),
    });
  }

  // End measurement and return results
  endMeasurement(name) {
    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`No measurement started for: ${name}`);
      return null;
    }

    const endTime = performance.now();
    const endMemory = this.getMemoryUsage();

    const result = {
      duration: endTime - metric.startTime,
      memoryDelta: endMemory - metric.startMemory,
      timestamp: new Date().toISOString(),
    };

    this.metrics.delete(name);
    return result;
  }

  // Get current memory usage (if available)
  getMemoryUsage() {
    if (performance.memory) {
      return performance.memory.usedJSHeapSize;
    }
    return 0;
  }

  // Measure React component render time
  measureComponentRender(componentName, renderFn) {
    this.startMeasurement(`component_${componentName}`);
    const result = renderFn();
    const metrics = this.endMeasurement(`component_${componentName}`);

    if (metrics && metrics.duration > 16) {
      // More than one frame
      console.warn(
        `[Performance] ${componentName} render took ${metrics.duration.toFixed(2)}ms`,
      );
    }

    return result;
  }

  // Measure async operation
  async measureAsync(name, asyncFn) {
    this.startMeasurement(name);
    try {
      const result = await asyncFn();
      const metrics = this.endMeasurement(name);
      console.log(
        `[Performance] ${name} completed in ${metrics.duration.toFixed(2)}ms`,
      );
      return result;
    } catch (error) {
      const metrics = this.endMeasurement(name);
      console.error(
        `[Performance] ${name} failed after ${metrics.duration.toFixed(2)}ms`,
        error,
      );
      throw error;
    }
  }

  // Measure bundle loading time
  measureBundleLoad() {
    if (performance.getEntriesByType) {
      const navigation = performance.getEntriesByType("navigation")[0];
      if (navigation) {
        return {
          domContentLoaded:
            navigation.domContentLoadedEventEnd -
            navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          totalLoadTime: navigation.loadEventEnd - navigation.fetchStart,
        };
      }
    }
    return null;
  }

  // Monitor long tasks (tasks taking > 50ms)
  observeLongTasks() {
    if ("PerformanceObserver" in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.warn(
            `[Long Task] Duration: ${entry.duration}ms, Start: ${entry.startTime}`,
          );

          // Log stack trace for long tasks in development
          if (import.meta.env.DEV) {
            console.trace("Long task stack trace");
          }
        }
      });

      try {
        observer.observe({ entryTypes: ["longtask"] });
        this.observers.set("longtask", observer);
      } catch (error) {
        console.log("Long task observer not supported");
      }
    }
  }

  // Monitor largest contentful paint
  observeLCP() {
    if ("PerformanceObserver" in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log(`[LCP] ${lastEntry.startTime}ms`);

        if (lastEntry.startTime > 2500) {
          console.warn("[LCP] Poor Largest Contentful Paint performance");
        }
      });

      try {
        observer.observe({ entryTypes: ["largest-contentful-paint"] });
        this.observers.set("lcp", observer);
      } catch (error) {
        console.log("LCP observer not supported");
      }
    }
  }

  // Monitor first input delay
  observeFID() {
    if ("PerformanceObserver" in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fid = entry.processingStart - entry.startTime;
          console.log(`[FID] ${fid}ms`);

          if (fid > 100) {
            console.warn("[FID] Poor First Input Delay performance");
          }
        }
      });

      try {
        observer.observe({ entryTypes: ["first-input"] });
        this.observers.set("fid", observer);
      } catch (error) {
        console.log("FID observer not supported");
      }
    }
  }

  // Monitor cumulative layout shift
  observeCLS() {
    if ("PerformanceObserver" in window) {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }

        console.log(`[CLS] Current: ${clsValue}`);

        if (clsValue > 0.1) {
          console.warn("[CLS] Poor Cumulative Layout Shift performance");
        }
      });

      try {
        observer.observe({ entryTypes: ["layout-shift"] });
        this.observers.set("cls", observer);
      } catch (error) {
        console.log("CLS observer not supported");
      }
    }
  }

  // Start all performance monitoring
  startMonitoring() {
    this.observeLongTasks();
    this.observeLCP();
    this.observeFID();
    this.observeCLS();

    // Log bundle loading metrics
    window.addEventListener("load", () => {
      const bundleMetrics = this.measureBundleLoad();
      if (bundleMetrics) {
        console.log("[Bundle Performance]", bundleMetrics);
      }
    });
  }

  // Stop all monitoring
  stopMonitoring() {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers.clear();
    this.metrics.clear();
  }

  // Generate performance report
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      memory: this.getMemoryUsage(),
      connection: navigator.connection
        ? {
            effectiveType: navigator.connection.effectiveType,
            downlink: navigator.connection.downlink,
            rtt: navigator.connection.rtt,
          }
        : null,
      bundle: this.measureBundleLoad(),
    };

    console.table(report);
    return report;
  }
}

// Create global performance tester instance
export const performanceTester = new PerformanceTester();

// Auto-start monitoring in development
if (import.meta.env.DEV) {
  performanceTester.startMonitoring();
}

export default performanceTester;
