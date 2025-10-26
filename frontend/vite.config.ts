// vite.config.ts (Corrected for localhost.run)

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    // We don't need `host: "::"` for this setup.
    
    // We will run the frontend on port 5173 to avoid conflicts with the backend.
    port: 5173, 
    
    // This is the key change. We are allowing any subdomain from localhost.run's domain.
    // The leading dot '.' is a wildcard.
    allowedHosts: [
      '.lhr.life'
    ]
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));