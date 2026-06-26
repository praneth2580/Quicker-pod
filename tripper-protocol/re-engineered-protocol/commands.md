# Command Opcodes

All command codes are the **first byte** (offset 0) of the 18-byte payload.

## Primary commands

| Name | Hex | Decimal | Description |
|------|-----|---------|-------------|
| `CMD_PING_FW` | `0x03` | 3 | Request firmware / OS version |
| `CMD_FUTURE_0B` | `0x0B` | 11 | Reserved — defined but unused in v2.1 |
| `CMD_NAVIGATE` | `0x10` | 16 | Navigation and display updates |
| `CMD_DEVICE_ID` | `0x20` | 32 | Submit pairing PIN |
| `CMD_HANDSHAKE` | `0x21` | 33 | Session / pairing UI control |
| `CMD_PING_WP` | `0x30` | 48 | Waypoint ping |
| `CMD_KEEPALIVE` | `0x40` | 64 | Keepalive and UI sub-commands |
| `CMD_SET_TIME` | `0x50` | 80 | Set pod clock |

## Sub-commands

### `CMD_HANDSHAKE` (`0x21`) — byte 1

| Value | Name | Action |
|-------|------|--------|
| `0x00` | `HS_CLOSE` | Close / resume session (reconnect path) |
| `0x01` | `HS_SHOW_PIN` | Show PIN entry screen on pod |

### `CMD_NAVIGATE` (`0x10`) — byte 1

| Value | Name | Action |
|-------|------|--------|
| `0x11` | Nav update | Standard TBT / screen update packet |

Other `0x10` packets may use different byte-1 values; `0x11` is the primary navigation sub-command.

### `CMD_KEEPALIVE` (`0x40`) — byte 1

| Value | Usage |
|-------|-------|
| `0x05` | Call-icon keepalive (phone call active) |
| *other* | `sendNavControl(sub)` — UI control passthrough |

## Screen IDs (byte 2 of `0x10 0x11` packets)

| Hex | Name | Description |
|-----|------|-------------|
| `0x01` | `SCREEN_LAST` | Last / previous screen |
| `0x14` | `SCREEN_TBT` | Turn-by-turn (default nav) |
| `0x15` | `SCREEN_ARRIVE` | Approaching destination |
| `0x1C` | `SCREEN_STOP` | Stop / loading |
| `0x32` | `SCREEN_HIGHWAY` | Highway mode |
| `0x3C` | `SCREEN_IDLE` | Idle (no active route) |
| `0x3D` | `SCREEN_RECALC` | Route recalculation |

## Maneuver icon bytes (byte 5 of nav packets)

| Hex | Name | Display |
|-----|------|---------|
| `0x00` | `MAN_STRAIGHT` | Straight / continue |
| `0x10` | `MAN_LEFT` | Turn left |
| `0x20` | `MAN_RIGHT_SOFT` | Turn right (soft) |
| `0x30` | `MAN_RIGHT_HARD` | Turn right (hard) |
| `0x40` | `MAN_FORWARD` | Keep straight / forward |
| `0x50` | `MAN_UTURN` | U-turn |
| `0x60` | `MAN_HIGHWAY` | Highway / ramp |

## Road type bytes (byte 10)

| Hex | Name |
|-----|------|
| `0x31` | `ROAD_HIGHWAY` |
| `0x41` | `ROAD_STREET` |
| `0x42` | `ROAD_AVENUE` |

## Handshake constants (Java source names)

From `TripperProtocol.smali`:

```
DEVICE_NAME     = "RE_DISP"
CMD_DEVICE_ID   = 0x20
CMD_HANDSHAKE   = 0x21
HS_SHOW_PIN     = 0x01
HS_CLOSE        = 0x00
```

See [navigation.md](navigation.md) for full nav packet field layout and [handshake.md](handshake.md) for pairing flows.
