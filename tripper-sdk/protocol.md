# Royal Enfield Tripper BLE Protocol

> **Canonical spec:** [`../tripper-protocol/re-engineered-protocol/`](../tripper-protocol/re-engineered-protocol/) — cross-validated from Royal Enfield reprime + Super TripperPod v2.1.

This document covers SDK-specific notes (GATT server role, Web Bluetooth limits). For opcode tables and packet layouts, prefer the canonical spec.

Reverse-engineered from **Super Tripper** APK (`com.supertripper.app`) smali sources.

## BLE GATT

| Item | UUID |
|------|------|
| Device name | `RE_DISP` |
| Service | `01FF0100-BA5E-F4EE-5CA1-EB1E5E4B1CE0` |
| Read/Write/Notify characteristic | `01FF0101-BA5E-F4EE-5CA1-EB1E5E4B1CE0` |
| CCCD | `00002902-0000-1000-8000-00805f9b34fb` |

The same characteristic is used for writes and notifications. After service discovery the app enables notifications on the write characteristic, writes `0x0100` to CCCD, waits 200 ms, then runs the handshake.

## Packet framing

Every packet is **20 bytes**:

| Bytes | Content |
|-------|---------|
| 0–17 | Payload |
| 18 | CRC high byte |
| 19 | CRC low byte |

CRC: **CRC-16/CCITT-FALSE** over bytes 0–17 (polynomial `0x1021`, init `0xFFFF`).

## Opcodes (byte 0)

| Value | Name | Direction |
|-------|------|-----------|
| `0x02` | NACK | Device → phone |
| `0x03` | PING_FW / OS_VERSION | Both |
| `0x10` | NAVIGATE | Phone → device |
| `0x20` | DEVICE_ID / AUTH | Both |
| `0x21` | HANDSHAKE / SESSION | Both |
| `0x30` | PING_WP / SERIAL | Both |
| `0x40` | KEEPALIVE | Phone → device |
| `0x50` | SET_TIME / TIME_ACK | Both |

Byte 1 is usually a sub-command (e.g. `0x11` for navigation screens).

## Connection sequence (`startHandshake`)

See **[startup-handshake.md](./startup-handshake.md)** for the full verified state machine,
logcat timeline, and root-cause analysis for PIN display failures.

```text
connectDevice()
  → startGattServer()          ← phone hosts 01FF0100 service (required)
  → wait 200 ms
  → connectGatt(TRANSPORT_LE)
  → onConnected: sendLoadingScreen()
  → discoverServices()
  → setCharacteristicNotification + optional CCCD
  → wait 200 ms
  → startHandshake()
```

**Tripper responses (AUTH, OS_VERSION, SERIAL) arrive via writes to the phone GATT server,
not client notifications.** Web Bluetooth cannot implement this server role.

### New device (PIN pairing)

```text
1. WRITE  21 01 … 50 A7     SHOW PIN screen   (PKT_PIN_SHOW)
   wait 300 ms
2. UI shows PIN entry → user submits PIN
3. WRITE  20 [6×ASCII PIN] … CRC   (buildPinPacket)
4. NOTIFY 20 01 …              AUTH accepted (byte1 == 0x01)
5. App sends SET TIME + PING FW (after onPinAccepted callback)
```

### Known device (reconnect)

```text
1. WRITE  21 00 … 40 45     CLOSE / RESUME
   wait 200 ms
2. WRITE  50 [hour][min][fmt] …   SET TIME (current clock)
   wait 150 ms
3. WRITE  03 …              PING FW  (sent twice)
   wait 300 ms
4. onAlreadyPaired()
```

On initial GATT connect (before handshake), the app sends a **loading screen** nav packet (`screen=0x1C`).

## PIN packet (`buildPinPacket`)

| Byte | Value |
|------|-------|
| 0 | `0x20` |
| 1–6 | PIN as ASCII digits (`'0'`–`'9'`) |
| 7–17 | `0x00` |
| 18–19 | CRC |

Example PIN `123456`:

```text
20 31 32 33 34 35 36 00 00 00 00 00 00 00 00 00 00 00 [CRC]
```

## AUTH response (`parseResponse`)

| Byte | Meaning |
|------|---------|
| 0 | `0x20` |
| 1 | `0x01` = accepted, else rejected |

## Time sync (`buildSetTimePacket`)

| Byte | Field |
|------|-------|
| 0 | `0x50` |
| 1 | Hour (0–23) |
| 2 | Minute (0–59) |
| 3 | `0` = 24 h display, `1` = 12 h display |

## Handshake packets

| Packet | Hex (first bytes) |
|--------|-------------------|
| Show PIN | `21 01 …` |
| Close / resume | `21 00 …` |
| Ping firmware | `03 00 …` |
| Ping waypoint | `30 00 …` |

## Navigation — simple builder (`buildNavPacket`)

Used by `TripperBleManager.sendNav()`:

| Byte | Field |
|------|-------|
| 0 | `0x10` |
| 1 | `0x11` |
| 2 | Screen ID |
| 3–4 | Distance to maneuver (uint16 BE, meters) |
| 5 | Maneuver icon |
| 6 | Heading |
| 7 | Speed flags |
| 8–9 | Distance duplicate (same as 3–4) |
| 10 | Road type |
| 11 | `0x00` |
| 12 | ETA minutes |
| 13 | `0x01` |

### Screen IDs

