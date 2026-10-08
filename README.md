<p align="center">
  <img src="public/pwa-512x512.png" width="96" alt="Quicker-pod logo" />
</p>

<h1 align="center">Quicker-pod</h1>

<p align="center">
  <strong>Free &amp; open-source Tripper Pod companion</strong><br />
  Download the Android APK for full BLE pairing, or explore the protocol lab on the web.
</p>

<p align="center">
  <a href="https://praneth2580.github.io/Quicker-pod/download"><strong>Download page</strong></a>
  ·
  <a href="https://github.com/praneth2580/Quicker-pod/releases/latest"><strong>Download APK</strong></a>
  ·
  <a href="https://praneth2580.github.io/Quicker-pod/connect">Open app</a>
  ·
  <a href="https://github.com/praneth2580/Quicker-pod">GitHub</a>
</p>

<p align="center">
  <a href="https://praneth2580.github.io/Quicker-pod/">
    <img src="public/screenshots/mobile-narrow.png" width="280" alt="Quicker-pod on mobile" />
  </a>
</p>

> **Prefer the Android APK for real Tripper pairing.** Full PIN + AUTH needs the phone GATT server role, which browsers cannot host. The app opens on **Connect** (not the marketing page). APK download / promo lives at [`/download`](https://praneth2580.github.io/Quicker-pod/download) for `gh-pages` only — it is not in the in-app nav.

**Quicker-pod** is an open-source companion for the Royal Enfield **Tripper Pod**. Version 1 focuses on **protocol exploration and BLE diagnostics**, with a Capacitor Android build for the full pairing path.

For setup, development, build, and deployment instructions, see **[DEVELOPMENT.md](./DEVELOPMENT.md)**.

---

## Download the APK

1. Open the [download page](https://praneth2580.github.io/Quicker-pod/download) and tap **Download APK**, or go to [latest release](https://github.com/praneth2580/Quicker-pod/releases/latest).
2. Install `quicker-pod.apk` (enable install from that source on Android).
3. Open **Quicker Pod** and connect your Tripper.

**Stable download URL** (once a release with that asset exists):

```text
https://github.com/praneth2580/Quicker-pod/releases/latest/download/quicker-pod.apk
```

The landing page also calls the GitHub Releases API (`/repos/praneth2580/Quicker-pod/releases/latest`) and links the APK asset when present.

### Cut a new APK release

```bash
export GITHUB_TOKEN=…   # repo scope; or: gh auth login
# clean working tree, then:
npm run release         # bump → build APK → GitHub Release → apk-latest.json → gh-pages
```

See **[DEVELOPMENT.md](./DEVELOPMENT.md)** for bump modes, `DRY_RUN`, and JDK 21 notes.

Tag-only alternative: push a `v*` tag (or Actions → **Release APK**) — CI uploads `quicker-pod.apk` and refreshes download metadata on `gh-pages`.

---

## What you can do

| Area | What it does |
|------|----------------|
| **Android APK** | Full companion with native BLE / GATT server for Tripper pairing |
| **App** (`/`) | Connect → Navigate → Home / Settings; Dev tools under **Dev** |
| **Download page** (`/download`) | Marketing / APK download for GitHub Pages only (not in app nav) |

---

## How to use Quicker-pod

### Android (recommended for pairing)

1. Install the latest APK from GitHub Releases
2. Connect to your Tripper and complete the PIN shown on the display
3. Use the in-app dashboard and Protocol Lab

See [docs/capacitor-tripper-ble.md](./docs/capacitor-tripper-ble.md) for native BLE details.

### Web / Chrome (diagnostics)

1. Open the site root (redirects to **Connect**) or `/connect`
2. Use **Connect** with Web Bluetooth (`RE_DISP` / `RE_*`) where supported
3. Send nav idle / guidance from **Navigate**; open **Dev** for Protocol Lab / Fuzzer / BLE Debug

> **Full Tripper pairing (PIN on pod + AUTH)** needs the phone GATT server role — use the **Android APK**, not Web Bluetooth alone.

---

## App navigation

| Screen | Route | Notes |
|--------|-------|-------|
| Home (entry) | `/` → `/dashboard` | Ride status, next turn, connection summary |
| Navigate | `/navigate` | Maps mirror + keepalive + manual guidance |
| Connect | `/connect` | Tripper pairing / reconnect |
| Settings | `/settings` | Appearance, Maps notification access, developer tools |
| Dev hub | `/dev` | Protocol Lab / Fuzzer / BLE Debug (via Settings, not bottom nav) |
| Download (site only) | `/download` | APK promo page for `gh-pages` — not in app chrome |

Legacy routes (`/explorer`, `/console`, `/transmit`, `/simulator`) redirect to Protocol Lab tabs.

**Maps → Tripper:** on Android, enable notification access and start Google Maps navigation. See [`docs/maps-notification-mirroring.md`](./docs/maps-notification-mirroring.md).

---

## Browser / platform requirements

| Feature | Android APK | Chrome (Android/Desktop) | Firefox / Safari |
|---------|-------------|--------------------------|------------------|
| Full Tripper pairing (GATT server) | ✅ | ❌ | ❌ |
| Web Bluetooth client | — | ✅ | ❌ |
| APK download page (`/download`) | ✅ (site) | ✅ | ✅ |

---

## Safety notes

- Mutation / fuzzer tools require explicit user action
- Navigate **keepalive** (opt-in) re-sends the last nav packet every 1s while connected — matching the official companion
- Mutation tools are disabled until a writable characteristic is selected
- Mutations stop on disconnect or error

---

## Roadmap

- [x] Reverse-engineered Tripper Pod protocol — see [`tripper-protocol/re-engineered-protocol/`](./tripper-protocol/re-engineered-protocol/)
- [ ] OpenStreetMap integration
- [ ] GPX import
- [x] Manual Tripper nav write path (idle / guidance / keepalive)
- [x] Android notification / Maps nav mirroring (NotificationListenerService)
- [ ] Turn-by-turn navigation (OSM / GPX)
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
