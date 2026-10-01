# Protocol discovery methodology

The goal is to replace guesses about the Tripper protocol with claims backed by
repeatable experiments, and to keep the two clearly apart.

## Evidence levels

| Level | Meaning | Produced by |
|-------|---------|-------------|
| OBSERVED | A byte changed, a notification arrived, the display showed X | runner, `compare`, `analyze`, operator observations |
| INFERRED | A pattern across observations suggests a meaning | `analyze` field discovery, hypotheses with 1–2 supporting experiments |
| HYPOTHESIZED | An explicit, falsifiable mapping claim | `hypotheses seed`, hand-written hypotheses |
| CONFIRMED | Reproduced by independent experiments with no contradiction | hypothesis status only |

Nothing is promoted silently: `analyze` never prints CONFIRMED, and a
hypothesis' status is derived from its recorded verdicts, never set by hand.

## Field-location discovery

To find where a known value lives:

1. Build packets that differ only in that value (`fuzz field`).
2. Generate every representation of each value: 100 is `64` (uint8), `00 64`
   (uint16 BE), `64 00` (uint16 LE), `00 00 64` (uint24 BE), and so on.
3. Keep only (offset, encoding) placements that match **every** sample and whose
   bytes actually change.
4. Score confidence: HIGH needs 3+ distinct values including one that needs the
   full width; 2 values is at most MEDIUM; one value is refused.

```bash
python tripper.py fuzz field --field distance --values 100,200,500,1000
python tripper.py analyze <experiment-id>
#   offset 3-4 may carry the value as uint16_be (confidence HIGH, 4 samples)
#   offset 8-9 may carry the value as uint16_be (confidence HIGH, 4 samples)
```

This describes what the **builder** writes, not what the firmware reads. Here
two placements fit equally well, and only device behavior can separate them:

```bash
python tripper.py fuzz int --offset 3 --encoding uint16_be --values 100,500,1000 --confirm-send --observe
```

This writes only bytes 3–4 while 8–9 keep the base value 200. If the display
shows 100/500/1000, ingesting the experiment supports `distance@3` and rejects
`distance@8`. If it keeps showing 200, the reverse.

## Hypothesis lifecycle

```
UNKNOWN → POSSIBLE (1 supporting) → LIKELY (2) → CONFIRMED (3+, none contradicting)
any contradicting experiment → REJECTED
```

- An experiment **supports** only if at least two distinct field values agree
  and none disagree. One interesting packet can never move a hypothesis.
- Field values are decoded from the transmitted bytes at the hypothesis' own
  offset, so a raw-byte experiment is a fair test of every hypothesis.
- `NO_CHANGE` means the display kept its previous state, and is judged as that
  state. `UNKNOWN` (nobody looked) is ignored.
- Dry-run, errored, and aborted packets are never evidence.
- Re-ingesting an experiment after correcting observations replaces its verdict.

```bash
python tripper.py hypotheses seed
python tripper.py hypotheses ingest nav.maneuver@5:uint8-app-labels <experiment-id>
python tripper.py hypotheses list
```

## Discovery order

1. **Navigation maneuver, heading, distance.** Start with
   `examples/nav_maneuver_discovery.py`.
2. **Screen, speedFlags, roadType, eta.** Use `fuzz bit --offset 7` for
   speedFlags (suspected bit-field).
3. **Compass, time, PIN.** Compass and time schemas exist already. PIN needs its
   own schema; probe it last, since what repeated wrong PINs do to the pod is
   unknown.

## NAVIGATION MANEUVER DISCOVERY

`examples/nav_maneuver_discovery.py` builds the SDK's default nav packet
(screen 0x14, 200 m, heading 0x40, speedFlags 0x40, road 0x41, eta 0), varies
only the maneuver argument, and refuses to start unless every candidate differs
from the base only at byte 5 with a valid CRC.

```bash
python examples/nav_maneuver_discovery.py                    # dry-run, 32 values the app emits
python examples/nav_maneuver_discovery.py --full             # dry-run, 0x00–0xFF
python examples/nav_maneuver_discovery.py --confirm-send     # live, with observation prompts
```

It finishes with an OBSERVED summary (states seen per value), a verdict for
`nav.maneuver@5:uint8-app-labels` (recorded only for live runs), and values
outside the app's labels that changed the display, listed as leads rather than
facts.

## Open questions in the existing sources

These are why the seed hypotheses all start UNKNOWN.

| Topic | Conflict |
|-------|----------|
| Nav byte 13 | Decompiled `buildNavPacket` and `PKT_NAV_IDLE` use `0x03`; the SDK and TypeScript builders write `0x01`. |
| speedFlags default | Decompiled code and `PKT_NAV_IDLE` use `0x15`; the SDK builder defaults to `0x40`. |
| Byte 6 | Called heading in `buildNavPacket`, written as distance-based intensity by `sendManeuverToTripper`, and used for roundabout exit and destination side by `GOOGLE_MANEUVERS`. |
| Maneuver tables | `GOOGLE_MANEUVERS` uses 0x00–0x60; `nav_maneuver_to_byte` emits a richer 0x08–0x3F set. |
| Compass directions | `bearing_to_direction(45°)` returns `0x50`, which `DIR_*` names NW; 90° returns the value named W. Either the names or the sector table is wrong. |
| Distance | Written twice (bytes 3–4 and 8–9); which copy the firmware reads is unknown. |
| `reference-packets.json` | In all three copies, 6 of 7 hex packets are not valid frames (21 or 19 bytes), so tests use the `PKT_*` constants from `packets.py` instead. |
