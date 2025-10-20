// src/main.tsx
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { GoogleOAuthProvider } from "@react-oauth/google"; // <-- Import

// Vite automatically loads the .env.local file
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!googleClientId) {
  throw new Error("Missing Google Client ID. Please set VITE_GOOGLE_CLIENT_ID in your .env.local file.");
}

createRoot(document.getElementById("root")!).render(
  // Wrap the entire App
  <GoogleOAuthProvider clientId={googleClientId}>
    <App />
  </GoogleOAuthProvider>
);