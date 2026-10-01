"""Differential packet analyzer and field-location discovery.

This layer only reports what it OBSERVES and, at most, what it INFERS. It never
emits CONFIRMED — confirmation requires independent experiments and lives in
hypothesis.py. Keeping that boundary sharp is the whole point (see
docs/protocol-discovery.md).
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Sequence

from packets import PAYLOAD_CRC_LEN, to_hex

from .encoding import ENCODINGS, can_represent, encode_int, encoding_width
from .experiment import EvidenceLevel
from .mutator import payload_of


@dataclass(frozen=True)
class ByteDiff:
    offset: int
    old: int
    new: int

    @property
    def xor(self) -> int:
        return self.old ^ self.new

    @property
    def changed_bits(self) -> list[int]:
        return [bit for bit in range(8) if self.xor & (1 << bit)]

    def __str__(self) -> str:
        return (
            f"offset {self.offset}: 0x{self.old:02X} -> 0x{self.new:02X} "
            f"(bits {self.changed_bits or '-'})"
        )


def compare(packet_a: bytes, packet_b: bytes) -> list[ByteDiff]:
    """Byte-level diff over the payload region (CRC excluded).

    Works on 18-byte payloads or full 20-byte frames; the CRC bytes are never
    reported because they change as a consequence of payload changes.
    """
    a, b = payload_of(packet_a), payload_of(packet_b)
    return [ByteDiff(i, a[i], b[i]) for i in range(PAYLOAD_CRC_LEN) if a[i] != b[i]]


def changed_offsets(packets: Sequence[bytes]) -> list[int]:
    """Payload offsets that are not constant across a series of packets."""
    payloads = [payload_of(p) for p in packets]
    if len(payloads) < 2:
        return []
    return [
        off
        for off in range(PAYLOAD_CRC_LEN)
        if len({p[off] for p in payloads}) > 1
    ]


@dataclass
class SeriesSummary:
    constant_offsets: list[int]
    varying_offsets: list[int]
    values_by_offset: dict[int, list[int]]

    def describe(self) -> str:
        lines = [f"varying offsets: {self.varying_offsets or 'none'}"]
        for off in self.varying_offsets:
            vals = " ".join(f"{v:02X}" for v in self.values_by_offset[off])
            lines.append(f"  offset {off}: {vals}")
        return "\n".join(lines)


def summarize_series(packets: Sequence[bytes]) -> SeriesSummary:
    """Which offsets stay constant vs vary, and the per-offset value sequence."""
    payloads = [payload_of(p) for p in packets]
    varying = changed_offsets(payloads)
    constant = [o for o in range(PAYLOAD_CRC_LEN) if o not in varying]
    values = {o: [p[o] for p in payloads] for o in varying}
    return SeriesSummary(constant, varying, values)


@dataclass
class FieldCandidate:
    """An OBSERVED correlation between an input value and payload bytes.

    confidence is a heuristic over the evidence; evidence_level stays OBSERVED
    until a human/hypothesis promotes it. A single sample is never HIGH.
    """

    offset: int
    width: int
    encoding: str
    samples: list[tuple[int, bytes]] = field(default_factory=list)
    confidence: str = "LOW"
    evidence_level: str = EvidenceLevel.OBSERVED.value

    def inference(self) -> str:
        return (
            f"offset {self.offset}" + (f"-{self.offset + self.width - 1}" if self.width > 1 else "")
            + f" may carry the value as {self.encoding} (confidence {self.confidence}, "
            f"{len(self.samples)} samples)"
        )

    def describe(self) -> str:
        rows = "\n".join(
            f"    {value:>6} -> {to_hex(encoded)}" for value, encoded in self.samples
        )
        span = f"{self.offset}" if self.width == 1 else f"{self.offset}-{self.offset + self.width - 1}"
        return (
            f"offset: {span}\n"
            f"width: {self.width}\n"
            f"encoding: {self.encoding}\n{rows}\n"
            f"confidence: {self.confidence}"
        )


def _confidence(samples: list[tuple[int, bytes]], width: int) -> str:
    """Heuristic confidence from the number of distinct values and their spread.

    HIGH   — 3+ distinct values, and at least one needs the candidate's full width.
    MEDIUM — 3+ distinct values that a narrower placement explains equally well,
             or 2 distinct values that exercise the full width.
    LOW    — anything weaker. Repeating one value adds no location information.
    """
    distinct = {v for v, _ in samples}
    if len(distinct) < 2:
        return "LOW"
    full_width = max(distinct).bit_length() > 8 * (width - 1)
    if len(distinct) >= 3:
        return "HIGH" if full_width else "MEDIUM"
    return "MEDIUM" if full_width else "LOW"


def find_value(packet: bytes, value: int) -> list[tuple[int, str]]:
    """Every (offset, encoding) where value's representation appears in one payload.

    One packet alone cannot distinguish a real field from a coincidence (0x00
    appears everywhere), so treat these hits as leads for discover_field().
    """
    payload = payload_of(packet)
    hits: list[tuple[int, str]] = []
    for enc in ENCODINGS:
        if not can_represent(value, enc):
            continue
        pattern = encode_int(value, enc)
        width = len(pattern)
        for offset in range(PAYLOAD_CRC_LEN - width + 1):
            if payload[offset : offset + width] == pattern:
                hits.append((offset, enc))
    return hits


def discover_field(
    samples: Sequence[tuple[int, bytes]],
    *,
    widths: Sequence[int] = (1, 2, 3, 4),
    encodings: Sequence[str] = ENCODINGS,
) -> list[FieldCandidate]:
    """Find (offset, width, encoding) placements consistent with every sample.

    Each sample is (known_input_value, packet). A candidate qualifies only if,
    for all samples, payload[offset:offset+width] equals encode_int(value) under
    that encoding — and the bytes actually change across samples (so a constant
    region is never mistaken for the field).
    """
    pairs = [(v, payload_of(p)) for v, p in samples]
    if len(pairs) < 2:
        raise ValueError("need at least 2 samples to correlate a field")

    results: list[FieldCandidate] = []
    for enc in encodings:
        width = encoding_width(enc)
        if width not in widths or not all(can_represent(v, enc) for v, _ in pairs):
            continue
        expected = [encode_int(v, enc) for v, _ in pairs]
        for offset in range(PAYLOAD_CRC_LEN - width + 1):
            observed = [(v, bytes(p[offset : offset + width])) for v, p in pairs]
            if any(obs != exp for (_, obs), exp in zip(observed, expected)):
                continue
            if len({obs for _, obs in observed}) < 2:
                continue  # bytes never changed — not this field
            results.append(
                FieldCandidate(offset, width, enc, observed, _confidence(observed, width))
            )

    order = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}
    results.sort(key=lambda c: (order[c.confidence], c.width, c.offset))
    return results


def detect_bitfield(packets: Sequence[bytes]) -> list[int]:
    """Offsets where consecutive packets differ by exactly one bit.

    A clean one-bit-at-a-time progression is a strong hint of packed flags
    (e.g. speedFlags). Returned offsets are OBSERVED, not confirmed flags.
    """
    payloads = [payload_of(p) for p in packets]
    if len(payloads) < 2:
        return []
    out: list[int] = []
    for off in range(PAYLOAD_CRC_LEN):
        seq = [p[off] for p in payloads]
        if len(set(seq)) < 2:
            continue
        steps = [bin(seq[i] ^ seq[i + 1]).count("1") for i in range(len(seq) - 1)]
        if all(s == 1 for s in steps):
            out.append(off)
    return out


@dataclass
class EnumObservation:
    """Groups device states seen for each value of a mutated field (OBSERVED)."""

    field: str
    mapping: dict[int, list[str]]

    def describe(self) -> str:
        lines = [f"enum observations for '{self.field}':"]
        for value in sorted(self.mapping):
            states = sorted(set(self.mapping[value]))
            lines.append(f"  {value:>3} (0x{value:02X}) -> {', '.join(states)}")
        return "\n".join(lines)


def detect_enum(
    observations: Sequence[tuple[int, str]], field_name: str = "field"
) -> EnumObservation:
    """Collect value -> observed-device-state groupings for an enum-like field."""
    mapping: dict[int, list[str]] = {}
    for value, state in observations:
        mapping.setdefault(value, []).append(state)
    return EnumObservation(field_name, mapping)
