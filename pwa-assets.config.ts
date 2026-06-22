import { defineConfig, minimal2023Preset } from "@vite-pwa/assets-generator/config";

export default defineConfig({
  preset: {
    ...minimal2023Preset,
    maskable: {
      sizes: [512],
      padding: 0.3,
      resizeOptions: { background: "#111827", fit: "contain" },
    },
    apple: {
      sizes: [180],
      padding: 0.3,
      resizeOptions: { background: "#111827", fit: "contain" },
    },
  },
  images: ["public/icon.svg"],
});
