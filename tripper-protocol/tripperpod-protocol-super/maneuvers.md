# Maneuver Byte Mapping

Tripper Pod nav packets use a **maneuver byte** (offset 5) to select the turn icon. Two mapping layers exist in Super TripperPod:

1. **`NavManeuver.toByte`** — maps Google Navigation SDK maneuver integers
2. **`TripperProtocol.GoogleManeuver`** — named enum with `byte5` / `byte6` pairs for heading and speed flags

## Protocol maneuver icons (byte 5)

Used in `maneuverLabel()` and basic nav builder:

| Hex | Name | Label (PT) |
|-----|------|------------|
| `0x00` | `MAN_STRAIGHT` | Reto |
| `0x10` | `MAN_LEFT` | ← Esquerda |
| `0x20` | `MAN_RIGHT_SOFT` | → Direita |
| `0x30` | `MAN_RIGHT_HARD` | →→ Direita Forte |
| `0x40` | `MAN_FORWARD` | ↑ Manter |
| `0x50` | `MAN_UTURN` | ↩ Retorno |
| `0x60` | `MAN_HIGHWAY` | ⤴ Rodovia |

## Google Navigation SDK → Tripper (`NavManeuver.toByte`)

Maps `maneuver` int + `roundaboutExit` int → single byte.

### Standard maneuvers (maneuver ID → byte)

| Maneuver ID | Google name (typical) | Tripper byte |
|-------------|----------------------|--------------|
| 0 | Unknown / none | `0xFF` |
| 1 | Depart | `0x3C` |
| 2 | — | `0x00` (fallthrough) |
| 3 | — | `0x01` |
| 4 | — | `0x02` |
| 5 | — | `0x09` |
| 6 | — | `0x14` |
| 7 | — | `0x15` |
| 8 | Turn slight left | `0x18` |
| 9 | Turn sharp left | `0x19` |
| 10 | Turn slight left (alt) | `0x18` |
| 11 | Turn sharp left (alt) | `0x19` |
| 12 | — | `0x16` |
| 13 | — | `0x17` |
| 14 | U-turn | `0x1A` |
| 15 | — | `0x3D` |
| 16 | — | `0x1B` |
| 17 | — | `0x04` |
| 18 | — | `0x03` |
| 19 | — | `0x06` |
| 20 | — | `0x05` |
| 21 | — | `0x09` |
| 22 | — | `0x1E` |
| 23 | — | `0x1D` |
| 24 | Turn left | `0x18` |
| 25 | Turn sharp left | `0x19` |
| 26 | Turn right | `0x20` |
| 27 | Turn sharp right | `0x1F` |
| 28 | Turn slight right | `0x22` |
| 29 | Turn sharp right (alt) | `0x21` |
| 30 | U-turn | `0x1A` |
| 31 | — | `0x3D` |
| 32 | — | `0x09` |
| 33 | Merge | `0x08` |
| 34 | — | `0x07` |
| 35 | Roundabout | `0x30` |
| 36 | — | `0x2F` |
| 37 | — | `0x2E` |
| 38 | — | `0x2D` |
| 39 | Roundabout (alt) | `0x30` |
| 40 | — | `0x2F` |
| 41 | — | `0x1A` |
| 42 | Destination | `0x3D` |
| 63 | — | `0x3E` |
| 64 | — | `0x3F` |
| 65 | — | `0x09` |

### Roundabouts (maneuver 43–62)

For maneuver IDs in range **43–62** (0x2B–0x3E):

```
base = 0x0A if (maneuver - 43) is even else 0x31
exit = clamp(roundaboutExit, 0, 9)
result = base + exit
```

Example: maneuver 44 (even), exit 3 → `0x0A + 3 = 0x0D`

## `GoogleManeuver` enum (byte5 + byte6)

Used by `buildNavFromManeuver()` where byte5 → heading param and byte6 → speedFlags param in `buildNavPacket`.

| Enum | byte5 | byte6 | Description |
|------|-------|-------|-------------|
| DEPART | `0x00` | `0x40` | Initial departure |
| STRAIGHT | `0x00` | `0x40` | Continue straight |
| DESTINATION_LEFT | `0x10` | `0x01` | Destination on left |
| DESTINATION_RIGHT | `0x20` | `0x01` | Destination on right |
| TURN_LEFT | `0x10` | `0x40` | Turn left |
| TURN_RIGHT | `0x20` | `0x40` | Turn right |
| TURN_KEEP_LEFT | `0x10` | `0x40` | Keep left |
| TURN_KEEP_RIGHT | `0x20` | `0x40` | Keep right |
| TURN_SLIGHT_LEFT | `0x10` | `0x40` | Slight left |
| TURN_SLIGHT_RIGHT | `0x20` | `0x40` | Slight right |
| TURN_SHARP_LEFT | `0x30` | `0x40` | Sharp left |
| TURN_SHARP_RIGHT | `0x30` | `0x40` | Sharp right |
| TURN_U_TURN_CLOCKWISE | `0x50` | `0x40` | U-turn CW |
| TURN_U_TURN_COUNTERCLOCKWISE | `0x50` | `0x40` | U-turn CCW |
| FORK_LEFT | `0x10` | `0x40` | Fork left |
| FORK_RIGHT | `0x20` | `0x40` | Fork right |
| KEEP_LEFT | `0x10` | `0x40` | Keep left |
| KEEP_RIGHT | `0x20` | `0x40` | Keep right |
| MERGE_LEFT | `0x10` | `0x40` | Merge left |
| MERGE_RIGHT | `0x20` | `0x40` | Merge right |
| ON_RAMP_LEFT | `0x60` | `0x40` | On-ramp left |
| ON_RAMP_RIGHT | `0x60` | `0x40` | On-ramp right |
| OFF_RAMP_LEFT | `0x10` | `0x40` | Off-ramp left |
| OFF_RAMP_RIGHT | `0x20` | `0x40` | Off-ramp right |
| ROUNDABOUT_LEFT_CLOCKWISE | `0x40` | `0x10` | Roundabout left |
| ROUNDABOUT_RIGHT_CLOCKWISE | `0x40` | `0x20` | Roundabout right |
| ROUNDABOUT_STRAIGHT_CLOCKWISE | `0x00` | `0x40` | Roundabout straight |
| ROUNDABOUT_EXIT_CLOCKWISE | `0x00` | `0x60` | Roundabout exit |
| ROUNDABOUT_U_TURN_CLOCKWISE | `0x00` | `0x50` | Roundabout U-turn |
| ROUNDABOUT_LEFT_COUNTERCLOCKWISE | `0x00` | `0x10` | Roundabout left CCW |
| ROUNDABOUT_RIGHT_COUNTERCLOCKWISE | `0x00` | `0x20` | Roundabout right CCW |
| ROUNDABOUT_EXIT_COUNTERCLOCKWISE | `0x00` | `0x60` | Roundabout exit CCW |

## Compass bearing → direction (`bearingToDirection`)

Maps compass bearing (degrees) to direction byte for compass mode (offset 6 and 14):

Bearing is adjusted by +22.5°, divided into 8 sectors of 45°:

| Sector | Bearing range (approx) | Byte |
|--------|------------------------|------|
| 0 | N | `0x10` |
| 1 | NE | `0x50` |
| 2 | E | `0x20` |
| 3 | SE | `0x70` |
| 4 | S | `0x40` |
| 5 | SW | `0x80` (signed -128) |
| 6 | W | `0x30` |
| 7 | NW | `0x60` |

## Next maneuver byte (offset 7)

In `sendManeuverToTripper`:

- Set to next step's `NavManeuver.toByte()` value
- `0xFF` if no next step exists
