# Royal Enfield Tripper Pod — Re-Engineered BLE Protocol

Consolidated protocol reference derived from two independent reverse-engineering efforts targeting the same `RE_DISP` hardware.

> **Disclaimer:** Community RE work, not official Royal Enfield documentation. On-wire framing, UUIDs, opcodes, and pre-built packets have been cross-validated between both source apps.

## Sources

| Source | Package | Role in this doc |
|--------|---------|------------------|
| **Royal Enfield reprime** | `com.royalenfield.reprime` | Primary for OTA, obfuscation map, RE-specific persistence keys |
| **Super TripperPod v2.1** | `com.supertripper.app` | Primary for clear class names (`TripperProtocol`, `TripperBleManager`) |

Raw RE data: [`../tripperpod-re/`](../tripperpod-re/)  
Raw Super data: [`../tripperpod-protocol-super/`](../tripperpod-protocol-super/)

App implementations: [`src/bluetooth/tripper/`](../../src/bluetooth/tripper/) (TypeScript), [`tripper-sdk/`](../../tripper-sdk/) (Python).

See [sources-comparison.md](sources-comparison.md) for a file-by-file diff summary.

## Cross-validation result

The on-wire protocol is **identical** between both apps:

- Same BLE service/characteristic UUIDs
- Same 20-byte frame (18 payload + CRC-16/CCITT-FALSE)
- Same command opcodes, screen IDs, maneuver bytes, and response codes
- Same pre-built static packets (`PKT_PIN_SHOW`, `PKT_CLOSE`, etc.)
- Same handshake timing and session flow

RE reprime splits logic across obfuscated `bluconnect/*` classes; Super TripperPod centralizes it in `TripperProtocol`. See [obfuscation-map.md](obfuscation-map.md).

## Quick reference

| Topic | File |
|-------|------|
| Source comparison | [sources-comparison.md](sources-comparison.md) |
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
- **Tripper Dash** — separate infotainment cluster path (not covered)

## Class name quick reference

| Function | RE reprime (obfuscated) | Super TripperPod |
|----------|-------------------------|------------------|
| BLE manager | `o12` | `TripperBleManager` |
| Packet builder | `k2h` | `TripperProtocol` |
| CRC | `xj3` | `TripperProtocol.crc16` |
| GATT callback | `jxa` | `gattCallback$1` |
| Keepalive timer | `q12` | (inline in BleManager) |
| Known devices | `ri1` | `TripperKnownDevices` |
