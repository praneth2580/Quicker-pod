# Compass, Time & Keepalive

## Set time (`CMD_SET_TIME` / `0x50`)

Syncs the Tripper Pod clock to the phone.

### Packet format

| Offset | Field |
|--------|-------|
| 0 | `0x50` |
| 1 | Hour (0–23) |
| 2 | Minute (0–59) |
| 3 | Clock format: `0` = 24-hour, `1` = 12-hour AM/PM |
| 4–17 | `0x00` |
| 18–19 | CRC |

`buildSetTimePacket(hour24, minute, is24h)` sets byte 3 to `is24h XOR 1` (inverted logic).

`buildSetTimeNowPacket()` uses current `Calendar` hour/minute with 24h format.

### Response

Pod replies `0x50` TIME_ACK.

## Compass mode (`buildCompassPacket`)

Shows heading on pod when compass feature is active (`CompassManager`).

| Offset | Value | Notes |
|--------|-------|-------|
| 0 | `0x10` | NAVIGATE |
| 1 | `0x11` | Nav sub-command |
| 2 | `0x41` | Compass screen marker |
| 3–5 | `0x00` | |
| 6 | direction | From `bearingToDirection(bearing)` |
| 7 | `0xFF` | |
| 8–10 | `0x00` | |
| 11–13 | `0xFF` | |
| 14 | direction | Same as byte 6 |
| 15–17 | `0x00` | |
| 18–19 | CRC | |

Night mode sets byte 6 via `buildCompassPacket(direction, nightMode=true)` — passed as byte at offset 6 in the smali (the `nightMode` boolean is stored at offset 6 in one code path; verify against live hardware).

## Keepalive (`CMD_KEEPALIVE` / `0x40`)

Maintains the BLE session and refreshes the pod display during navigation.

### Behavior

- Enabled via `setKeepaliveEnabled(true)` after successful pairing
- Runnable fires every **1000 ms**
- Only sends when:
  - Write queue is **empty**
  - No write currently **pending**
  - Write characteristic is available

### Packet selection

| Condition | Packet sent |
|-----------|---------------|
| Phone call active (`callIconActive`) | Call-icon keepalive |
| Normal navigation | Last nav packet (`lastNavPacket`) |

### Call-icon keepalive

```
40 05 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 [CRC]
```

- Byte 0: `0x40`
- Byte 1: `0x05`
- Bytes 2–17: zero
- CRC computed at runtime

### Nav keepalive

Re-transmits the exact bytes of the last `sendNav()` / `sendManeuverToTripper()` packet with log label `KEEPALIVE [<lastNavLabel>]`.

Uses `rawWrite()` (bypasses queue) to avoid blocking user-initiated updates.

## Nav control (`sendNavControl`)

Sends a `0x40` frame with arbitrary sub-command in byte 1:

| Offset | Field |
|--------|-------|
| 0 | `0x40` |
| 1 | sub_command |
| 2–17 | `0x00` |
| 18–19 | CRC |

Used for UI control passthrough from `InternalMapManager`.

## Locked mode (`sendLocked`)

When app is in locked state, sends keepalive-style packet with sub-command `0x42`:

```
40 42 00 … [CRC]
```

Navigation packets (`sendNav`) are suppressed while locked.

## Ping commands

### Firmware ping (`PKT_PING_FW`)

`03 00 00 … 45 D9` — triggers `OS_VERSION` (`0x03`) response.

Sent **twice** during reconnect handshake.

### Waypoint ping (`PKT_PING_WP`)

`30 00 00 … 42 8B` — purpose unclear in v2.1; exposed as `sendPingWaypoint()`.

## Timing summary

| Event | Interval |
|-------|----------|
| Inter-packet write delay | 80 ms |
| Keepalive period | 1000 ms |
| Handshake: close → set time | 200 ms |
| Handshake: set time → ping FW | 150 ms |
| Handshake: ping → onAlreadyPaired | 300 ms |
| Service discovery → handshake | 200 ms |
