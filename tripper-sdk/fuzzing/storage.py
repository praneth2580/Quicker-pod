"""JSONL experiment store.

The Python SDK has no database layer, so storage is plain files:

    <root>/experiments/<experiment_id>/config.json    immutable, written once
    <root>/experiments/<experiment_id>/results.jsonl  append-only, one result per line
    <root>/captures/<capture_id>.jsonl                 passive RX captures, append-only
    <root>/hypotheses.json                             all hypotheses, rewritten atomically

results.jsonl is never rewritten: correcting an observation appends a newer
version of the same result, and loaders keep the last line per sequence. The
full history therefore stays on disk for audit and reproducibility.
"""

from __future__ import annotations

import json
import os
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

from .experiment import ExperimentConfig, ExperimentResult
from .hypothesis import Hypothesis

DATA_DIR_ENV = "TRIPPER_DATA_DIR"


def default_data_dir() -> Path:
    """$TRIPPER_DATA_DIR, else <repo>/tripper-experiments next to tripper-sdk/."""
    env = os.environ.get(DATA_DIR_ENV)
    if env:
        return Path(env).expanduser()
    return Path(__file__).resolve().parent.parent.parent / "tripper-experiments"


class ExperimentStore:
    def __init__(self, root: Optional[Path] = None) -> None:
        self.root = Path(root) if root is not None else default_data_dir()
        self.experiments_dir = self.root / "experiments"
        self.captures_dir = self.root / "captures"
        self.hypotheses_path = self.root / "hypotheses.json"

    # -- experiments ----------------------------------------------------------

    def _dir(self, experiment_id: str) -> Path:
        if not experiment_id or "/" in experiment_id or experiment_id.startswith("."):
            raise ValueError(f"invalid experiment id: {experiment_id!r}")
        return self.experiments_dir / experiment_id

    def new_experiment_id(self, name: str) -> str:
        """'<slug>-<UTC timestamp>', suffixed -2, -3… if that already exists."""
        slug = re.sub(r"[^A-Za-z0-9._-]+", "-", name).strip("-.") or "experiment"
        stamp = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")
        base = f"{slug}-{stamp}"
        candidate, n = base, 1
        while self._dir(candidate).exists():
            n += 1
            candidate = f"{base}-{n}"
        return candidate

    def save_config(self, config: ExperimentConfig) -> Path:
        directory = self._dir(config.experiment_id)
        path = directory / "config.json"
        if path.exists():
            raise FileExistsError(f"experiment {config.experiment_id} already exists; configs are immutable")
        directory.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(config.to_dict(), indent=2) + "\n", encoding="utf-8")
        return path

    def append_result(self, result: ExperimentResult, *, durable: bool = True) -> None:
        """Append one result line. durable=True fsyncs, so a crash right after a
        physical transmission cannot lose its record."""
        directory = self._dir(result.experiment_id)
        if not (directory / "config.json").exists():
            raise FileNotFoundError(f"no config for experiment {result.experiment_id}")
        with open(directory / "results.jsonl", "a", encoding="utf-8") as fh:
            fh.write(json.dumps(result.to_dict()) + "\n")
            fh.flush()
            if durable:
                os.fsync(fh.fileno())

    def has_experiment(self, experiment_id: str) -> bool:
        return (self._dir(experiment_id) / "config.json").exists()

    def load_config(self, experiment_id: str) -> ExperimentConfig:
        path = self._dir(experiment_id) / "config.json"
        if not path.exists():
            raise FileNotFoundError(f"unknown experiment: {experiment_id}")
        return ExperimentConfig.from_dict(json.loads(path.read_text(encoding="utf-8")))

    def load_results(self, experiment_id: str, *, history: bool = False) -> list[ExperimentResult]:
        """Results ordered by sequence. history=True returns every stored version."""
        path = self._dir(experiment_id) / "results.jsonl"
        if not path.exists():
            return []
        versions: list[ExperimentResult] = []
        with open(path, encoding="utf-8") as fh:
            for line in fh:
                line = line.strip()
                if line:
                    versions.append(ExperimentResult.from_dict(json.loads(line)))
        if history:
            return versions
        latest: dict[int, ExperimentResult] = {}
        for r in versions:
            latest[r.sequence] = r
        return [latest[k] for k in sorted(latest)]

    def list_experiments(self) -> list[ExperimentConfig]:
        if not self.experiments_dir.exists():
            return []
        configs = [
            self.load_config(p.name)
            for p in self.experiments_dir.iterdir()
            if (p / "config.json").exists()
        ]
        return sorted(configs, key=lambda c: c.created_at)

    def find_result(self, result_id: str) -> ExperimentResult:
        """Resolve '<experiment_id>-<NNNN>' to the latest stored result."""
        experiment_id, _, seq = result_id.rpartition("-")
        if not experiment_id or len(seq) < 4 or not seq.isdigit():
            raise ValueError(f"not a result id: {result_id!r} (expected <experiment_id>-NNNN)")
        for r in self.load_results(experiment_id):
            if r.sequence == int(seq):
                return r
        raise FileNotFoundError(f"unknown result: {result_id}")

    def record_observation(
        self,
        result_id: str,
        *,
        device_state: Optional[str] = None,
        observation: Optional[str] = None,
        observed_value: Optional[int] = None,
    ) -> ExperimentResult:
        """Append a corrected/annotated version of a result (never edits in place)."""
        result = self.find_result(result_id)
        if device_state is not None:
            result.device_state = device_state
        if observation is not None:
            result.device_observation = observation
        if observed_value is not None:
            result.observed_value = observed_value
        self.append_result(result)
        return result

    # -- passive captures -------------------------------------------------------

    def new_capture_id(self) -> str:
        return "capture-" + datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")

    def append_capture(self, capture_id: str, record: dict[str, Any]) -> Path:
        if not re.fullmatch(r"[A-Za-z0-9._-]+", capture_id) or capture_id.startswith("."):
            raise ValueError(f"invalid capture id: {capture_id!r}")
        self.captures_dir.mkdir(parents=True, exist_ok=True)
        path = self.captures_dir / f"{capture_id}.jsonl"
        with open(path, "a", encoding="utf-8") as fh:
            fh.write(json.dumps(record) + "\n")
            fh.flush()
            os.fsync(fh.fileno())
        return path

    # -- hypotheses -------------------------------------------------------------

    def load_hypotheses(self) -> dict[str, Hypothesis]:
        if not self.hypotheses_path.exists():
            return {}
        raw = json.loads(self.hypotheses_path.read_text(encoding="utf-8"))
        return {h.hypothesis_id: h for h in (Hypothesis.from_dict(d) for d in raw)}

    def save_hypotheses(self, hypotheses: dict[str, Hypothesis]) -> None:
        self.root.mkdir(parents=True, exist_ok=True)
        payload = [h.to_dict() for h in sorted(hypotheses.values(), key=lambda h: h.hypothesis_id)]
        tmp = self.hypotheses_path.with_suffix(".json.tmp")
        tmp.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
        os.replace(tmp, self.hypotheses_path)
