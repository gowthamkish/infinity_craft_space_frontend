import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Use React Fast Refresh
      fastRefresh: true,
      // Include all .js and .jsx files
      include: "**/*.{js,jsx,ts,tsx}",
    }),
  ],
  // Treat .js files as JSX (CRA compatibility)
  esbuild: {
    loader: "jsx",
    include: /src\/.*\.[jt]sx?$/,
    exclude: [],
  },
  resolve: {
    alias: {
      react: path.resolve("./node_modules/react"),
      "react-dom": path.resolve("./node_modules/react-dom"),
    },
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    include: ["c3", "d3", "react", "react-dom", "react-redux"],
    esbuildOptions: {
      loader: {
        ".js": "jsx",
        ".jsx": "jsx",
      },
    },
  },
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
    middlewares: [
      (req, res, next) => {
        // Disable caching for HTML and dynamic assets in development
        if (req.url.endsWith(".html") || req.url === "/") {
          res.setHeader(
            "Cache-Control",
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          );
          res.setHeader("Pragma", "no-cache");
          res.setHeader("Expires", "0");
        }
        // Disable service worker caching during development
        if (req.url === "/sw.js") {
          res.setHeader(
            "Cache-Control",
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          );
        }
        next();
      },
    ],
  },
  preview: {
    port: 3000,
  },
  build: {
    rollupOptions: {
      output: {
        // Add hash to all assets for cache-busting in production
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
    outDir: "build",
    sourcemap: false,
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          redux: ["@reduxjs/toolkit", "react-redux"],
          bootstrap: ["react-bootstrap", "bootstrap"],
        },
      },
    },
  },
  // Enable .env file support (VITE_* prefix)
  envPrefix: "VITE_",
});
