import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,

    // Phone se http://<laptop-ip>:5173 kholne ke liye
    host: true,

    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },

  build: {
    sourcemap: false,

    chunkSizeWarningLimit: 1000,

    cssCodeSplit: true,

    rollupOptions: {
      output: {
        manualChunks: {
          react: [
            "react",
            "react-dom",
            "react-router-dom",
          ],

          icons: [
            "lucide-react",
          ],

          dates: [
            "date-fns",
          ],
        },
      },
    },
  },
});