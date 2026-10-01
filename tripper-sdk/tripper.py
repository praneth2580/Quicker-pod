#!/usr/bin/env python3
"""Tripper protocol fuzzing / differential reverse-engineering CLI.

Dry-run is the default everywhere. Nothing is transmitted unless --confirm-send
is given, and even then the batch plan is shown and must be confirmed.

  generate   build one packet from a command's fields (prints hex + CRC)
  fuzz       generate a controlled one-field/one-byte mutation batch and run it
  send       send one explicit packet (CRC always recomputed)
  capture    passively record notifications for N seconds
  observe    record what the Tripper displayed for a result
  compare    diff two packets
  analyze    report observations and inferred field locations for an experiment
  replay     re-run an experiment from its stored packets
  hypotheses list / seed / show / ingest field-mapping hypotheses
  experiments list / show / create (curated templates)

Examples:
  python tripper.py fuzz field --field maneuver
  python tripper.py fuzz byte --offset 5 --sweep16
  python tripper.py fuzz int --offset 3 --encoding uint16_be --boundary
  python tripper.py analyze <experiment-id>
  python tripper.py fuzz field --field maneuver --confirm-send --observe
"""

from __future__ import annotations

import argparse
import os
import sys
import time
from typing import Optional, Sequence

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from packets import to_hex  # noqa: E402
from parser import parse_response  # noqa: E402

from fuzzing import analyzer, mutator  # noqa: E402
from fuzzing.encoding import ENCODINGS  # noqa: E402
from fuzzing.experiment import (  # noqa: E402
    Candidate,
    DeviceState,
    ExperimentConfig,
    SafetyLimits,
    command_of,
    utc_now,
)
from fuzzing.hypothesis import seed_hypotheses  # noqa: E402
from fuzzing.mutator import documented_maneuver_bytes, get_schema, payload_of  # noqa: E402
from fuzzing.observer import ManualObserver, resolve_state  # noqa: E402
from fuzzing.runner import ExperimentRunner  # noqa: E402
from fuzzing.storage import ExperimentStore  # noqa: E402
from fuzzing.transport import BleTransport, DryRunTransport  # noqa: E402

TEMPLATES: dict[str, dict] = {
    "nav-maneuver": {
        "command": "nav", "field": "maneuver", "values": list(documented_maneuver_bytes()),
        "desc": "Every byte-5 value the app can emit; all other nav fields fixed.",
    },
    "nav-distance": {
        "command": "nav", "field": "distance", "values": [50, 100, 200, 500, 999, 1000, 1500],
        "desc": "Vary only distance; analyze locates its offset and encoding.",
    },
    "nav-heading": {
        "command": "nav", "field": "heading",
        "values": [0x00, 0x01, 0x10, 0x20, 0x40, 0x50, 0x60, 0x80, 0xC0, 0xFF],
        "desc": "Vary only byte 6 (heading / intensity / roundabout-exit candidates).",
    },
    "nav-screen": {
        "command": "nav", "field": "screen",
        "values": [0x01, 0x14, 0x15, 0x1C, 0x32, 0x3C, 0x3D, 0x41, 0x42],
        "desc": "Step through documented screen IDs.",
    },
    "compass-direction": {
        "command": "compass", "field": "direction",
        "values": [0x10, 0x20, 0x30, 0x40, 0x50, 0x60, 0x70, 0x80],
        "desc": "Step through the DIR_* constants on the compass screen.",
    },
}

RAW_STRATEGY_NOTE = (
    "placement was chosen by the experiment, so field location is not inferred; "
    "the evidence is in device observations"
)


class CliError(Exception):
    """A user-facing error: printed without a traceback."""


# ---------------------------------------------------------------------------
# argument helpers
# ---------------------------------------------------------------------------

def _parse_ints(text: str) -> list[int]:
    try:
        return [int(token, 0) for token in text.replace(",", " ").split()]
    except ValueError as exc:
        raise CliError(f"bad integer list {text!r}: {exc}") from None


