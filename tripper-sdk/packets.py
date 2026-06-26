"""Royal Enfield Tripper BLE packet builders.

All packets are exactly 20 bytes: 18-byte payload (indices 0–17) + CRC16 (indices 18–19).
CRC algorithm: CRC-16/CCITT-FALSE (poly 0x1021, init 0xFFFF).
"""

from __future__ import annotations

import struct
from datetime import datetime
from typing import Iterable

PACKET_SIZE = 20
PAYLOAD_CRC_LEN = 18

# Opcodes (byte 0 unless noted)
CMD_NAVIGATE = 0x10
CMD_HANDSHAKE = 0x21
CMD_DEVICE_ID = 0x20
CMD_PING_FW = 0x03
CMD_PING_WP = 0x30
CMD_KEEPALIVE = 0x40
CMD_SET_TIME = 0x50

NAV_SUBCMD = 0x11
COMPASS_SCREEN = 0x41

HS_SHOW_PIN = 0x01
HS_CLOSE = 0x00

# Screen IDs
SCREEN_TBT = 0x14
SCREEN_ARRIVE = 0x15
SCREEN_STOP = 0x1C
SCREEN_HIGHWAY = 0x32
SCREEN_IDLE = 0x3C
SCREEN_RECALC = 0x3D
SCREEN_LAST = 0x01

# Maneuver icons (byte 5 in simple nav packet)
MAN_STRAIGHT = 0x00
MAN_LEFT = 0x10
MAN_RIGHT_SOFT = 0x20
MAN_RIGHT_HARD = 0x30
MAN_FORWARD = 0x40
MAN_UTURN = 0x50
MAN_HIGHWAY = 0x60

# Road types
ROAD_HIGHWAY = 0x31
ROAD_STREET = 0x41
ROAD_AVENUE = 0x42

# Compass direction bytes (byte 14 in compass packet)
DIR_N = 0x10
DIR_NE = 0x60
DIR_E = 0x30
DIR_SE = 0x70
DIR_S = 0x40
DIR_SW = 0x80
DIR_W = 0x20
DIR_NW = 0x50

# Pre-built static packets from Super Tripper APK
PKT_PIN_SHOW = bytes.fromhex("21010000000000000000000000000000000050A7")
PKT_CLOSE = bytes.fromhex("2100000000000000000000000000000000004045")
PKT_PING_FW = bytes.fromhex("03000000000000000000000000000000000045D9")
PKT_PING_WP = bytes.fromhex("300000000000000000000000000000000000428B")
PKT_STOP_NAV = bytes.fromhex("10111C00000100FF00000000000000000000F782")
PKT_NAV_IDLE = bytes.fromhex("10113C0000044015000041000403000000001050")


def crc16(data: Iterable[int]) -> int:
    crc = 0xFFFF
    for b in data:
        crc ^= (b & 0xFF) << 8
        for _ in range(8):
            if crc & 0x8000:
                crc = ((crc << 1) ^ 0x1021) & 0xFFFF
            else:
                crc = (crc << 1) & 0xFFFF
    return crc


def append_crc(buf: bytearray) -> bytes:
    c = crc16(buf[:PAYLOAD_CRC_LEN])
    buf[18] = (c >> 8) & 0xFF
    buf[19] = c & 0xFF
    return bytes(buf)


def blank_packet() -> bytearray:
    return bytearray(PACKET_SIZE)


def to_hex(data: bytes, sep: str = " ") -> str:
    return sep.join(f"{b:02X}" for b in data)


def bearing_to_direction(bearing_deg: float) -> int:
    """Map compass bearing (0=N, 90=E) to Tripper direction byte."""
    sector = int(((bearing_deg + 22.5) % 360.0) / 45.0)
    # TripperProtocol.bearingToDirection packed-switch; sectors are not clockwise from N.
    table = (DIR_N, DIR_NW, DIR_W, DIR_SE, DIR_S, DIR_SW, DIR_E, DIR_NE)
    return table[sector % 8]


def calc_intensity(distance_m: int, night_mode: bool = False) -> int:
    """Distance-based alert intensity used in live navigation packets."""
    if distance_m <= 10:
        value = 0x50
    elif distance_m <= 20:
        value = 0x40
    elif distance_m <= 45:
        value = 0x30
    elif distance_m <= 70:
        value = 0x20
    elif distance_m <= 95:
        value = 0x10
    else:
        value = 0x00
    if night_mode:
        value += 1
    return value & 0xFF


