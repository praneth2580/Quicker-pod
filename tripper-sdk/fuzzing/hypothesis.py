"""Hypothesis tracking with explicit, conservative promotion rules.

A hypothesis is a testable claim about where a field is serialized and, for
enum-like fields, what its values do on the Tripper. Its status is DERIVED from
recorded experiments — never typed in by hand:

    UNKNOWN    no supporting experiments yet
    POSSIBLE   1 supporting experiment
    LIKELY     2 supporting experiments
    CONFIRMED  >= min_support (default 3) supporting experiments, 0 contradicting
    REJECTED   any contradicting experiment

An experiment only counts as supporting when >= 2 distinct field values agree
with the claim and none disagree, so a single interesting packet can never move
a hypothesis forward. Field values are decoded from the transmitted bytes at the
hypothesis' own offset, so experiments that mutated a different byte still
count as (fair) tests of it. Every verdict and status change is appended to
history so nothing is promoted silently.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from enum import Enum
from typing import Any, Iterable, Optional

from .encoding import ENCODINGS, decode_int, encoding_width
from .experiment import DeviceState, EvidenceLevel, ExperimentResult, utc_now


class HypothesisStatus(str, Enum):
    UNKNOWN = "UNKNOWN"
    POSSIBLE = "POSSIBLE"
    LIKELY = "LIKELY"
    CONFIRMED = "CONFIRMED"
    REJECTED = "REJECTED"


SUPPORT = "support"
CONTRADICT = "contradict"
INCONCLUSIVE = "inconclusive"

DEFAULT_MIN_SUPPORT = 3
MIN_DISTINCT_VALUES_PER_EXPERIMENT = 2

_NO_CHANGE = DeviceState.NO_CHANGE.value
_UNKNOWN = DeviceState.UNKNOWN.value


def parse_int(text: Any) -> int:
    """Parse '16', '0x10', or an int."""
    if isinstance(text, int) and not isinstance(text, bool):
        return text
    s = str(text).strip()
    return int(s, 16) if s.lower().startswith("0x") else int(s)


def normalize_mapping(mapping: dict[Any, Any]) -> dict[str, str]:
    """Decimal-string keys and validated, upper-case DeviceState values."""
    out: dict[str, str] = {}
    for raw_key, raw_state in mapping.items():
        state = str(raw_state).upper()
        if state not in DeviceState.__members__:
            raise ValueError(f"unknown device state '{raw_state}'")
        out[str(parse_int(raw_key))] = state
    return out


@dataclass
class Verdict:
    """Outcome of testing one hypothesis against one experiment."""

    experiment_id: str
    outcome: str
    agreeing_values: list[int] = field(default_factory=list)
    disagreements: list[str] = field(default_factory=list)

    def describe(self) -> str:
        text = f"{self.experiment_id}: {self.outcome.upper()}"
        if self.agreeing_values:
            text += f" (agreeing values: {', '.join(f'0x{v:02X}' for v in self.agreeing_values)})"
        for d in self.disagreements:
            text += f"\n    disagreement: {d}"
        return text


@dataclass
class Hypothesis:
    field: str
    offset: int
    width: int = 1
    encoding: Optional[str] = None
    mapping: dict[str, str] = field(default_factory=dict)
    command: str = "nav"
    label: str = ""
    confidence: str = "NONE"
    supporting_experiments: list[str] = field(default_factory=list)
    contradicting_experiments: list[str] = field(default_factory=list)
    evidence_level: str = EvidenceLevel.HYPOTHESIZED.value
    status: str = HypothesisStatus.UNKNOWN.value
    history: list[str] = field(default_factory=list)
    created_at: str = field(default_factory=utc_now)
    updated_at: str = field(default_factory=utc_now)
    notes: str = ""

    def __post_init__(self) -> None:
        if self.encoding is None:
            if self.width != 1:
                raise ValueError("multi-byte hypotheses need an explicit encoding")
        elif self.encoding not in ENCODINGS:
            raise ValueError(f"unknown encoding: {self.encoding}")
        elif encoding_width(self.encoding) != self.width:
            raise ValueError(f"{self.encoding} is {encoding_width(self.encoding)} bytes, not {self.width}")
        if self.offset < 0 or self.offset + self.width > 18:
            raise ValueError("hypothesis must lie inside the 18-byte payload")
        self.mapping = normalize_mapping(self.mapping)

    @property
    def effective_encoding(self) -> str:
        return self.encoding or "uint8"

    @property
    def hypothesis_id(self) -> str:
        base = f"{self.command}.{self.field}@{self.offset}:{self.effective_encoding}"
        return f"{base}-{self.label}" if self.label else base

    def decode(self, packet: bytes) -> int:
        """Value this hypothesis would read from a payload or frame."""
        return decode_int(bytes(packet[self.offset : self.offset + self.width]), self.effective_encoding)

    # -- testing against experiments ----------------------------------------

    def test(self, experiment_id: str, results: Iterable[ExperimentResult]) -> Verdict:
        """Compare what the device did with what this hypothesis predicts.

        Enum hypotheses (mapping set) compare device_state; NO_CHANGE resolves
        to the last concrete state in the same experiment. Numeric hypotheses
        (no mapping) compare the decoded value with observed_value. Packets that
        never reached the radio and other commands are ignored.
        """
        agree: set[int] = set()
        disagreements: list[str] = []
        shown: Optional[str] = None  # what the display currently shows, if known

        for r in sorted(results, key=lambda r: r.sequence):
            if not r.delivered:
                continue
            state = (r.device_state or _UNKNOWN).upper()
            effective = shown if state == _NO_CHANGE else state
            if state == _UNKNOWN:
                shown = None  # nobody looked; we lost track of the display
            elif state != _NO_CHANGE:
                shown = state

            if r.command != self.command:
                continue
            value = self.decode(r.generated_packet)

            if self.mapping:
                expected = self.mapping.get(str(value))
                if expected is None or effective in (None, _UNKNOWN):
                    continue
                if effective == expected:
                    agree.add(value)
                else:
                    disagreements.append(
                        f"{r.result_id}: 0x{value:02X} expected {expected}, saw {effective}"
                    )
            elif r.observed_value is not None:
                if r.observed_value == value:
                    agree.add(value)
                else:
                    disagreements.append(
                        f"{r.result_id}: bytes decode to {value}, display showed {r.observed_value}"
                    )

        if disagreements:
            outcome = CONTRADICT
        elif len(agree) >= MIN_DISTINCT_VALUES_PER_EXPERIMENT:
            outcome = SUPPORT
        else:
            outcome = INCONCLUSIVE
        return Verdict(experiment_id, outcome, sorted(agree), disagreements)

    def ingest(
        self,
        experiment_id: str,
        results: Iterable[ExperimentResult],
        *,
        min_support: int = DEFAULT_MIN_SUPPORT,
    ) -> Verdict:
        """Test against one experiment, record the verdict, re-derive status.

        Re-ingesting an experiment (e.g. after correcting an observation)
        replaces its previous verdict instead of double-counting it.
        """
        verdict = self.test(experiment_id, results)
        for bucket in (self.supporting_experiments, self.contradicting_experiments):
            if experiment_id in bucket:
                bucket.remove(experiment_id)
        if verdict.outcome == SUPPORT:
            self.supporting_experiments.append(experiment_id)
        elif verdict.outcome == CONTRADICT:
            self.contradicting_experiments.append(experiment_id)
        previous = self.status
        self.evaluate(min_support=min_support)
        self.history.append(
            f"{utc_now()} {experiment_id}: {verdict.outcome} (status {previous} -> {self.status})"
        )
        return verdict

    def evaluate(self, *, min_support: int = DEFAULT_MIN_SUPPORT) -> str:
        """Re-derive status, evidence level, and confidence from the evidence."""
        support = len(self.supporting_experiments)
        if self.contradicting_experiments:
            status = HypothesisStatus.REJECTED
        elif support >= min_support:
            status = HypothesisStatus.CONFIRMED
        elif support >= 2:
            status = HypothesisStatus.LIKELY
        elif support == 1:
            status = HypothesisStatus.POSSIBLE
        else:
            status = HypothesisStatus.UNKNOWN

        self.status = status.value
        self.evidence_level = {
            HypothesisStatus.CONFIRMED: EvidenceLevel.CONFIRMED,
            HypothesisStatus.LIKELY: EvidenceLevel.INFERRED,
            HypothesisStatus.POSSIBLE: EvidenceLevel.INFERRED,
            HypothesisStatus.REJECTED: EvidenceLevel.HYPOTHESIZED,
            HypothesisStatus.UNKNOWN: EvidenceLevel.HYPOTHESIZED,
        }[status].value
        self.confidence = {
            HypothesisStatus.CONFIRMED: "HIGH",
            HypothesisStatus.LIKELY: "MEDIUM",
            HypothesisStatus.POSSIBLE: "LOW",
            HypothesisStatus.REJECTED: "NONE",
            HypothesisStatus.UNKNOWN: "NONE",
        }[status]
        self.updated_at = utc_now()
        return self.status

    # -- presentation / serialization ---------------------------------------

    def describe(self) -> str:
        span = f"{self.offset}" if self.width == 1 else f"{self.offset}-{self.offset + self.width - 1}"
        lines = [
            f"[{self.status}] {self.hypothesis_id}  ({self.evidence_level}, confidence {self.confidence})",
            f"  field={self.field} offset={span} width={self.width} encoding={self.effective_encoding}",
            f"  supporting={self.supporting_experiments or '-'}",
            f"  contradicting={self.contradicting_experiments or '-'}",
        ]
        if self.mapping:
            pretty = ", ".join(
                f"0x{int(k):02X}={v}" for k, v in sorted(self.mapping.items(), key=lambda kv: int(kv[0]))
            )
            lines.append(f"  mapping: {pretty}")
        if self.notes:
            lines.append(f"  notes: {self.notes}")
        return "\n".join(lines)

    def to_dict(self) -> dict[str, Any]:
        data = asdict(self)
        data["hypothesis_id"] = self.hypothesis_id
        return data

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "Hypothesis":
        data = dict(data)
        data.pop("hypothesis_id", None)
        return cls(**data)


def seed_hypotheses() -> list[Hypothesis]:
    """Starting claims implied by the existing code — all UNKNOWN, zero evidence.

    They exist so experiments have something falsifiable to test; the notes
    record where each claim came from. None is a protocol fact until confirmed.
    """
    return [
        Hypothesis(field="screen", offset=2,
                   notes="buildNavPacket writes screen at byte 2 (decompiled code, not hardware)."),
        Hypothesis(field="distance", offset=3, width=2, encoding="uint16_be",
                   notes="buildNavPacket writes distance big-endian at bytes 3-4."),
        Hypothesis(field="distance", offset=8, width=2, encoding="uint16_be",
                   notes="buildNavPacket duplicates distance at bytes 8-9; which copy the "
                         "firmware reads is unknown."),
        Hypothesis(field="maneuver", offset=5, label="app-labels",
                   mapping={0x00: "STRAIGHT", 0x10: "LEFT", 0x20: "RIGHT", 0x50: "U_TURN"},
                   notes="From TripperProtocol.maneuverLabel(); 0x30/0x40/0x60 omitted because "
                         "sources disagree on their direction. maneuvers.nav_maneuver_to_byte "
                         "emits a second, richer icon table (0x08-0x3F) that is untested."),
        Hypothesis(field="heading", offset=6,
                   notes="Three incompatible readings: buildNavPacket calls byte 6 heading; "
                         "sendManeuverToTripper writes distance-based intensity there; "
                         "maneuvers.GOOGLE_MANEUVERS puts roundabout exit arrows (with byte 5 "
                         "= 0x40) and destination side (0x01) there. Test with byte 5 fixed."),
        Hypothesis(field="speedFlags", offset=7,
                   notes="buildNavPacket byte 7; decompiled default is 0x15 while SDK default is "
                         "0x40. Candidate bit-field."),
        Hypothesis(field="roadType", offset=10,
                   notes="buildNavPacket writes road type at byte 10."),
        Hypothesis(field="eta", offset=12,
                   notes="buildNavPacket writes ETA minutes at byte 12."),
        Hypothesis(field="nav_trailer", offset=13,
                   notes="Discrepancy: decompiled buildNavPacket sets byte 13 = 0x03; the TS/"
                         "Python builders set 0x01. Assume neither until tested."),
        Hypothesis(field="direction", offset=14, command="compass", label="dir-constants",
                   mapping={0x10: "COMPASS_N", 0x60: "COMPASS_NE", 0x30: "COMPASS_E",
                            0x70: "COMPASS_SE", 0x40: "COMPASS_S", 0x80: "COMPASS_SW",
                            0x20: "COMPASS_W", 0x50: "COMPASS_NW"},
                   notes="DIR_* constant names. bearingToDirection's sector order disagrees "
                         "(bearing 45° yields 0x50, named NW), so one of the two is wrong."),
    ]
