import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";

const REPO_BASE = "/Quicker-pod/";

export default defineConfig(({ command }) => {
  const base = command === "build" ? REPO_BASE : "/";

  return {
    base,
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["favicon.svg", "apple-touch-icon.png", ".nojekyll"],
        manifest: {
          name: "Quicker-pod",
          short_name: "Quicker-pod",
          description: "Open-source BLE explorer for Royal Enfield Tripper Pod",
          theme_color: "#111827",
          background_color: "#111827",
          display: "standalone",
          orientation: "portrait",
          start_url: base,
          scope: base,
          icons: [
            {
              src: "pwa-192x192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
            },
            {
              src: "pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any maskable",
            },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
          navigateFallback: `${base}index.html`,
        },
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
