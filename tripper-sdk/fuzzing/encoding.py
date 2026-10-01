"""Integer encoding hypotheses and value representations for field discovery.

Pure functions, no BLE or SDK dependency — the easiest layer to unit-test.
Never assumes any one encoding is correct; callers enumerate all of them.
"""

from __future__ import annotations

from typing import Iterator

# Candidate integer encodings tested during discovery (Mode D).
# Order matters only for stable, human-readable output.
ENCODINGS: tuple[str, ...] = (
    "uint8",
    "uint16_le",
    "uint16_be",
    "uint24_le",
    "uint24_be",
    "uint32_le",
    "uint32_be",
)

_WIDTHS: dict[str, int] = {
    "uint8": 1,
    "uint16_le": 2,
    "uint16_be": 2,
    "uint24_le": 3,
    "uint24_be": 3,
    "uint32_le": 4,
    "uint32_be": 4,
}

# Boundary values worth probing on a numeric field (Mode C). Filtered per
# encoding so we never emit a value the candidate width cannot represent.
BOUNDARY_VALUES: tuple[int, ...] = (
    0, 1, 2, 10, 50, 99, 100, 127, 128, 255, 256, 257, 500, 1000, 65535,
)

# Small enum-like sweep (Mode B).
SMALL_VALUES: tuple[int, ...] = tuple(range(16))


def encoding_width(encoding: str) -> int:
    """Return the byte width of a named encoding."""
    try:
        return _WIDTHS[encoding]
    except KeyError as exc:
        raise ValueError(f"unknown encoding: {encoding}") from exc


def max_value(encoding: str) -> int:
    """Largest integer representable by the encoding."""
    return (1 << (8 * encoding_width(encoding))) - 1


def can_represent(value: int, encoding: str) -> bool:
    """True if value fits in the encoding (unsigned)."""
    return 0 <= value <= max_value(encoding)


def encode_int(value: int, encoding: str) -> bytes:
    """Encode an unsigned integer using one named encoding.

    Raises ValueError if the value does not fit — callers filter first with
    can_represent() so an out-of-range value is a programming error here.
    """
    width = encoding_width(encoding)
    if not can_represent(value, encoding):
        raise ValueError(f"{value} does not fit in {encoding}")
    little = encoding.endswith("_le") or encoding == "uint8"
    return value.to_bytes(width, "little" if little else "big")


def decode_int(data: bytes, encoding: str) -> int:
    """Decode bytes back to an unsigned integer for the named encoding."""
    width = encoding_width(encoding)
    if len(data) != width:
        raise ValueError(f"{encoding} needs {width} bytes, got {len(data)}")
    little = encoding.endswith("_le") or encoding == "uint8"
    return int.from_bytes(data, "little" if little else "big")


def all_encodings(value: int) -> "dict[str, bytes]":
    """Every representable encoding of value (Mode D candidates)."""
    out: dict[str, bytes] = {}
    for enc in ENCODINGS:
        if can_represent(value, enc):
            out[enc] = encode_int(value, enc)
    return out


def representations(value: int) -> "dict[str, bytes]":
    """Minimal-width byte patterns to search for a known value in a payload.

    Mirrors the discovery recipe in protocol-discovery.md, e.g. for 100 (0x64):

        uint8      -> 64
        uint16_be  -> 00 64
        uint16_le  -> 64 00
        uint24_be  -> 00 00 64
        uint24_le  -> 64 00 00
        uint32_be  -> 00 00 00 64
        uint32_le  -> 64 00 00 00
    """
    return all_encodings(value)


def boundary_values(encoding: str) -> Iterator[int]:
    """Boundary probe values representable by the encoding (Mode C)."""
    for v in BOUNDARY_VALUES:
        if can_represent(v, encoding):
            yield v
