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
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
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
