"""Manual device-behavior observation."""

import unittest

import support  # noqa: F401  (sys.path)
from fuzzing.experiment import ExperimentResult
from fuzzing.mutator import NAV_SCHEMA, finalize_frame, frame_crc
from fuzzing.observer import ManualObserver, resolve_state

FRAME = finalize_frame(NAV_SCHEMA.base_payload())


def fresh_result() -> ExperimentResult:
    return ExperimentResult(
        experiment_id="e", sequence=0, command="nav", base_packet=FRAME, mutated_field="maneuver",
        mutation_value=0x20, generated_packet=FRAME, crc=frame_crc(FRAME), response_status="TIMEOUT",
    )


def scripted(*answers):
    replies = iter(answers)
    return lambda _prompt: next(replies)


class ResolveStateTests(unittest.TestCase):
    def test_inputs(self):
        cases = {
            "": "UNKNOWN", "-": "NO_CHANGE", "left": "LEFT", "le": "LEFT", "ri": "RIGHT",
            "uturn": "U_TURN", "u turn": "U_TURN", "compass_n": "COMPASS_N",
            "compass_ne": "COMPASS_NE", "s": "STRAIGHT",
        }
        for typed, state in cases.items():
            with self.subTest(typed=typed):
                self.assertEqual(resolve_state(typed), state)

    def test_ambiguous_or_unknown(self):
        for typed in ("r", "u", "compass", "sideways"):
            with self.subTest(typed=typed):
                self.assertIsNone(resolve_state(typed))


class ManualObserverTests(unittest.TestCase):
    def test_reprompts_on_ambiguity_and_records_everything(self):
        printed = []
        result = fresh_result()
        ManualObserver(scripted("r", "ri", "arrow bends right", "250"), printed.append)(result)
        self.assertEqual(result.device_state, "RIGHT")
        self.assertEqual(result.device_observation, "arrow bends right")
        self.assertEqual(result.observed_value, 250)
        self.assertTrue(any("ambiguous" in line for line in printed))

    def test_gives_up_as_other_and_keeps_what_was_typed(self):
        result = fresh_result()
        ManualObserver(scripted("zz", "zz", "zz", "", "0.2 km"), lambda _l: None)(result)
        self.assertEqual(result.device_state, "OTHER")
        self.assertEqual(result.device_observation, "typed: zz | value: 0.2 km")
        self.assertIsNone(result.observed_value)


if __name__ == "__main__":
    unittest.main()