def encode_distance(distance_m: int) -> tuple[int, int, int]:
    """Return (high, low, unit) for distance encoding.

    unit=1 → meters (distance < 1000)
    unit=2 → distance stored in hundreds of meters (distance >= 1000)
    """
    if distance_m < 1000:
        value = max(0, min(distance_m, 0xFFFF))
        return (value >> 8) & 0xFF, value & 0xFF, 1
    value = max(0, min(distance_m // 100, 0xFFFF))
    return (value >> 8) & 0xFF, value & 0xFF, 2


def build_handshake_packet(show_pin: bool) -> bytes:
    buf = blank_packet()
    buf[0] = CMD_HANDSHAKE
    buf[1] = HS_SHOW_PIN if show_pin else HS_CLOSE
    return append_crc(buf)


def build_pin_packet(code: str) -> bytes:
    """Authenticate with 6-digit PIN (ASCII digits at bytes 1–6)."""
    digits = "".join(c for c in code if c.isdigit())[:6]
    if len(digits) != 6:
        raise ValueError("PIN must be exactly 6 digits")
    buf = blank_packet()
    buf[0] = CMD_DEVICE_ID
    for i, ch in enumerate(digits):
        buf[1 + i] = ord(ch)
    return append_crc(buf)


def build_set_time_packet(hour24: int, minute: int, is_24h: bool = True) -> bytes:
    buf = blank_packet()
    buf[0] = CMD_SET_TIME
    buf[1] = hour24 & 0xFF
    buf[2] = minute & 0xFF
    buf[3] = 0 if is_24h else 1  # APK stores (is24h XOR 1)
    return append_crc(buf)


def build_set_time_now_packet(is_24h: bool = True) -> bytes:
    now = datetime.now()
    return build_set_time_packet(now.hour, now.minute, is_24h)


def build_compass_packet(direction: int, night_mode: bool = False) -> bytes:
    buf = blank_packet()
    buf[0] = CMD_NAVIGATE
    buf[1] = NAV_SUBCMD
    buf[2] = COMPASS_SCREEN
    buf[6] = 1 if night_mode else 0
    for idx in (7, 11, 12, 13):
        buf[idx] = 0xFF
    buf[14] = direction & 0xFF
    return append_crc(buf)


def build_nav_packet(
    screen: int,
    dist_meters: int,
    maneuver: int,
    heading: int = 0x40,
    speed_flags: int = 0x40,
    road_type: int = ROAD_STREET,
    eta_minutes: int = 0,
) -> bytes:
    """Simpler nav builder from TripperProtocol.buildNavPacket()."""
    buf = blank_packet()
    buf[0] = CMD_NAVIGATE
    buf[1] = NAV_SUBCMD
    buf[2] = screen & 0xFF
    buf[3] = (dist_meters >> 8) & 0xFF
    buf[4] = dist_meters & 0xFF
    buf[5] = maneuver & 0xFF
    buf[6] = heading & 0xFF
    buf[7] = speed_flags & 0xFF
    buf[8] = buf[3]
    buf[9] = buf[4]
    buf[10] = road_type & 0xFF
    buf[11] = 0
    buf[12] = eta_minutes & 0xFF
    buf[13] = 1
    return append_crc(buf)


def build_nav_maneuver_packet(
    screen: int,
    maneuver_detail: int,
    distance_m: int,
    eta_seconds: int = 0,
    total_distance_m: int = 0,
    *,
    night_mode: bool = False,
    eta_as_arrival: bool = False,
    use_12h_clock: bool = False,
) -> bytes:
    """Full nav packet built by InternalMapManager.sendManeuverToTripper()."""
    buf = blank_packet()
    buf[0] = CMD_NAVIGATE
    buf[1] = NAV_SUBCMD
    buf[2] = screen & 0xFF

    d_hi, d_lo, unit = encode_distance(distance_m)
    buf[3] = d_hi
    buf[4] = d_lo
    buf[5] = unit
    buf[6] = calc_intensity(distance_m, night_mode)
    buf[7] = maneuver_detail & 0xFF
    buf[8] = 0xFF
    buf[9] = 0xFF
    buf[10] = ROAD_STREET

    if eta_seconds > 0:
        if eta_as_arrival:
            arrival = datetime.now().timestamp() + eta_seconds
            dt = datetime.fromtimestamp(arrival)
            if use_12h_clock:
                hour = dt.hour % 12 or 12
                if dt.hour >= 12:
                    hour += 0x80
                else:
                    hour += 0x40
                buf[11] = hour & 0xFF
            else:
                buf[11] = max(0, min(dt.hour, 23)) & 0xFF
            buf[12] = max(0, min(dt.minute, 59)) & 0xFF
        else:
            buf[11] = max(0, min(eta_seconds // 60, 23)) & 0xFF
            buf[12] = max(0, min(eta_seconds % 60, 59)) & 0xFF
        buf[13] = 0
    elif total_distance_m > 0:
        t_hi, t_lo, t_unit = encode_distance(total_distance_m)
        buf[11] = t_hi
        buf[12] = t_lo
        buf[13] = t_unit
    else:
        buf[11] = 0xFF
        buf[12] = 0xFF
        buf[13] = 0xFF

    # bytes 14–17 remain zero
    return append_crc(buf)


def build_loading_screen(night_mode: bool = False) -> bytes:
    buf = blank_packet()
    buf[0] = CMD_NAVIGATE
    buf[1] = NAV_SUBCMD
    buf[2] = SCREEN_STOP
    if night_mode:
        buf[6] = 1
    return append_crc(buf)


def build_keepalive(subcmd: int = 0) -> bytes:
    buf = blank_packet()
    buf[0] = CMD_KEEPALIVE
    buf[1] = subcmd & 0xFF
    return append_crc(buf)


def build_call_icon_keepalive() -> bytes:
    return build_keepalive(5)


def build_locked_screen() -> bytes:
    buf = blank_packet()
    buf[0] = CMD_NAVIGATE
    buf[1] = NAV_SUBCMD
    buf[2] = 0x42
    buf[3] = 0xFF
    buf[4] = 0xFF
    return append_crc(buf)


def build_nav_from_maneuver(
    byte5: int,
    byte6: int,
    dist_meters: int,
    screen: int = SCREEN_TBT,
    road_type: int = ROAD_STREET,
    eta_minutes: int = 0,
) -> bytes:
    return build_nav_packet(
        screen=screen,
        dist_meters=dist_meters,
        maneuver=byte5,
        heading=byte6,
        road_type=road_type,
        eta_minutes=eta_minutes,
    )
