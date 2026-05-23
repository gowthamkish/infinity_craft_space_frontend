import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { Provider } from "react-redux";
import { store } from "./app/store";
import { ToastProvider } from "./context/ToastContext";
import { fetchCurrentUser } from "./features/authSlice";
import { fetchUserCart } from "./features/cartSlice";

// Restore session from httpOnly cookie — no localStorage needed.
// On mobile (iOS Safari ITP), cookies may not be immediately available after login.
// Retry once after a short delay if the first attempt fails.
store.dispatch(fetchCurrentUser()).then((result) => {
  if (result.payload?._id) {
    store.dispatch(fetchUserCart());
  } else {
    // Retry after 3 s to handle mobile cookie propagation delay
    const loginTime = Number(sessionStorage.getItem("authLoginTime") || 0);
    const recentlyLoggedIn = loginTime && Date.now() - loginTime < 60_000;
    if (recentlyLoggedIn) {
      setTimeout(() => {
        store.dispatch(fetchCurrentUser()).then((r) => {
          if (r.payload?._id) store.dispatch(fetchUserCart());
        });
      }, 3000);
    }
  }
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <ToastProvider>
      <App />
    </ToastProvider>
  </Provider>,
);

// Register service worker only in production builds to avoid caching during development
if (import.meta.env.VITE_ENV === "production" && "serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log(
        "Service Worker registered successfully:",
        registration.scope,
      );

      // Listen for updates
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              // New content is available, notify user
              console.log("New content is available; please refresh.");
              // You can show a toast notification here
            }
          });
        }
      });
    } catch (error) {
      console.error("Service Worker registration failed:", error);
    }
  });
} else if (import.meta.env.DEV && "serviceWorker" in navigator) {
  // In development, unregister any existing service workers to prevent caching
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.unregister().then(() => {
        console.log("Service Worker unregistered for development");
      });
    });
  });

  // Clear caches in development
  if ("caches" in window) {
    caches.keys().then((cacheNames) => {
      cacheNames.forEach((cacheName) => {
        caches.delete(cacheName).then(() => {
          console.log(`Cache '${cacheName}' cleared for development`);
        });
      });
    });
  }
}

// Performance observer for additional metrics
if (import.meta.env.DEV && "PerformanceObserver" in window) {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === "navigation") {
        console.log("[Navigation Timing]", {
          "DNS Lookup": entry.domainLookupEnd - entry.domainLookupStart,
          "TCP Connection": entry.connectEnd - entry.connectStart,
          "Request Time": entry.responseStart - entry.requestStart,
          "Response Time": entry.responseEnd - entry.responseStart,
          "DOM Processing":
            entry.domContentLoadedEventStart - entry.responseEnd,
          "Load Complete": entry.loadEventEnd - entry.navigationStart,
        });
      }

      if (entry.entryType === "resource" && entry.duration > 100) {
        console.warn(`[Slow Resource] ${entry.name} took ${entry.duration}ms`);
      }
    }
  });

  observer.observe({ entryTypes: ["navigation", "resource"] });
}
