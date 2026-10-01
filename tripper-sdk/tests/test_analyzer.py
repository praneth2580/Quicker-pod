"""Packet comparison and field-location discovery."""

import unittest

import support  # noqa: F401  (sys.path)
from fuzzing.analyzer import (
    compare,
    detect_bitfield,
    detect_enum,
    discover_field,
    find_value,
    summarize_series,
)
from fuzzing.experiment import EvidenceLevel
from fuzzing.mutator import NAV_SCHEMA, finalize_frame
from packets import build_nav_packet


def distance_samples(values):
    return [(v, build_nav_packet(0x14, v, 0x40)) for v in values]


class CompareTests(unittest.TestCase):
    def test_reports_offsets_values_and_bits(self):
        a = build_nav_packet(0x14, 100, 0x40)
        b = build_nav_packet(0x14, 200, 0x40)
        diffs = compare(a, b)
        self.assertEqual([d.offset for d in diffs], [4, 9])
        self.assertEqual((diffs[0].old, diffs[0].new), (0x64, 0xC8))
        self.assertEqual(diffs[0].changed_bits, [2, 3, 5, 7])

    def test_crc_bytes_are_never_reported(self):
        payload = NAV_SCHEMA.base_payload()
        stale = payload + b"\x00\x00"
        self.assertEqual(compare(finalize_frame(payload), stale), [])

    def test_series_summary(self):
        summary = summarize_series([p for _, p in distance_samples([100, 200, 500])])
        self.assertEqual(summary.varying_offsets, [3, 4, 8, 9])
        self.assertEqual(summary.values_by_offset[4], [0x64, 0xC8, 0xF4])
        self.assertIn(5, summary.constant_offsets)


class DiscoveryTests(unittest.TestCase):
    def test_finds_both_distance_copies_as_uint16_be(self):
        found = discover_field(distance_samples([100, 200, 500, 1000]))
        placements = {(c.offset, c.encoding) for c in found}
        self.assertEqual(placements, {(3, "uint16_be"), (8, "uint16_be")})
        self.assertTrue(all(c.confidence == "HIGH" for c in found))

    def test_never_emits_more_than_observed(self):
        for c in discover_field(distance_samples([100, 200, 500])):
            self.assertEqual(c.evidence_level, EvidenceLevel.OBSERVED.value)
            self.assertIn("may carry", c.inference())

    def test_small_values_prefer_the_narrow_placement(self):
        found = discover_field(distance_samples([10, 20, 30]))
        conf = {(c.offset, c.encoding): c.confidence for c in found}
        self.assertEqual(conf[(4, "uint8")], "HIGH")
        self.assertEqual(conf[(9, "uint8")], "HIGH")
        self.assertEqual(conf[(3, "uint16_be")], "MEDIUM")

    def test_two_values_are_never_high_confidence(self):
        found = discover_field(distance_samples([100, 1000]))
        self.assertTrue(found)
        self.assertNotIn("HIGH", {c.confidence for c in found})

    def test_single_sample_is_refused(self):
        with self.assertRaises(ValueError):
            discover_field(distance_samples([100]))

    def test_constant_bytes_are_not_a_field(self):
        # The same value twice never changes any byte, so nothing qualifies.
        self.assertEqual(discover_field(distance_samples([100, 100])), [])

    def test_find_value_lists_every_placement(self):
        hits = find_value(build_nav_packet(0x14, 200, 0x40), 200)
        self.assertIn((4, "uint8"), hits)
        self.assertIn((3, "uint16_be"), hits)
        self.assertIn((8, "uint16_be"), hits)


class PatternTests(unittest.TestCase):
    def test_bitfield_progression(self):
        base = bytearray(NAV_SCHEMA.base_payload())
        packets = []
        for value in (0x00, 0x01, 0x03, 0x07):
            base[7] = value
            packets.append(bytes(base))
        self.assertEqual(detect_bitfield(packets), [7])

    def test_enum_grouping(self):
        obs = detect_enum([(0x10, "LEFT"), (0x20, "RIGHT"), (0x10, "LEFT")], "maneuver")
        self.assertEqual(obs.mapping, {0x10: ["LEFT", "LEFT"], 0x20: ["RIGHT"]})
        self.assertIn("0x10", obs.describe())


if __name__ == "__main__":
    unittest.main()
