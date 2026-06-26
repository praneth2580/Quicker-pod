# Source Comparison

Comparison of protocol data from two independent RE efforts against Royal Enfield Tripper Pod (`RE_DISP`).

## Source directories

| Directory | App | Package | Notes |
|-----------|-----|---------|-------|
| `tripperpod-re/` | Royal Enfield reprime | `com.royalenfield.reprime` | Obfuscated `bluconnect/*`; includes OTA, smali refs, captures |
| `tripperpod-protocol-super/` | Super TripperPod v2.1 | `com.supertripper.app` | Clear `TripperProtocol` class names |

## Comparison summary

| Area | RE reprime | Super TripperPod | Result |
|------|------------|------------------|--------|
| Device name | `RE_DISP` | `RE_DISP` | **Match** |
| Service UUID | `01FF0100-BA5E-F4EE-5CA1-EB1E5E4B1CE0` | same | **Match** |
| Char UUID | `01FF0101-BA5E-F4EE-5CA1-EB1E5E4B1CE0` | same | **Match** |
| Frame length | 20 bytes | 20 bytes | **Match** |
| CRC algorithm | CRC-16/CCITT-FALSE | CRC-16/CCITT-FALSE | **Match** |
| Command opcodes | `0x03`–`0x50` | same set | **Match** |
| Screen IDs | `0x01`, `0x14`–`0x3D` | same | **Match** |
| Maneuver icons | `0x00`–`0x60` | same | **Match** |
| Response opcodes | `0x02`–`0x50` | same | **Match** |
| Pre-built packets | 7 static frames | 7 static frames | **Match** (identical hex) |
| Handshake timing | 200/150/300 ms delays | same | **Match** |
| Write queue delay | 80 ms | 80 ms | **Match** |
| Keepalive interval | 1000 ms | 1000 ms | **Match** |
| Google maneuver map | 46 entries | 46 entries | **Match** |
| `tripper_protocol.py` | 441 lines | 440 lines | **Match** (header comment only) |

## File-level diff

### Identical (byte-for-byte)

- `commands.md`
- `navigation.md`
- `responses.md`
- `maneuvers.md`
- `compass-time-keepalive.md`

### Minor differences (RE adds source annotations)

| File | Difference |
|------|------------|
| `ble-gatt.md` | RE adds obfuscated class references in header |
| `frame-format.md` | RE adds `xj3`/`k2h` source note |
| `handshake.md` | RE adds method names (`o12.N`, `ri1.d`, etc.) |
| `constants.json` | RE adds `_source` metadata block |
| `reference-packets.json` | RE description mentions dynamic `k2h` builder |
| `tripper_protocol.py` | Docstring cites both sources vs Super only |
| `README.md` | RE documents OTA, obfuscation map, Tripper Dash |

### RE-only artifacts (included in consolidated doc)

| File | Content |
|------|---------|
| `obfuscation-map.md` | RE smali → function mapping |
| `firmware-ota.md` | DFU over same GATT link (`wni` class) |

### RE-only artifacts (not copied here)

Raw RE captures and smali dumps remain in `tripperpod-re/`:

- `captures/` — grep indexes and decompiled Java dumps
- `smali-reference/` — extracted smali from both apps
- `snippets/` — isolated CRC/handshake smali fragments

## Consolidation decisions

This `re-engineered-protocol/` directory:

1. Uses **RE-annotated** versions of `ble-gatt.md`, `frame-format.md`, and `handshake.md` (dual class names).
2. Copies **identical** protocol docs unchanged.
3. Includes **RE-only** `obfuscation-map.md` and `firmware-ota.md`.
4. Merges `constants.json` with metadata from both sources.
5. Uses the **cross-validated** `tripper_protocol.py` citing both apps.
6. Treats Super TripperPod as the canonical naming reference; RE obfuscated names are documented in the obfuscation map.

## Consolidation fixes (2026-06-26)

| Issue | Resolution |
|-------|------------|
| `bearingToDirection` in `src/bluetooth/tripper/packets.ts` and `tripper-sdk/packets.py` used clockwise sector order | Fixed to match smali packed-switch (`re-engineered-protocol/maneuvers.md`) |
| `maneuvers.md` mislabeled sector bytes (e.g. sector 1 as NE instead of NW) | Corrected in `re-engineered-protocol/` |
| No single canonical protocol path | `re-engineered-protocol/` is canonical; `tripper-protocol/README.md` indexes sources |
| `constants.txt` missing `SCREEN_LOCKED`, stale source note | Updated; points to `re-engineered-protocol/` |

## Confidence

| Protocol layer | Confidence | Basis |
|----------------|------------|-------|
| Framing & CRC | High | Identical implementation in both apps |
| Nav / handshake / auth | High | Identical opcodes, packets, timing |
| Maneuver mapping | High | Same Google Nav SDK → byte table |
| Firmware OTA | Medium | RE-only; not validated against Super app |
| GATT server (secondary) | Low | Super app only; purpose unclear |
