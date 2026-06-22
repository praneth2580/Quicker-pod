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
        includeAssets: [".nojekyll", "screenshots/*.png"],
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
          description: "BLE protocol explorer for Royal Enfield Tripper Pod",
          lang: "en",
          dir: "ltr",
          categories: ["utilities", "developer"],
          theme_color: "#111827",
          background_color: "#111827",
          display: "standalone",
          display_override: ["standalone", "minimal-ui", "browser"],
          orientation: "portrait",
          start_url: base,
          scope: base,
          screenshots: [
            {
              src: "screenshots/mobile-narrow.png",
              sizes: "390x844",
              type: "image/png",
              form_factor: "narrow",
              label: "Protocol Lab on mobile",
            },
            {
              src: "screenshots/mobile-wide.png",
              sizes: "1280x720",
              type: "image/png",
              form_factor: "wide",
              label: "BLE diagnostics dashboard",
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
      },
    },
  };
});
