# Experiments: records, storage, replay

An experiment is one controlled batch: a base packet, one mutation target, and
the list of values tried. Every generated packet is recorded whether or not it
was transmitted.

## Storage layout

Default root is `<repo>/tripper-experiments/` (git-ignored); override with
`--data-dir` or `TRIPPER_DATA_DIR`.

```
tripper-experiments/
  experiments/<experiment-id>/config.json     written once, never modified
  experiments/<experiment-id>/results.jsonl   append-only, one JSON object per line
  captures/<capture-id>.jsonl                 passive notification captures
  hypotheses.json                             all hypotheses, rewritten atomically
```

Experiment ids are `<name>-<UTC timestamp>` (for example
`nav-maneuver-20261001-124453`); result ids append the sequence number
(`nav-maneuver-20261001-124453-0007`).

## config.json

| Field | Meaning |
|-------|---------|
| `experiment_id`, `name`, `created_at` | Identity |
| `command` | Command family (`nav`, `compass`, `time`, …) |
| `base_packet` | Full 20-byte base frame (hex) every candidate is derived from |
| `strategy` | `field`, `byte-exhaustive`, `byte-sweep16`, `bit-toggle`, `boundary`, `encoding-hypotheses`, `manual`, `replay` |
| `target` | Field or byte under test |
| `mutation_values` | Values in send order |
| `encoding` | Encoding when a single one was used |
| `params` | Builder arguments, overrides, template, transport/handshake for live runs |
| `limits` | `max_packets`, `delay_s`, `timeout_s`, `cooldown_s`, `abort_on_error` |
| `dry_run` | `true` unless packets were really transmitted |
| `replay_of` | Source experiment for replays |
| `notes` | Free text |

## results.jsonl

One line per packet:

| Field | Meaning |
|-------|---------|
| `result_id`, `experiment_id`, `sequence` | Identity |
| `command`, `base_packet`, `mutated_field`, `mutation_value`, `encoding` | What was generated |
| `generated_packet`, `crc` | Exact 20-byte frame and its recomputed CRC |
| `timestamp` | UTC, milliseconds |
| `response_status` | `DRY_RUN`, `OK`, `TIMEOUT`, `ERROR`, `ABORTED` |
| `response_packet`, `response_label`, `latency_ms` | First notification after the write, its parsed label, and time from write completion |
| `uncorrelated_rx` | Notifications outside this packet's window (late replies, unsolicited traffic, handshake responses) |
| `device_state` | `UNKNOWN`, `NO_CHANGE`, `LEFT`, `RIGHT`, `STRAIGHT`, `U_TURN`, `ROUNDABOUT`, `COMPASS_N` … `COMPASS_NW`, `OTHER` |
| `device_observation`, `observed_value` | Free-text observation and any number read off the display |
| `notes` | Generator notes, transport errors, interruptions |

Status meanings:

- `OK` — a notification arrived within `timeout_s`.
- `TIMEOUT` — the write completed but no notification arrived. **Not** evidence
  that the packet was rejected.
- `ERROR` — the transport failed; the packet may not have been sent.
- `ABORTED` — interrupted during transmission; delivery unknown.
- `DRY_RUN` — generated only.

Only `OK` and `TIMEOUT` results count as delivered. Observations can only be
attached to delivered packets, and only delivered packets count as evidence.

## Corrections never overwrite

`observe` appends a newer version of the same result line. Loaders use the
latest version per sequence; the full history stays on disk
(`ExperimentStore.load_results(id, history=True)`).

```bash
python tripper.py observe nav-maneuver-20261001-124453-0003 --state LEFT --note "sharp left arrow"
```

## Replay

```bash
python tripper.py replay nav-maneuver-20261001-124453                 # dry-run
python tripper.py replay nav-maneuver-20261001-124453 --confirm-send
```

A replay re-sends the exact stored frames (not a rebuild from the current
builder), under the original safety limits, as a new experiment with
`replay_of` set. Because it is a separate experiment, an ingested replay that
agrees adds one supporting experiment, which is how a result gets reproduced.

## Hypotheses file

`hypotheses.json` stores each hypothesis with its `supporting_experiments`,
`contradicting_experiments`, derived `status`, and a `history` line for every
ingest. See [protocol-discovery.md](protocol-discovery.md) for the rules.
