"""CRC and packet generation, pinned to packets the existing code already uses."""

import unittest

import support  # noqa: F401  (sys.path)
from fuzzing.mutator import NAV_SCHEMA, finalize_frame, frame_crc, payload_of
from packets import (
    PKT_CLOSE,
    PKT_NAV_IDLE,
    PKT_PIN_SHOW,
    PKT_PING_FW,
    PKT_PING_WP,
    PKT_STOP_NAV,
    build_compass_packet,
    build_nav_packet,
    crc16,
    to_hex,
)

# Regression fixtures: the literal frames hard-coded in packets.py.
KNOWN_FRAMES = {
    "PIN_SHOW": PKT_PIN_SHOW,
    "CLOSE": PKT_CLOSE,
    "PING_FW": PKT_PING_FW,
    "PING_WP": PKT_PING_WP,
    "STOP_NAV": PKT_STOP_NAV,
    "NAV_IDLE": PKT_NAV_IDLE,
}

BASE_NAV_HEX = "10 11 14 00 C8 40 40 40 00 C8 41 00 00 01 00 00 00 00 9C 46"


class CrcTests(unittest.TestCase):
    def test_crc16_ccitt_false_check_value(self):
        self.assertEqual(crc16(b"123456789"), 0x29B1)

    def test_known_frames_carry_valid_crc(self):
        for name, frame in KNOWN_FRAMES.items():
            with self.subTest(name):
                self.assertEqual(len(frame), 20)
                self.assertEqual(crc16(frame[:18]), frame_crc(frame))

    def test_finalize_frame_reproduces_known_frames(self):
        for name, frame in KNOWN_FRAMES.items():
            with self.subTest(name):
                self.assertEqual(finalize_frame(frame[:18]), frame)

    def test_crc_is_big_endian_in_bytes_18_19(self):
        frame = finalize_frame(bytes(18))
        crc = crc16(bytes(18))
        self.assertEqual(frame[18:], bytes([crc >> 8, crc & 0xFF]))

    def test_wrong_lengths_rejected(self):
        with self.assertRaises(ValueError):
            finalize_frame(bytes(20))
        with self.assertRaises(ValueError):
            frame_crc(bytes(18))
        with self.assertRaises(ValueError):
            payload_of(bytes(19))


class PacketGenerationTests(unittest.TestCase):
    def test_reference_nav_frame(self):
        self.assertEqual(to_hex(build_nav_packet(0x14, 200, 0x40)), BASE_NAV_HEX)

    def test_schema_base_is_the_existing_builder_output(self):
        self.assertEqual(to_hex(finalize_frame(NAV_SCHEMA.base_payload())), BASE_NAV_HEX)

    def test_distance_is_written_big_endian_twice(self):
        frame = build_nav_packet(0x14, 0x1234, 0x40)
        self.assertEqual(frame[3:5], b"\x12\x34")
        self.assertEqual(frame[8:10], b"\x12\x34")

    def test_compass_direction_at_byte_14(self):
        self.assertEqual(build_compass_packet(0x60)[14], 0x60)

    def test_payload_of_accepts_payload_or_frame(self):
        frame = build_nav_packet(0x14, 200, 0x40)
        self.assertEqual(payload_of(frame), frame[:18])
        self.assertEqual(payload_of(frame[:18]), frame[:18])


if __name__ == "__main__":
    unittest.main()
