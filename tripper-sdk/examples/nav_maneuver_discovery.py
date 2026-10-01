#!/usr/bin/env python3
"""NAVIGATION MANEUVER DISCOVERY — the reference experiment.

Keeps every known navigation field constant and mutates ONLY the suspected
maneuver field (build_nav_packet's `maneuver` argument, byte 5 in the code).
Every packet gets a freshly computed CRC, every TX/RX is stored, and the run
ends with a summary of what the Tripper was observed to do.

    python examples/nav_maneuver_discovery.py                  # dry-run, documented values
    python examples/nav_maneuver_discovery.py --full           # dry-run, all 256 values
    python examples/nav_maneuver_discovery.py --confirm-send   # transmit; asks first, then
                                                               # prompts for each observation
"""

from __future__ import annotations

import argparse
import os
import sys
from typing import Optional, Sequence

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from packets import crc16, to_hex  # noqa: E402

from fuzzing import (  # noqa: E402
    NAV_SCHEMA,
    DeviceState,
    ExperimentConfig,
    ExperimentRunner,
    ExperimentStore,
    ManualObserver,
    SafetyLimits,
    analyzer,
    seed_hypotheses,
)
from fuzzing.mutator import documented_maneuver_bytes, finalize_frame  # noqa: E402
from fuzzing.transport import BleTransport, DryRunTransport  # noqa: E402

FIELD = "maneuver"
CODE_OFFSET = 5  # where build_nav_packet writes the maneuver (code, not hardware)
HYPOTHESIS_ID = "nav.maneuver@5:uint8-app-labels"


def build_candidates(full: bool):
    values = list(range(256)) if full else list(documented_maneuver_bytes())
    return NAV_SCHEMA.candidates(FIELD, values)


def verify_invariants(base_payload: bytes, candidates) -> None:
    """Refuse to run unless every packet differs from the base only at the
    maneuver byte and carries a valid CRC."""
    for c in candidates:
        changed = [d.offset for d in analyzer.compare(base_payload, c.payload)]
        if changed not in ([], [CODE_OFFSET]):
            raise SystemExit(f"invariant violated: maneuver={c.mutation_value} changed {changed}")
        frame = finalize_frame(c.payload)
        if crc16(frame[:18]) != (frame[18] << 8) | frame[19]:
            raise SystemExit(f"invariant violated: bad CRC for maneuver={c.mutation_value}")


def summarize(store: ExperimentStore, experiment_id: str, transmitted: bool) -> None:
    results = store.load_results(experiment_id)
    print("\n=== OBSERVED ===")
    statuses: dict[str, int] = {}
    for r in results:
        statuses[r.response_status] = statuses.get(r.response_status, 0) + 1
    print("packets: " + ", ".join(f"{k}={v}" for k, v in sorted(statuses.items())))
    if not transmitted:
        print("dry-run: nothing was transmitted, so there is no device behavior to report.")

    by_state: dict[str, list[int]] = {}
    for r in results:
        if r.device_state != DeviceState.UNKNOWN.value:
            by_state.setdefault(r.device_state, []).append(r.mutation_value)
    for state, values in sorted(by_state.items()):
        print(f"  {state:<12} {', '.join(f'0x{v:02X}' for v in values)}")
    if transmitted and not by_state:
        print("no observations recorded — add them with `tripper.py observe <result-id> --state ...`")

    hypotheses = store.load_hypotheses()
    if HYPOTHESIS_ID not in hypotheses:
        hypotheses.update({h.hypothesis_id: h for h in seed_hypotheses()})
    hyp = hypotheses[HYPOTHESIS_ID]
    print("\n=== HYPOTHESIS CHECK (evidence, not confirmation) ===")
    if transmitted:
        verdict = hyp.ingest(experiment_id, results)
        store.save_hypotheses(hypotheses)
    else:
        verdict = hyp.test(experiment_id, results)  # dry-run: report only, never record
    print(verdict.describe())
    print(hyp.describe())

    unexplained = sorted(
        {r.mutation_value for r in results
         if r.device_state not in (DeviceState.UNKNOWN.value, DeviceState.NO_CHANGE.value)
         and str(r.mutation_value) not in hyp.mapping}
    )
    if unexplained:
        print("\nINFERRED leads (values outside the app-label mapping that changed the display): "
              + ", ".join(f"0x{v:02X}" for v in unexplained))
        print("Treat these as HYPOTHESIZED until repeated in independent experiments.")