def _int_any_base(text: str) -> int:
    try:
        return int(text, 0)
    except ValueError:
        raise argparse.ArgumentTypeError(f"not an integer: {text!r}") from None


def _parse_hex(text: str) -> bytes:
    try:
        return bytes.fromhex(text.replace(" ", "").replace(":", ""))
    except ValueError as exc:
        raise CliError(f"bad hex packet: {exc}") from None


def _parse_overrides(pairs: Optional[Sequence[str]]) -> dict[str, int]:
    overrides: dict[str, int] = {}
    for pair in pairs or []:
        key, sep, value = pair.partition("=")
        if not sep:
            raise CliError(f"--set expects key=value, got {pair!r}")
        try:
            overrides[key.strip()] = int(value.strip(), 0)
        except ValueError:
            raise CliError(f"--set {key}: {value!r} is not an integer") from None
    return overrides


def _limits(args: argparse.Namespace) -> SafetyLimits:
    limits = SafetyLimits(
        max_packets=args.max_packets,
        delay_s=args.delay,
        timeout_s=args.timeout,
        cooldown_s=args.cooldown,
        abort_on_error=not args.no_abort_on_error,
    )
    try:
        limits.validate()
    except ValueError as exc:
        raise CliError(f"invalid safety limits: {exc}") from None
    return limits


def _emit(args: argparse.Namespace):
    def emit(msg: str) -> None:
        if not args.quiet:
            print(f"[runner] {msg}")
    return emit


def _pin_prompt() -> str:
    return input("Enter the 6-digit PIN shown on the Tripper: ").strip()


def _ble_transport(args: argparse.Namespace) -> BleTransport:
    return BleTransport(
        address=args.address,
        handshake=args.handshake,
        pin_prompt=_pin_prompt if args.handshake == "pin" else None,
        on_event=_emit(args),
    )


def _make_runner(args: argparse.Namespace, store: ExperimentStore) -> ExperimentRunner:
    transport = _ble_transport(args) if args.confirm_send else DryRunTransport()
    return ExperimentRunner(store, transport, on_event=_emit(args))


def _interactive_observer(args: argparse.Namespace) -> Optional[ManualObserver]:
    """Ask a human what the Tripper displayed (no computer vision yet)."""
    if not args.confirm_send or not args.observe or not sys.stdin.isatty():
        return None
    return ManualObserver()


def _confirm_transmission(args: argparse.Namespace, config: ExperimentConfig, count: int) -> None:
    print("\n  !!! PHYSICAL TRANSMISSION !!!")
    print(f"  experiment : {config.experiment_id}")
    print(f"  command    : {config.command}   target: {config.target}   strategy: {config.strategy}")
    print(f"  base packet: {to_hex(config.base_packet)}")
    print(f"  packets    : {count}  (delay {config.limits.delay_s}s, timeout "
          f"{config.limits.timeout_s}s, cooldown {config.limits.cooldown_s}s, "
          f"abort_on_error={config.limits.abort_on_error})")
    print(f"  handshake  : {args.handshake}   address: {args.address or 'scan for RE_DISP'}")
    print("  Ctrl-C stops immediately; everything sent so far stays recorded.")
    if args.yes:
        return
    if not sys.stdin.isatty():
        raise CliError("refusing to transmit non-interactively without --yes")
    if input("  type 'send' to transmit: ").strip().lower() != "send":
        raise CliError("aborted by operator")


