# Smali Reference

## `re/` — Royal Enfield reprime

| File | Class | Role |
|------|-------|------|
| `o12.smali` | BleManager | BLE connection, handshake, write queue |
| `jxa.smali` | GattCallback | GATT events, UUID discovery |
| `k2h.smali` | Packet builder | Nav frame assembly (`k2h.d`) |
| `xj3.smali` | CRC helper | CRC-16/CCITT-FALSE |
| `q12.smali` | Nav session | Keepalive timer, nav dispatch |
| `ri1.smali` | Device store | Known MAC list (`mytbtlist`) |
| `h2h.smali` | TBT step model | Turn-by-turn step data |
| `j2h.smali` | Maneuver mapper | Distance/unit conversion |
| `wni.smali` | DFU handler | Firmware OTA |
| `DeviceListFragment.smali` | Pairing UI | PIN packet, device scan |

## `super/` — Super TripperPod (cross-reference)

| File | Role |
|------|------|
| `TripperProtocol.smali` | Complete protocol class |
| `buildNavPacket.smali` | Nav packet builder |
| `buildPinPacket.smali` | PIN submission |
| `parseResponse.smali` | Pod response parser |
| `handleNotification.smali` | Notification dispatcher |

See [obfuscation-map.md](../obfuscation-map.md) for RE ↔ Super class mapping.
