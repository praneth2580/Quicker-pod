"""Controlled protocol fuzzing and differential reverse-engineering for the Tripper.

Requires the tripper-sdk directory on sys.path (the SDK's flat-import
convention); it reuses packets.py (CRC + builders), parser.py, and ble.py.
See docs/fuzzing.md, docs/experiments.md and docs/protocol-discovery.md.
"""

from .analyzer import (
    ByteDiff,
    FieldCandidate,
    compare,
    detect_bitfield,
    detect_enum,
    discover_field,
    find_value,
    summarize_series,
)
from .encoding import ENCODINGS, all_encodings, decode_int, encode_int, representations
from .experiment import (
    Candidate,
    DeviceState,
    EvidenceLevel,
    ExperimentConfig,
    ExperimentResult,
    SafetyLimits,
)
from .hypothesis import Hypothesis, HypothesisStatus, seed_hypotheses
from .observer import ManualObserver, Observer, resolve_state
from .mutator import (
    NAV_SCHEMA,
    SCHEMAS,
    bit_toggle,
    boundary_sweep,
    encoding_hypotheses,
    exhaustive_byte,
    finalize_frame,
    get_schema,
    mutate_byte,
    mutate_int,
    small_value_sweep,
)
from .runner import ExperimentRunner, RunReport
from .storage import ExperimentStore
from .transport import BleTransport, DryRunTransport

__all__ = [
    "BleTransport",
    "ByteDiff",
    "Candidate",
    "DeviceState",
    "DryRunTransport",
    "ENCODINGS",
    "EvidenceLevel",
    "ExperimentConfig",
    "ExperimentResult",
    "ExperimentRunner",
    "ExperimentStore",
    "FieldCandidate",
    "Hypothesis",
    "HypothesisStatus",
    "ManualObserver",
    "NAV_SCHEMA",
    "Observer",
    "RunReport",
    "SCHEMAS",
    "SafetyLimits",
    "all_encodings",
    "bit_toggle",
    "boundary_sweep",
    "compare",
    "decode_int",
    "detect_bitfield",
    "detect_enum",
    "discover_field",
    "encode_int",
    "encoding_hypotheses",
    "exhaustive_byte",
    "finalize_frame",
    "find_value",
    "get_schema",
    "mutate_byte",
    "mutate_int",
    "representations",
    "resolve_state",
    "seed_hypotheses",
    "small_value_sweep",
    "summarize_series",
]
