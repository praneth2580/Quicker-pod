# Capacitor + TripperBle (Android)

Web Bluetooth can connect as a **GATT client**, but Tripper pairing requires the phone to also run a **GATT server**. AUTH (`0x20`) arrives via `onCharacteristicWriteRequest` on the phone — that path is only available in a native app.

Quicker-pod uses **Capacitor 7** plus a local plugin `plugins/tripper-ble` that mirrors the official RE app sequence ([startup-handshake.md](../tripper-sdk/docs/startup-handshake.md)).

## Prerequisites

- Node 20+
- JDK 17 or 21
- Android SDK (`ANDROID_HOME` set; platform API 35 recommended)
- Android Studio (for device deploy / logcat)

## One-time setup

```bash
npm install
npx cap add android           # if android/ is missing
npm run android:run           # sync → emulator if needed → installDebug → launch
```

## Permissions (Android 12+)

The app manifest requests:

| Permission | Purpose |
|------------|---------|
| `BLUETOOTH_SCAN` (`neverForLocation`) | Scan for `RE_` / `RE_DISP` |
| `BLUETOOTH_CONNECT` | GATT client connect / writes |
| `BLUETOOTH_ADVERTISE` | Phone GATT server / advertising role |
| `ACCESS_FINE_LOCATION` | Legacy scan on older APIs |
| `BLUETOOTH` / `BLUETOOTH_ADMIN` | Pre-API-31 |

Grant prompts appear on first `startPairing` / `reconnect`.

## Pairing test gate

1. Install the debug APK on a physical Android phone (BLE emulator is unreliable).
2. Turn motorcycle ignition **on** so the Tripper advertises.
3. Open **Connect** → **Connect**.
4. App starts **GATT server** → waits 200 ms → scans → connects (`TRANSPORT_LE`) → loading screen → SHOW PIN (`21 01 … 50 A7`).
5. **PIN must appear on the pod.** If it does not, check logcat / in-app BLE log for TX SHOW PIN and GATT server status.
6. Enter the 6-digit PIN → AUTH should arrive on the phone GATT server (`auth` / `rx` events).

## Architecture

| Layer | Role |
|-------|------|
| `BluetoothManager` | Branches on `Capacitor.isNativePlatform()` → `nativeTripperBle.ts` vs Web Bluetooth |
| `tripper-ble` plugin | Kotlin `TripperBleManager` (server + client + write queue ~80 ms) |
| `connectionStore` | Same `startPairing` / `submitPin` / `reconnectDevice` entry points |

Events: `connected`, `readyForPin`, `rx`, `auth`, `disconnected`, `log` (forwarded into `bleDebugLogger`).

## Useful commands

```bash
npm run cap:sync              # rebuild web + sync native
npm run android:run           # sync → emulator if needed → install + launch
SKIP_SYNC=1 npm run android:run   # install/launch without rebuilding web
adb logcat -s TripperBle:* Capacitor:*
```

## Troubleshooting

| Symptom | Check |
|---------|--------|
| No device / AVD | `emulator -list-avds`; set `ANDROID_AVD=Pixel_3a_API_34_extension_level_7_x86_64` |
| No PIN on pod | Confirm TX SHOW PIN in BLE log; GATT server must start *before* connect |
| Scan finds nothing | Ignition on; location/BLE permissions granted; device name starts with `RE_` |
| AUTH never verified | AUTH is server-side — watch `auth` events, not client notifications |
| Blank WebView | Rebuild with `CAPACITOR=1` so Vite `base` is `/`, then `cap sync` |
| Emulator + BLE | Emulator is fine for UI/smoke tests; **physical phone** needed for real Tripper BLE |