def _run_and_report(args, store, config: ExperimentConfig, candidates: list[Candidate]) -> int:
    if not candidates:
        raise CliError("no candidates generated — check the value selection")
    if config.dry_run:
        print(f"[dry-run] {config.experiment_id}: {len(candidates)} candidate(s) generated, "
              f"none transmitted. Add --confirm-send to transmit.")
    else:
        config.params["transport"] = {
            "type": "ble", "handshake": args.handshake, "address": args.address,
        }
        _confirm_transmission(args, config, min(len(candidates), config.limits.max_packets))

    report = _make_runner(args, store).run(config, candidates, observe=_interactive_observer(args))

    shown = report.results[: args.show]
    for r in shown:
        rx = f" rx={r.response_label}" if r.response_label else ""
        latency = f" {r.latency_ms}ms" if r.latency_ms is not None else ""
        print(f"  #{r.sequence:04d} {r.mutated_field}={r.mutation_value!s:<6} "
              f"{to_hex(r.generated_packet)}  [{r.response_status}{rx}{latency}]")
    if len(report.results) > len(shown):
        print(f"  … {len(report.results) - len(shown)} more — "
              f"`experiments show {config.experiment_id}`")
    print(report.summary())
    return 0


def _base_payload(args) -> bytes:
    if args.base_hex:
        return payload_of(_parse_hex(args.base_hex))
    return get_schema("nav").base_payload()


def _raw_config(args, store, strategy: str, target: str, base: bytes, values,
                encoding: Optional[str] = None) -> ExperimentConfig:
    return ExperimentConfig(
        experiment_id=store.new_experiment_id(target),
        name=target,
        command=command_of(base),
        base_packet=mutator.finalize_frame(base),
        strategy=strategy,
        target=target,
        mutation_values=list(values),
        encoding=encoding,
        limits=_limits(args),
        dry_run=not args.confirm_send,
        notes=f"{strategy} on {target}; every other byte fixed",
    )


def _field_config(args, store, command: str, field_name: str, values, overrides,
                  notes: str) -> ExperimentConfig:
    schema = get_schema(command)
    return ExperimentConfig(
        experiment_id=store.new_experiment_id(f"{command}-{field_name}"),
        name=f"{command}-{field_name}",
        command=command,
        base_packet=mutator.finalize_frame(schema.base_payload(**overrides)),
        strategy="field",
        target=field_name,
        mutation_values=list(values),
        params={"overrides": overrides, "builder_args": schema.base_kwargs(**overrides)},
        limits=_limits(args),
        dry_run=not args.confirm_send,
        notes=notes,
    )


# ---------------------------------------------------------------------------
# commands
# ---------------------------------------------------------------------------

def cmd_generate(args, store) -> int:
    schema = get_schema(args.command)
    overrides = _parse_overrides(args.set)
    kwargs = schema.base_kwargs(**overrides)
    frame = mutator.finalize_frame(schema.base_payload(**overrides))

    def fmt(v) -> str:
        if isinstance(v, bool) or not isinstance(v, int) or v > 0xFF:
            return str(v)
        return f"0x{v:02X}"

    call = ", ".join(f"{k}={fmt(v)}" for k, v in kwargs.items())
    print(f"{schema.builder.__name__}({call})")
    print(to_hex(frame))
    print(f"CRC 0x{mutator.frame_crc(frame):04X} (CRC-16/CCITT-FALSE over bytes 0-17, big-endian)")
    return 0


def cmd_fuzz_field(args, store) -> int:
    schema = get_schema(args.command)
    canonical, _ = schema.resolve_field(args.field)
    overrides = _parse_overrides(args.set)
    values = _parse_ints(args.values) if args.values else None
    candidates = schema.candidates(canonical, values, overrides)
    config = _field_config(
        args, store, args.command, canonical, [c.mutation_value for c in candidates], overrides,
        f"Vary only {canonical}; every other {args.command} builder argument fixed.",
    )
    return _run_and_report(args, store, config, candidates)


def cmd_fuzz_byte(args, store) -> int:
    base = _base_payload(args)
    if args.sweep16:
        values, strategy = list(range(16)), "byte-sweep16"
    elif args.range:
        lo, hi = args.range
        values, strategy = list(range(lo, hi + 1)), f"byte-range-{lo}-{hi}"
    elif args.values:
        values, strategy = _parse_ints(args.values), "byte-values"
    else:
        values, strategy = list(range(256)), "byte-exhaustive"
    candidates = mutator.mutate_byte(base, args.offset, values, allow_header=args.allow_header)
    config = _raw_config(args, store, strategy, f"byte{args.offset}", base, values, "uint8")
    return _run_and_report(args, store, config, candidates)