| Value | Screen |
|-------|--------|
| `0x01` | LAST |
| `0x14` | Turn-by-turn |
| `0x15` | Arrival |
| `0x1C` | Stop / loading |
| `0x32` | Highway |
| `0x3C` | Idle |
| `0x3D` | Recalculating |

### Maneuver icons (byte 5)

| Value | Meaning |
|-------|---------|
| `0x00` | Straight |
| `0x10` | Left |
| `0x20` | Right (soft) |
| `0x30` | Right (hard) |
| `0x40` | Forward / keep |
| `0x50` | U-turn |
| `0x60` | Highway |

### Road types (byte 10)

| Value | Meaning |
|-------|---------|
| `0x31` | Highway |
| `0x41` | Street |
| `0x42` | Avenue |

### Defaults (`sendNav` Kotlin defaults)

- `heading` = `0x40`
- `speedFlags` = `0x40`
- `screen` = `0x14` (TBT)
- `roadType` = `0x41`
- `eta` = `0`

## Navigation — live builder (`sendManeuverToTripper`)

Used by `InternalMapManager` for real Google/Valhalla navigation:

| Byte | Field |
|------|-------|
| 0–2 | `10 11 [screen]` |
| 3–4 | Encoded distance (high, low) |
| 5 | Unit: `1` = meters, `2` = ×100 m |
| 6 | Intensity (distance-based, +1 at night) |
| 7 | Maneuver detail / heading |
| 8–9 | `0xFF` |
| 10 | `0x41` road |
| 11–13 | ETA or total-distance extension |
| 14–17 | `0x00` |

### Distance encoding

- If distance &lt; 1000 m: value = meters, unit = `1`
- Else: value = distance ÷ 100, unit = `2`

### Intensity (`calcIntensity`)

| Distance | Value |
|----------|-------|
| ≤ 10 m | `0x50` |
| ≤ 20 m | `0x40` |
| ≤ 45 m | `0x30` |
| ≤ 70 m | `0x20` |
| ≤ 95 m | `0x10` |
| &gt; 95 m | `0x00` |

Add `+1` when night mode is enabled.

### ETA bytes (11–13)

When ETA mode is on:

- **Duration mode**: byte 11 = hours, byte 12 = minutes, byte 13 = `0`
- **Arrival mode (12 h)**: hour with `+0x40` (AM) or `+0x80` (PM)
- **Arrival mode (24 h)**: hour 0–23, minute 0–59

When ETA mode is off but total route distance is known, bytes 11–13 repeat the distance encoding for total distance. Otherwise `FF FF FF`.

## Compass (`buildCompassPacket`)

| Byte | Value |
|------|-------|
| 0–2 | `10 11 41` |
| 6 | Night mode (`0`/`1`) |
| 7, 11–13 | `0xFF` |
| 14 | Direction byte |

### Direction bytes (`bearingToDirection`)

| Cardinal | Byte |
|----------|------|
| N | `0x10` |
| NE | `0x60` |
| E | `0x30` |
| SE | `0x70` |
| S | `0x40` |
| SW | `0x80` |
| W | `0x20` |
| NW | `0x50` |

Bearing uses +22.5° offset and 45° sectors. **Sector index → byte** mapping (smali packed-switch):

| Sector | Byte |
|--------|------|
| 0 | `0x10` (N) |
| 1 | `0x50` (NW) |
| 2 | `0x20` (W) |
| 3 | `0x70` (SE) |
| 4 | `0x40` (S) |
| 5 | `0x80` (SW) |
| 6 | `0x30` (E) |
| 7 | `0x60` (NE) |

## Keepalive

When idle, every 1 s the app re-writes the last nav packet if the queue is empty. During phone calls it sends `40 05 …` (call icon keepalive).

## Device → phone responses

| Byte 0 | Label | Notes |
|--------|-------|-------|
| `0x02` | NACK | Command rejected |
| `0x03` | OS_VERSION | Bytes 1–2 BCD version (e.g. `0x13 0x03` → 1.3) |
| `0x10` | NAV_ACK | Navigation accepted |
| `0x20` | AUTH | PIN result |
| `0x21` | SESSION | Session event |
| `0x30` | SERIAL | ASCII serial in bytes 1–7 |
| `0x50` | TIME_ACK | Time set confirmed |

## Static packets (from APK)

```text
PKT_PIN_SHOW  = 21 01 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 50 A7
PKT_CLOSE     = 21 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 40 45
PKT_PING_FW   = 03 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 45 D9
PKT_PING_WP   = 30 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 42 8B
PKT_STOP_NAV  = 10 11 1C 00 00 01 00 FF 00 00 00 00 00 00 00 00 00 00 F7 82
PKT_NAV_IDLE  = 10 11 3C 00 00 04 40 15 00 00 41 00 04 03 00 00 00 00 10 50
```

## Python SDK

See `packets.py`, `parser.py`, and `ble.py` in this directory.

```bash
pip install bleak
```

```python
from packets import build_pin_packet, build_nav_packet, SCREEN_TBT, MAN_LEFT
from parser import parse_response

pkt = build_nav_packet(SCREEN_TBT, 250, MAN_LEFT)
resp = parse_response(bytes.fromhex("20 01 00 ..."))
```

## Open items

- [ ] Confirm PIN placement with a live HCI capture (smali `copyInto` offsets are ambiguous)
- [ ] Map all `GoogleManeuver` enum values to icon + byte7 pairs
- [ ] Document `0x40` keepalive sub-commands beyond call-icon (`0x05`)
- [ ] Capture real `SESSION` (`0x21`) notification payloads
- [ ] Verify whether firmware uses write-with-response or write-without-response
