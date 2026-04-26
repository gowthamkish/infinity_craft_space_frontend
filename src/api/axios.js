import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Send httpOnly cookies automatically
  timeout: 120000, // 2 minutes timeout for large file uploads
  maxContentLength: Infinity, // Remove content length limit
  maxBodyLength: Infinity, // Remove body length limit
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue = [];

// ── CSRF token management ──────────────────────────────────────────────────────
let csrfToken = null;

async function ensureCsrfToken() {
  if (csrfToken) return csrfToken;
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/auth/csrf-token`,
      { withCredentials: true },
    );
    csrfToken = res.data.csrfToken;
  } catch {
    // Non-fatal: if CSRF fetch fails, proceed without it (will 403 on state-changing calls)
  }
  return csrfToken;
}

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor — cookies are sent automatically via withCredentials
api.interceptors.request.use(
  async (config) => {
    // Attach CSRF token to all state-changing requests
    if (!["get", "head", "options"].includes(config.method?.toLowerCase())) {
      const token = await ensureCsrfToken();
      if (token) config.headers["X-CSRF-Token"] = token;
    }
    // Log large requests in development
    if (import.meta.env.DEV && config.data) {
      const dataSize = JSON.stringify(config.data).length;
      if (dataSize > 1024 * 1024) {
        // > 1MB
        console.log(
          `[Large Request] ${config.url} - ${(dataSize / 1024 / 1024).toFixed(2)}MB`,
        );
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const url = originalRequest?.url || "";

    // Paths where we should never attempt a token refresh or redirect
    const noRefreshPaths = [
      "/api/auth/login",
      "/api/auth/register",
      "/api/auth/refresh-token",
    ];
    const isNoRefresh = noRefreshPaths.some((p) => url.includes(p));

    // Handle all 401s on protected endpoints by attempting a token refresh first.
    // On mobile (iOS Safari ITP), cookies may not be sent even right after login,
    // so we must try to refresh before giving up — not just when code === TOKEN_EXPIRED.
    // On 403 "Invalid CSRF token", refresh the CSRF token and retry once.
    // This handles iOS Safari ITP resetting cookies between sessions.
    if (
      error.response?.status === 403 &&
      error.response?.data?.error === "Invalid CSRF token" &&
      !originalRequest._csrfRetry
    ) {
      originalRequest._csrfRetry = true;
      csrfToken = null; // force re-fetch
      const token = await ensureCsrfToken();
      if (token) originalRequest.headers["X-CSRF-Token"] = token;
      return api(originalRequest);
    }

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isNoRefresh
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/auth/refresh-token`,
          {},
          { withCredentials: true },
        );
        processQueue(null, null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        // Refresh failed — only redirect to /login for protected data calls,
        // not for profile checks (those are just hydration probes).
        const noRedirectPaths = [
          "/api/auth/profile",
          "/api/auth/login",
          "/api/auth/register",
          "/api/auth/refresh-token",
        ];
        const isNoRedirect = noRedirectPaths.some((p) => url.includes(p));
        const alreadyOnAuth =
          window.location.pathname === "/login" ||
          window.location.pathname === "/register";

        // Grace period: on mobile (iOS Safari ITP), cookies can take a few seconds
        // to be sent after login. If we're within 25 seconds of login, skip the
        // redirect and let the page recover naturally on the next request.
        const loginTime = Number(sessionStorage.getItem("authLoginTime") || 0);
        const withinGracePeriod = loginTime && Date.now() - loginTime < 60_000;

        if (!isNoRedirect && !alreadyOnAuth && !withinGracePeriod) {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status === 401) {
      // Reached here only for login/register/refresh-token endpoints — let callers handle it.
    } else if (error.response?.status === 413) {
      // Payload too large
      console.error(
        "Payload too large - consider reducing image sizes or number of images",
      );
      return Promise.reject(
        new Error(
          "Files too large. Please reduce image sizes or upload fewer images.",
        ),
      );
    } else if (error.response?.status === 429) {
      // Rate limited
      console.error("Rate limit exceeded");
      return Promise.reject(
        new Error(
          error.response?.data?.error ||
            "Too many requests. Please try again later.",
        ),
      );
    } else if (error.code === "ECONNABORTED") {
      // Timeout error
      console.error("Request timeout - consider reducing payload size");
      return Promise.reject(
        new Error(
          "Upload timeout. Please try with smaller images or fewer files.",
        ),
      );
    }

    return Promise.reject(error);
  },
);

export default api;