def cmd_fuzz_bit(args, store) -> int:
    base = _base_payload(args)
    candidates = mutator.bit_toggle(base, args.offset, allow_header=args.allow_header)
    config = _raw_config(args, store, "bit-toggle", f"byte{args.offset}-bits", base,
                         [c.mutation_value for c in candidates], "uint8")
    return _run_and_report(args, store, config, candidates)


def cmd_fuzz_int(args, store) -> int:
    base = _base_payload(args)
    encodings = [e.strip() for e in args.encoding.split(",")] if args.encoding else list(ENCODINGS)
    unknown = [e for e in encodings if e not in ENCODINGS]
    if unknown:
        raise CliError(f"unknown encoding(s) {unknown}; choose from {list(ENCODINGS)}")
    candidates: list[Candidate] = []
    for enc in encodings:
        if args.boundary:
            candidates += mutator.boundary_sweep(base, args.offset, enc, allow_header=args.allow_header)
        else:
            batch, skipped = mutator.mutate_int(base, args.offset, enc, _parse_ints(args.values),
                                                allow_header=args.allow_header)
            if skipped:
                print(f"  {enc}: skipped unrepresentable values {skipped}")
            candidates += batch
    strategy = "boundary" if args.boundary else "encoding-hypotheses"
    config = _raw_config(args, store, strategy, f"int{args.offset}", base,
                         [c.mutation_value for c in candidates],
                         encodings[0] if len(encodings) == 1 else None)
    config.params["encodings"] = encodings
    return _run_and_report(args, store, config, candidates)


def cmd_send(args, store) -> int:
    raw = _parse_hex(args.packet)
    payload = payload_of(raw)
    frame = mutator.finalize_frame(payload)
    if len(raw) == 20 and raw != frame:
        print(f"  note: supplied CRC {raw[18]:02X} {raw[19]:02X} was wrong; "
              f"recomputed {frame[18]:02X} {frame[19]:02X}")
    command = command_of(payload)
    if command == "raw" and not args.allow_unknown:
        raise CliError(f"command byte 0x{payload[0]:02X} is not a known command; pass "
                       f"--allow-unknown to send it anyway (the characteristic also carries OTA)")
    config = ExperimentConfig(
        experiment_id=store.new_experiment_id(f"send-{command}"),
        name=f"send-{command}",
        command=command,
        base_packet=frame,
        strategy="manual",
        target="packet",
        mutation_values=[],
        limits=_limits(args),
        dry_run=not args.confirm_send,
        notes=args.note or "single manual packet",
    )
    return _run_and_report(args, store, config, [Candidate(payload, "packet", None)])


def cmd_capture(args, store) -> int:
    if args.handshake != "none" and not args.confirm_send:
        raise CliError("the handshake transmits packets: pass --confirm-send, or "
                       "--handshake none for a purely passive capture")
    transport = _ble_transport(args)
    capture_id = store.new_capture_id()
    count = 0
    transport.connect()
    started = time.monotonic()
    try:
        while (remaining := args.seconds - (time.monotonic() - started)) > 0:
            rx = transport.wait_response(remaining)
            if rx is None:
                break
            resp = parse_response(rx)
            record = {
                "capture_id": capture_id, "timestamp": utc_now(),
                "elapsed_ms": round((time.monotonic() - started) * 1000, 1),
                "rx": to_hex(rx), "label": resp.label, "description": resp.description,
            }
            path = store.append_capture(capture_id, record)
            count += 1
            print(f"  +{record['elapsed_ms']:>8}ms  {record['rx']}  {resp.label}")
    except KeyboardInterrupt:
        print("  interrupted")
    finally:
        transport.disconnect()
    print(f"{capture_id}: {count} notification(s)"
          + (f" -> {path}" if count else " (nothing received)"))
    return 0


