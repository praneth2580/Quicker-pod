"""Integer encodings, endianness, and value-range rules."""

import unittest

import support  # noqa: F401  (sys.path)
from fuzzing.encoding import (
    BOUNDARY_VALUES,
    ENCODINGS,
    SMALL_VALUES,
    all_encodings,
    boundary_values,
    can_represent,
    decode_int,
    encode_int,
    encoding_width,
    max_value,
    representations,
)


class EncodingTests(unittest.TestCase):
    def test_widths(self):
        expected = {"uint8": 1, "uint16_le": 2, "uint16_be": 2, "uint24_le": 3,
                    "uint24_be": 3, "uint32_le": 4, "uint32_be": 4}
        self.assertEqual({e: encoding_width(e) for e in ENCODINGS}, expected)
        with self.assertRaises(ValueError):
            encoding_width("int16")

    def test_endianness(self):
        self.assertEqual(encode_int(0x0102, "uint16_be"), b"\x01\x02")
        self.assertEqual(encode_int(0x0102, "uint16_le"), b"\x02\x01")
        self.assertEqual(encode_int(0x010203, "uint24_be"), b"\x01\x02\x03")
        self.assertEqual(encode_int(0x010203, "uint24_le"), b"\x03\x02\x01")
        self.assertEqual(encode_int(0x01020304, "uint32_be"), b"\x01\x02\x03\x04")
        self.assertEqual(encode_int(0x01020304, "uint32_le"), b"\x04\x03\x02\x01")

    def test_decode_respects_endianness(self):
        self.assertEqual(decode_int(b"\x01\x02", "uint16_be"), 0x0102)
        self.assertEqual(decode_int(b"\x01\x02", "uint16_le"), 0x0201)
        with self.assertRaises(ValueError):
            decode_int(b"\x01", "uint16_be")

    def test_round_trip_every_encoding(self):
        for enc in ENCODINGS:
            for value in (0, 1, 100, 0xFF, max_value(enc)):
                if can_represent(value, enc):
                    with self.subTest(enc=enc, value=value):
                        self.assertEqual(decode_int(encode_int(value, enc), enc), value)

    def test_representations_of_100(self):
        reps = representations(100)
        self.assertEqual(reps["uint8"], b"\x64")
        self.assertEqual(reps["uint16_be"], b"\x00\x64")
        self.assertEqual(reps["uint16_le"], b"\x64\x00")
        self.assertEqual(reps["uint24_be"], b"\x00\x00\x64")
        self.assertEqual(reps["uint32_le"], b"\x64\x00\x00\x00")

    def test_unrepresentable_values_are_excluded_not_truncated(self):
        self.assertNotIn("uint8", all_encodings(256))
        self.assertTrue(can_represent(255, "uint8"))
        self.assertFalse(can_represent(256, "uint8"))
        self.assertFalse(can_represent(-1, "uint16_be"))
        self.assertTrue(can_represent(65535, "uint16_le"))
        self.assertFalse(can_represent(65536, "uint16_le"))
        self.assertTrue(can_represent(2**24 - 1, "uint24_be"))
        self.assertFalse(can_represent(2**32, "uint32_be"))
        with self.assertRaises(ValueError):
            encode_int(256, "uint8")

    def test_boundary_values_filtered_per_encoding(self):
        uint8 = list(boundary_values("uint8"))
        self.assertEqual(uint8, [v for v in BOUNDARY_VALUES if v <= 0xFF])
        self.assertIn(255, uint8)
        self.assertNotIn(256, uint8)
        self.assertEqual(list(boundary_values("uint16_be")), list(BOUNDARY_VALUES))

    def test_small_value_sweep(self):
        self.assertEqual(SMALL_VALUES, tuple(range(16)))


if __name__ == "__main__":
    unittest.main()
