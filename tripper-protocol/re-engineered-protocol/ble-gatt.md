# BLE GATT Profile

> **Sources:** RE `bluconnect/o12` (BleManager), `bluconnect/jxa` (GattCallback), `bluconnect/ri1` (known devices). Super `TripperBleManager`, `gattCallback$1`, `TripperKnownDevices`. See [obfuscation-map.md](obfuscation-map.md).

## Device identification

| Field | Value |
|-------|-------|
| Advertised name | `RE_DISP` |
| Role | Tripper Pod = **peripheral**, phone = **central** |
| Transport | Bluetooth Low Energy (BLE) |
| Min SDK (app) | Android 26 |

## UUIDs

| Role | UUID |
|------|------|
| Custom service | `01FF0100-BA5E-F4EE-5CA1-EB1E5E4B1CE0` |
| Read / write / notify characteristic | `01FF0101-BA5E-F4EE-5CA1-EB1E5E4B1CE0` |
| Client Characteristic Configuration (CCCD) | `00002902-0000-1000-8000-00805f9b34fb` |

The app discovers the service, selects the `01FF0101` characteristic as the **write** target, enables **notifications** on the same characteristic, and writes `ENABLE_NOTIFICATION_VALUE` to the CCCD.

## Connection sequence

1. **Scan** for devices named `RE_DISP` (or connect by known MAC).
2. **Connect** GATT (`connectGatt`).
3. On `STATE_CONNECTED`: optionally send loading screen; call `discoverServices()`.
4. On `onServicesDiscovered`:
   - Locate service `01FF0100-…`
   - Locate characteristic `01FF0101-…`
   - `setCharacteristicNotification(char, true)`
   - Write CCCD descriptor to enable notifications
   - After **200 ms** delay → `startHandshake()`
5. On disconnect: clear send queue, disable keepalive, schedule auto-reconnect (unless user disconnected).

## Traffic model

| Direction | Mechanism |
|-----------|-----------|
| Phone → Pod | `writeCharacteristic` (write-with-response) |
| Pod → Phone | Notifications on `01FF0101` |

## Write queue

Both apps serialize all outbound packets:

- Packets are enqueued in a `ConcurrentLinkedQueue`.
- Only one write in flight (`writePending` atomic flag).
- On `onCharacteristicWrite` success → pump next packet after **80 ms** (`WRITE_DELAY_MS`).

## Persistence

Known devices are stored in SharedPreferences:

| App | Prefs name | Keys |
|-----|------------|------|
| RE reprime | (default) | `mytbtlist` — paired MAC addresses |
| Super TripperPod | `TripperKnownDevices` | `knownMacs`, `lastConnectedMac`, `lastTripperFirmware` |

Both apps check whether the connecting MAC is in the known-device list before choosing the handshake path (show PIN vs resume session).

## Foreground service

Super TripperPod runs `TripperService` as a foreground service (`connectedDevice|location`) to maintain the BLE link during navigation. RE reprime uses an equivalent background connection model for navigation sessions.

## GATT server (secondary)

Super TripperPod's `TripperBleManager` also implements a **GATT server** (`startGattServer`). Purpose in this build appears related to call/media metadata bridging; the primary Tripper Pod protocol uses the **central** role documented above. Not observed in RE reprime navigation path.