def cmd_observe(args, store) -> int:
    state = None
    if args.state is not None:
        state = resolve_state(args.state)
        if state is None:
            raise CliError(f"ambiguous or unknown state {args.state!r}; choose from "
                           f"{[s.value for s in DeviceState]}")
    existing = store.find_result(args.result_id)
    if not existing.delivered:
        raise CliError(f"{args.result_id} was never delivered ({existing.response_status}); "
                       f"the device could not have reacted to it")
    result = store.record_observation(
        args.result_id, device_state=state, observation=args.note, observed_value=args.value,
    )
    print(f"{result.result_id}: device_state={result.device_state} "
          f"observed_value={result.observed_value} note={result.device_observation!r}")
    print("(appended as a new version; earlier versions stay in results.jsonl)")
    return 0


def cmd_compare(args, store) -> int:
    diffs = analyzer.compare(_parse_hex(args.packet_a), _parse_hex(args.packet_b))
    if not diffs:
        print("no payload differences (CRC bytes are excluded)")
        return 0
    print(f"{len(diffs)} changed offset(s):")
    for d in diffs:
        print(f"  {d}")
    return 0


def cmd_analyze(args, store) -> int:
    config = store.load_config(args.experiment_id)
    results = store.load_results(args.experiment_id)
    if not results:
        raise CliError(f"{args.experiment_id} has no results")
    strategy = config.params.get("original_strategy", config.strategy)

    print(f"=== OBSERVED: packets ({len(results)}, {config.strategy}, "
          f"{'dry-run' if config.dry_run else 'transmitted'}) ===")
    packets = [r.generated_packet for r in results]
    print(analyzer.summarize_series(packets).describe())
    bitfields = analyzer.detect_bitfield(packets)
    if bitfields:
        print(f"one-bit steps between consecutive packets at offsets {bitfields}")

    statuses: dict[str, int] = {}
    labels: dict[str, int] = {}
    for r in results:
        statuses[r.response_status] = statuses.get(r.response_status, 0) + 1
        if r.response_label:
            labels[r.response_label] = labels.get(r.response_label, 0) + 1
    extra_rx = sum(len(r.uncorrelated_rx) for r in results)
    print("\n=== OBSERVED: responses ===")
    print("statuses: " + ", ".join(f"{k}={v}" for k, v in sorted(statuses.items())))
    if labels:
        print("labels:   " + ", ".join(f"{k}={v}" for k, v in sorted(labels.items())))
    if extra_rx:
        print(f"uncorrelated notifications: {extra_rx}")
    if statuses.get("TIMEOUT"):
        print("(TIMEOUT = no client-visible notification; it does NOT mean the packet was rejected)")

    looked = [r for r in results if r.device_state != DeviceState.UNKNOWN.value]
    if looked:
        print("\n=== OBSERVED: device behavior ===")
        enum = analyzer.detect_enum(
            [(int(r.mutation_value), r.device_state) for r in looked
             if isinstance(r.mutation_value, int)], config.target)
        print(enum.describe())
    numeric = [r for r in results if r.observed_value is not None and isinstance(r.mutation_value, int)]
    if numeric:
        print("\n=== OBSERVED: displayed numbers vs. sent value ===")
        by_encoding: dict[str, list[bool]] = {}
        for r in numeric:
            by_encoding.setdefault(r.encoding or config.target, []).append(
                r.observed_value == r.mutation_value)
        for key, matches in sorted(by_encoding.items()):
            print(f"  {key}: {sum(matches)}/{len(matches)} displayed value(s) equal the sent value")

    print("\n=== INFERRED: field location (correlation only — NOT confirmed) ===")
    samples = [(r.mutation_value, r.generated_packet) for r in results
               if isinstance(r.mutation_value, int)]
    if strategy != "field":
        print(RAW_STRATEGY_NOTE)
    elif len({v for v, _ in samples}) < 2:
        print("need at least 2 distinct values to correlate")
    else:
        found = analyzer.discover_field(samples)
        if not found:
            print("no offset/encoding tracks the value across every packet")
        for fc in found:
            print(f"- {fc.inference()}")
        if len(found) > 1:
            print("Several placements fit the builder output equally well; only device "
                  "behavior (raw-byte experiments + observations) can tell which one the "
                  "firmware reads.")
    print("\nNext: record what the device showed (`observe`), then "
          f"`hypotheses ingest <hypothesis-id> {args.experiment_id}`.")
    return 0


