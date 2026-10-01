"""Runner: dry-run isolation, response correlation, safety controls, replay."""

import unittest
from unittest import mock

import support  # noqa: F401  (sys.path)
from support import NACK, NAV_ACK, FakeTransport, StoreTestCase
from fuzzing.experiment import ExperimentConfig, SafetyLimits
from fuzzing.mutator import NAV_SCHEMA, finalize_frame
from fuzzing.runner import ExperimentRunner
from fuzzing.transport import DryRunTransport
from packets import crc16


def candidates(n: int = 3):
    return NAV_SCHEMA.candidates("maneuver", [0x00, 0x10, 0x20, 0x30, 0x50, 0x60][:n])


def make_config(store, *, dry_run=True, **limits) -> ExperimentConfig:
    return ExperimentConfig(
        experiment_id=store.new_experiment_id("runner-test"), name="runner-test",
        command="nav", base_packet=finalize_frame(NAV_SCHEMA.base_payload()),
        strategy="field", target="maneuver", mutation_values=[],
        limits=SafetyLimits(**{"delay_s": 0.5, "cooldown_s": 0.0, **limits}),
        dry_run=dry_run,
    )


class DryRunTests(StoreTestCase):
    def test_dry_run_never_touches_the_transport(self):
        transport = DryRunTransport()
        report = ExperimentRunner(self.store, transport).run(make_config(self.store), candidates())
        self.assertEqual(transport.sent, [])
        self.assertFalse(transport.connected)
        self.assertFalse(report.transmitted)
        self.assertEqual(report.counts, {"DRY_RUN": 3})

    def test_a_non_transmitting_transport_forces_dry_run(self):
        config = make_config(self.store, dry_run=False)
        report = ExperimentRunner(self.store, DryRunTransport()).run(config, candidates())
        self.assertFalse(report.transmitted)
        self.assertTrue(self.store.load_config(config.experiment_id).dry_run)

    def test_every_stored_packet_has_a_valid_crc(self):
        config = make_config(self.store)
        ExperimentRunner(self.store).run(config, candidates(6))
        for r in self.store.load_results(config.experiment_id):
            frame = r.generated_packet
            self.assertEqual(crc16(frame[:18]), (frame[18] << 8) | frame[19])
            self.assertEqual(r.crc, (frame[18] << 8) | frame[19])

    def test_max_packets_truncates_with_a_warning(self):
        events = []
        config = make_config(self.store, max_packets=2)
        report = ExperimentRunner(self.store, on_event=events.append).run(config, candidates(6))
        self.assertEqual(len(report.results), 2)
        self.assertTrue(any("truncating" in e for e in events))


