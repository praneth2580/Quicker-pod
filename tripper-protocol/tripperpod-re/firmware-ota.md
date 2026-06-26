# Firmware OTA (RE Reprime only)

The Royal Enfield reprime app supports **firmware updates** for Tripper Pod over the same BLE GATT link used for navigation. Super TripperPod does not implement this path.

## Source

| Item | Value |
|------|-------|
| Class | `bluconnect/wni` |
| Smali | `smali-reference/re/wni.smali` |

## Overview

OTA uses a block-transfer protocol layered on the same `01FF0101` characteristic. Navigation commands (`0x10`, `0x21`, etc.) and OTA commands coexist on the link; `wni.processReplyFromDisplay` handles pod responses during update.

## Response opcodes (pod → phone during OTA)

| Byte 0 | Purpose |
|--------|---------|
| `0x02` | Block ACK / status |
| `0x03` | Version info (shared with PING_FW nav path) |
| `0x04` | Transfer progress |
| `0x05` | Block request |
| `0x06` | Completion |
| `0x07` | Error / abort |
| `0x08` | Resume point |
| `0x09` | Checksum verify |
| `0x0A` | Final status |

## UI entry points

- `FirmwareVersionActivity` — displays current firmware, triggers update
- `InfotainmentActivity` — Tripper Pod / Dash settings

## Relationship to navigation protocol

| Phase | Protocol |
|-------|----------|
| Normal nav | `0x10` nav, `0x40` keepalive, `0x50` time |
| Pairing | `0x21` handshake, `0x20` PIN |
| OTA | `wni` block transfer (`0x02`–`0x0A` responses) |