def cmd_replay(args, store) -> int:
    if args.confirm_send:
        original = store.load_config(args.experiment_id)
        _confirm_transmission(args, original, len(store.load_results(args.experiment_id)))
    report = _make_runner(args, store).replay(
        args.experiment_id, dry_run=not args.confirm_send, observe=_interactive_observer(args))
    print(report.summary())
    return 0


def cmd_hypotheses(args, store) -> int:
    hyps = store.load_hypotheses()
    if args.hyp_command == "seed":
        added = 0
        for h in seed_hypotheses():
            if h.hypothesis_id not in hyps:
                hyps[h.hypothesis_id] = h
                added += 1
        store.save_hypotheses(hyps)
        print(f"added {added} seed hypotheses ({len(hyps)} total, all start UNKNOWN) "
              f"-> {store.hypotheses_path}")
        return 0
    if not hyps:
        print("no hypotheses yet — `hypotheses seed` loads the claims implied by the code")
        return 0
    if args.hyp_command == "list":
        for h in sorted(hyps.values(), key=lambda h: h.hypothesis_id):
            print(h.describe())
            print()
        return 0

    h = hyps.get(args.hypothesis_id)
    if h is None:
        raise CliError(f"unknown hypothesis {args.hypothesis_id!r}; see `hypotheses list`")
    if args.hyp_command == "show":
        print(h.describe())
        for line in h.history:
            print(f"  history: {line}")
        return 0
    if args.hyp_command == "ingest":
        results = store.load_results(args.experiment_id)
        if not results:
            raise CliError(f"{args.experiment_id} has no results")
        verdict = h.ingest(args.experiment_id, results)
        store.save_hypotheses(hyps)
        print(verdict.describe())
        print(h.describe())
        return 0
    raise CliError(f"unknown hypotheses command {args.hyp_command!r}")


def cmd_experiments(args, store) -> int:
    if args.exp_command == "list":
        configs = store.list_experiments()
        if not configs:
            print(f"no experiments in {store.root}")
        for c in configs:
            n = len(store.load_results(c.experiment_id))
            replay = f"  replay of {c.replay_of}" if c.replay_of else ""
            mode = "dry-run" if c.dry_run else "transmitted"
            print(f"{c.experiment_id}  [{c.command}/{c.target} {c.strategy}]  {n} results  {mode}{replay}")
        return 0
    if args.exp_command == "show":
        config = store.load_config(args.experiment_id)
        print(f"{config.experiment_id}: {config.notes or config.strategy}")
        print(f"base {to_hex(config.base_packet)}  limits {config.limits}")
        for r in store.load_results(args.experiment_id):
            rx = f" rx={r.response_label}" if r.response_label else ""
            seen = f"  saw {r.device_state}" if r.device_state != DeviceState.UNKNOWN.value else ""
            if r.observed_value is not None:
                seen += f" ({r.observed_value})"
            print(f"  #{r.sequence:04d} {r.mutated_field}={r.mutation_value!s:<6} "
                  f"{to_hex(r.generated_packet)}  [{r.response_status}{rx}]{seen}")
        return 0
    if args.exp_command == "create":
        template = TEMPLATES[args.template]
        overrides = _parse_overrides(args.set)
        schema = get_schema(template["command"])
        candidates = schema.candidates(template["field"], template["values"], overrides)
        config = _field_config(args, store, template["command"], template["field"],
                               template["values"], overrides, template["desc"])
        config.params["template"] = args.template
        return _run_and_report(args, store, config, candidates)
    raise CliError(f"unknown experiments command {args.exp_command!r}")


