# Frame Format

> **Sources:** RE CRC via `bluconnect/xj3`; packet assembly in `bluconnect/k2h.d()`. Super `TripperProtocol.crc16` and `TripperProtocol.build*Packet`. Identical on-wire output.

Every Tripper Pod message is exactly **20 bytes** (`0x14`).

## Layout

```
Offset   Size   Field
──────   ────   ─────
0–17     18     Payload (command + data + padding)
18–19     2     CRC-16, big-endian (MSB first)
```

## CRC-16 / CCITT-FALSE

Computed over payload bytes **0 through 17** (all 18 bytes).

| Parameter | Value |
|-----------|-------|
| Polynomial | `0x1021` |
| Initial value | `0xFFFF` |
| Input reflection | No |
| Output reflection | No |
| Final XOR | None |

### Algorithm (pseudocode)

```
crc = 0xFFFF
for each byte b in payload[0..17]:
    crc ^= (b & 0xFF) << 8
    repeat 8 times:
        if crc & 0x8000:
            crc = ((crc << 1) ^ 0x1021) & 0xFFFF
        else:
            crc = (crc << 1) & 0xFFFF
append (crc >> 8) as byte 18
append (crc & 0xFF) as byte 19
```

### Python

```python
def crc16_ccitt_false(data: bytes) -> int:
    crc = 0xFFFF
    for b in data:
        crc ^= (b & 0xFF) << 8
        for _ in range(8):
            if crc & 0x8000:
                crc = ((crc << 1) ^ 0x1021) & 0xFFFF
            else:
                crc = (crc << 1) & 0xFFFF
    return crc

def build_frame(payload18: bytes) -> bytes:
    assert len(payload18) == 18
    crc = crc16_ccitt_false(payload18)
    return payload18 + bytes([(crc >> 8) & 0xFF, crc & 0xFF])
```

## Padding

Most commands zero-fill unused payload bytes before CRC calculation. The CRC is always computed on the full 18-byte payload region, including zeros.

## Hex dump convention

Documentation and logs use space-separated uppercase hex:

```
10 11 14 00 C8 10 40 40 00 C8 41 00 00 01 00 00 00 00 XX XX
│  │  │     │  │  │  │     │  │     │  │  │           └── CRC
│  │  │     │  │  │  │     │  │     │  │  └── flags
│  │  │     │  │  │  │     │  │     │  └── ETA minutes
│  │  │     │  │  │  │     │  │     └── road type
│  │  │     │  │  │  │     │  └── distance repeat
│  │  │     │  │  │  └── speed flags
│  │  │     │  │  └── heading / intensity
│  │  │     │  └── maneuver
│  │  │     └── distance (200 m = 0x00C8)
│  │  └── screen (TBT = 0x14)
│  └── nav sub-command (0x11)
└── command (NAVIGATE = 0x10)
```

See [tripper_protocol.py](tripper_protocol.py) for a complete builder implementation.
