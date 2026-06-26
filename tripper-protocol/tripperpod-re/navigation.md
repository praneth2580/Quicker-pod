# Navigation Packets

Primary command: **`0x10 0x11`** (`CMD_NAVIGATE` + nav sub-command).

Built by `TripperProtocol.buildNavPacket()` and extended by `InternalMapManager.sendManeuverToTripper()`.

## Basic field layout (`buildNavPacket`)

| Offset | Field | Type | Description |
|--------|-------|------|-------------|
| 0 | command | u8 | `0x10` |
| 1 | subcommand | u8 | `0x11` |
| 2 | screen | u8 | Screen mode ID (see [commands.md](commands.md)) |
| 3 | dist_hi | u8 | Distance to maneuver, high byte |
| 4 | dist_lo | u8 | Distance to maneuver, low byte |
| 5 | maneuver | u8 | Turn icon byte |
| 6 | heading | u8 | Heading / approach intensity |
| 7 | speed_flags | u8 | Secondary maneuver info |
| 8 | dist_hi | u8 | **Duplicate** of byte 3 |
| 9 | dist_lo | u8 | **Duplicate** of byte 4 |
| 10 | road_type | u8 | Road classification |
| 11 | reserved | u8 | `0x00` in basic builder |
| 12 | eta_minutes | u8 | ETA in whole minutes |
| 13 | flag | u8 | `0x01` in basic builder |
| 14–17 | padding | u8 | `0x00` |
| 18–19 | crc | u16 | CRC-16 BE |

### Default builder arguments

When optional params are omitted (`buildNavPacket$default`):

| Param | Default |
|-------|---------|
| screen | `0x14` (TBT) |
| distMeters | 0 |
| maneuver | `0x40` (forward) |
| heading | `0x40` |
| speedFlags | `0x40` |
| roadType | `0x41` (street) |
| etaMinutes | 0 |

## Extended layout (`sendManeuverToTripper`)

Used by Google Maps Nav SDK bridge and internal Valhalla routing. **Differs from `buildNavPacket`** — the current maneuver icon is at **byte 2**, not byte 5.

| Offset | Field | Notes |
|--------|-------|-------|
| 0 | `0x10` | CMD_NAVIGATE |
| 1 | `0x11` | Nav sub-command |
| 2 | cur_maneuver | `NavManeuver.toByte()` or `0x1C` on reroute |
| 3–5 | distance | Encoded via `encodeDistance()` (hi, lo, scale) |
| 6 | intensity | `calcIntensity(distMeters)` |
| 7 | next_maneuver | Next turn byte, or `0xFF` if none |
| 8–9 | `0xFF` | Unused |
| 10 | `0x41` | Road type (street) |
| 11–13 | eta / distance | See ETA modes below |
| 14–17 | `0x00` | Padding |
| 18–19 | CRC | |

### ETA display modes

When `etaMode` is enabled and ETA > 0:

**Arrival time mode** (`etaShowArrival = true`):

| Byte | Content |
|------|---------|
| 11 | Hour (24h: 0–23; 12h AM/PM: hour + `0x40` for PM, + `0x80` for AM variant) |
| 12 | Minute (0–59) |
| 13 | `0x01` flag |

**Duration mode** (`etaShowArrival = false`):

| Byte | Content |
|------|---------|
| 11 | ETA hours (`etaMinutes / 60`, max 23) |
| 12 | ETA minutes (`etaMinutes % 60`, max 59) |
| 13 | `0x01` flag |

When ETA mode off but total route distance available: bytes 11–13 hold **encoded total distance** via `encodeDistance()`.

When no ETA/distance: bytes 11–13 = `0xFF`.

## Distance encoding (`encodeDistance`)

| Condition | Value bytes (hi, lo) | Scale byte |
|-----------|----------------------|------------|
| distance < 1000 m | meters (uint16 BE) | `0x01` |
| distance ≥ 1000 m | (meters / 100) uint16 BE | `0x02` |

Returns triple: `(dist_hi, dist_lo, scale)` placed at offsets 3–5 or 11–13.

### Examples

| Meters | Encoded (hi, lo, scale) |
|--------|-------------------------|
| 200 | `00 C8 01` |
| 1500 | `00 0F 02` (15 × 100 m) |
| 10000 | `00 64 02` |

## Approach intensity (`calcIntensity`)

Byte 6 when using `sendManeuverToTripper`. Based on meters to current maneuver:

| Distance to turn | Value | Notes |
|------------------|-------|-------|
| ≤ 10 m | `0x50` | Imminent |
| ≤ 20 m | `0x40` | |
| ≤ 45 m | `0x30` | |
| ≤ 70 m | `0x20` | |
| ≤ 95 m | `0x10` | |
| > 95 m | `0x00` | |

If **night mode** enabled: value += 1.

## Loading screen (`sendLoadingScreen`)

Sent on connect and between sessions:

| Offset | Value |
|--------|-------|
| 0 | `0x10` |
| 1 | `0x11` |
| 2 | `0x1C` (STOP screen) |
| 3–17 | `0x00` (byte 6 = `0x01` if night mode) |
| 18–19 | CRC |

## Stop navigation (`PKT_STOP_NAV`)

Pre-built: `10 11 1C 00 00 01 00 FF 00 … F7 82`

## Nav idle (`PKT_NAV_IDLE`)

Pre-built idle screen shown when not navigating:

`10 11 3C 00 00 04 40 15 00 00 41 00 04 03 00 00 00 10 50`

## Google Maps integration

`TripperNavInfoService` receives nav updates via Android `Messenger` (message id `0x1C20`):

1. Parse `NavInfo` bundle from Google Navigation SDK
2. Map maneuver integer → `NavManeuver.toByte(maneuver, roundaboutExit)`
3. On reroute flag: screen = `0x1C` (STOP)
4. Call `InternalMapManager.sendManeuverToTripper(screen, cur, next, dist, eta)`

## Internal routing (Valhalla)

`InternalMapManager` uses Valhalla/OSRM-style routing and calls the same `sendManeuverToTripper` path with `RouteStep` → maneuver byte conversion.

## Locked mode

When `TripperBleManager.locked == true`, all `sendNav()` calls are suppressed; `sendLocked()` sends a keepalive-style `0x40` packet with sub-command `0x42`.
