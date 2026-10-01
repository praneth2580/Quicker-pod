"""Experiment runner — the controlled transmit/capture/correlate/persist loop.

Pipeline per candidate:

    finalize CRC -> (optionally) send -> wait for response -> correlate latency
    -> record human observation -> persist result

Safety is structural, not advisory:
  * dry-run is the default; a packet is transmitted only when the experiment is
    explicitly not dry-run AND the transport actually transmits;
  * delay_between_packets has a hard floor and max_packets has a hard ceiling;
  * abort_on_error stops the batch on the first transport failure;
  * stop() and Ctrl-C halt immediately and persist whatever already ran;
  * a cooldown follows every transmitting batch.

A TIMEOUT is recorded, never treated as "invalid packet": the Tripper often
answers via the phone GATT server, which this client cannot see.
"""

from __future__ import annotations

import time
from dataclasses import dataclass, field
from typing import Callable, Iterable, Optional

from parser import parse_response

from .experiment import (
    STATUS_ABORTED,
    STATUS_DRY_RUN,
    STATUS_ERROR,
    STATUS_OK,
    STATUS_TIMEOUT,
    Candidate,
    ExperimentConfig,
    ExperimentResult,
    command_of,
)
from .mutator import finalize_frame, frame_crc
from .storage import ExperimentStore
from .transport import DryRunTransport, Transport

ObserveFn = Callable[[ExperimentResult], None]
EventFn = Callable[[str], None]


def _append_note(notes: str, extra: str) -> str:
    return f"{notes} | {extra}" if notes else extra


@dataclass
class RunReport:
    config: ExperimentConfig
    results: list[ExperimentResult] = field(default_factory=list)
    aborted: bool = False
    transmitted: bool = False

    @property
    def counts(self) -> dict[str, int]:
        out: dict[str, int] = {}
        for r in self.results:
            out[r.response_status] = out.get(r.response_status, 0) + 1
        return out

    def summary(self) -> str:
        counts = ", ".join(f"{k}={v}" for k, v in sorted(self.counts.items()))
        mode = "TRANSMITTED" if self.transmitted else "DRY-RUN"
        tail = " (ABORTED)" if self.aborted else ""
        return f"{self.config.experiment_id}: {len(self.results)} packets [{mode}] {counts}{tail}"


