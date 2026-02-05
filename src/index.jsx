import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { Provider } from "react-redux";
import { store } from "./app/store";
import { setAuthFromStorage, fetchCurrentUser } from "./features/authSlice";
import "bootstrap/dist/css/bootstrap.min.css";

// Hydrate auth state from localStorage if available
try {
  const token = localStorage.getItem("token");
  if (token) {
    store.dispatch(setAuthFromStorage({ token }));
    store.dispatch(fetchCurrentUser());
  }
} catch (e) {
  // ignore storage errors
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <App />
  </Provider>,
);

// Register service worker for performance optimization
if ("serviceWorker" in navigator) {
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
