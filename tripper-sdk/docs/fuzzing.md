# Protocol fuzzing framework

Controlled, reproducible mutation of Tripper packets to find out what each byte
does. It extends the Python SDK in place: packets are built by `packets.py`
builders, checksummed by `packets.append_crc`, transmitted through
`ble.TripperBleClient`, and parsed by `parser.parse_response`. Nothing in those
modules was changed.

Companion docs: [experiments.md](experiments.md) (data format, replay) and
[protocol-discovery.md](protocol-discovery.md) (methodology, open questions).

## Safety model

| Control | Behavior |
|---------|----------|
| Dry-run default | Every command generates and stores packets without sending them. |
| `--confirm-send` | Required for any transmission; the batch plan is printed and you must type `send` (or pass `--yes`). Non-interactive runs without `--yes` are refused. |
| One change per packet | Each candidate differs from the base in exactly one logical field, byte, or bit. |
| CRC | Recomputed for every packet with the SDK's CRC-16/CCITT-FALSE; bytes 18–19 can never be mutated. |
| Header guard | Bytes 0–1 (command/sub-command) are protected because the same characteristic carries firmware OTA. Override deliberately with `--allow-header`. |
| Rate limit | `--delay` between packets, hard floor 0.5 s. |
| Batch ceiling | `--max-packets` (default 256, hard maximum 1024); longer sweeps are truncated with a warning. |
| Abort on error | A transport failure stops the batch unless `--no-abort-on-error`. |
| Emergency stop | Ctrl-C stops immediately. An in-flight packet is stored as `ABORTED` ("delivery unknown"), never dropped. |
| Cooldown | `--cooldown` rest after each transmitting batch; late notifications are still recorded. |
| Timeout ≠ invalid | No notification is recorded as `TIMEOUT`. The pod usually answers via the phone's GATT server, which a BLE client cannot host. |

There is no unbounded or random fuzzing mode.

## Quick start

From `tripper-sdk/` (Python 3.10+; dry-run needs no dependencies):

```bash
python tripper.py fuzz field --field maneuver --values 0x00,0x10,0x20,0x50
python tripper.py experiments list
python tripper.py analyze <experiment-id>
python examples/nav_maneuver_discovery.py          # the reference experiment
```

Transmitting needs `pip install -r requirements.txt` (bleak) and a pod in range:

```bash
python tripper.py fuzz field --field maneuver --confirm-send --observe
```

`--handshake known` (default) runs the reconnect sequence for an already-paired
pod; `--handshake pin` shows the PIN on the pod and prompts for it; `--handshake
none` only connects.

## CLI

| Command | Purpose |
|---------|---------|
| `generate <nav\|compass\|time> [--set field=value]` | Print one builder-generated frame and its CRC. |
| `fuzz field --field F [--values …] [--set other=value]` | Vary one logical field through the SDK builder; everything else fixed. |
| `fuzz byte --offset N [--sweep16 \| --range LO HI \| --values …]` | Set one payload byte. Default is all 256 values (Mode A). |
| `fuzz int --offset N (--values … \| --boundary) [--encoding …]` | Write integers under candidate encodings (Modes C and D). |
| `fuzz bit --offset N` | Toggle each bit of one byte, one bit per packet. |
| `send <hex>` | Send one explicit packet (CRC recomputed; unknown command bytes refused without `--allow-unknown`). |
| `capture --seconds N` | Record notifications only (`--handshake none` keeps it passive). |
| `observe <result-id> --state S [--note …] [--value N]` | Record what the pod displayed for a delivered packet. |
| `compare <hex-a> <hex-b>` | Byte and bit diff (CRC excluded). |
| `analyze <experiment-id>` | Observed differences, responses, device behavior, then inferred field locations. |
| `replay <experiment-id>` | Re-run the exact stored frames as a new experiment. |
| `hypotheses seed \| list \| show ID \| ingest ID EXPERIMENT` | Track mapping claims and the evidence for them. |
| `experiments list \| show ID \| create TEMPLATE` | Browse experiments; run curated templates (`nav-maneuver`, `nav-distance`, `nav-heading`, `nav-screen`, `compass-direction`). |

Every option is per-subcommand, for example `fuzz byte --offset 5 --confirm-send`.
Raw-byte commands mutate the SDK nav base packet unless `--base-hex` is given.

## Mutation strategies

| Mode | Command | Values |
|------|---------|--------|
| A — exhaustive byte | `fuzz byte --offset N` | 0–255, only for the offset you name |
| B — small values | `fuzz byte --offset N --sweep16` | 0–15 |
| C — boundaries | `fuzz int --offset N --boundary` | 0, 1, 2, 10, 50, 99, 100, 127, 128, 255, 256, 257, 500, 1000, 65535, filtered to what each encoding can hold |
| D — encodings | `fuzz int --offset N --values …` | uint8, uint16/24/32 in both byte orders |
| Bit | `fuzz bit --offset N` | one bit flipped per packet |
| Field | `fuzz field --field F` | the field's value set, via the SDK builder |

Values an encoding cannot represent are skipped and reported, never truncated.

## Architecture

```
tripper.py                 CLI (argparse)
examples/                  ready-to-run experiments
fuzzing/
  encoding.py              integer encodings, boundary/small value sets
  experiment.py            Candidate, ExperimentConfig, ExperimentResult, SafetyLimits, DeviceState
  mutator.py               one-change-per-packet generators; CommandSchema for nav/compass/time
  analyzer.py              compare, series summary, field discovery, bit-field/enum patterns
  hypothesis.py            Hypothesis with evidence-derived status; seed claims from the code
  observer.py              ManualObserver (operator prompts); extension point for automation
  runner.py                send → wait → correlate → observe → persist loop, replay
  storage.py               JSONL experiment store, hypotheses.json, captures
  transport.py             DryRunTransport, BleTransport (wraps ble.TripperBleClient)
tests/                     unittest suite (stdlib only)
```

The runner only sees the small `Transport` interface, so dry-run, tests, and
real BLE run the same code path.

## Extending

- **New command** (PIN, keepalive, …): add a `CommandSchema` in `mutator.py`
  wrapping the existing builder and listing its fields. `fuzz field --command`,
  `generate`, `analyze`, and hypotheses work unchanged.
- **Automated observation**: implement `__call__(result)` that sets
  `result.device_state` / `observed_value` (for example from a camera frame) and
  pass it as `observe=` to `ExperimentRunner.run`.
- **Other storage**: `ExperimentStore` is the only module that touches disk; the
  records are plain JSON and map one-to-one onto SQL tables if that is ever needed.

## Tests

```bash
cd tripper-sdk
python -m unittest discover -s tests
```

Covers CRC (including the hard-coded `PKT_*` frames as regression fixtures),
packet generation, mutation guards, encodings and endianness, comparison and
field discovery, hypothesis promotion, serialization, storage, response
correlation, safety controls, replay, the CLI, and the example.
