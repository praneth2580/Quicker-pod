<p align="center">
  <img src="public/pwa-512x512.png" width="96" alt="Quicker-pod logo" />
</p>

<h1 align="center">Quicker-pod</h1>

<p align="center">
  <strong>Free &amp; open-source Tripper Pod companion</strong><br />
  Download the Android APK for full BLE pairing, or explore the protocol lab on the web.
</p>

<p align="center">
  <a href="https://praneth2580.github.io/Quicker-pod/"><strong>Landing page</strong></a>
  ·
  <a href="https://github.com/praneth2580/Quicker-pod/releases/latest"><strong>Download APK</strong></a>
  ·
  <a href="https://praneth2580.github.io/Quicker-pod/app">Web lab</a>
  ·
  <a href="https://github.com/praneth2580/Quicker-pod">GitHub</a>
</p>

<p align="center">
  <a href="https://praneth2580.github.io/Quicker-pod/">
    <img src="public/screenshots/mobile-narrow.png" width="280" alt="Quicker-pod on mobile" />
  </a>
</p>

> **Prefer the Android APK for real Tripper pairing.** Full PIN + AUTH needs the phone GATT server role, which browsers cannot host. The website is a **landing + download** page; the web BLE lab remains at `/app` for Chrome diagnostics.

**Quicker-pod** is an open-source companion for the Royal Enfield **Tripper Pod**. Version 1 focuses on **protocol exploration and BLE diagnostics**, with a Capacitor Android build for the full pairing path.

For setup, development, build, and deployment instructions, see **[DEVELOPMENT.md](./DEVELOPMENT.md)**.

---

## Download the APK

1. Open the [landing page](https://praneth2580.github.io/Quicker-pod/) and tap **Download APK**, or go to [latest release](https://github.com/praneth2580/Quicker-pod/releases/latest).
2. Install `quicker-pod.apk` (enable install from that source on Android).
3. Open **Quicker Pod** and connect your Tripper.

**Stable download URL** (once a release with that asset exists):

```text
https://github.com/praneth2580/Quicker-pod/releases/latest/download/quicker-pod.apk
```

The landing page also calls the GitHub Releases API (`/repos/praneth2580/Quicker-pod/releases/latest`) and links the APK asset when present.

### Cut a new APK release

```bash
# Local build → dist-apk/quicker-pod.apk
npm run build:apk

# Publish via CI (preferred): push a version tag
git tag v0.1.0
git push origin v0.1.0
```

The **Release APK** workflow (`.github/workflows/release-apk.yml`) builds the Capacitor Android release APK and uploads `quicker-pod.apk` to the GitHub Release for that tag. You can also run it manually from the Actions tab (`workflow_dispatch`).

---

## What you can do

| Area | What it does |
|------|----------------|
| **Android APK** | Full companion with native BLE / GATT server for Tripper pairing |
| **Landing** | Promotional download page with latest release link |
| **Web lab** (`/app`) | Dashboard, Connect, Protocol Lab, Settings in Chrome (Web Bluetooth) |

---

## How to use Quicker-pod

### Android (recommended for pairing)

1. Install the latest APK from GitHub Releases
2. Connect to your Tripper and complete the PIN shown on the display
3. Use the in-app dashboard and Protocol Lab

See [docs/capacitor-tripper-ble.md](./docs/capacitor-tripper-ble.md) for native BLE details.

### Web lab (Chrome diagnostics)

1. Open **[`/app`](https://praneth2580.github.io/Quicker-pod/app)** (or `/dashboard`)
2. Use **Connect** with Web Bluetooth (`RE_DISP` / `RE_*`)
3. Explore GATT, monitor traffic, send packets in **Protocol Lab**

> **Full Tripper pairing (PIN on pod + AUTH)** needs the phone GATT server role — use the **Android APK**, not Web Bluetooth alone.

---

## App navigation

| Screen | Route | Notes |
|--------|-------|-------|
| Landing | `/` | Download / promo page — default for `npm run dev` |
| Web lab home | `/app` → `/dashboard` | BLE diagnostics UI |
| Connect | `/connect` | BLE scan and pairing |
| Protocol Lab | `/protocol-lab` | GATT explorer, monitor, sender, mutation, export |
| Settings | `/settings` | Theme, debug, and experimental toggles |

Legacy routes (`/explorer`, `/console`, `/transmit`, `/simulator`) redirect to Protocol Lab tabs.

---

## Browser / platform requirements

| Feature | Android APK | Chrome (Android/Desktop) | Firefox / Safari |
|---------|-------------|--------------------------|------------------|
| Full Tripper pairing (GATT server) | ✅ | ❌ | ❌ |
| Web Bluetooth client | — | ✅ | ❌ |
| Landing + download | ✅ (site) | ✅ | ✅ |

---

## Safety notes

- Packets are **never sent automatically** — every transmission requires explicit user action
- Mutation tools are disabled until a writable characteristic is selected
- Packet rate is capped (max ~2/sec) during mutations
- Mutations stop on disconnect or error

---

## Roadmap

- [x] Reverse-engineered Tripper Pod protocol — see [`tripper-protocol/re-engineered-protocol/`](./tripper-protocol/re-engineered-protocol/)
- [ ] OpenStreetMap integration
- [ ] GPX import
- [ ] Turn-by-turn navigation
- [ ] Ride recording and route history
- [ ] Offline maps
- [ ] Fuel tracking

---

## Contributing

This project is in early development. Issues, protocol findings, and pull requests are welcome — especially packet captures and UUID mappings from real Tripper Pod hardware.

See **[DEVELOPMENT.md](./DEVELOPMENT.md)** for how to run and build the project locally.

---

## License

Open source. See repository for license details.
