"""Experiment data model: candidates, reproducible configs, and per-packet results.

Everything here serializes to plain JSON (bytes become uppercase hex) so the
same records round-trip through JSONL or SQLite unchanged.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Optional

from packets import to_hex

from .encoding import ENCODINGS


class DeviceState(str, Enum):
    """What a human (or later, computer vision) saw on the Tripper."""

    UNKNOWN = "UNKNOWN"
    NO_CHANGE = "NO_CHANGE"
    LEFT = "LEFT"
    RIGHT = "RIGHT"
    STRAIGHT = "STRAIGHT"
    U_TURN = "U_TURN"
    ROUNDABOUT = "ROUNDABOUT"
    COMPASS_N = "COMPASS_N"
    COMPASS_NE = "COMPASS_NE"
    COMPASS_E = "COMPASS_E"
    COMPASS_SE = "COMPASS_SE"
    COMPASS_S = "COMPASS_S"
    COMPASS_SW = "COMPASS_SW"
    COMPASS_W = "COMPASS_W"
    COMPASS_NW = "COMPASS_NW"
    OTHER = "OTHER"


class EvidenceLevel(str, Enum):
    """Epistemic strength of a claim. Never silently promoted."""

    OBSERVED = "OBSERVED"          # a byte changed / a response arrived
    INFERRED = "INFERRED"          # a pattern across observations suggests meaning
    HYPOTHESIZED = "HYPOTHESIZED"  # an explicit, testable mapping claim
    CONFIRMED = "CONFIRMED"        # reproduced by multiple independent experiments


# Response status for one transmitted packet. TIMEOUT is deliberately distinct
# from an error: the Tripper often answers via the phone GATT server, so a
# missing client notification does NOT mean the packet was invalid.
STATUS_DRY_RUN = "DRY_RUN"
STATUS_OK = "OK"
STATUS_TIMEOUT = "TIMEOUT"
STATUS_ERROR = "ERROR"
STATUS_ABORTED = "ABORTED"

RESPONSE_STATUSES = (STATUS_DRY_RUN, STATUS_OK, STATUS_TIMEOUT, STATUS_ERROR, STATUS_ABORTED)

# Statuses where the packet actually reached the radio, so a device observation
# can be attributed to it. TIMEOUT counts: the write happened, only the RX didn't.
DELIVERED_STATUSES = (STATUS_OK, STATUS_TIMEOUT)


def command_of(packet: bytes) -> str:
    """Name the command family from the header bytes of a payload or frame."""
    if len(packet) >= 3 and packet[0] == 0x10 and packet[1] == 0x11:
        return "compass" if packet[2] == 0x41 else "nav"
    return {
        0x03: "ping_fw",
        0x20: "pin",
        0x21: "handshake",
        0x30: "ping_wp",
        0x40: "keepalive",
        0x50: "time",
    }.get(packet[0] if packet else -1, "raw")


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="milliseconds")


def _hex(data: Optional[bytes]) -> Optional[str]:
    return to_hex(data) if data is not None else None


def _unhex(text: Optional[str]) -> Optional[bytes]:
    if text is None:
        return None
    return bytes.fromhex(text.replace(" ", ""))


@dataclass(frozen=True)
class Candidate:
    """One generated 18-byte payload differing from the base in a single field.

    The CRC is intentionally absent: it is always recomputed by finalize_frame()
    so a candidate can never carry a stale or hand-mutated checksum.
    """

    payload: bytes
    mutated_field: str
    mutation_value: Any
    encoding: Optional[str] = None
    notes: str = ""

    def __post_init__(self) -> None:
        if len(self.payload) != 18:
            raise ValueError(f"candidate payload must be 18 bytes, got {len(self.payload)}")
        if self.encoding is not None and self.encoding not in ENCODINGS:
            raise ValueError(f"unknown encoding: {self.encoding}")


@dataclass
class SafetyLimits:
    """Physical-device guardrails. Defaults are conservative on purpose."""

    max_packets: int = 256
    delay_s: float = 1.0
    timeout_s: float = 1.5
    cooldown_s: float = 2.0
    abort_on_error: bool = True

    # Hard floor so a typo can never flood the Tripper (mirrors the PWA's 500 ms).
    MIN_DELAY_S = 0.5
    HARD_MAX_PACKETS = 1024

    def validate(self) -> None:
        if self.delay_s < self.MIN_DELAY_S:
            raise ValueError(f"delay_s must be >= {self.MIN_DELAY_S}s (got {self.delay_s})")
        if not 1 <= self.max_packets <= self.HARD_MAX_PACKETS:
            raise ValueError(f"max_packets must be 1..{self.HARD_MAX_PACKETS} (got {self.max_packets})")
        if self.timeout_s <= 0:
            raise ValueError("timeout_s must be > 0")
        if self.cooldown_s < 0:
            raise ValueError("cooldown_s must be >= 0")


@dataclass
class ExperimentConfig:
    """Everything needed to regenerate and replay an experiment exactly."""

    experiment_id: str
    name: str
    command: str
    base_packet: bytes
    strategy: str
    target: str
    mutation_values: list[Any]
    encoding: Optional[str] = None
    params: dict[str, Any] = field(default_factory=dict)
    limits: SafetyLimits = field(default_factory=SafetyLimits)
    dry_run: bool = True
    replay_of: Optional[str] = None
    created_at: str = field(default_factory=utc_now)
    notes: str = ""

    def to_dict(self) -> dict[str, Any]:
        data = asdict(self)
        data["base_packet"] = _hex(self.base_packet)
        return data

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "ExperimentConfig":
        data = dict(data)
        data["base_packet"] = _unhex(data["base_packet"])
        data["limits"] = SafetyLimits(**data.get("limits", {}))
        return cls(**data)


@dataclass
class ExperimentResult:
    """One transmitted (or dry-run) packet and everything observed about it."""

    experiment_id: str
    sequence: int
    command: str
    base_packet: bytes
    mutated_field: str
    mutation_value: Any
    generated_packet: bytes
    crc: int
    encoding: Optional[str] = None
    timestamp: str = field(default_factory=utc_now)
    response_packet: Optional[bytes] = None
    response_label: Optional[str] = None
    response_status: str = STATUS_DRY_RUN
    latency_ms: Optional[float] = None
    # Notifications received outside this packet's correlation window: late
    # replies to the previous packet, unsolicited traffic, handshake responses.
    uncorrelated_rx: list[bytes] = field(default_factory=list)
    device_state: str = DeviceState.UNKNOWN.value
    device_observation: str = ""
    # A number read off the display, in the field's own unit (e.g. meters).
    observed_value: Optional[int] = None
    notes: str = ""

    @property
    def delivered(self) -> bool:
        return self.response_status in DELIVERED_STATUSES

    @property
    def result_id(self) -> str:
        return f"{self.experiment_id}-{self.sequence:04d}"

    def to_dict(self) -> dict[str, Any]:
        data = asdict(self)
        data["result_id"] = self.result_id
        data["base_packet"] = _hex(self.base_packet)
        data["generated_packet"] = _hex(self.generated_packet)
        data["response_packet"] = _hex(self.response_packet)
        data["uncorrelated_rx"] = [to_hex(rx) for rx in self.uncorrelated_rx]
        return data

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "ExperimentResult":
        data = dict(data)
        data.pop("result_id", None)
        data["base_packet"] = _unhex(data["base_packet"])
        data["generated_packet"] = _unhex(data["generated_packet"])
        data["response_packet"] = _unhex(data.get("response_packet"))
        data["uncorrelated_rx"] = [_unhex(rx) for rx in data.get("uncorrelated_rx", [])]
        return cls(**data)
