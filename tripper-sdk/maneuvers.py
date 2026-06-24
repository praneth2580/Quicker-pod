"""Google Navigation SDK maneuver → Tripper icon bytes."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Tuple

MAN_HIGHWAY = 0x60


@dataclass(frozen=True)
class GoogleManeuver:
    name: str
    byte5: int
    byte6: int
    display_name: str


GOOGLE_MANEUVERS: Tuple[GoogleManeuver, ...] = (
    GoogleManeuver("DEPART", 0x00, 0x40, "Depart"),
    GoogleManeuver("STRAIGHT", 0x00, 0x40, "Straight"),
    GoogleManeuver("DESTINATION_LEFT", 0x10, 0x01, "Destination left"),
    GoogleManeuver("DESTINATION_RIGHT", 0x20, 0x01, "Destination right"),
    GoogleManeuver("TURN_LEFT", 0x10, 0x40, "Turn left"),
    GoogleManeuver("TURN_RIGHT", 0x20, 0x40, "Turn right"),
    GoogleManeuver("TURN_KEEP_LEFT", 0x10, 0x40, "Keep left"),
    GoogleManeuver("TURN_KEEP_RIGHT", 0x20, 0x40, "Keep right"),
    GoogleManeuver("TURN_SLIGHT_LEFT", 0x10, 0x40, "Slight left"),
    GoogleManeuver("TURN_SLIGHT_RIGHT", 0x20, 0x40, "Slight right"),
    GoogleManeuver("TURN_SHARP_LEFT", 0x30, 0x40, "Sharp left"),
    GoogleManeuver("TURN_SHARP_RIGHT", 0x30, 0x40, "Sharp right"),
    GoogleManeuver("TURN_U_TURN_CLOCKWISE", 0x50, 0x40, "U-turn CW"),
    GoogleManeuver("TURN_U_TURN_COUNTERCLOCKWISE", 0x50, 0x40, "U-turn CCW"),
    GoogleManeuver("FORK_LEFT", 0x10, 0x40, "Fork left"),
    GoogleManeuver("FORK_RIGHT", 0x20, 0x40, "Fork right"),
    GoogleManeuver("KEEP_LEFT", 0x10, 0x40, "Keep left"),
    GoogleManeuver("KEEP_RIGHT", 0x20, 0x40, "Keep right"),
    GoogleManeuver("MERGE_LEFT", 0x10, 0x40, "Merge left"),
    GoogleManeuver("MERGE_RIGHT", 0x20, 0x40, "Merge right"),
    GoogleManeuver("ON_RAMP_LEFT", MAN_HIGHWAY, 0x40, "On-ramp left"),
    GoogleManeuver("ON_RAMP_RIGHT", MAN_HIGHWAY, 0x40, "On-ramp right"),
    GoogleManeuver("OFF_RAMP_LEFT", MAN_HIGHWAY, 0x40, "Off-ramp left"),
    GoogleManeuver("OFF_RAMP_RIGHT", MAN_HIGHWAY, 0x40, "Off-ramp right"),
    GoogleManeuver("ROUNDABOUT_LEFT_CLOCKWISE", 0x40, 0x10, "Roundabout left"),
    GoogleManeuver("ROUNDABOUT_RIGHT_CLOCKWISE", 0x40, 0x20, "Roundabout right"),
    GoogleManeuver("ROUNDABOUT_STRAIGHT_CLOCKWISE", 0x40, 0x40, "Roundabout straight"),
    GoogleManeuver("ROUNDABOUT_EXIT_CLOCKWISE", 0x40, MAN_HIGHWAY, "Roundabout exit"),
    GoogleManeuver("ROUNDABOUT_U_TURN_CLOCKWISE", 0x40, 0x50, "Roundabout U-turn"),
    GoogleManeuver("ROUNDABOUT_LEFT_COUNTERCLOCKWISE", 0x40, 0x10, "Roundabout left CCW"),
    GoogleManeuver("ROUNDABOUT_RIGHT_COUNTERCLOCKWISE", 0x40, 0x20, "Roundabout right CCW"),
    GoogleManeuver("ROUNDABOUT_EXIT_COUNTERCLOCKWISE", 0x40, MAN_HIGHWAY, "Roundabout exit CCW"),
)

_BY_NAME: Dict[str, GoogleManeuver] = {m.name: m for m in GOOGLE_MANEUVERS}


def get_google_maneuver(name: str) -> GoogleManeuver | None:
    return _BY_NAME.get(name)


def nav_maneuver_to_byte(maneuver_id: int, roundabout_exit: int = 0) -> int:
    """Map Google Navigation SDK maneuver id (NavManeuver.toByte)."""
    table = {
        0: 0x00, 1: 0x00, 2: 0x10, 3: 0x20, 4: 0x30, 5: 0x40, 6: 0x50, 7: 0x60,
        8: 0x21, 9: 0x22, 10: 0x1F, 11: 0x20, 12: 0x1D, 13: 0x1E, 14: 0x1B, 15: 0x17,
        16: 0x16, 17: 0x15, 18: 0x14, 19: 0x3C, 20: 0x2D, 21: 0x2E, 22: 0x2B, 23: 0x31,
        24: 0x30, 25: 0x2F, 26: 0x18, 27: 0x19, 28: 0x1A, 29: 0x3D, 30: 0x3E, 31: 0x3F,
        32: 0x09, 33: 0x0A, 34: 0x08, 36: 0x1B, 37: 0x1A, 38: 0x19, 39: 0x18, 40: 0x17,
        41: 0x16, 42: 0x15,
    }
    if maneuver_id == 35:
        return (0x1C + roundabout_exit) if roundabout_exit > 0 else 0xFF
    return table.get(maneuver_id, 0xFF)
