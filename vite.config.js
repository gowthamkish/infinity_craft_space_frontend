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
    include: ["recharts", "react", "react-dom", "react-redux"],
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
    outDir: "build",
    sourcemap: false,
    // Target modern browsers — avoids legacy polyfills that add dead KB
    target: "es2020",
    // Don't print gzip sizes during build (saves ~2s on large projects)
    reportCompressedSize: false,
    // Warn only when a single chunk exceeds 600 KB (before compression)
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
        manualChunks(id) {
          // Each group below becomes a separate cached chunk.
          // Browsers download chunks in parallel; splitting means a change
          // to one group doesn't bust the cache of the others.

          // Heavy spreadsheet lib — only needed on /admin/bulkImport
          if (id.includes("node_modules/xlsx")) return "xlsx";

          // MUI icon glyphs — 174 MB source, tree-shaken but still large
          if (id.includes("@mui/icons-material")) return "mui-icons";

          // MUI core + emotion (styling engine)
          if (
            id.includes("@mui/material") ||
            id.includes("@emotion/react") ||
            id.includes("@emotion/styled") ||
            id.includes("@mui/system") ||
            id.includes("@mui/base")
          )
            return "mui";

          // Charting — only used in /admin/analytics
          if (id.includes("recharts") || id.includes("d3-")) return "charts";

          // State management
          if (id.includes("@reduxjs/toolkit") || id.includes("react-redux"))
            return "redux";

          // React core + router — smallest possible initial chunk
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("react-router-dom") ||
            id.includes("react-router/")
          )
            return "vendor";
        },
      },
    },
  },
  // Enable .env file support (VITE_* prefix)
  envPrefix: "VITE_",
});
