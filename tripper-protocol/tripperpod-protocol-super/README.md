# Royal Enfield Tripper Pod — BLE Protocol

Reverse-engineered from **Super TripperPod** (`com.supertripper.app` v2.1), a third-party navigation bridge for the Royal Enfield Tripper Pod display.

> **Canonical merged spec:** [`../re-engineered-protocol/`](../re-engineered-protocol/)

> **Disclaimer:** This is community RE work, not official Royal Enfield documentation. UUIDs and framing have been validated against the Super TripperPod app targeting real `RE_DISP` hardware.

## Source

| Item | Value |
|------|-------|
| APK | `Super.apk` (apktool decompile) |
| Package | `com.supertripper.app` |
| Version | 2.1 (versionCode 51) |
| Key classes | `TripperProtocol`, `TripperBleManager`, `NavManeuver`, `InternalMapManager` |

## Quick reference

| Topic | File |
|-------|------|
| BLE service & connection | [ble-gatt.md](ble-gatt.md) |
| 20-byte frame & CRC | [frame-format.md](frame-format.md) |
| Command opcodes | [commands.md](commands.md) |
| Pairing & handshake | [handshake.md](handshake.md) |
| Navigation packets | [navigation.md](navigation.md) |
| Pod → phone responses | [responses.md](responses.md) |
| Maneuver byte tables | [maneuvers.md](maneuvers.md) |
| Compass, time, keepalive | [compass-time-keepalive.md](compass-time-keepalive.md) |
| Pre-built packet hex | [reference-packets.json](reference-packets.json) |
| Machine-readable constants | [constants.json](constants.json) |
| Python reference client | [tripper_protocol.py](tripper_protocol.py) |

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
5. During navigation: send `10 11` packets; pod ACKs with `10`
6. Keepalive: repeat last packet every 1 s

See [handshake.md](handshake.md) for timing details.
