# Reverse Engineering Notes

Working directory for APK analysis:

```bash
cd /home/apprication/Downloads/bluetooth-logs
```

## Sources

| Artifact | Path |
|----------|------|
| APK | `Super.apk` |
| Apktool smali | `super_apktool/smali_classes3/com/supertripper/app/` |
| Key classes | `TripperProtocol.smali`, `TripperBleManager.smali`, `InternalMapManager.smali` |
| Extracted methods | `protocol_dump/*.smali` |

## Analysis commands

```bash
# Search for protocol methods
rg "buildNavPacket|startHandshake|parseResponse" super_apktool/

# View handshake flow
sed -n '1879,2060p' super_apktool/smali_classes3/com/supertripper/app/TripperBleManager.smali

# Maneuver enum values
sed -n '239,750p' super_apktool/smali_classes3/com/supertripper/app/TripperProtocol\$GoogleManeuver.smali
```

## Progress (2026-06-24)

| Area | Status |
|------|--------|
| BLE UUIDs + CCCD | 100% |
| CRC16 | 100% |
| Handshake sequence | 95% |
| PIN packet | 90% |
| Time sync | 95% |
| Compass directions | 95% |
| Nav (simple builder) | 90% |
| Nav (live InternalMapManager) | 85% |
| Response parser | 95% |
| Keepalive | 80% |
| Python SDK | 85% |

## Key findings

1. **Dual GATT roles** — Phone is GATT client (commands) **and** GATT server (responses). Tripper writes AUTH/OS_VERSION/SERIAL to the phone peripheral.
2. **Single characteristic** — `01FF0101` on Tripper is write-only (`props=0x04`); CCCD often missing.
3. **20-byte fixed frames** — CRC over 18 bytes, big-endian CRC placement.
4. **WRITE_NO_RESPONSE** — All command writes use `setWriteType(1)`.
5. **Two nav code paths** — `TripperProtocol.buildNavPacket` (simpler) vs `InternalMapManager.sendManeuverToTripper` (production).
6. **Reconnect vs pair** — `isDeviceKnown(mac)` chooses CLOSE+TIME+PING vs SHOW_PIN.
7. **AUTH** — response opcode `0x20`, byte 1 is boolean success; delivered via GATT server write.
8. **SESSION is not a handshake prerequisite** — `0x21` SHOW_PIN is sent without waiting for SESSION.
9. **Full startup spec** — see [startup-handshake.md](./startup-handshake.md).

## Recommended next captures

1. Full pairing session (show PIN → enter PIN → AUTH → TIME → PING)
2. Live navigation from Google Maps overlay
3. Compass mode bearing changes
4. Disconnect/reconnect on bonded device

Log format to record:

```text
[timestamp] TX|RX [label] AA BB CC ...
```