# ---------------------------------------------------------------------------
# parser
# ---------------------------------------------------------------------------

def _store_options() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(add_help=False)
    p.add_argument("--data-dir", help="experiment store (default: $TRIPPER_DATA_DIR or ../tripper-experiments)")
    p.add_argument("--quiet", action="store_true", help="hide runner progress messages")
    return p


def _run_options() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(add_help=False)
    g = p.add_argument_group("transmission (dry-run unless --confirm-send)")
    g.add_argument("--confirm-send", action="store_true", help="really transmit over BLE")
    g.add_argument("--yes", action="store_true", help="skip the typed 'send' confirmation")
    g.add_argument("--observe", action="store_true", help="prompt for what the Tripper showed after each packet")
    g.add_argument("--address", help="BLE address (default: scan for RE_DISP)")
    g.add_argument("--handshake", choices=("known", "pin", "none"), default="known",
                   help="session setup before sending (default: known)")
    s = p.add_argument_group("safety limits")
    s.add_argument("--delay", type=float, default=1.0, help="seconds between packets (>= 0.5)")
    s.add_argument("--max-packets", type=int, default=256, help="hard cap per experiment (<= 1024)")
    s.add_argument("--timeout", type=float, default=1.5, help="seconds to wait for a notification")
    s.add_argument("--cooldown", type=float, default=2.0, help="seconds to rest after a batch")
    s.add_argument("--no-abort-on-error", action="store_true", help="continue after a transport error")
    p.add_argument("--show", type=int, default=16, help="result rows to print (default 16)")
    return p


