# Handshake & Pairing

## Overview

After GATT connection and service discovery, the app runs `startHandshake()`. The path depends on whether the device MAC is in the **known devices** list.

## New device (first pairing)

```
App                              Tripper Pod
 │                                     │
 │── PKT_PIN_SHOW (21 01 …) ──────────►│  Show PIN UI
 │                                     │
 │◄── (user enters PIN on pod) ────────│
 │                                     │
 │── buildPinPacket(code) ────────────►│  CMD 0x20 + PIN digits
 │                                     │
 │◄── AUTH 0x20 [1]=0x01 ──────────────│  PIN accepted
 │                                     │
 │── SET TIME + PING FW ──────────────►│
```

### Steps

1. Send `PKT_PIN_SHOW` → `21 01 00 … 50 A7`
2. After **300 ms** (`0x12C`): callback `onReadyForPin` (UI prompts user)
3. User submits PIN; app sends `buildPinPacket(code)`:
   - `[0] = 0x20`
   - `[1..6]` = up to **6 ASCII digits** (PIN copied into bytes 1–6)
   - CRC over bytes 0–17
4. Pod responds `0x20` AUTH:
   - `[1] == 0x01` → accepted → `onPinAccepted`, MAC saved to known devices
   - otherwise → rejected → `onPinRejected`

## Known device (reconnect)

```
App                              Tripper Pod
 │                                     │
 │── PKT_CLOSE (21 00 …) ─────────────►│  Resume session
 │                                     │
 │  (200 ms)                           │
 │── SET TIME (50 hh mm fmt) ─────────►│
 │                                     │
 │  (150 ms)                           │
 │── PING FW (03 …) × 2 ──────────────►│
 │                                     │
 │  (300 ms)                           │
 │── onAlreadyPaired ─────────────────►│  (app callback)
```

### Timing (from `TripperBleManager.startHandshake`)

| Delay | Action |
|-------|--------|
| 0 ms | Send `PKT_CLOSE` (`21 00`) |
| +200 ms (`0xC8`) | Send `buildSetTimeNowPacket()` |
| +150 ms (`0x96`) | Send `PKT_PING_FW` twice |
| +300 ms (`0x12C`) | Invoke `onAlreadyPaired` |

## On connect (before handshake)

When GATT reaches `STATE_CONNECTED`:

- If **locked** mode: send `sendLocked()` packet
- Else: send **loading screen** (`sendLoadingScreen()`)
- Start service discovery

After services discovered + CCCD written:

- Wait **200 ms**, then `startHandshake()`

## PIN packet format (`CMD_DEVICE_ID` / `0x20`)

| Offset | Field |
|--------|-------|
| 0 | `0x20` |
| 1–6 | PIN digits (ASCII, max 6 chars) |
| 7–17 | `0x00` |
| 18–19 | CRC |

Example PIN `"123456"`:

```
20 31 32 33 34 35 36 00 00 00 00 00 00 00 00 00 00 00 [CRC]
```

## Session close packet (`CMD_HANDSHAKE` / `0x21`)

| Packet | Byte 0 | Byte 1 | Purpose |
|--------|--------|--------|---------|
| `PKT_PIN_SHOW` | `0x21` | `0x01` | Show PIN screen |
| `PKT_CLOSE` | `0x21` | `0x00` | Close / resume |

Both are pre-built static frames in `TripperProtocol` — see [reference-packets.json](reference-packets.json).

## Post-pairing initialization

After successful auth or reconnect:

1. **Set time** — sync pod clock to phone (see [compass-time-keepalive.md](compass-time-keepalive.md))
2. **Ping firmware** — retrieve version via `0x03` response
3. **Enable keepalive** — 1 s interval re-sending last nav packet
4. **Send nav idle** or loading screen until navigation starts

## Error handling

| Response | Meaning |
|----------|---------|
| `0x02` NACK | Last command rejected |
| AUTH `[1] != 1` | Wrong PIN |

On unexpected disconnect, the app schedules reconnect with backoff (unless `userDisconnected` flag is set).
