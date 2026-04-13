import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 120000, // 2 minutes timeout for large file uploads
  maxContentLength: Infinity, // Remove content length limit
  maxBodyLength: Infinity, // Remove body length limit
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue = [];

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

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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

    // Handle token expiry with refresh token
    if (
      error.response?.status === 401 &&
      error.response?.data?.code === "TOKEN_EXPIRED" &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        // No refresh token, redirect to login
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/auth/refresh-token`,
          { refreshToken },
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        localStorage.setItem("token", accessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        // Update the Authorization header
        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        processQueue(null, accessToken);

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status === 401) {
      // Token invalid (not just expired)
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
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
