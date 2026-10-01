"""Mutation engine: one field/byte at a time, CRC always recomputed, guards hold."""

import unittest

import support  # noqa: F401  (sys.path)
from fuzzing.analyzer import compare
from fuzzing.experiment import Candidate
from fuzzing.mutator import (
    NAV_SCHEMA,
    bit_toggle,
    boundary_sweep,
    documented_maneuver_bytes,
    encoding_hypotheses,
    exhaustive_byte,
    finalize_frame,
    get_schema,
    mutate_byte,
    mutate_int,
    small_value_sweep,
)
from packets import crc16

BASE = NAV_SCHEMA.base_payload()

# Where build_nav_packet writes each logical field (from the code under test).
FIELD_OFFSETS = {
    "screen": {2},
    "maneuver": {5},
    "heading": {6},
    "speedflags": {7},
    "roadtype": {10},
    "eta": {12},
    "distance": {3, 4, 8, 9},
}


def changed(candidate) -> set[int]:
    return {d.offset for d in compare(BASE, candidate.payload)}


class OneFieldAtATimeTests(unittest.TestCase):
    def test_each_nav_field_touches_only_its_own_bytes(self):
        for name, allowed in FIELD_OFFSETS.items():
            for c in NAV_SCHEMA.candidates(name):
                with self.subTest(field=name, value=c.mutation_value):
                    self.assertLessEqual(changed(c), allowed)

    def test_every_candidate_gets_a_fresh_valid_crc(self):
        base_crc = finalize_frame(BASE)[18:]
        for c in NAV_SCHEMA.candidates("maneuver"):
            frame = finalize_frame(c.payload)
            self.assertEqual(crc16(frame[:18]), (frame[18] << 8) | frame[19])
            if c.payload != BASE:
                self.assertNotEqual(frame[18:], base_crc)

    def test_raw_byte_modes(self):
        self.assertEqual([c.mutation_value for c in exhaustive_byte(BASE, 5)], list(range(256)))
        self.assertEqual([c.mutation_value for c in small_value_sweep(BASE, 5)], list(range(16)))
        for c in mutate_byte(BASE, 12, [0, 7, 0xFF]):
            self.assertLessEqual(changed(c), {12})

    def test_bit_toggle_flips_exactly_one_bit(self):
        candidates = bit_toggle(BASE, 7)
        self.assertEqual(len(candidates), 8)
        for bit, c in enumerate(candidates):
            diffs = compare(BASE, c.payload)
            self.assertEqual(len(diffs), 1)
            self.assertEqual(diffs[0].changed_bits, [bit])

    def test_mutate_int_skips_instead_of_truncating(self):
        candidates, skipped = mutate_int(BASE, 3, "uint8", [1, 255, 256, 1000])
        self.assertEqual([c.mutation_value for c in candidates], [1, 255])
        self.assertEqual(skipped, [256, 1000])

    def test_boundary_sweep_stays_in_range(self):
        values = [c.mutation_value for c in boundary_sweep(BASE, 12, "uint8")]
        self.assertTrue(values and max(values) <= 0xFF)
        values16 = [c.mutation_value for c in boundary_sweep(BASE, 3, "uint16_be")]
        self.assertIn(65535, values16)

    def test_encoding_hypotheses_write_each_encoding_at_the_offset(self):
        candidates = encoding_hypotheses(BASE, 3, [500])
        by_enc = {c.encoding: c.payload for c in candidates}
        self.assertNotIn("uint8", by_enc)  # 500 does not fit
        self.assertEqual(by_enc["uint16_be"][3:5], b"\x01\xF4")
        self.assertEqual(by_enc["uint16_le"][3:5], b"\xF4\x01")
        self.assertEqual(by_enc["uint16_be"][8:10], BASE[8:10])  # duplicate untouched

    def test_encodings_past_the_payload_are_skipped(self):
        encs = {c.encoding for c in encoding_hypotheses(BASE, 16, [1])}
        self.assertEqual(encs, {"uint8", "uint16_le", "uint16_be"})


class GuardTests(unittest.TestCase):
    def test_header_bytes_protected_by_default(self):
        for offset in (0, 1):
            with self.assertRaises(ValueError):
                mutate_byte(BASE, offset, [0])
        self.assertEqual(len(mutate_byte(BASE, 0, [0x10], allow_header=True)), 1)

    def test_crc_bytes_can_never_be_mutated(self):
        for offset in (18, 19):
            with self.assertRaises(ValueError):
                mutate_byte(BASE, offset, [0], allow_header=True)
        with self.assertRaises(ValueError):
            mutate_int(BASE, 17, "uint16_be", [1])

    def test_out_of_range_values_rejected(self):
        with self.assertRaises(ValueError):
            mutate_byte(BASE, 5, [256])
        with self.assertRaises(ValueError):
            NAV_SCHEMA.candidates("maneuver", [300])

    def test_candidate_payload_must_be_18_bytes(self):
        with self.assertRaises(ValueError):
            Candidate(bytes(20), "x", 0)


class SchemaTests(unittest.TestCase):
    def test_field_names_are_forgiving(self):
        self.assertEqual(NAV_SCHEMA.resolve_field("speed_flags")[0], "speedflags")
        self.assertEqual(NAV_SCHEMA.resolve_field("Dist")[0], "distance")
        with self.assertRaises(ValueError):
            NAV_SCHEMA.resolve_field("bogus")

    def test_overrides_accept_field_or_builder_names(self):
        self.assertEqual(NAV_SCHEMA.base_kwargs(distance=500), NAV_SCHEMA.base_kwargs(dist_meters=500))
        with self.assertRaises(ValueError):
            NAV_SCHEMA.base_kwargs(nonsense=1)

    def test_other_fields_stay_fixed_under_overrides(self):
        for c in NAV_SCHEMA.candidates("maneuver", [0x10, 0x20], {"distance": 500}):
            self.assertEqual(c.payload[3:5], b"\x01\xF4")

    def test_documented_maneuver_bytes_cover_both_tables(self):
        values = documented_maneuver_bytes()
        for v in (0x00, 0x10, 0x20, 0x30, 0x40, 0x50, 0x60, 0x21, 0x3F):
            self.assertIn(v, values)
        self.assertNotIn(0xFF, values)

    def test_compass_and_time_schemas_exist(self):
        compass = get_schema("compass").candidates("direction", [0x10, 0x60])
        self.assertEqual([c.payload[14] for c in compass], [0x10, 0x60])
        hours = get_schema("time").candidates("hour", [0, 23])
        self.assertEqual([c.payload[1] for c in hours], [0, 23])
        with self.assertRaises(ValueError):
            get_schema("ota")


if __name__ == "__main__":
    unittest.main()
