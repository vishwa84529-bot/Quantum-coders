import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const frontendEnv = loadEnv(mode, process.cwd(), ["VITE_", "REACT_APP_"]);
  const rootEnv = loadEnv(mode, path.resolve(process.cwd(), ".."), ["VITE_", "REACT_APP_"]);
  const googleMapsKey =
    frontendEnv.VITE_GOOGLE_MAPS_API_KEY ||
    frontendEnv.REACT_APP_GOOGLE_MAPS_API_KEY ||
    rootEnv.VITE_GOOGLE_MAPS_API_KEY ||
    rootEnv.REACT_APP_GOOGLE_MAPS_API_KEY ||
    "";

  return {
    plugins: [react()],
    envPrefix: ["VITE_", "REACT_APP_"],
    define: {
      "import.meta.env.VITE_GOOGLE_MAPS_API_KEY": JSON.stringify(googleMapsKey),
      "import.meta.env.REACT_APP_GOOGLE_MAPS_API_KEY": JSON.stringify(googleMapsKey),
    },
    server: {
      port: 5173,
      proxy: {
        "/api": {
          target: "http://localhost:8000",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
  };
});
