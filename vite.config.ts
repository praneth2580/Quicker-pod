import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";
import { renameSync, existsSync, copyFileSync } from "node:fs";

const REPO_BASE = "/Quicker-pod/";
const shortcutIcon = [{ src: "pwa-192x192.png", sizes: "192x192", type: "image/png" }];

function isCapacitorBuild() {
  return process.env.CAPACITOR === "1" || process.env.CAPACITOR === "true";
}

/** After app.html builds to dist/app.html, Capacitor needs dist/index.html. */
function capacitorIndexPlugin() {
  return {
    name: "capacitor-index-html",
    closeBundle() {
      if (!isCapacitorBuild()) return;
      const from = path.resolve(__dirname, "dist/app.html");
      const to = path.resolve(__dirname, "dist/index.html");
      if (existsSync(from)) {
        renameSync(from, to);
      }
    },
  };
}

export default defineConfig(({ command }) => {
  const forCapacitor = isCapacitorBuild();
  // Site (GitHub Pages) uses repo base; Capacitor app uses "/".
  const base = forCapacitor ? "/" : command === "build" ? REPO_BASE : "/";
  // Site artifacts → dist-site (gh-pages). App/Capacitor → dist.
  const outDir = forCapacitor ? "dist" : "dist-site";

  return {
    base,
    build: {
      outDir,
      emptyOutDir: true,
      rollupOptions: {
        input: forCapacitor
          ? path.resolve(__dirname, "app.html")
          : path.resolve(__dirname, "index.html"),
      },
    },
    plugins: [
      react(),
      ...(forCapacitor
        ? [
            VitePWA({
              registerType: "autoUpdate",
              includeAssets: ["screenshots/*.png"],
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
              devOptions: { enabled: false },
            }),
            capacitorIndexPlugin(),
          ]
        : [
            // Marketing site: no service worker needed for a static landing page
            {
              name: "site-copy-404",
              closeBundle() {
                const indexHtml = path.resolve(__dirname, `${outDir}/index.html`);
                const notFound = path.resolve(__dirname, `${outDir}/404.html`);
                if (existsSync(indexHtml)) {
                  copyFileSync(indexHtml, notFound);
                }
              },
            },
          ]),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "tripper-ble": path.resolve(__dirname, "./plugins/tripper-ble/src/index.ts"),
        "nav-notifications": path.resolve(__dirname, "./plugins/nav-notifications/src/index.ts"),
      },
    },
    optimizeDeps: {
      exclude: ["tripper-ble", "nav-notifications"],
    },
  };
});
