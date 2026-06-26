# Tripper Pod Protocol Documentation

## Canonical reference

**Use [`re-engineered-protocol/`](re-engineered-protocol/)** — consolidated BLE protocol spec cross-validated from:

| Directory | App |
|-----------|-----|
| [`tripperpod-re/`](tripperpod-re/) | Royal Enfield reprime (`com.royalenfield.reprime`) |
| [`tripperpod-protocol-super/`](tripperpod-protocol-super/) | Super TripperPod v2.1 (`com.supertripper.app`) |

## Layout

```
tripper-protocol/
├── README.md                    # This file
├── constants.txt                # Quick opcode cheat sheet (see re-engineered-protocol/constants.json)
├── re-engineered-protocol/      # ★ Canonical merged protocol spec + tripper_protocol.py
├── tripperpod-re/               # Raw RE reprime RE data (smali, captures, OTA notes)
└── tripperpod-protocol-super/   # Raw Super TripperPod RE data
```

## App integration

| Component | Path | Role |
|-----------|------|------|
| Web app (TypeScript) | [`src/bluetooth/tripper/`](../src/bluetooth/tripper/) | BLE session, packet builders, parser |
| Python SDK | [`tripper-sdk/`](../tripper-sdk/) | Standalone packet builders + optional BLE client |

Both implementations follow `re-engineered-protocol/`. See [`re-engineered-protocol/sources-comparison.md`](re-engineered-protocol/sources-comparison.md) for validation notes.
