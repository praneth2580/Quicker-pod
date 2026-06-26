#!/usr/bin/env python3
"""
Royal Enfield Tripper Pod — BLE protocol reference implementation.

Reverse-engineered from Super TripperPod (com.supertripper.app v2.1).
See README.md and companion docs in this directory.

No external dependencies required.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import datetime
from enum import IntEnum
from pathlib import Path
from typing import Optional

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

DEVICE_NAME = "RE_DISP"
FRAME_LEN = 20
PAYLOAD_LEN = 18

SERVICE_UUID = "01FF0100-BA5E-F4EE-5CA1-EB1E5E4B1CE0"
CHAR_UUID = "01FF0101-BA5E-F4EE-5CA1-EB1E5E4B1CE0"
CCCD_UUID = "00002902-0000-1000-8000-00805f9b34fb"

WRITE_DELAY_MS = 80
KEEPALIVE_INTERVAL_MS = 1000


class Cmd(IntEnum):
    PING_FW = 0x03
    FUTURE_0B = 0x0B
    NAVIGATE = 0x10
    DEVICE_ID = 0x20
    HANDSHAKE = 0x21
    PING_WP = 0x30
    KEEPALIVE = 0x40
    SET_TIME = 0x50


class Screen(IntEnum):
    LAST = 0x01
    TBT = 0x14
    ARRIVE = 0x15
    STOP = 0x1C
    HIGHWAY = 0x32
    IDLE = 0x3C
    RECALC = 0x3D


class Maneuver(IntEnum):
    STRAIGHT = 0x00
    LEFT = 0x10
    RIGHT_SOFT = 0x20
    RIGHT_HARD = 0x30
    FORWARD = 0x40
    UTURN = 0x50
    HIGHWAY_RAMP = 0x60


class RoadType(IntEnum):
    HIGHWAY = 0x31
    STREET = 0x41
    AVENUE = 0x42


class Response(IntEnum):
    NACK = 0x02
    OS_VERSION = 0x03
    NAV_ACK = 0x10
    AUTH = 0x20
    SESSION = 0x21
    SERIAL = 0x30
    TIME_ACK = 0x50


# Pre-built packets (from TripperProtocol static init)
PKT_PIN_SHOW = bytes.fromhex("21010000000000000000000000000000000050A7")
PKT_CLOSE = bytes.fromhex("2100000000000000000000000000000000004045")
PKT_PING_FW = bytes.fromhex("03000000000000000000000000000000000045D9")
PKT_PING_WP = bytes.fromhex("300000000000000000000000000000000000428B")
PKT_STOP_NAV = bytes.fromhex("10111C00000100FF00000000000000000000F782")
PKT_NAV_IDLE = bytes.fromhex("10113C0000044015000041000403000000001050")

# Google Navigation SDK maneuver ID → Tripper byte (NavManeuver.toByte)
GOOGLE_MANEUVER_MAP: dict[int, int] = {
    0: 0xFF,
    1: 0x3C,
    3: 0x01,
    4: 0x02,
    5: 0x09,
    6: 0x14,
    7: 0x15,
    8: 0x18,
    9: 0x19,
    10: 0x18,
    11: 0x19,
    12: 0x16,
    13: 0x17,
    14: 0x1A,
    15: 0x3D,
    16: 0x1B,
    17: 0x04,
    18: 0x03,
    19: 0x06,
    20: 0x05,
    21: 0x09,
    22: 0x1E,
    23: 0x1D,
    24: 0x18,
    25: 0x19,
    26: 0x20,
    27: 0x1F,
    28: 0x22,
    29: 0x21,
    30: 0x1A,
    31: 0x3D,
    32: 0x09,
    33: 0x08,
    34: 0x07,
    35: 0x30,
    36: 0x2F,
    37: 0x2E,
    38: 0x2D,
    39: 0x30,
    40: 0x2F,
    41: 0x1A,
    42: 0x3D,
    63: 0x3E,
    64: 0x3F,
    65: 0x09,
}


# ---------------------------------------------------------------------------
# CRC & framing
# ---------------------------------------------------------------------------

def crc16_ccitt_false(data: bytes) -> int:
    """CRC-16/CCITT-FALSE over data (polynomial 0x1021, init 0xFFFF)."""
    crc = 0xFFFF
    for b in data:
        crc ^= (b & 0xFF) << 8
        for _ in range(8):
            if crc & 0x8000:
                crc = ((crc << 1) ^ 0x1021) & 0xFFFF
            else:
                crc = (crc << 1) & 0xFFFF
    return crc


def build_frame(payload: bytearray | bytes) -> bytes:
    """Append CRC to an 18-byte payload and return a 20-byte frame."""
    if len(payload) != PAYLOAD_LEN:
        raise ValueError(f"payload must be {PAYLOAD_LEN} bytes, got {len(payload)}")
    p = bytes(payload)
    crc = crc16_ccitt_false(p)
    return p + bytes([(crc >> 8) & 0xFF, crc & 0xFF])


def to_hex(data: bytes, sep: str = " ") -> str:
    return sep.join(f"{b:02X}" for b in data)


def from_hex(s: str) -> bytes:
    return bytes.fromhex(s.replace(" ", "").replace(":", ""))


# ---------------------------------------------------------------------------
# Packet builders
# ---------------------------------------------------------------------------

def encode_distance(meters: int) -> tuple[int, int, int]:
    """Return (hi, lo, scale) for distance encoding."""
    meters = max(0, min(meters, 0xFFFF))
    if meters < 1000:
        return (meters >> 8) & 0xFF, meters & 0xFF, 0x01
    scaled = meters // 100
    return (scaled >> 8) & 0xFF, scaled & 0xFF, 0x02


def calc_intensity(meters: int, night_mode: bool = False) -> int:
    if meters <= 10:
        v = 0x50
    elif meters <= 20:
        v = 0x40
    elif meters <= 45:
        v = 0x30
    elif meters <= 70:
        v = 0x20
    elif meters <= 95:
        v = 0x10
    else:
        v = 0x00
    if night_mode:
        v += 1
    return v


def bearing_to_direction(bearing: float) -> int:
    """Map compass bearing (degrees) to Tripper direction byte."""
    sector = int(((bearing + 22.5) % 360.0) / 45.0)
    table = [0x10, 0x50, 0x20, 0x70, 0x40, 0x80, 0x30, 0x60]
    return table[sector % 8] & 0xFF


def google_maneuver_to_byte(maneuver: int, roundabout_exit: int = 0) -> int:
    """NavManeuver.toByte — Google Navigation SDK maneuver → Tripper byte."""
    if 43 <= maneuver < 63:
        base = 0x0A if (maneuver - 43) % 2 == 0 else 0x31
        return (base + max(0, min(roundabout_exit, 9))) & 0xFF
    return GOOGLE_MANEUVER_MAP.get(maneuver, 0x09)


def build_nav_packet(
    screen: int = Screen.TBT,
    dist_meters: int = 0,
    maneuver: int = Maneuver.FORWARD,
    heading: int = 0x40,
    speed_flags: int = 0x40,
    road_type: int = RoadType.STREET,
    eta_minutes: int = 0,
) -> bytes:
    """TripperProtocol.buildNavPacket."""
    p = bytearray(PAYLOAD_LEN)
    p[0] = Cmd.NAVIGATE
    p[1] = 0x11
    p[2] = screen & 0xFF
    p[3] = (dist_meters >> 8) & 0xFF
    p[4] = dist_meters & 0xFF
    p[5] = maneuver & 0xFF
    p[6] = heading & 0xFF
    p[7] = speed_flags & 0xFF
    p[8] = p[3]
    p[9] = p[4]
    p[10] = road_type & 0xFF
    p[12] = eta_minutes & 0xFF
    p[13] = 0x01
    return build_frame(p)


def build_maneuver_packet(
    cur_maneuver: int,
    next_maneuver: int = 0xFF,
    dist_meters: int = 0,
    eta_minutes: int = 0,
    night_mode: bool = False,
) -> bytes:
    """InternalMapManager.sendManeuverToTripper — Google Nav / Valhalla path.

    Note: byte 2 holds the current maneuver icon (or 0x1C for reroute/stop),
    not the screen enum used by build_nav_packet().
    """
    p = bytearray(PAYLOAD_LEN)
    p[0] = Cmd.NAVIGATE
    p[1] = 0x11
    p[2] = cur_maneuver & 0xFF
    hi, lo, scale = encode_distance(dist_meters)
    p[3], p[4], p[5] = hi, lo, scale
    p[6] = calc_intensity(dist_meters, night_mode)
    p[7] = next_maneuver & 0xFF
    p[8] = p[9] = 0xFF
    p[10] = RoadType.STREET
    if eta_minutes > 0:
        p[11] = (eta_minutes // 60) & 0xFF
        p[12] = (eta_minutes % 60) & 0xFF
        p[13] = 0x01
    else:
        p[11] = p[12] = p[13] = 0xFF
    return build_frame(p)


def build_pin_packet(pin: str) -> bytes:
    """TripperProtocol.buildPinPacket — max 6 ASCII digits."""
    p = bytearray(PAYLOAD_LEN)
    p[0] = Cmd.DEVICE_ID
    digits = pin.encode("ascii")[:6]
    p[1 : 1 + len(digits)] = digits
    return build_frame(p)


def build_set_time_packet(hour: int, minute: int, is_24h: bool = True) -> bytes:
    """TripperProtocol.buildSetTimePacket."""
    p = bytearray(PAYLOAD_LEN)
    p[0] = Cmd.SET_TIME
    p[1] = hour & 0xFF
    p[2] = minute & 0xFF
    p[3] = 0 if is_24h else 1
    return build_frame(p)


def build_set_time_now(is_24h: bool = True) -> bytes:
    now = datetime.now()
    return build_set_time_packet(now.hour, now.minute, is_24h)


def build_compass_packet(direction: int, night_mode: bool = False) -> bytes:
    """TripperProtocol.buildCompassPacket."""
    p = bytearray(PAYLOAD_LEN)
    p[0] = Cmd.NAVIGATE
    p[1] = 0x11
    p[2] = 0x41
    p[6] = 1 if night_mode else 0  # night flag in builder
    p[7] = 0xFF
    p[11] = p[12] = p[13] = 0xFF
    p[14] = direction & 0xFF
    return build_frame(p)


def build_loading_screen(night_mode: bool = False) -> bytes:
    """TripperBleManager.sendLoadingScreen."""
    p = bytearray(PAYLOAD_LEN)
    p[0] = Cmd.NAVIGATE
    p[1] = 0x11
    p[2] = Screen.STOP
    if night_mode:
        p[6] = 0x01
    return build_frame(p)


def build_keepalive_call_icon() -> bytes:
    p = bytearray(PAYLOAD_LEN)
    p[0] = Cmd.KEEPALIVE
    p[1] = 0x05
    return build_frame(p)


def build_handshake(show_pin: bool) -> bytes:
    return PKT_PIN_SHOW if show_pin else PKT_CLOSE


# ---------------------------------------------------------------------------
# Response parsing
# ---------------------------------------------------------------------------

@dataclass
class TripperResponse:
    opcode: int
    label: str
    description: str
    raw: bytes


def parse_bcd_version_byte(b: int) -> int:
    return ((b >> 4) * 10) + (b & 0x0F)


def parse_response(data: bytes) -> TripperResponse:
    """TripperProtocol.parseResponse."""
    if not data:
        return TripperResponse(0, "EMPTY", "empty", data)

    op = data[0]
    if op == Response.NACK:
        return TripperResponse(op, "NACK", "command rejected", data)
    if op == Response.OS_VERSION:
        if len(data) >= 3:
            maj = parse_bcd_version_byte(data[1])
            minor = parse_bcd_version_byte(data[2])
            return TripperResponse(
                op, "OS_VERSION", f"Firmware v0x{data[1]:02X}.0x{data[2]:02X} ({maj}.{minor})", data
            )
        return TripperResponse(op, "OS_VERSION", "short response", data)
    if op == Response.NAV_ACK:
        return TripperResponse(op, "NAV_ACK", "navigation ACK", data)
    if op == Response.AUTH:
        ok = len(data) > 1 and data[1] == 0x01
        return TripperResponse(op, "AUTH", "PIN accepted" if ok else "PIN rejected", data)
    if op == Response.SESSION:
        return TripperResponse(op, "SESSION", "session event", data)
    if op == Response.SERIAL:
        serial = ""
        for i in range(1, min(8, len(data))):
            c = data[i]
            if c == 0:
                break
            if 0x20 <= c < 0x7F:
                serial += chr(c)
        return TripperResponse(op, "SERIAL", f'Serial: "{serial}"', data)
    if op == Response.TIME_ACK:
        return TripperResponse(op, "TIME_ACK", "time ACK", data)
    return TripperResponse(op, f"0x{op:02X}", "unhandled command", data)


def verify_frame(frame: bytes) -> bool:
    """Return True if CRC matches."""
    if len(frame) != FRAME_LEN:
        return False
    expected = crc16_ccitt_false(frame[:PAYLOAD_LEN])
    actual = (frame[18] << 8) | frame[19]
    return expected == actual


def load_constants() -> dict:
    path = Path(__file__).parent / "constants.json"
    with open(path, encoding="utf-8") as f:
        return json.load(f)


# ---------------------------------------------------------------------------
# CLI demo
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    print("Tripper Pod Protocol — frame examples\n")

    examples = [
        ("PIN show", PKT_PIN_SHOW),
        ("Close session", PKT_CLOSE),
        ("Ping FW", PKT_PING_FW),
        ("Nav TBT 200m left", build_nav_packet(
            screen=Screen.TBT, dist_meters=200, maneuver=Maneuver.LEFT
        )),
        ("Set time now", build_set_time_now()),
        ("PIN 123456", build_pin_packet("123456")),
        ("Compass N", build_compass_packet(bearing_to_direction(0))),
        ("Call keepalive", build_keepalive_call_icon()),
    ]

    for label, frame in examples:
        ok = verify_frame(frame)
        print(f"{label}:")
        print(f"  {to_hex(frame)}")
        print(f"  CRC ok: {ok}\n")

    # Self-test CRC against known static packets
    for name, pkt in [
        ("PKT_PIN_SHOW", PKT_PIN_SHOW),
        ("PKT_CLOSE", PKT_CLOSE),
        ("PKT_PING_FW", PKT_PING_FW),
    ]:
        assert verify_frame(pkt), f"CRC failed for {name}"
    print("All static packet CRC checks passed.")
