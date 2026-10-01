"""Differential mutation engine.

Core rule: every candidate changes exactly ONE field or byte; all other payload
bytes stay identical to the base. Candidates are 18-byte payloads — the CRC is
never mutated, it is always recomputed by finalize_frame() using the SDK's
existing CRC (packets.append_crc).

Command/sub-command bytes (offsets 0–1) are protected by default: the same
characteristic carries firmware-OTA block transfers, so a random opcode is a
genuine hazard. Pass allow_header=True to override deliberately.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Callable, Iterable, Optional, Sequence

from maneuvers import GOOGLE_MANEUVERS, nav_maneuver_to_byte
from packets import (
    DIR_N,
    MAN_FORWARD,
    PACKET_SIZE,
    PAYLOAD_CRC_LEN,
    ROAD_STREET,
    SCREEN_TBT,
    append_crc,
    build_compass_packet,
    build_nav_packet,
    build_set_time_packet,
)

from .encoding import (
    ENCODINGS,
    SMALL_VALUES,
    boundary_values,
    can_represent,
    encode_int,
    encoding_width,
)
from .experiment import Candidate

HEADER_OFFSETS = (0, 1)


def finalize_frame(payload: bytes) -> bytes:
    """Append a freshly computed CRC to an 18-byte payload (20-byte frame)."""
    if len(payload) != PAYLOAD_CRC_LEN:
        raise ValueError(f"payload must be {PAYLOAD_CRC_LEN} bytes, got {len(payload)}")
    buf = bytearray(PACKET_SIZE)
    buf[:PAYLOAD_CRC_LEN] = payload
    return append_crc(buf)


def frame_crc(frame: bytes) -> int:
    """Big-endian CRC stored in bytes 18–19 of a 20-byte frame."""
    if len(frame) != PACKET_SIZE:
        raise ValueError(f"frame must be {PACKET_SIZE} bytes, got {len(frame)}")
    return (frame[18] << 8) | frame[19]


def payload_of(packet: bytes) -> bytes:
    """Return the 18-byte payload from a payload or a full 20-byte frame."""
    if len(packet) == PAYLOAD_CRC_LEN:
        return bytes(packet)
    if len(packet) == PACKET_SIZE:
        return bytes(packet[:PAYLOAD_CRC_LEN])
    raise ValueError(f"expected 18 or 20 bytes, got {len(packet)}")


def _check_span(offset: int, width: int, allow_header: bool) -> None:
    if offset < 0 or offset + width > PAYLOAD_CRC_LEN:
        raise ValueError(
            f"bytes {offset}..{offset + width - 1} are outside the 18-byte payload "
            f"(CRC bytes 18–19 can never be mutated)"
        )
    touched = set(range(offset, offset + width))
    if not allow_header and touched & set(HEADER_OFFSETS):
        raise ValueError(
            "offsets 0–1 are the command header; mutating them can select unrelated "
            "commands (including firmware OTA). Pass allow_header=True (CLI: "
            "--allow-header) to override deliberately."
        )


def _with_bytes(base: bytes, offset: int, data: bytes) -> bytes:
    buf = bytearray(base)
    buf[offset : offset + len(data)] = data
    return bytes(buf)


def mutate_byte(
    base: bytes,
    offset: int,
    values: Iterable[int],
    *,
    label: Optional[str] = None,
    allow_header: bool = False,
) -> list[Candidate]:
    """Set one payload byte to each value (Mode A when values=range(256))."""
    base = payload_of(base)
    _check_span(offset, 1, allow_header)
    name = label or f"byte[{offset}]"
    out: list[Candidate] = []
    for v in values:
        if not 0 <= v <= 0xFF:
            raise ValueError(f"byte value out of range: {v}")
        out.append(Candidate(_with_bytes(base, offset, bytes([v])), name, v, "uint8"))
    return out


def exhaustive_byte(base: bytes, offset: int, **kwargs: Any) -> list[Candidate]:
    """Mode A — all 256 values of one explicitly selected byte."""
    return mutate_byte(base, offset, range(256), **kwargs)


def small_value_sweep(base: bytes, offset: int, **kwargs: Any) -> list[Candidate]:
    """Mode B — values 0..15, for enum-like fields."""
    return mutate_byte(base, offset, SMALL_VALUES, **kwargs)


def mutate_int(
    base: bytes,
    offset: int,
    encoding: str,
    values: Iterable[int],
    *,
    label: Optional[str] = None,
    allow_header: bool = False,
) -> tuple[list[Candidate], list[int]]:
    """Write each value at offset using one encoding.

    Returns (candidates, skipped) — values the encoding cannot represent are
    skipped rather than silently truncated, so no packet ever lies about the
    value it claims to carry.
    """
    base = payload_of(base)
    width = encoding_width(encoding)
    _check_span(offset, width, allow_header)
    name = label or f"{encoding}@{offset}"
    out: list[Candidate] = []
    skipped: list[int] = []
    for v in values:
        if not can_represent(v, encoding):
            skipped.append(v)
            continue
        out.append(
            Candidate(
                _with_bytes(base, offset, encode_int(v, encoding)),
                name,
                v,
                encoding,
                notes=f"bytes {offset}-{offset + width - 1}",
            )
        )
    return out, skipped


def boundary_sweep(base: bytes, offset: int, encoding: str, **kwargs: Any) -> list[Candidate]:
    """Mode C — boundary values that the candidate encoding can represent."""
    candidates, _ = mutate_int(base, offset, encoding, boundary_values(encoding), **kwargs)
    return candidates


def encoding_hypotheses(
    base: bytes,
    offset: int,
    values: Sequence[int],
    *,
    encodings: Sequence[str] = ENCODINGS,
    label: Optional[str] = None,
    allow_header: bool = False,
) -> list[Candidate]:
    """Mode D — the same values under every integer encoding that fits.

    Encodings whose width would run past byte 17 are skipped for this offset.
    """
    out: list[Candidate] = []
    for enc in encodings:
        if offset + encoding_width(enc) > PAYLOAD_CRC_LEN:
            continue
        candidates, _ = mutate_int(
            base, offset, enc, values, label=label or f"{enc}@{offset}", allow_header=allow_header
        )
        out.extend(candidates)
    return out


def bit_toggle(
    base: bytes,
    offset: int,
    *,
    bits: Iterable[int] = range(8),
    label: Optional[str] = None,
    allow_header: bool = False,
) -> list[Candidate]:
    """Toggle exactly one bit of one byte per candidate (bit-level fuzzing)."""
    base = payload_of(base)
    _check_span(offset, 1, allow_header)
    original = base[offset]
    out: list[Candidate] = []
    for bit in bits:
        if not 0 <= bit <= 7:
            raise ValueError(f"bit index out of range: {bit}")
        value = original ^ (1 << bit)
        out.append(
            Candidate(
                _with_bytes(base, offset, bytes([value])),
                label or f"byte[{offset}].bit{bit}",
                value,
                "uint8",
                notes=f"toggled bit {bit}: {original:08b} -> {value:08b}",
            )
        )
    return out


# ---------------------------------------------------------------------------
# Command schemas — logical-field mutation through the existing SDK builders
# ---------------------------------------------------------------------------


@dataclass(frozen=True)
class FieldSpec:
    """One logical builder argument that can be mutated in isolation."""

    param: str
    max_value: int
    default_values: tuple[int, ...]
    description: str = ""


@dataclass(frozen=True)
class CommandSchema:
    """A command whose logical fields are serialized by an existing SDK builder.

    The builder is treated as a black box: the analyzer, not this schema,
    decides where each field lands in the payload.
    """

    name: str
    builder: Callable[..., bytes]
    defaults: dict[str, Any]
    fields: dict[str, FieldSpec] = field(default_factory=dict)
    aliases: dict[str, str] = field(default_factory=dict)

    def base_kwargs(self, **overrides: Any) -> dict[str, Any]:
        """Defaults plus overrides keyed by builder arg or field name."""
        mapped: dict[str, Any] = {}
        for key, value in overrides.items():
            if key in self.defaults:
                mapped[key] = value
                continue
            try:
                mapped[self.resolve_field(key)[1].param] = value
            except ValueError:
                raise ValueError(
                    f"unknown {self.name} arg '{key}'; use a builder arg "
                    f"{sorted(self.defaults)} or a field {sorted(self.fields)}"
                ) from None
        return {**self.defaults, **mapped}

    def base_payload(self, **overrides: Any) -> bytes:
        return payload_of(self.builder(**self.base_kwargs(**overrides)))

    def resolve_field(self, name: str) -> tuple[str, FieldSpec]:
        """Map a user-facing name (any case, '_'/'-' ignored, aliases) to its spec."""
        key = name.lower().replace("_", "").replace("-", "")
        key = self.aliases.get(key, key)
        if key not in self.fields:
            raise ValueError(
                f"unknown {self.name} field '{name}'; choose from {sorted(self.fields)}"
            )
        return key, self.fields[key]

    def candidates(
        self,
        field_name: str,
        values: Optional[Iterable[int]] = None,
        base_overrides: Optional[dict[str, Any]] = None,
    ) -> list[Candidate]:
        """Vary one logical field; every other builder argument stays fixed."""
        canonical, spec = self.resolve_field(field_name)
        fixed = self.base_kwargs(**(base_overrides or {}))
        chosen = list(spec.default_values if values is None else values)
        out: list[Candidate] = []
        for v in chosen:
            if not 0 <= v <= spec.max_value:
                raise ValueError(
                    f"{canonical}={v} is outside 0..{spec.max_value}; the builder would "
                    f"silently truncate it"
                )
            payload = payload_of(self.builder(**{**fixed, spec.param: v}))
            out.append(Candidate(payload, canonical, v, None))
        return out


_BYTE_RANGE = tuple(range(256))
_SINGLE_BITS = (0x00, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80)


def documented_maneuver_bytes() -> tuple[int, ...]:
    """Every byte-5 value the existing code can emit, from BOTH maneuver tables.

    maneuvers.GOOGLE_MANEUVERS uses a coarse 0x00–0x60 set; nav_maneuver_to_byte
    uses a richer icon table. They disagree, which is exactly what a maneuver
    experiment should discriminate. 0xFF is that table's "unknown" sentinel.
    """
    values = {m.byte5 for m in GOOGLE_MANEUVERS}
    values |= {nav_maneuver_to_byte(i) for i in range(64)}
    values.discard(0xFF)
    return tuple(sorted(values))

NAV_SCHEMA = CommandSchema(
    name="nav",
    builder=build_nav_packet,
    defaults={
        "screen": SCREEN_TBT,
        "dist_meters": 200,
        "maneuver": MAN_FORWARD,
        "heading": 0x40,
        "speed_flags": 0x40,
        "road_type": ROAD_STREET,
        "eta_minutes": 0,
    },
    fields={
        "screen": FieldSpec(
            "screen", 0xFF, (0x01, 0x14, 0x15, 0x1C, 0x32, 0x3C, 0x3D, 0x41, 0x42),
            "Documented screen IDs only; pass explicit values for an exhaustive sweep.",
        ),
        "distance": FieldSpec(
            "dist_meters", 0xFFFF, tuple(boundary_values("uint16_be")),
            "Boundary values a 16-bit field can carry.",
        ),
        "maneuver": FieldSpec("maneuver", 0xFF, _BYTE_RANGE, "Full 0..255 icon sweep."),
        "heading": FieldSpec("heading", 0xFF, _BYTE_RANGE, "Full 0..255 sweep."),
        "speedflags": FieldSpec(
            "speed_flags", 0xFF, _SINGLE_BITS, "Single-bit values to expose flag bits."
        ),
        "roadtype": FieldSpec(
            "road_type", 0xFF, (0x00, 0x01, 0x02, 0x31, 0x41, 0x42, 0xFF),
            "Documented road types plus edge values.",
        ),
        "eta": FieldSpec("eta_minutes", 0xFF, tuple(boundary_values("uint8")), "uint8 boundaries."),
    },
    aliases={"dist": "distance", "distmeters": "distance", "etaminutes": "eta"},
)

COMPASS_SCHEMA = CommandSchema(
    name="compass",
    builder=build_compass_packet,
    defaults={"direction": DIR_N, "night_mode": False},
    fields={"direction": FieldSpec("direction", 0xFF, _BYTE_RANGE, "Full 0..255 sweep.")},
)

TIME_SCHEMA = CommandSchema(
    name="time",
    builder=build_set_time_packet,
    defaults={"hour24": 12, "minute": 0, "is_24h": True},
    fields={
        "hour": FieldSpec("hour24", 0xFF, tuple(range(24)) + (24, 0x7F, 0xFF), "0..23 plus edges."),
        "minute": FieldSpec("minute", 0xFF, tuple(range(0, 60, 5)) + (59, 60, 0xFF), "Coarse sweep."),
    },
)

SCHEMAS: dict[str, CommandSchema] = {
    s.name: s for s in (NAV_SCHEMA, COMPASS_SCHEMA, TIME_SCHEMA)
}


def get_schema(name: str) -> CommandSchema:
    try:
        return SCHEMAS[name]
    except KeyError as exc:
        raise ValueError(f"unknown command '{name}'; choose from {sorted(SCHEMAS)}") from exc
