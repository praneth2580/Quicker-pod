"""Device-behavior observers.

The runner calls an observer after each delivered packet; it fills
device_state / device_observation / observed_value on the result before the
result is persisted. ManualObserver asks a human. An automated observer (for
example a camera plus computer vision) only has to implement the same
__call__(result) signature — nothing else in the framework changes.
"""

from __future__ import annotations

from typing import Callable, Optional, Protocol

from packets import to_hex

from .experiment import DeviceState, ExperimentResult

NO_CHANGE_SHORTCUT = "-"
_STATES = [s.value for s in DeviceState]


class Observer(Protocol):
    def __call__(self, result: ExperimentResult) -> None: ...


def resolve_state(text: str) -> Optional[str]:
    """Map operator input to a DeviceState value.

    Accepts exact names, unique prefixes ("le" -> LEFT), underscores optional
    ("uturn" -> U_TURN), "-" for NO_CHANGE and "" for UNKNOWN. Returns None
    when the input is ambiguous ("r": RIGHT or ROUNDABOUT) or unknown.
    """
    typed = text.strip().upper().replace(" ", "_")
    if not typed:
        return DeviceState.UNKNOWN.value
    if typed == NO_CHANGE_SHORTCUT:
        return DeviceState.NO_CHANGE.value
    key = typed.replace("_", "")
    exact = [s for s in _STATES if s.replace("_", "") == key]
    if exact:
        return exact[0]
    matches = [s for s in _STATES if s.replace("_", "").startswith(key)]
    return matches[0] if len(matches) == 1 else None


class ManualObserver:
    """Prompts the operator for what the Tripper displayed after a packet."""

    def __init__(
        self,
        input_fn: Callable[[str], str] = input,
        print_fn: Callable[[str], None] = print,
        max_attempts: int = 3,
    ) -> None:
        self.input_fn = input_fn
        self.print_fn = print_fn
        self.max_attempts = max_attempts

    def __call__(self, result: ExperimentResult) -> None:
        rx = f" rx={result.response_label}" if result.response_label else ""
        self.print_fn(
            f"\n  TX {to_hex(result.generated_packet)}  "
            f"{result.mutated_field}={result.mutation_value}  [{result.response_status}{rx}]"
        )
        self.print_fn(f"  states: {', '.join(_STATES)}  ('-' = NO_CHANGE, Enter = UNKNOWN)")

        state: Optional[str] = None
        typed = ""
        for _ in range(self.max_attempts):
            typed = self.input_fn("  observed state: ")
            state = resolve_state(typed)
            if state is not None:
                break
            self.print_fn(f"  '{typed.strip()}' is ambiguous or unknown")
        notes: list[str] = []
        if state is None:
            state = DeviceState.OTHER.value
            notes.append(f"typed: {typed.strip()}")
        result.device_state = state

        note = self.input_fn("  note (optional): ").strip()
        if note:
            notes.append(note)
        value = self.input_fn("  number shown, if any: ").strip()
        if value:
            try:
                result.observed_value = int(value, 0)
            except ValueError:
                notes.append(f"value: {value}")
        if notes:
            result.device_observation = " | ".join(notes)
