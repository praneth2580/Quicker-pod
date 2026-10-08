import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";

const REPO_BASE = "/Quicker-pod/";

const shortcutIcon = [{ src: "pwa-192x192.png", sizes: "192x192", type: "image/png" }];

export default defineConfig(({ command }) => {
  // Capacitor needs root-relative (or ./) assets; GitHub Pages uses the repo base path.
  const forCapacitor = process.env.CAPACITOR === "1" || process.env.CAPACITOR === "true";
  const base = forCapacitor ? "/" : command === "build" ? REPO_BASE : "/";

  return {
    base,
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: [".nojekyll", "screenshots/*.png", "robots.txt", "sitemap.xml"],
        pwaAssets: {
          config: true,
          overrideManifestIcons: true,
          includeHtmlHeadLinks: true,
          injectThemeColor: true,
        },
        manifest: {
          id: base,
          name: "Quicker-pod",
          short_name: "Quicker",
          description:
            "Free, open-source navigation companion for Royal Enfield Tripper Pod. Pair over BLE, mirror Google Maps turns, ride with the pod.",
          lang: "en",
          dir: "ltr",
          categories: ["navigation", "utilities"],
          theme_color: "#0f766e",
          background_color: "#eef3f6",
          display: "standalone",
          display_override: ["standalone", "minimal-ui", "browser"],
          orientation: "portrait",
          start_url: `${base}navigate`,
          scope: base,
          screenshots: [
            {
              src: "screenshots/mobile-narrow.png",
              sizes: "390x844",
              type: "image/png",
              form_factor: "narrow",
              label: "Quicker-pod navigation on mobile",
            },
            {
              src: "screenshots/mobile-wide.png",
              sizes: "1280x720",
              type: "image/png",
              form_factor: "wide",
              label: "Quicker-pod companion overview",
            },
          ],
          shortcuts: [
            {
              name: "Navigate",
              short_name: "Navigate",
              url: `${base}navigate`,
              icons: shortcutIcon,
            },
            {
              name: "Connect",
              short_name: "Connect",
              url: `${base}connect`,
              icons: shortcutIcon,
            },
            {
              name: "Settings",
              short_name: "Settings",
              url: `${base}settings`,
              icons: shortcutIcon,
            },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
          navigateFallback: `${base}index.html`,
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "tripper-ble": path.resolve(__dirname, "./plugins/tripper-ble/src/index.ts"),
      },
    },
    optimizeDeps: {
      exclude: ["tripper-ble"],
    },
  };
});