@mock.patch("fuzzing.runner.time.sleep")
class TransmitTests(StoreTestCase):
    def run_with(self, transport, n=3, observe=None, **limits):
        runner = ExperimentRunner(self.store, transport)
        config = make_config(self.store, dry_run=False, **limits)
        return runner, config, runner.run(config, candidates(n), observe=observe)

    def test_responses_are_correlated_per_packet(self, _sleep):
        transport = FakeTransport([NAV_ACK, None, NACK])
        _, config, report = self.run_with(transport)
        stored = self.store.load_results(config.experiment_id)
        self.assertEqual([r.response_status for r in stored], ["OK", "TIMEOUT", "OK"])
        self.assertEqual([r.response_label for r in stored], ["NAV_ACK", None, "NACK"])
        self.assertEqual(stored[0].response_packet, NAV_ACK)
        self.assertIsNotNone(stored[0].latency_ms)
        self.assertIsNone(stored[1].latency_ms)
        self.assertEqual(transport.sent, [r.generated_packet for r in stored])
        self.assertEqual((transport.connect_calls, transport.disconnect_calls), (1, 1))
        self.assertTrue(report.transmitted)

    def test_timeout_is_not_an_error(self, _sleep):
        _, _, report = self.run_with(FakeTransport(), abort_on_error=True)
        self.assertEqual(report.counts, {"TIMEOUT": 3})
        self.assertFalse(report.aborted)

    def test_abort_on_error_stops_the_batch(self, _sleep):
        transport = FakeTransport(fail_on={1})
        _, _, report = self.run_with(transport, n=4)
        self.assertEqual([r.response_status for r in report.results], ["TIMEOUT", "ERROR"])
        self.assertIn("radio failure", report.results[1].notes)
        self.assertTrue(report.aborted)
        self.assertEqual(transport.disconnect_calls, 1)

    def test_errors_can_be_tolerated_explicitly(self, _sleep):
        _, _, report = self.run_with(FakeTransport(fail_on={1}), n=4, abort_on_error=False)
        self.assertEqual(report.counts, {"TIMEOUT": 3, "ERROR": 1})

    def test_rate_limit_and_cooldown(self, sleep):
        self.run_with(FakeTransport(), n=3, delay_s=0.75, cooldown_s=2.0)
        self.assertEqual(sleep.call_args_list, [mock.call(0.75), mock.call(0.75), mock.call(2.0)])

    def test_emergency_stop(self, _sleep):
        holder = {}

        def observe(_result):
            holder["runner"].stop()

        runner = ExperimentRunner(self.store, FakeTransport())
        holder["runner"] = runner
        report = runner.run(make_config(self.store, dry_run=False), candidates(4), observe=observe)
        self.assertEqual(len(report.results), 1)
        self.assertTrue(report.aborted)

    def test_ctrl_c_mid_send_is_recorded_not_lost(self, _sleep):
        _, config, report = self.run_with(FakeTransport(interrupt_on={1}), n=4)
        stored = self.store.load_results(config.experiment_id)
        self.assertEqual([r.response_status for r in stored], ["TIMEOUT", "ABORTED"])
        self.assertIn("delivery unknown", stored[1].notes)
        self.assertTrue(report.aborted)

    def test_every_rx_is_kept_including_late_ones(self, _sleep):
        transport = FakeTransport(unsolicited={1: [NACK], 2: [NAV_ACK]})
        _, config, _ = self.run_with(transport, n=2)
        latest = self.store.load_results(config.experiment_id)
        self.assertEqual(latest[0].uncorrelated_rx, [])
        self.assertEqual(latest[1].uncorrelated_rx, [NACK, NAV_ACK])
        self.assertEqual(len(self.store.load_results(config.experiment_id, history=True)), 3)

    def test_observations_are_persisted(self, _sleep):
        def observe(result):
            result.device_state = "LEFT"

        _, config, _ = self.run_with(FakeTransport(), n=2, observe=observe)
        states = [r.device_state for r in self.store.load_results(config.experiment_id)]
        self.assertEqual(states, ["LEFT", "LEFT"])

    def test_connection_failure_leaves_no_experiment(self, _sleep):
        transport = FakeTransport(connect_error=RuntimeError("no RE_DISP found"))
        runner = ExperimentRunner(self.store, transport)
        with self.assertRaises(RuntimeError):
            runner.run(make_config(self.store, dry_run=False), candidates())
        self.assertEqual(self.store.list_experiments(), [])
        self.assertEqual(transport.disconnect_calls, 1)


class ReplayTests(StoreTestCase):
    def test_replay_reproduces_the_exact_frames(self):
        runner = ExperimentRunner(self.store)
        original = make_config(self.store)
        runner.run(original, candidates(3))
        report = runner.replay(original.experiment_id)
        replay = self.store.load_config(report.config.experiment_id)
        self.assertNotEqual(replay.experiment_id, original.experiment_id)
        self.assertEqual(replay.replay_of, original.experiment_id)
        self.assertEqual(replay.params["original_strategy"], "field")
        before = [r.generated_packet for r in self.store.load_results(original.experiment_id)]
        after = [r.generated_packet for r in report.results]
        self.assertEqual(after, before)

    def test_replay_of_unknown_experiment(self):
        with self.assertRaises(FileNotFoundError):
            ExperimentRunner(self.store).replay("missing-20260101-000000")


if __name__ == "__main__":
    unittest.main()
