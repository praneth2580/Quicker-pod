# Quicker-pod

**Quicker-pod** is an open-source, mobile-first Progressive Web App for exploring and communicating with the Royal Enfield **Tripper Pod** over Bluetooth Low Energy (BLE).

It is a community-driven alternative to the official Tripper Pod app. Version 1 focuses on **protocol exploration and BLE diagnostics** — not turn-by-turn navigation. The goal is to reverse-engineer the Tripper Pod communication protocol and build a fully open replacement over time.

**Live demo:** [https://praneth2580.github.io/Quicker-pod/](https://praneth2580.github.io/Quicker-pod/)

---

## Features

| Page | Route | Description |
|------|-------|-------------|
| **Dashboard** | `/` | Bluetooth status, connection state, device info, last TX/RX packets |
| **Connect** | `/scanner` | Scan, filter, connect, and disconnect BLE devices |
| **Protocol Lab** | `/protocol-lab` | BLE protocol workbench with 6 tabs (see below) |
| **Settings** | `/settings` | Dark mode, debug/experimental toggles |

### Protocol Lab tabs (`/protocol-lab`)

| Tab | Description |
|-----|-------------|
| **Explorer** | GATT services, characteristics, descriptors; read, subscribe, select TX target |
| **Monitor** | Live notification log with pause, clear, copy, export |
| **Sender** | Manual HEX transmission to a selected writable characteristic |
| **Mutation** | Guided byte mutation with rate limiting and results table |
| **Simulator** | Navigation maneuver packet generation |
| **Export** | Session export/import (JSON, CSV) |

Legacy routes (`/explorer`, `/console`, `/transmit`, `/simulator`) redirect to the matching Protocol Lab tab.

When Web Bluetooth is unavailable (e.g. desktop Firefox), the scanner falls back to **mock devices** so the UI and packet flow can still be tested.

---

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** — dev server and build tooling
- **React Router** — client-side routing
- **Zustand** — state management
- **Tailwind CSS** — mobile-first styling
- **vite-plugin-pwa** — installable PWA with offline shell
- **Web Bluetooth API** — BLE device communication
- No backend required

---

## Getting Started

### Prerequisites

- Node.js 18+
- **Chrome on Android** or **Chrome/Edge on desktop** for real BLE (HTTPS or `localhost` required)

### Local development

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Build

```bash
npm run build
npm run preview   # preview production build locally
```

### Deploy to GitHub Pages

```bash
npm run deploy
```

This builds the app, copies `index.html` → `404.html` for SPA routing, and pushes `dist/` to the **`gh-pages`** branch.

**GitHub Pages setup (one-time):** Repo → **Settings** → **Pages** → Source: branch `gh-pages`, folder `/ (root)`.

---

## PWA

Quicker-pod is installable as a standalone app on Android and desktop:

- Offline shell via service worker (Workbox)
- Add to home screen support
- Standalone display mode
- Theme color `#111827` (dark diagnostics aesthetic)

On supported browsers, an **Install** banner appears above the bottom navigation.

---

## Architecture

```
src/
├── bluetooth/       # BluetoothManager — Web Bluetooth wrapper + event system
├── components/      # Reusable UI (cards, buttons) and layout (nav, install prompt)
├── hooks/           # useBluetooth, useTheme
├── layouts/         # AppLayout shell
├── pages/           # Route-level views
├── services/        # Mock data for offline/dev testing
├── store/           # Zustand stores (connection, packets, settings)
├── types/           # TypeScript interfaces
├── utils/           # HEX conversion, formatting, file helpers
└── App.tsx          # Route definitions
```

### State management

| Store | Responsibility |
|-------|----------------|
| `connectionStore` | Device connection, services, characteristics, scan state |
| `packetStore` | Sent/received packets, saved packets, log export/import |
| `settingsStore` | Dark mode, debug mode, experimental mode (persisted) |

### Bluetooth layer

`bluetooth/BluetoothManager.ts` handles device request, connect/disconnect, characteristic read/write, notification subscriptions, and emits events consumed by the packet store. It is designed to be extended as the Tripper protocol is reverse-engineered.

---

## UI

Dark theme by default, inspired by OBD scanners, aircraft instrumentation, and network analyzers:

- Glassmorphism cards with rounded corners
- Large touch targets (mobile-first)
- Monospace packet viewer with horizontal scroll
- Safe-area padding for notched phones
- Horizontally scrollable bottom navigation

---

## Browser Support

| Feature | Chrome (Android) | Chrome (Desktop) | Firefox | Safari |
|---------|------------------|------------------|---------|--------|
| App UI | ✅ | ✅ | ✅ | ✅ |
| Web Bluetooth | ✅ | ✅ | ❌ | ❌ |
| PWA install | ✅ | ✅ | Limited | ✅ (iOS 16.4+) |

Real BLE requires a Chromium-based browser. Use mock mode elsewhere.

---

## Roadmap

- [ ] Reverse-engineered Tripper Pod protocol
- [ ] OpenStreetMap integration
- [ ] GPX import
- [ ] Turn-by-turn navigation
- [ ] Ride recording and route history
- [ ] Offline maps
- [ ] Fuel tracking

---

## Contributing

This project is in early development. Issues, protocol findings, and pull requests are welcome — especially packet captures and UUID mappings from real Tripper Pod hardware.

---

## License

Open source. See repository for license details.
