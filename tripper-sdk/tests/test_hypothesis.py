"""Hypothesis promotion rules: conservative, evidence-driven, never silent."""

import unittest

import support  # noqa: F401  (sys.path)
from fuzzing.experiment import (
    STATUS_DRY_RUN,
    STATUS_OK,
    STATUS_TIMEOUT,
    ExperimentResult,
    command_of,
)
from fuzzing.hypothesis import (
    CONTRADICT,
    INCONCLUSIVE,
    SUPPORT,
    Hypothesis,
    seed_hypotheses,
)
from fuzzing.mutator import NAV_SCHEMA, finalize_frame, frame_crc, mutate_int
from packets import build_compass_packet

APP_LABELS = {0x00: "STRAIGHT", 0x10: "LEFT", 0x20: "RIGHT", 0x50: "U_TURN"}


def result(exp, seq, payload, state="UNKNOWN", status=STATUS_OK, observed=None):
    frame = finalize_frame(bytes(payload[:18]))
    return ExperimentResult(
        experiment_id=exp, sequence=seq, command=command_of(frame), base_packet=frame,
        mutated_field="x", mutation_value=None, generated_packet=frame, crc=frame_crc(frame),
        response_status=status, device_state=state, observed_value=observed,
    )


def maneuver(value: int) -> bytes:
    return NAV_SCHEMA.candidates("maneuver", [value])[0].payload


def maneuver_run(exp, observations, status=STATUS_TIMEOUT):
    """observations: [(maneuver_byte, observed_state), ...] in send order."""
    return [result(exp, i, maneuver(v), state, status) for i, (v, state) in enumerate(observations)]


def maneuver_hypothesis() -> Hypothesis:
    return Hypothesis(field="maneuver", offset=5, mapping=APP_LABELS, label="app-labels")


AGREEING = [(0x10, "LEFT"), (0x20, "RIGHT"), (0x00, "STRAIGHT")]


class PromotionTests(unittest.TestCase):
    def test_seeds_start_unknown_with_unique_ids(self):
        seeds = seed_hypotheses()
        self.assertEqual(len({h.hypothesis_id for h in seeds}), len(seeds))
        for h in seeds:
            self.assertEqual((h.status, h.evidence_level, h.supporting_experiments),
                             ("UNKNOWN", "HYPOTHESIZED", []))

    def test_one_experiment_never_confirms(self):
        h = maneuver_hypothesis()
        verdict = h.ingest("e1", maneuver_run("e1", AGREEING + [(0x50, "U_TURN")]))
        self.assertEqual(verdict.outcome, SUPPORT)
        self.assertEqual((h.status, h.evidence_level), ("POSSIBLE", "INFERRED"))

    def test_status_climbs_only_with_independent_experiments(self):
        h = maneuver_hypothesis()
        statuses = [h.status]
        for exp in ("e1", "e2", "e3"):
            h.ingest(exp, maneuver_run(exp, AGREEING))
            statuses.append(h.status)
        self.assertEqual(statuses, ["UNKNOWN", "POSSIBLE", "LIKELY", "CONFIRMED"])
        self.assertEqual((h.evidence_level, h.confidence), ("CONFIRMED", "HIGH"))

    def test_a_single_value_is_inconclusive(self):
        h = maneuver_hypothesis()
        verdict = h.ingest("e1", maneuver_run("e1", [(0x10, "LEFT")] * 3))
        self.assertEqual((verdict.outcome, h.status), (INCONCLUSIVE, "UNKNOWN"))

    def test_any_contradiction_rejects_even_after_confirmation(self):
        h = maneuver_hypothesis()
        for exp in ("e1", "e2", "e3"):
            h.ingest(exp, maneuver_run(exp, AGREEING))
        verdict = h.ingest("e4", maneuver_run("e4", [(0x10, "RIGHT"), (0x20, "RIGHT")]))
        self.assertEqual(verdict.outcome, CONTRADICT)
        self.assertEqual(h.status, "REJECTED")
        self.assertIn("expected LEFT, saw RIGHT", verdict.disagreements[0])

    def test_reingesting_replaces_the_previous_verdict(self):
        h = maneuver_hypothesis()
        h.ingest("e1", maneuver_run("e1", AGREEING))
        h.ingest("e1", maneuver_run("e1", AGREEING))
        self.assertEqual(h.supporting_experiments, ["e1"])
        self.assertEqual(len(h.history), 2)

    def test_dry_run_results_are_not_evidence(self):
        h = maneuver_hypothesis()
        verdict = h.ingest("e1", maneuver_run("e1", AGREEING, status=STATUS_DRY_RUN))
        self.assertEqual((verdict.outcome, h.status), (INCONCLUSIVE, "UNKNOWN"))

    def test_no_change_means_the_display_kept_its_previous_state(self):
        h = maneuver_hypothesis()
        verdict = h.test("e1", maneuver_run("e1", [(0x10, "LEFT"), (0x20, "NO_CHANGE")]))
        self.assertEqual(verdict.outcome, CONTRADICT)
        verdict = h.test("e2", maneuver_run("e2", [(0x10, "LEFT"), (0x10, "NO_CHANGE"),
                                                   (0x20, "RIGHT")]))
        self.assertEqual(verdict.outcome, SUPPORT)

    def test_unknown_breaks_the_no_change_chain(self):
        h = maneuver_hypothesis()
        verdict = h.test("e1", maneuver_run("e1", [(0x10, "LEFT"), (0x20, "UNKNOWN"),
                                                   (0x20, "NO_CHANGE")]))
        self.assertEqual(verdict.outcome, INCONCLUSIVE)

    def test_other_commands_are_ignored(self):
        h = maneuver_hypothesis()
        compass = [result("e1", i, build_compass_packet(0x10), "LEFT") for i in range(3)]
        self.assertEqual(h.test("e1", compass).outcome, INCONCLUSIVE)


