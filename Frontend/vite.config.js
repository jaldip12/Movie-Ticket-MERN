import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // After admin/account routes are split out the public bundle should be
    // well under the 500 KB default — but framer-motion + radix can still
    // push individual vendor chunks above 500 KB on cold install. Bump the
    // warning ceiling so CI logs stay quiet without hiding real regressions.
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;

          // React core + router live together — they're always loaded so a
          // single shared chunk maximises long-term cache hits across deploys.
          if (
            id.includes("react-router-dom") ||
            id.match(/[\\/]react-dom[\\/]/) ||
            id.match(/[\\/]react[\\/]/) ||
            id.match(/[\\/]scheduler[\\/]/)
          ) {
            return "react-vendor";
          }

          if (id.includes("framer-motion")) return "motion-vendor";
          if (id.includes("@radix-ui")) return "radix-vendor";
          if (id.includes("socket.io-client") || id.includes("engine.io-client")) {
            return "realtime-vendor";
          }
          if (id.includes("qrcode") || id.includes("html5-qrcode")) {
            return "qr-vendor";
          }
          if (id.includes("axios")) return "axios-vendor";
          if (id.includes("lucide-react")) return "lucide-vendor";

          // Everything else falls into Vite's default vendor splitting.
          return undefined;
        },
      },
    },
  },
});
