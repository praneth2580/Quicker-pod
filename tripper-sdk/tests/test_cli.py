"""CLI and example end-to-end, with the radio replaced by fakes."""

import contextlib
import importlib.util
import io
import os
import unittest
from unittest import mock

import support  # noqa: F401  (sys.path)
from support import NACK, NAV_ACK, FakeTransport, StoreTestCase
import tripper
from fuzzing.analyzer import compare
from fuzzing.mutator import NAV_SCHEMA
from packets import crc16

EXAMPLE = os.path.join(support.SDK_DIR, "examples", "nav_maneuver_discovery.py")


class CliTests(StoreTestCase):
    def cli(self, *argv, stdin=""):
        out, err = io.StringIO(), io.StringIO()
        with contextlib.redirect_stdout(out), contextlib.redirect_stderr(err), \
                mock.patch("sys.stdin", io.StringIO(stdin)):
            code = tripper.main(list(argv))
        return code, out.getvalue(), err.getvalue()

    def with_store(self, *argv, **kwargs):
        return self.cli(*argv, "--data-dir", self.tmpdir, **kwargs)

    def test_generate_prints_a_crc_valid_frame(self):
        code, out, _ = self.cli("generate", "nav", "--set", "maneuver=0x20", "--set", "distance=500")
        self.assertEqual(code, 0)
        frame = bytes.fromhex(out.splitlines()[1])
        self.assertEqual((frame[3:5], frame[5]), (b"\x01\xF4", 0x20))
        self.assertEqual(crc16(frame[:18]), (frame[18] << 8) | frame[19])

    def test_fuzz_field_dry_run_is_stored(self):
        code, out, _ = self.with_store("fuzz", "field", "--field", "maneuver", "--values", "0x10,0x20")
        self.assertEqual(code, 0)
        self.assertIn("[dry-run]", out)
        (config,) = self.store.list_experiments()
        results = self.store.load_results(config.experiment_id)
        self.assertEqual([r.mutation_value for r in results], [0x10, 0x20])
        self.assertEqual({r.response_status for r in results}, {"DRY_RUN"})

    def test_analyze_separates_observed_from_inferred(self):
        self.with_store("fuzz", "field", "--field", "distance", "--values", "100,200,500")
        (config,) = self.store.list_experiments()
        code, out, _ = self.with_store("analyze", config.experiment_id)
        self.assertEqual(code, 0)
        self.assertIn("=== OBSERVED", out)
        self.assertIn("NOT confirmed", out)
        self.assertIn("offset 3-4 may carry the value as uint16_be", out)

    def test_safety_refusals_store_nothing(self):
        refusals = [
            ("fuzz", "byte", "--offset", "5", "--delay", "0.1"),
            ("fuzz", "byte", "--offset", "0"),
            ("fuzz", "byte", "--offset", "18"),
            ("fuzz", "field", "--field", "maneuver", "--values", "300"),
            ("send", "99" + "00" * 17),
        ]
        for argv in refusals:
            with self.subTest(argv=argv):
                code, _, err = self.with_store(*argv)
                self.assertEqual(code, 2)
                self.assertIn("error:", err)
        self.assertEqual(self.store.list_experiments(), [])

    def test_transmission_needs_interactive_confirmation(self):
        with mock.patch.object(tripper, "BleTransport") as ble:
            code, _, err = self.with_store("fuzz", "field", "--field", "maneuver",
                                           "--values", "0x10", "--confirm-send")
        self.assertEqual(code, 2)
        self.assertIn("refusing to transmit", err)
        ble.assert_not_called()
        self.assertEqual(self.store.list_experiments(), [])

    @mock.patch("fuzzing.runner.time.sleep")
    def test_confirmed_transmission_records_the_transport(self, _sleep):
        fake = FakeTransport()
        with mock.patch.object(tripper, "BleTransport", return_value=fake):
            code, _, _ = self.with_store("fuzz", "field", "--field", "maneuver", "--values",
                                         "0x10,0x20", "--confirm-send", "--yes", "--quiet")
        self.assertEqual(code, 0)
        (config,) = self.store.list_experiments()
        self.assertFalse(config.dry_run)
        self.assertEqual(config.params["transport"]["handshake"], "known")
        self.assertEqual(len(fake.sent), 2)
        self.assertEqual({r.response_status for r in self.store.load_results(config.experiment_id)},
                         {"TIMEOUT"})

    def test_observe_rejects_packets_that_were_never_sent(self):
        self.with_store("fuzz", "field", "--field", "maneuver", "--values", "0x10")
        (config,) = self.store.list_experiments()
        code, _, err = self.with_store("observe", f"{config.experiment_id}-0000", "--state", "left")
        self.assertEqual(code, 2)
        self.assertIn("never delivered", err)

    def test_hypothesis_workflow(self):
        self.assertEqual(self.with_store("hypotheses", "seed")[0], 0)
        _, out, _ = self.with_store("hypotheses", "list")
        self.assertIn("[UNKNOWN] nav.maneuver@5:uint8-app-labels", out)
        self.with_store("fuzz", "field", "--field", "maneuver", "--values", "0x10,0x20")
        (config,) = self.store.list_experiments()
        _, out, _ = self.with_store("hypotheses", "ingest", "nav.maneuver@5:uint8-app-labels",
                                    config.experiment_id)
        self.assertIn("INCONCLUSIVE", out)

    def test_capture_is_passive_and_recorded(self):
        class Listener:
            def __init__(self):
                self.queue = [NAV_ACK, NACK]

            def connect(self):
                pass

            def disconnect(self):
                pass

            def wait_response(self, timeout):
                return self.queue.pop(0) if self.queue else None

        with mock.patch.object(tripper, "BleTransport", return_value=Listener()):
            code, out, _ = self.with_store("capture", "--seconds", "5", "--handshake", "none")
        self.assertEqual(code, 0)
        self.assertIn("2 notification(s)", out)
        (path,) = self.store.captures_dir.iterdir()
        self.assertEqual(len(path.read_text(encoding="utf-8").splitlines()), 2)

    def test_capture_refuses_a_transmitting_handshake_without_confirmation(self):
        with mock.patch.object(tripper, "BleTransport") as ble:
            code, _, err = self.with_store("capture", "--seconds", "1")
        self.assertEqual(code, 2)
        self.assertIn("--handshake none", err)
        ble.assert_not_called()

    def test_compare(self):
        a = "10 11 14 00 64 40 40 40 00 64 41 00 00 01 00 00 00 00 ED 67"
        b = "10 11 14 00 C8 40 40 40 00 C8 41 00 00 01 00 00 00 00 9C 46"
        code, out, _ = self.cli("compare", a, b)
        self.assertEqual(code, 0)
        self.assertIn("offset 4: 0x64 -> 0xC8", out)
        self.assertIn("offset 9: 0x64 -> 0xC8", out)


class ExampleTests(StoreTestCase):
    def test_maneuver_discovery_dry_run_mutates_only_byte_5(self):
        spec = importlib.util.spec_from_file_location("nav_maneuver_discovery", EXAMPLE)
        example = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(example)
        with contextlib.redirect_stdout(io.StringIO()) as out:
            self.assertEqual(example.main(["--data-dir", self.tmpdir]), 0)
        self.assertIn("NAVIGATION MANEUVER DISCOVERY", out.getvalue())
        (config,) = self.store.list_experiments()
        base = NAV_SCHEMA.base_payload()
        for r in self.store.load_results(config.experiment_id):
            self.assertLessEqual({d.offset for d in compare(base, r.generated_packet)}, {5})
            self.assertEqual(r.response_status, "DRY_RUN")
        self.assertEqual(self.store.load_hypotheses(), {})  # dry-run never records evidence


if __name__ == "__main__":
    unittest.main()
