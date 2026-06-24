"""Parse Tripper BLE notification payloads."""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Optional

CMD_NAVIGATE = 0x10


@dataclass(frozen=True)
class TripperResponse:
    opcode: int
    label: str
    description: str
    raw: bytes


def _bcd_version(byte_val: int) -> int:
    return ((byte_val >> 4) * 10) + (byte_val & 0x0F)


def parse_response(data: bytes) -> TripperResponse:
    if not data:
        return TripperResponse(0, "EMPTY", "empty notification", data)

    opcode = data[0] & 0xFF

    if opcode == 0x02:
        return TripperResponse(opcode, "NACK", "NAK — command rejected", data)

    if opcode == 0x03:
        if len(data) >= 3:
            major_raw, minor_raw = data[1] & 0xFF, data[2] & 0xFF
            major = _bcd_version(major_raw)
            minor = _bcd_version(minor_raw)
            desc = (
                f"Firmware: v0x{major_raw:02X}.0x{minor_raw:02X} "
                f"({major}.{minor})"
            )
            return TripperResponse(opcode, "OS_VERSION", desc, data)
        return TripperResponse(opcode, "OS_VERSION", "OS version short", data)

    if opcode == CMD_NAVIGATE:
        return TripperResponse(opcode, "NAV_ACK", "NAV ACK", data)

    if opcode == 0x30:
        if len(data) >= 8:
            chars = []
            for i in range(1, 8):
                b = data[i] & 0xFF
                if b == 0:
                    break
                if 1 < b < 0x7F:
                    chars.append(chr(b))
            serial = "".join(chars)
            return TripperResponse(
                opcode,
                "SERIAL",
                f'Serial: "{serial}"',
                data,
            )
        return TripperResponse(opcode, "SERIAL", "Serial short", data)

    if opcode == 0x50:
        return TripperResponse(opcode, "TIME_ACK", "Time ACK", data)

    if opcode == 0x20:
        accepted = len(data) > 1 and (data[1] & 0xFF) == 0x01
        desc = "✓ PIN ACCEPTED" if accepted else "✗ PIN REJECTED"
        return TripperResponse(opcode, "AUTH", desc, data)

    if opcode == 0x21:
        return TripperResponse(opcode, "SESSION", "Session", data)

    return TripperResponse(opcode, f"0x{opcode:02X}", "unhandled command", data)


def is_pin_accepted(response: TripperResponse) -> bool:
    return response.label == "AUTH" and response.description.startswith("✓")


def is_pin_rejected(response: TripperResponse) -> bool:
    return response.label == "AUTH" and response.description.startswith("✗")


def firmware_version(response: TripperResponse) -> Optional[str]:
    if response.label != "OS_VERSION":
        return None
    match = re.search(r"\((\d+\.\d+)\)", response.description)
    return match.group(1) if match else response.description


def serial_number(response: TripperResponse) -> Optional[str]:
    if response.label != "SERIAL":
        return None
    match = re.search(r'"([^"]*)"', response.description)
    return match.group(1) if match else None
