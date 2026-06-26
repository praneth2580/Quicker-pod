# RE Reprime — Obfuscation Map

Royal Enfield reprime obfuscates BLE/navigation code under the `bluconnect` package. Original class names are recovered from `SourceDebugExtension` SMAP annotations and behavioral analysis.

## Core BLE + protocol

| Obfuscated | Original name | Role | Smali |
|------------|---------------|------|-------|
| `o12` | `BleManager` | Central BLE manager: connect, scan, packet queue, handshake, set-time | `smali-reference/re/o12.smali` |
| `jxa` | GattCallback | GATT callbacks; UUIDs; notifications → `o12.l()` | `smali-reference/re/jxa.smali` |
| `k2h` | Nav packet builder | Builds 20-byte nav frames; CRC via `xj3` | `smali-reference/re/k2h.smali` |
| `xj3` | CRC-16 helper | `a([B)` table CRC; `b([B)` bit-at-a-time | `smali-reference/re/xj3.smali` |
| `q12` | Nav session manager | 1 s keepalive timer; calls `k2h.d()`; keepalive `0x40` | `smali-reference/re/q12.smali` |
| `h2h` | TBT step model | Google nav → pod fields | `smali_classes12/bluconnect/h2h.smali` |
| `j2h` | Distance/maneuver mapper | Converts meters, imperial, maneuver bytes for `k2h` | `smali-reference/re/j2h.smali` |
| `ssb` | BleManager interface | Abstract BLE API implemented by `o12` | — |
| `za7` | ScanCallback | LE scan → device discovery | — |
| `ti1` | Connection singleton | Holds `BluetoothGatt`, paired device list | `smali-reference/re/ti1.smali` |
| `ri1` | Paired device store | `isDeviceKnown` = `d(mac, ctx)` | `smali-reference/re/ri1.smali` |
| `p9k` | Navigation ViewModel | Tripper connection state, `TRIPPER` device type | — |
| `ugk` | Nav utilities | Injects `deviceName=RE_DISP` for Tripper Pod mode | — |

## UI / pairing (non-obfuscated)

| Class | Role | Smali |
|-------|------|-------|
| `DeviceListFragment` | Scan UI, PIN packet `0x20`, ping WP `0x30` | `smali-reference/re/DeviceListFragment.smali` |
| `PINAuthorizationScreen` | PIN entry UI | `smali_classes8/com/royalenfield/bluetooth/client/` |
| `BleSearchActivity` | BLE search | `smali_classes8/com/royalenfield/bluetooth/` |
| `NavigationFragment` | Calls `q12.o()` for live TBT | `smali_classes12/.../NavigationFragment.smali` |
| `NavigationRootFragment` | Creates `q12`, tripper dash auth | `smali_classes12/.../NavigationRootFragment.smali` |

## Firmware OTA (RE-only, same GATT link)

| Obfuscated | Role | Smali |
|------------|------|-------|
| `wni` | DFU / firmware update; `processReplyFromDisplay` opcodes `0x02`–`0x0A` | `smali-reference/re/wni.smali` |
| `dma` | Download + GATT write queue for OTA | — |
| `kdk` | `TripperLog.txt` logging | — |

## Super TripperPod equivalents

| RE (obfuscated) | Super (clear name) | Function |
|-----------------|-------------------|----------|
| `o12` | `TripperBleManager` | BLE connection + write queue |
| `k2h` | `TripperProtocol` | Packet building |
| `q12` | (inline in BleManager) | Keepalive timer |
| `xj3` | `TripperProtocol.crc16` | CRC computation |
| `jxa` | `gattCallback$1` | GATT event handler |
| `ri1` | `TripperKnownDevices` prefs | Known MAC storage |

## Key method mapping

| RE method | Super equivalent | Purpose |
|-----------|-----------------|---------|
| `o12.N(Z)` | `startHandshake()` | Send `21 01` (new) or `21 00` (known) |
| `o12.O()` | `buildSetTimeNowPacket()` | Send `50` set-time |
| `o12.l()` | `handleNotification()` AUTH path | Handle `0x20` PIN response |
| `k2h.d(...)` | `buildNavPacket()` | Build `10 11` nav frame |
| `q12.n()` / `q12.m(B)` | keepalive runnable | 1 s `0x40` keepalive |
| `DeviceListFragment.e5()` | `buildPinPacket()` | Send `0x20` + PIN digits |
| `ri1.d(mac, ctx)` | `isDeviceKnown()` | Check paired device list |

## SharedPreferences keys (RE)

| Key | Purpose |
|-----|---------|
| `mytbtlist` | Paired Tripper device MAC addresses |
| `lastConnectedMac` | Last successful connection (Super) |
| `TripperKnownDevices` | Known devices (Super app) |
