"""Shared test helpers. Importing this module puts tripper-sdk on sys.path,
matching the SDK's flat-import convention (import packets, import fuzzing)."""

from __future__ import annotations

import os
import shutil
import sys
import tempfile
import unittest
from typing import Optional

SDK_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if SDK_DIR not in sys.path:
    sys.path.insert(0, SDK_DIR)

from fuzzing.storage import ExperimentStore  # noqa: E402

NAV_ACK = bytes([0x10, 0x11] + [0] * 18)
NACK = bytes([0x02] + [0] * 19)


class StoreTestCase(unittest.TestCase):
    """Gives each test a fresh ExperimentStore in a temporary directory."""

    def setUp(self) -> None:
        super().setUp()
        self.tmpdir = tempfile.mkdtemp(prefix="tripper-fuzz-test-")
        self.store = ExperimentStore(self.tmpdir)

    def tearDown(self) -> None:
        shutil.rmtree(self.tmpdir, ignore_errors=True)
        super().tearDown()


class FakeTransport:
    """A transmitting transport double, scripted per send index.

    responses[i]     notification returned after send i (None = timeout)
    fail_on          send indexes that raise a transport error
    interrupt_on     send indexes that raise KeyboardInterrupt (operator Ctrl-C)
    unsolicited[i]   notifications pending just before send i; key len(sends)
                     is what arrives during the final cooldown
    """

    def __init__(
        self,
        responses: Optional[list[Optional[bytes]]] = None,
        *,
        fail_on=(),
        interrupt_on=(),
        unsolicited: Optional[dict[int, list[bytes]]] = None,
        connect_error: Optional[BaseException] = None,
    ) -> None:
        self.responses = list(responses or [])
        self.fail_on = set(fail_on)
        self.interrupt_on = set(interrupt_on)
        self.unsolicited = {k: list(v) for k, v in (unsolicited or {}).items()}
        self.connect_error = connect_error
        self.sent: list[bytes] = []
        self.connect_calls = 0
        self.disconnect_calls = 0

    @property
    def transmits(self) -> bool:
        return True

    def connect(self) -> None:
        self.connect_calls += 1
        if self.connect_error is not None:
            raise self.connect_error

    def disconnect(self) -> None:
        self.disconnect_calls += 1

    def send(self, frame: bytes, label: str = "") -> None:
        index = len(self.sent)
        self.sent.append(bytes(frame))
        if index in self.interrupt_on:
            raise KeyboardInterrupt
        if index in self.fail_on:
            raise RuntimeError(f"radio failure on send {index}")

    def wait_response(self, timeout: float) -> Optional[bytes]:
        index = len(self.sent) - 1
        return self.responses[index] if index < len(self.responses) else None

    def take_unsolicited(self) -> list[bytes]:
        return self.unsolicited.pop(len(self.sent), [])
