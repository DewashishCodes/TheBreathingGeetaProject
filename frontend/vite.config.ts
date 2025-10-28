// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    // Only include the lovable-tagger plugin in development mode
    mode === "development" && componentTagger(),
  ].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    host: true, // allows access from other devices / tunnels
    allowedHosts: ["*.ngrok-free.dev"], // allow your ngrok domain
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000", // FastAPI backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
}));
