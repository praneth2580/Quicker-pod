# Royal Enfield Tripper Pod — BLE Protocol

Reverse-engineered from the **Royal Enfield reprime** app (`com.royalenfield.reprime`) and cross-validated against **Super TripperPod** (`com.supertripper.app` v2.1).

> **Canonical merged spec:** [`../re-engineered-protocol/`](../re-engineered-protocol/)

> **Disclaimer:** Community RE work, not official Royal Enfield documentation. UUIDs and framing validated against both apps targeting `RE_DISP` hardware.

## Source

| Item | Value |
|------|-------|
| APK | `RoyalEnfield.apk` (apktool decompile → `re_apktool/`) |
| Package | `com.royalenfield.reprime` |
| BLE device name | `RE_DISP` |
| Key RE classes (obfuscated) | `o12` (BleManager), `k2h` (packet builder), `q12` (nav/keepalive), `xj3` (CRC) |
| Cross-reference | Super TripperPod — see `smali-reference/super/` |

The on-wire protocol is **identical** between RE reprime and Super TripperPod. RE splits logic across obfuscated `bluconnect/*` classes; Super uses a single `TripperProtocol` class. See [obfuscation-map.md](obfuscation-map.md).

## Quick reference

| Topic | File |
|-------|------|
| RE class name mapping | [obfuscation-map.md](obfuscation-map.md) |
| BLE service & connection | [ble-gatt.md](ble-gatt.md) |
| 20-byte frame & CRC | [frame-format.md](frame-format.md) |
| Command opcodes | [commands.md](commands.md) |
| Pairing & handshake | [handshake.md](handshake.md) |
| Navigation packets | [navigation.md](navigation.md) |
| Pod → phone responses | [responses.md](responses.md) |
| Maneuver byte tables | [maneuvers.md](maneuvers.md) |
| Compass, time, keepalive | [compass-time-keepalive.md](compass-time-keepalive.md) |
| Firmware OTA (RE-only) | [firmware-ota.md](firmware-ota.md) |
| Pre-built packet hex | [reference-packets.json](reference-packets.json) |
| Machine-readable constants | [constants.json](constants.json) |
| Python reference client | [tripper_protocol.py](tripper_protocol.py) |

## Directory layout

```
tripperpod-re/
├── README.md                  # This file
├── obfuscation-map.md         # RE smali → function mapping
├── *.md                       # Protocol documentation
├── constants.json             # UUIDs, opcodes, screen IDs
├── reference-packets.json     # Pre-built frame hex dumps
├── tripper_protocol.py        # Python packet builder/parser
├── smali-reference/
│   ├── re/                    # RE reprime extracted smali
│   └── super/                 # Super TripperPod reference smali
├── snippets/                  # Isolated Super smali fragments (CRC, handshake)
└── captures/                  # Grep indexes + decompiled Java dumps
```

## Protocol at a glance

```
Phone (GATT Central)  ──write──►  Tripper Pod (RE_DISP)
                      ◄─notify──  (same characteristic)
```

- All messages are **20 bytes**: 18-byte payload + **CRC-16/CCITT-FALSE** (big-endian).
- Primary nav command: `0x10 0x11` with screen, distance, maneuver, and ETA fields.
- Pairing uses `0x21` handshake + `0x20` PIN submission.
- Keepalive re-sends the last nav packet every **1 second** when idle.

## Typical session flow

1. Scan for BLE device named **`RE_DISP`**
2. Connect, discover service `01FF0100-…`, enable notifications on `01FF0101-…`
3. **New device:** send show-PIN (`21 01`), user pairs, send PIN (`20` + digits)
4. **Known device:** send close/resume (`21 00`), set time (`50`), ping firmware (`03` ×2)
5. During navigation: send `0x10 0x11` packets; pod ACKs with `0x10`
6. Keepalive: repeat last packet every 1 s

See [handshake.md](handshake.md) for timing details.

## Tripper Pod vs Tripper Dash

RE reprime supports both:

- **Tripper Pod** — BLE `RE_DISP`, protocol documented here
- **Tripper Dash** — separate infotainment cluster path (not covered in this folder)
