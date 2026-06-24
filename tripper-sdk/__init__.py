"""Royal Enfield Tripper BLE Python SDK."""

from maneuvers import GOOGLE_MANEUVERS, GoogleManeuver, get_google_maneuver, nav_maneuver_to_byte
from packets import *
from parser import TripperResponse, firmware_version, is_pin_accepted, is_pin_rejected, parse_response, serial_number

try:
    from ble import TripperBleClient
except ImportError:
    TripperBleClient = None  # type: ignore

__all__ = [
    "GOOGLE_MANEUVERS",
    "GoogleManeuver",
    "TripperBleClient",
    "TripperResponse",
    "firmware_version",
    "get_google_maneuver",
    "is_pin_accepted",
    "is_pin_rejected",
    "nav_maneuver_to_byte",
    "parse_response",
    "serial_number",
]
