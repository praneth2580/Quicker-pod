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
- **Web Bluetooth API** — BLE device communication (browser)
- **Capacitor 7** + local **tripper-ble** plugin — Android dual-role BLE (GATT client + phone GATT server)
- **@vite-pwa/assets-generator** — PWA icon generation

No backend is required.

For Android Tripper pairing (SHOW PIN / AUTH), see **[docs/capacitor-tripper-ble.md](./docs/capacitor-tripper-ble.md)**.

---

## Prerequisites

- **Node.js 18+**
- **npm**
- **Chrome on Android** or **Chrome/Edge on desktop** for real BLE testing (HTTPS or `localhost`)

---

## Quick start

```bash
npm install
npm run dev:web
```

Open [http://localhost:5173](http://localhost:5173) for the **marketing landing** (GitHub Pages surface).

For the **functional companion** in the browser: `npm run dev:app` → open `/app.html`.

### Two surfaces (same repo)

| Surface | Entry | Output | Deploy |
|---------|-------|--------|--------|
| Landing (SEO / Download APK) | `index.html` → `src/site/main.tsx` | `dist-site/` | `npm run deploy:web` |
| App (Connect / Navigate / …) | `app.html` → `src/app/main.tsx` | `dist/` | `npm run deploy:app` (APK + landing URL) |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev:web` | Landing page only (site entry) |
| `npm run build:web` | Marketing site → `dist-site/` |
| `npm run deploy:web` | Build site + push `dist-site/` to `gh-pages` |
| `npm run dev:app` | Functional app entry (`/app.html`) |
| `npm run build:app` | Plugins + Capacitor web bundle + `cap sync android` |
| `npm run deploy:app` | Ask major/minor → APK Release → update landing URL → `deploy:web` |

Helper scripts (not npm aliases): `scripts/build-apk.sh`, `scripts/start-emulator.sh`, `scripts/run-android-emulator.sh`. They source `scripts/android-env.sh` (JDK **21** + `ANDROID_HOME`).

---

## Build

```bash
npm run build:web     # landing → dist-site/
npm run build:app     # companion → dist/ + android sync
```

Site build:

1. Runs PWA asset generation (icons + screenshots)
2. Typechecks with `tsc -b`
3. Bundles with Vite
4. Copies `index.html` → `404.html` for GitHub Pages SPA routing

Production base path is `/Quicker-pod/` (GitHub Pages). Local dev uses `/`.

---

## Deploy to GitHub Pages

```bash
npm run deploy:web
```

**One-time GitHub setup:** Repo → **Settings** → **Pages** → Source: branch `gh-pages`, folder `/ (root)`.

Live URL: [https://praneth2580.github.io/Quicker-pod/](https://praneth2580.github.io/Quicker-pod/)

---

## Android APK releases

### One command: bump, publish, update landing download URL

Requires a **clean git tree**, JDK 21 / Android SDK, and GitHub credentials for the Releases API.

```bash
# Preferred auth (do not put PATs in the git remote URL):
export GITHUB_TOKEN=…          # classic PAT with repo scope
# or: gh auth login

# If origin still embeds a token, clean it after exporting GITHUB_TOKEN:
#   git remote set-url origin https://github.com/praneth2580/Quicker-pod.git

DRY_RUN=1 npm run deploy:app           # print plan only (safe)
npm run deploy:app                     # interactive: asks major or minor
npm run deploy:app -- minor
npm run deploy:app -- major
SKIP_WEB_DEPLOY=1 npm run deploy:app   # APK Release only (skip gh-pages)
```

What it does:

1. Asks **major** or **minor**, bumps `package.json` + Android `versionName` / `versionCode`
2. Writes `public/apk-latest.json` (landing download CTA)
3. Builds `dist-apk/quicker-pod-X.Y.Z.apk` (via `scripts/android-env.sh` → JDK 21)
4. Commits, tags `vX.Y.Z`, creates/updates a GitHub Release with asset `quicker-pod-X.Y.Z.apk`
5. Runs `deploy:web` so the landing page points at the new APK URL

Clients prefer `apk-latest.json`, then fall back to the GitHub Releases API
(`src/hooks/useLatestApkRelease.ts`).

### Local APK only

```bash
bash scripts/build-apk.sh
# → dist-apk/quicker-pod-<package.json version>.apk
```

### CI alternative

Push a `v*` tag (or run Actions → **Release APK**). The workflow builds the APK,
uploads `quicker-pod-X.Y.Z.apk`, refreshes `apk-latest.json`, and deploys `gh-pages`.

Landing download URL comes from `apk-latest.json` (exact versioned asset).

Release APKs are signed with the Android **debug** keystore for sideloading.
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
│   └── tripper/            # Tripper Pod protocol (see tripper-protocol/re-engineered-protocol/)
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

### Protocol documentation

Canonical BLE protocol reference: **[`tripper-protocol/re-engineered-protocol/`](./tripper-protocol/re-engineered-protocol/)**

- Markdown specs (GATT, framing, handshake, navigation, …)
- [`constants.json`](./tripper-protocol/re-engineered-protocol/constants.json) — machine-readable opcodes
- [`tripper_protocol.py`](./tripper-protocol/re-engineered-protocol/tripper_protocol.py) — Python reference client

TypeScript packet builders live in `src/bluetooth/tripper/`. Python SDK in `tripper-sdk/`.

Protocol fuzzing and differential reverse-engineering (Python CLI, dry-run by default): [`tripper-sdk/docs/fuzzing.md`](./tripper-sdk/docs/fuzzing.md).

---

## Architecture

### Routing

**Landing (`src/site`):** `/` only (product + Download APK + SEO).

**App (`src/app`):**

| Route | Page |
|-------|------|
| `/` | Redirects to Home (`/dashboard`) |
| `/connect` | Connect / pairing |
| `/navigate` | Maps mirroring + Tripper nav |
| `/dashboard` | Home summary |
| `/dev` | Developer tools hub (also under Settings) |
| `/protocol-lab`, `/fuzzer`, `/ble-debug` | Dev tools |
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

- Light-first “road tour” theme (teal accent, atmospheric canvas); optional night-ride dark mode in Settings
- Mobile-first with safe-area padding and large touch targets
- Monospace packet viewers with horizontal scroll
- Four-item bottom navigation: **Home · Navigate · Connect · Settings** (dev tools under Settings)
- Maps notification mirroring: Capacitor plugin `plugins/nav-notifications` — see `docs/maps-notification-mirroring.md`

---

## Environment notes

- **Web Bluetooth** requires a secure context (HTTPS or localhost)
- **GitHub Pages** serves from `/Quicker-pod/` — `BrowserRouter` uses `import.meta.env.BASE_URL`

---

## License

Open source. See repository for license details.