class NumericHypothesisTests(unittest.TestCase):
    def test_raw_experiment_disambiguates_duplicate_distance(self):
        """Fake firmware that reads bytes 3-4. Writing distance only at 3-4
        (8-9 stay 200) must support @3 and reject @8."""
        base = NAV_SCHEMA.base_payload()
        candidates, _ = mutate_int(base, 3, "uint16_be", [100, 500, 1000])
        results = [
            result("raw", i, c.payload, observed=int.from_bytes(c.payload[3:5], "big"),
                   status=STATUS_TIMEOUT)
            for i, c in enumerate(candidates)
        ]
        at3 = Hypothesis(field="distance", offset=3, width=2, encoding="uint16_be")
        at8 = Hypothesis(field="distance", offset=8, width=2, encoding="uint16_be")
        self.assertEqual(at3.ingest("raw", results).outcome, SUPPORT)
        self.assertEqual(at8.ingest("raw", results).outcome, CONTRADICT)
        self.assertEqual((at3.status, at8.status), ("POSSIBLE", "REJECTED"))


class ValidationTests(unittest.TestCase):
    def test_shape_is_validated(self):
        with self.assertRaises(ValueError):
            Hypothesis(field="d", offset=3, width=2)  # multi-byte needs an encoding
        with self.assertRaises(ValueError):
            Hypothesis(field="d", offset=3, encoding="uint16_be")  # width mismatch
        with self.assertRaises(ValueError):
            Hypothesis(field="d", offset=17, width=2, encoding="uint16_be")  # past byte 17

    def test_mapping_is_normalized(self):
        h = Hypothesis(field="m", offset=5, mapping={"0x10": "left", 32: "RIGHT"})
        self.assertEqual(h.mapping, {"16": "LEFT", "32": "RIGHT"})
        with self.assertRaises(ValueError):
            Hypothesis(field="m", offset=5, mapping={0x10: "SIDEWAYS"})

    def test_round_trip(self):
        h = maneuver_hypothesis()
        h.ingest("e1", maneuver_run("e1", AGREEING))
        restored = Hypothesis.from_dict(h.to_dict())
        self.assertEqual(restored.to_dict(), h.to_dict())
        self.assertEqual(restored.hypothesis_id, "nav.maneuver@5:uint8-app-labels")


if __name__ == "__main__":
    unittest.main()