def build_parser() -> argparse.ArgumentParser:
    store_opts, run_opts = _store_options(), _run_options()
    both = [store_opts, run_opts]
    parser = argparse.ArgumentParser(prog="tripper", description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="group", required=True)

    gen = sub.add_parser("generate", help="build one packet from command fields")
    gen.add_argument("command", choices=sorted(mutator.SCHEMAS))
    gen.add_argument("--set", action="append", metavar="FIELD=VALUE", help="override a field (repeatable)")

    fuzz = sub.add_parser("fuzz", help="controlled one-field / one-byte mutation")
    fuzz_sub = fuzz.add_subparsers(dest="fuzz_command", required=True)

    ffield = fuzz_sub.add_parser("field", parents=both, help="vary ONE logical field via the SDK builder")
    ffield.add_argument("--command", default="nav", choices=sorted(mutator.SCHEMAS))
    ffield.add_argument("--field", required=True, help="e.g. maneuver, heading, distance, screen")
    ffield.add_argument("--values", help="override the field's default value set, e.g. 0,0x10,0x20")
    ffield.add_argument("--set", action="append", metavar="FIELD=VALUE", help="fix another field (repeatable)")

    raw_help = "base packet hex (18 or 20 bytes; default: SDK nav base)"
    fbyte = fuzz_sub.add_parser("byte", parents=both, help="set ONE payload byte to each value")
    fbyte.add_argument("--offset", type=int, required=True)
    mode = fbyte.add_mutually_exclusive_group()
    mode.add_argument("--sweep16", action="store_true", help="values 0..15 (enum sweep)")
    mode.add_argument("--range", type=int, nargs=2, metavar=("LO", "HI"))
    mode.add_argument("--values", help="explicit values, e.g. 0,1,2,0x10")
    fbyte.add_argument("--base-hex", help=raw_help)
    fbyte.add_argument("--allow-header", action="store_true", help="permit bytes 0-1 (command header)")

    fbit = fuzz_sub.add_parser("bit", parents=both, help="toggle each bit of ONE byte, one at a time")
    fbit.add_argument("--offset", type=int, required=True)
    fbit.add_argument("--base-hex", help=raw_help)
    fbit.add_argument("--allow-header", action="store_true")

    fint = fuzz_sub.add_parser("int", parents=both, help="write integers under candidate encodings")
    fint.add_argument("--offset", type=int, required=True)
    vals = fint.add_mutually_exclusive_group(required=True)
    vals.add_argument("--values", help="e.g. 100,200,500,1000")
    vals.add_argument("--boundary", action="store_true", help="boundary values each encoding can hold")
    fint.add_argument("--encoding", help=f"comma list (default all): {','.join(ENCODINGS)}")
    fint.add_argument("--base-hex", help=raw_help)
    fint.add_argument("--allow-header", action="store_true")

    send = sub.add_parser("send", parents=both, help="send one explicit packet")
    send.add_argument("packet", help="18-byte payload or 20-byte frame (hex); CRC is recomputed")
    send.add_argument("--note", help="free-text note stored with the experiment")
    send.add_argument("--allow-unknown", action="store_true", help="permit an unknown command byte")

    cap = sub.add_parser("capture", parents=both, help="record notifications for N seconds")
    cap.add_argument("--seconds", type=float, default=10.0)

    obs = sub.add_parser("observe", parents=[store_opts], help="record what the device showed")
    obs.add_argument("result_id", help="<experiment-id>-NNNN")
    obs.add_argument("--state", help="DeviceState, e.g. LEFT, RIGHT, NO_CHANGE, COMPASS_N")
    obs.add_argument("--note", help="free-text observation")
    obs.add_argument("--value", type=_int_any_base, help="number shown on the display")

    cmp_ = sub.add_parser("compare", help="diff two packets (hex)")
    cmp_.add_argument("packet_a")
    cmp_.add_argument("packet_b")

    ana = sub.add_parser("analyze", parents=[store_opts], help="observations + inferred field locations")
    ana.add_argument("experiment_id")

    rep = sub.add_parser("replay", parents=both, help="re-run an experiment from its stored packets")
    rep.add_argument("experiment_id")

    hyp = sub.add_parser("hypotheses", help="field-mapping hypotheses")
    hyp_sub = hyp.add_subparsers(dest="hyp_command", required=True)
    hyp_sub.add_parser("list", parents=[store_opts])
    hyp_sub.add_parser("seed", parents=[store_opts], help="load code-derived claims (all UNKNOWN)")
    hshow = hyp_sub.add_parser("show", parents=[store_opts])
    hshow.add_argument("hypothesis_id")
    hing = hyp_sub.add_parser("ingest", parents=[store_opts], help="test a hypothesis against an experiment")
    hing.add_argument("hypothesis_id")
    hing.add_argument("experiment_id")

    exp = sub.add_parser("experiments", help="list / show / create experiments")
    exp_sub = exp.add_subparsers(dest="exp_command", required=True)
    exp_sub.add_parser("list", parents=[store_opts])
    eshow = exp_sub.add_parser("show", parents=[store_opts])
    eshow.add_argument("experiment_id")
    create = exp_sub.add_parser("create", parents=both, help="run a curated template")
    create.add_argument("template", choices=sorted(TEMPLATES))
    create.add_argument("--set", action="append", metavar="FIELD=VALUE", help="fix another field (repeatable)")

    return parser


COMMANDS = {
    "generate": cmd_generate,
    "send": cmd_send,
    "capture": cmd_capture,
    "observe": cmd_observe,
    "compare": cmd_compare,
    "analyze": cmd_analyze,
    "replay": cmd_replay,
    "hypotheses": cmd_hypotheses,
    "experiments": cmd_experiments,
}
FUZZ_COMMANDS = {"field": cmd_fuzz_field, "byte": cmd_fuzz_byte, "bit": cmd_fuzz_bit, "int": cmd_fuzz_int}


def main(argv: Optional[Sequence[str]] = None) -> int:
    args = build_parser().parse_args(argv)
    store = ExperimentStore(getattr(args, "data_dir", None))
    handler = FUZZ_COMMANDS[args.fuzz_command] if args.group == "fuzz" else COMMANDS[args.group]
    try:
        return handler(args, store)
    except (CliError, ValueError, FileNotFoundError, FileExistsError, RuntimeError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\ninterrupted", file=sys.stderr)
        sys.exit(130)
