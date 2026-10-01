"""Experiment serialization, safety-limit validation, and the JSONL store."""

import json
import unittest

import support  # noqa: F401  (sys.path)
from support import NACK, NAV_ACK, StoreTestCase
from fuzzing.experiment import (
    STATUS_ABORTED,
    STATUS_DRY_RUN,
    STATUS_ERROR,
    STATUS_OK,
    STATUS_TIMEOUT,
    ExperimentConfig,
    ExperimentResult,
    SafetyLimits,
    command_of,
)
from fuzzing.hypothesis import seed_hypotheses
from fuzzing.mutator import NAV_SCHEMA, finalize_frame, frame_crc
from packets import PKT_CLOSE, PKT_PING_FW, build_compass_packet, build_set_time_packet

BASE_FRAME = finalize_frame(NAV_SCHEMA.base_payload())


def make_config(experiment_id: str = "exp-1", **kwargs) -> ExperimentConfig:
    fields = dict(
        experiment_id=experiment_id, name="exp", command="nav", base_packet=BASE_FRAME,
        strategy="field", target="maneuver", mutation_values=[0x10, 0x20],
        params={"overrides": {"distance": 500}}, limits=SafetyLimits(delay_s=0.75),
    )
    fields.update(kwargs)
    return ExperimentConfig(**fields)


def make_result(experiment_id: str = "exp-1", sequence: int = 0, **kwargs) -> ExperimentResult:
    fields = dict(
        experiment_id=experiment_id, sequence=sequence, command="nav", base_packet=BASE_FRAME,
        mutated_field="maneuver", mutation_value=0x10, generated_packet=BASE_FRAME,
        crc=frame_crc(BASE_FRAME),
    )
    fields.update(kwargs)
    return ExperimentResult(**fields)


class ModelTests(unittest.TestCase):
    def test_config_round_trips_through_json(self):
        config = make_config()
        restored = ExperimentConfig.from_dict(json.loads(json.dumps(config.to_dict())))
        self.assertEqual(restored, config)
        self.assertEqual(config.to_dict()["base_packet"],
                         "10 11 14 00 C8 40 40 40 00 C8 41 00 00 01 00 00 00 00 9C 46")

    def test_result_round_trips_including_every_rx(self):
        result = make_result(response_packet=NAV_ACK, response_label="NAV_ACK",
                             response_status=STATUS_OK, latency_ms=12.5,
                             uncorrelated_rx=[NACK, NAV_ACK], device_state="LEFT",
                             observed_value=200)
        data = json.loads(json.dumps(result.to_dict()))
        self.assertEqual(data["result_id"], "exp-1-0000")
        self.assertEqual(ExperimentResult.from_dict(data), result)

    def test_result_without_response_round_trips(self):
        result = make_result(response_status=STATUS_TIMEOUT)
        self.assertEqual(ExperimentResult.from_dict(result.to_dict()), result)

    def test_only_ok_and_timeout_count_as_delivered(self):
        delivered = {s: make_result(response_status=s).delivered
                     for s in (STATUS_OK, STATUS_TIMEOUT, STATUS_DRY_RUN, STATUS_ERROR, STATUS_ABORTED)}
        self.assertEqual(delivered, {STATUS_OK: True, STATUS_TIMEOUT: True, STATUS_DRY_RUN: False,
                                     STATUS_ERROR: False, STATUS_ABORTED: False})

    def test_safety_limits(self):
        SafetyLimits().validate()
        for bad in (dict(delay_s=0.4), dict(max_packets=0), dict(max_packets=1025),
                    dict(timeout_s=0), dict(cooldown_s=-1)):
            with self.subTest(bad), self.assertRaises(ValueError):
                SafetyLimits(**bad).validate()

    def test_command_of(self):
        self.assertEqual(command_of(BASE_FRAME), "nav")
        self.assertEqual(command_of(build_compass_packet(0x10)), "compass")
        self.assertEqual(command_of(PKT_PING_FW), "ping_fw")
        self.assertEqual(command_of(PKT_CLOSE), "handshake")
        self.assertEqual(command_of(build_set_time_packet(12, 0)), "time")
        self.assertEqual(command_of(bytes([0x99]) + bytes(19)), "raw")


class StoreTests(StoreTestCase):
    def test_config_is_immutable(self):
        self.store.save_config(make_config())
        with self.assertRaises(FileExistsError):
            self.store.save_config(make_config())

    def test_results_need_a_config(self):
        with self.assertRaises(FileNotFoundError):
            self.store.append_result(make_result())

    def test_append_only_with_latest_version_winning(self):
        self.store.save_config(make_config())
        self.store.append_result(make_result(response_status=STATUS_TIMEOUT))
        self.store.record_observation("exp-1-0000", device_state="LEFT", observation="arrow")
        latest = self.store.load_results("exp-1")
        self.assertEqual(len(latest), 1)
        self.assertEqual(latest[0].device_state, "LEFT")
        history = self.store.load_results("exp-1", history=True)
        self.assertEqual([r.device_state for r in history], ["UNKNOWN", "LEFT"])

    def test_results_are_ordered_by_sequence(self):
        self.store.save_config(make_config())
        for seq in (2, 0, 1):
            self.store.append_result(make_result(sequence=seq), durable=False)
        self.assertEqual([r.sequence for r in self.store.load_results("exp-1")], [0, 1, 2])

    def test_find_result(self):
        self.store.save_config(make_config())
        self.store.append_result(make_result(sequence=7))
        self.assertEqual(self.store.find_result("exp-1-0007").sequence, 7)
        with self.assertRaises(ValueError):
            self.store.find_result("exp-1")
        with self.assertRaises(FileNotFoundError):
            self.store.find_result("exp-1-0008")

    def test_ids_are_filesystem_safe_and_unique(self):
        first = self.store.new_experiment_id("byte[5]/../x")
        self.assertNotIn("/", first)
        self.assertFalse(first.startswith("."))
        self.store.save_config(make_config(first))
        second = self.store.new_experiment_id("byte[5]/../x")
        self.assertNotEqual(first, second)
        with self.assertRaises(ValueError):
            self.store.load_config("../outside")

    def test_list_experiments(self):
        self.store.save_config(make_config("a-1", created_at="2026-01-02T00:00:00+00:00"))
        self.store.save_config(make_config("b-1", created_at="2026-01-01T00:00:00+00:00"))
        self.assertEqual([c.experiment_id for c in self.store.list_experiments()], ["b-1", "a-1"])

    def test_hypotheses_saved_atomically(self):
        hyps = {h.hypothesis_id: h for h in seed_hypotheses()}
        self.store.save_hypotheses(hyps)
        self.assertEqual(set(self.store.load_hypotheses()), set(hyps))
        self.assertFalse(self.store.hypotheses_path.with_suffix(".json.tmp").exists())

    def test_captures_are_append_only_jsonl(self):
        cid = self.store.new_capture_id()
        self.store.append_capture(cid, {"rx": "10 11"})
        path = self.store.append_capture(cid, {"rx": "02 00"})
        lines = path.read_text(encoding="utf-8").splitlines()
        self.assertEqual([json.loads(line)["rx"] for line in lines], ["10 11", "02 00"])
        with self.assertRaises(ValueError):
            self.store.append_capture("../x", {})


if __name__ == "__main__":
    unittest.main()