def main(argv: Optional[Sequence[str]] = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--full", action="store_true", help="all 256 values instead of documented ones")
    parser.add_argument("--confirm-send", action="store_true", help="really transmit over BLE")
    parser.add_argument("--yes", action="store_true", help="skip the typed 'send' confirmation")
    parser.add_argument("--no-observe", action="store_true", help="transmit without observation prompts")
    parser.add_argument("--address", help="BLE address (default: scan for RE_DISP)")
    parser.add_argument("--handshake", choices=("known", "pin", "none"), default="known")
    parser.add_argument("--delay", type=float, default=1.5, help="seconds between packets (>= 0.5)")
    parser.add_argument("--data-dir", help="experiment store (default: ../tripper-experiments)")
    args = parser.parse_args(argv)

    store = ExperimentStore(args.data_dir)
    base_payload = NAV_SCHEMA.base_payload()
    candidates = build_candidates(args.full)
    verify_invariants(base_payload, candidates)

    limits = SafetyLimits(max_packets=len(candidates), delay_s=args.delay)
    try:
        limits.validate()
    except ValueError as exc:
        raise SystemExit(f"invalid safety limits: {exc}")
    config = ExperimentConfig(
        experiment_id=store.new_experiment_id("nav-maneuver-discovery"),
        name="nav-maneuver-discovery",
        command="nav",
        base_packet=finalize_frame(base_payload),
        strategy="field",
        target=FIELD,
        mutation_values=[c.mutation_value for c in candidates],
        params={
            "builder_args": NAV_SCHEMA.base_kwargs(),
            "value_set": "full" if args.full else "documented",
            "code_offset": CODE_OFFSET,
        },
        limits=limits,
        dry_run=not args.confirm_send,
        notes="NAVIGATION MANEUVER DISCOVERY: only the maneuver field varies.",
    )

    fixed = ", ".join(f"{k}={v if v > 0xFF else f'0x{v:02X}'}"
                      for k, v in NAV_SCHEMA.base_kwargs().items() if k != FIELD)
    print("NAVIGATION MANEUVER DISCOVERY")
    print(f"  experiment : {config.experiment_id}")
    print(f"  base frame : {to_hex(config.base_packet)}")
    print(f"  fixed      : {fixed}")
    print(f"  varying    : {FIELD} over {len(candidates)} values "
          f"({'0x00-0xFF' if args.full else 'documented by the app'})")
    print(f"  mode       : {'TRANSMIT' if args.confirm_send else 'dry-run'}  "
          f"(delay {limits.delay_s}s, timeout {limits.timeout_s}s)")

    if args.confirm_send and not args.yes:
        if not sys.stdin.isatty():
            raise SystemExit("refusing to transmit non-interactively without --yes")
        if input("  type 'send' to transmit: ").strip().lower() != "send":
            raise SystemExit("aborted by operator")

    if args.confirm_send:
        transport = BleTransport(
            address=args.address,
            handshake=args.handshake,
            pin_prompt=(lambda: input("PIN shown on the Tripper: ").strip())
            if args.handshake == "pin" else None,
            on_event=lambda msg: print(f"[ble] {msg}"),
        )
        config.params["transport"] = {"type": "ble", "handshake": args.handshake,
                                      "address": args.address}
    else:
        transport = DryRunTransport()
    observe = (ManualObserver()
               if args.confirm_send and not args.no_observe and sys.stdin.isatty() else None)

    runner = ExperimentRunner(store, transport, on_event=lambda msg: print(f"[runner] {msg}"))
    report = runner.run(config, candidates, observe=observe)
    print(report.summary())
    summarize(store, config.experiment_id, report.transmitted)
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\ninterrupted — everything sent so far is recorded", file=sys.stderr)
        sys.exit(130)
