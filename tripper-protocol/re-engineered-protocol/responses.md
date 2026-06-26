# Pod → Phone Responses

Notifications on characteristic `01FF0101-…` carry response frames. The first payload byte (offset 0) identifies the response type.

Parsed by `TripperProtocol.parseResponse()`.

## Response types

| Byte 0 | Label | Description |
|--------|-------|-------------|
| `0x02` | `NACK` | Command rejected — "NAK — comando rejeitado" |
| `0x03` | `OS_VERSION` | Firmware / OS version |
| `0x10` | `NAV_ACK` | Navigation packet accepted |
| `0x20` | `AUTH` | PIN authentication result |
| `0x21` | `SESSION` | Session event |
| `0x30` | `SERIAL` | Device serial number |
| `0x50` | `TIME_ACK` | Clock set acknowledged |

Unknown opcodes are logged as "comando não tratado" with hex label.

## `NACK` (`0x02`)

The pod rejected the previous write. App logs at ERROR level.

## `OS_VERSION` (`0x03`)

Firmware version response to `PING_FW`.

Requires at least 3 bytes.

| Offset | Field |
|--------|-------|
| 0 | `0x03` |
| 1 | Major version (BCD nibbles) |
| 2 | Minor version (BCD nibbles) |

### BCD decoding

Each version byte is split into high/low nibbles, each treated as a decimal digit:

```
major = (byte1 >> 4) * 10 + (byte1 & 0x0F)
minor = (byte2 >> 4) * 10 + (byte2 & 0x0F)
```

Display format: `Firmware: v0x%02X.0x%02X (%d.%d)`

Example: bytes `01 02` → v0x01.0x02 (1.2)

## `NAV_ACK` (`0x10`)

Confirms the pod received and accepted a `0x10 0x11` navigation packet.

## `AUTH` (`0x20`)

PIN submission result.

| Offset | Field |
|--------|-------|
| 0 | `0x20` |
| 1 | `0x01` = accepted, other = rejected |

App behavior:

- Accepted → `onPinAccepted`, device MAC added to known list
- Rejected → `onPinRejected`

## `SESSION` (`0x21`)

Session lifecycle event. Logged as OK; no further parsing in v2.1.

## `SERIAL` (`0x30`)

Device serial string.

Requires at least 8 bytes. ASCII characters read from bytes 1–7 (printable range `0x20`–`0x7E`, stops at `0x00`).

Format: `Serial: "XXXXXXX"`

## `TIME_ACK` (`0x50`)

Confirms `SET_TIME` (`0x50`) was applied.

## Empty notification

Zero-length notification → label `EMPTY`, description "vazio".

## App logging levels

| Response | Log level |
|----------|-----------|
| NACK | ERROR |
| AUTH rejected | ERROR |
| AUTH accepted | OK |
| OS_VERSION, NAV_ACK, TIME_ACK, SESSION, SERIAL | OK |
| Other | INFO |

## Example response frames

Responses are also 20-byte frames with CRC (same format as outbound). The parser primarily inspects byte 0 and selected payload bytes; full frame is stored in `TripperResponse.raw`.

Typical ACK may look like:

```
10 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 [CRC]
```

Exact CRC values depend on pod firmware; validate against live captures.
