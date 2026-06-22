# Development Guide

This document covers how to set up, run, build, and deploy **Quicker-pod** locally.

For app features and usage workflows, see **[README.md](./README.md)**.

---

## Tech stack

- **React 19** + **TypeScript**
- **Vite** — dev server and build tooling
- **React Router** — client-side routing
- **Zustand** — state management
- **Tailwind CSS** — mobile-first styling
- **vite-plugin-pwa** — installable PWA with offline shell
- **Web Bluetooth API** — BLE device communication
- **@vite-pwa/assets-generator** — PWA icon generation

No backend is required.

---

## Prerequisites

- **Node.js 18+**
- **npm**
- **Chrome on Android** or **Chrome/Edge on desktop** for real BLE testing (HTTPS or `localhost`)

---

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Generate PWA assets, typecheck, and production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm run generate-pwa-assets` | Regenerate icons and screenshots from `public/icon.svg` |
| `npm run deploy` | Build and push `dist/` to the `gh-pages` branch |

---

## Build

```bash
npm run build
npm run preview   # optional: test production build at http://localhost:4173
```

The build:

1. Runs `generate-pwa-assets` (icons + screenshots)
2. Typechecks with `tsc -b`
3. Bundles with Vite
4. Copies `index.html` → `404.html` for GitHub Pages SPA routing

Production base path is `/Quicker-pod/` (GitHub Pages). Local dev uses `/`.

---

## Deploy to GitHub Pages

```bash
npm run deploy
```

**One-time GitHub setup:** Repo → **Settings** → **Pages** → Source: branch `gh-pages`, folder `/ (root)`.

Live URL: [https://praneth2580.github.io/Quicker-pod/](https://praneth2580.github.io/Quicker-pod/)

---

## PWA assets

Icons are generated from **`public/icon.svg`** using `@vite-pwa/assets-generator`.

```bash
npm run generate-pwa-assets
```

Generated files in `public/`:

- `favicon.ico`, `icon.svg`
- `pwa-64x64.png`, `pwa-192x192.png`, `pwa-512x512.png`
- `maskable-icon-512x512.png`
- `apple-touch-icon-180x180.png`
- `screenshots/mobile-narrow.png`, `screenshots/mobile-wide.png`

Configuration: `pwa-assets.config.ts`  
Screenshot script: `scripts/generate-screenshots.mjs`

To change the app icon, edit `public/icon.svg` and rerun `npm run generate-pwa-assets`.

### PWA features

- Offline shell via Workbox service worker
- Installable (`short_name`: **Quicker**)
- Maskable Android icon
- Theme color `#111827`
- Manifest screenshots for Chrome install UI
- Open Graph / Twitter meta tags

---

## Project structure

```
src/
├── bluetooth/              # BluetoothManager — Web Bluetooth wrapper
├── components/             # Shared UI and layout
├── features/
│   └── protocol-lab/       # Protocol Lab feature (tabs, stores, BLE helpers)
├── hooks/                  # useBluetooth, useTheme, usePwaInstall
├── layouts/                # AppLayout shell
├── pages/                  # Dashboard, Scanner, Settings
├── store/                  # connectionStore, settingsStore, pwaInstallStore
├── types/                  # Shared TypeScript interfaces
├── utils/                  # HEX conversion, formatting
└── App.tsx                 # Route definitions
```

---

## Architecture

### Routing

| Route | Page |
|-------|------|
| `/` | Dashboard |
| `/scanner` | Connect (BLE scanner) |
| `/protocol-lab` | Protocol Lab |
| `/settings` | Settings |

Legacy routes redirect to Protocol Lab tabs with `?tab=`.

### State management

| Store | Location | Responsibility |
|-------|----------|----------------|
| `connectionStore` | `src/store/` | Device connection, services, scan state |
| `settingsStore` | `src/store/` | Dark mode, debug/experimental (persisted) |
| `pwaInstallStore` | `src/store/` | PWA install prompt state |
| `protocolLabStore` | `features/protocol-lab/store/` | Lab UI state, selected characteristic |
| `packetLoggerStore` | `features/protocol-lab/store/` | TX/RX/notification logs (persisted) |
| `mutationStore` | `features/protocol-lab/store/` | Mutation jobs and results (persisted) |

### Bluetooth layer

`bluetooth/BluetoothManager.ts` handles device request, connect/disconnect, characteristic read/write, notification subscriptions, and emits events consumed by the protocol lab packet logger.

`features/protocol-lab/services/bleService.ts` adds descriptor discovery on top of the shared Bluetooth manager.

---

## UI conventions

- Dark theme by default (`#111827` surface, `#22d3ee` accent)
- Mobile-first with safe-area padding and large touch targets
- Monospace packet viewers with horizontal scroll
- Four-item bottom navigation: Home, Connect, Lab, Settings

---

## Environment notes

- **Web Bluetooth** requires a secure context (HTTPS or localhost)
- **GitHub Pages** serves from `/Quicker-pod/` — `BrowserRouter` uses `import.meta.env.BASE_URL`

---

## License

Open source. See repository for license details.