class ExperimentRunner:
    def __init__(
        self,
        store: ExperimentStore,
        transport: Optional[Transport] = None,
        *,
        on_event: Optional[EventFn] = None,
    ) -> None:
        self.store = store
        self.transport = transport or DryRunTransport()
        self.on_event = on_event or (lambda _msg: None)
        self._stop = False

    def stop(self) -> None:
        """Emergency stop — the current batch ends after the in-flight packet."""
        self._stop = True

    def run(
        self,
        config: ExperimentConfig,
        candidates: Iterable[Candidate],
        *,
        observe: Optional[ObserveFn] = None,
        save_config: bool = True,
    ) -> RunReport:
        config.limits.validate()
        self._stop = False

        candidates = list(candidates)
        limit = config.limits.max_packets
        if len(candidates) > limit:
            self.on_event(
                f"{len(candidates)} candidates exceed max_packets={limit}; truncating. "
                f"Narrow the sweep or raise --max-packets to cover the rest."
            )
            candidates = candidates[:limit]

        transmit = not config.dry_run and self.transport.transmits
        if not transmit and not config.dry_run:
            self.on_event("transport does not transmit; running as dry-run")
        config.dry_run = not transmit
        report = RunReport(config=config, transmitted=transmit)

        if transmit:
            self.on_event(f"connecting transport for {config.experiment_id}")
            try:
                self.transport.connect()
            except BaseException:
                self.transport.disconnect()
                raise
        try:
            if save_config:
                self.store.save_config(config)
            for seq, candidate in enumerate(candidates):
                if self._stop:
                    report.aborted = True
                    self.on_event("stop requested — ending batch")
                    break
                result = self._run_one(config, seq, candidate, transmit, observe)
                report.results.append(result)
                if (
                    transmit
                    and config.limits.abort_on_error
                    and result.response_status == STATUS_ERROR
                ):
                    report.aborted = True
                    self.on_event(f"abort_on_error: stopping after {result.result_id}")
                    break
                if transmit and not self._stop and seq < len(candidates) - 1:
                    time.sleep(config.limits.delay_s)
        except KeyboardInterrupt:
            self.on_event("interrupted — results so far are persisted")
            report.aborted = True
        finally:
            if transmit:
                self._wind_down(config, report)
        return report

    def _wind_down(self, config: ExperimentConfig, report: RunReport) -> None:
        """Cooldown, keep any late notifications, then disconnect."""
        try:
            if config.limits.cooldown_s:
                time.sleep(config.limits.cooldown_s)
        except KeyboardInterrupt:
            report.aborted = True
        late = self.transport.take_unsolicited()
        if late and report.results:
            last = report.results[-1]
            last.uncorrelated_rx.extend(late)
            self.store.append_result(last)  # newer version of the same sequence
            self.on_event(f"{len(late)} late notification(s) attached to {last.result_id}")
        elif late:
            self.on_event(f"{len(late)} notification(s) arrived before any packet was sent")
        self.transport.disconnect()

    def _run_one(
        self,
        config: ExperimentConfig,
        seq: int,
        candidate: Candidate,
        transmit: bool,
        observe: Optional[ObserveFn],
    ) -> ExperimentResult:
        frame = finalize_frame(candidate.payload)
        result = ExperimentResult(
            experiment_id=config.experiment_id,
            sequence=seq,
            command=command_of(frame),
            base_packet=config.base_packet,
            mutated_field=candidate.mutated_field,
            mutation_value=candidate.mutation_value,
            generated_packet=frame,
            crc=frame_crc(frame),
            encoding=candidate.encoding,
            notes=candidate.notes,
        )

        if transmit:
            self._transmit(config, candidate, frame, result)
        else:
            result.response_status = STATUS_DRY_RUN

        if observe is not None and result.delivered:
            try:
                observe(result)
            except KeyboardInterrupt:
                self._stop = True
                result.notes = _append_note(result.notes, "observation skipped (interrupted)")

        self.store.append_result(result, durable=transmit)
        return result

    def _transmit(
        self,
        config: ExperimentConfig,
        candidate: Candidate,
        frame: bytes,
        result: ExperimentResult,
    ) -> None:
        try:
            result.uncorrelated_rx = self.transport.take_unsolicited()
            self.transport.send(frame, candidate.mutated_field)
            started = time.perf_counter()  # send() returns once the write is done
            response = self.transport.wait_response(config.limits.timeout_s)
        except KeyboardInterrupt:
            self._stop = True
            result.response_status = STATUS_ABORTED
            result.notes = _append_note(result.notes, "interrupted mid-transmission; delivery unknown")
            return
        except Exception as exc:  # transport/BLE failure, not a protocol signal
            result.response_status = STATUS_ERROR
            result.notes = _append_note(result.notes, f"transport error: {exc}")
            return

        if response is None:
            result.response_status = STATUS_TIMEOUT
            return
        result.response_packet = response
        result.response_label = parse_response(response).label
        result.response_status = STATUS_OK
        result.latency_ms = round((time.perf_counter() - started) * 1000, 1)

    # -- replay ---------------------------------------------------------------

    def replay(
        self,
        experiment_id: str,
        *,
        dry_run: bool = True,
        observe: Optional[ObserveFn] = None,
    ) -> RunReport:
        """Re-run an experiment from the exact bytes it transmitted before.

        Candidates are rebuilt from each stored result's generated packet, so a
        replay reproduces the original frames even if a builder later changes.
        The replay is saved as a new experiment that references the original.
        """
        original = self.store.load_config(experiment_id)
        results = self.store.load_results(experiment_id)
        if not results:
            raise ValueError(f"experiment {experiment_id} has no results to replay")

        candidates = [
            Candidate(
                payload=bytes(r.generated_packet[:18]),
                mutated_field=r.mutated_field,
                mutation_value=r.mutation_value,
                encoding=r.encoding,
                notes=f"replay of {r.result_id}",
            )
            for r in results
        ]

        replay_id = self.store.new_experiment_id(f"{original.name}-replay")
        config = ExperimentConfig(
            experiment_id=replay_id,
            name=f"{original.name}-replay",
            command=original.command,
            base_packet=original.base_packet,
            strategy="replay",
            target=original.target,
            mutation_values=[r.mutation_value for r in results],
            encoding=original.encoding,
            params={
                **original.params,
                "replayed_results": len(results),
                "original_strategy": original.params.get("original_strategy", original.strategy),
            },
            limits=original.limits,
            dry_run=dry_run,
            replay_of=experiment_id,
            notes=f"Replay of {experiment_id}",
        )
        return self.run(config, candidates, observe=observe)
