"""Transports that carry a finalized 20-byte frame to the Tripper (or nowhere).

The runner talks to this small synchronous interface so its logic is identical
whether packets are really transmitted or not:

    connect() / disconnect()
    send(frame, label)                     transmit one frame; returns once written
    wait_response(timeout) -> bytes | None None means nothing arrived in time
    take_unsolicited() -> list[bytes]      notifications nobody waited for

No notification is ever discarded: anything that arrives outside a packet's
correlation window is handed back by take_unsolicited() so the runner can
persist it.

DryRunTransport is the default and needs no hardware or bleak. BleTransport
wraps the existing async TripperBleClient (ble.py) and is imported lazily, so
this module imports fine on machines without bleak installed.
"""

from __future__ import annotations

from typing import Callable, Optional, Protocol, runtime_checkable

HANDSHAKES = ("none", "known", "pin")
WRITE_TIMEOUT_S = 5.0


@runtime_checkable
class Transport(Protocol):
    def connect(self) -> None: ...
    def disconnect(self) -> None: ...
    def send(self, frame: bytes, label: str = "") -> None: ...
    def wait_response(self, timeout: float) -> Optional[bytes]: ...
    def take_unsolicited(self) -> list[bytes]: ...

    @property
    def transmits(self) -> bool: ...


class DryRunTransport:
    """Records frames instead of transmitting them. Never touches a radio."""

    def __init__(self) -> None:
        self.sent: list[tuple[bytes, str]] = []
        self.connected = False

    @property
    def transmits(self) -> bool:
        return False

    def connect(self) -> None:
        self.connected = True

    def disconnect(self) -> None:
        self.connected = False

    def send(self, frame: bytes, label: str = "") -> None:
        if len(frame) != 20:
            raise ValueError(f"frame must be 20 bytes, got {len(frame)}")
        self.sent.append((bytes(frame), label))

    def wait_response(self, timeout: float) -> Optional[bytes]:
        return None

    def take_unsolicited(self) -> list[bytes]:
        return []


class BleTransport:
    """Real transmission over BLE via TripperBleClient, driven from a background
    asyncio loop so the runner can stay synchronous.

    handshake:
      "known" — reconnect path (CLOSE, SET TIME, PING FW) for an already-paired pod
      "pin"   — SHOW PIN, then pin_prompt() supplies the code shown on the pod
      "none"  — connect only (packets may be ignored without a session)

    Notifications are queued as they arrive. wait_response() takes the first one
    after a send; the runner drains the rest via take_unsolicited() before the
    next send, so late replies are recorded rather than mis-correlated.
    """

    def __init__(
        self,
        address: Optional[str] = None,
        *,
        handshake: str = "known",
        pin_prompt: Optional[Callable[[], str]] = None,
        on_event: Optional[Callable[[str], None]] = None,
        connect_timeout: float = 20.0,
    ) -> None:
        if handshake not in HANDSHAKES:
            raise ValueError(f"handshake must be one of {HANDSHAKES}")
        if handshake == "pin" and pin_prompt is None:
            raise ValueError("handshake='pin' needs a pin_prompt callback")
        self.address = address
        self.handshake = handshake
        self.pin_prompt = pin_prompt
        self.on_event = on_event or (lambda _msg: None)
        self.connect_timeout = connect_timeout
        self._client = None
        self._loop = None
        self._thread = None
        self._responses = None  # queue.Queue[bytes]

    @property
    def transmits(self) -> bool:
        return True

    def connect(self) -> None:
        import asyncio
        import queue
        import threading

        try:
            import ble  # lazy: only needs bleak when actually transmitting
        except ImportError as exc:  # pragma: no cover - depends on environment
            raise RuntimeError(
                "Physical transmission needs bleak. Install it with "
                "`pip install -r tripper-sdk/requirements.txt`."
            ) from exc

        self._responses = queue.Queue()
        self._loop = asyncio.new_event_loop()
        self._thread = threading.Thread(target=self._loop.run_forever, daemon=True)
        self._thread.start()

        async def create_client():
            # Built inside the loop so its asyncio.Queue binds to this loop.
            return ble.TripperBleClient(self.address)

        client = self._run(create_client(), timeout=5.0)

        def on_notification(resp) -> None:
            self._responses.put(bytes(resp.raw))

        client.on_notification = on_notification
        self._client = client
        self._run(client.connect(self.address), timeout=self.connect_timeout)
        self.on_event(f"connected to {client.device_address}")
        self._handshake(client)

    def _handshake(self, client) -> None:
        import asyncio
        import concurrent.futures

        from parser import is_pin_accepted

        if self.handshake == "known":
            self._run(client.start_handshake(known_device=True), timeout=10.0)
            self.on_event("known-device handshake sent (CLOSE, SET TIME, PING FW)")
        elif self.handshake == "pin":
            self._run(client.start_handshake(known_device=False), timeout=10.0)
            pin = self.pin_prompt()
            try:
                auth = self._run(client.send_pin(pin), timeout=10.0)
            except (TimeoutError, asyncio.TimeoutError, concurrent.futures.TimeoutError):
                self.on_event(
                    "no AUTH notification (the pod usually answers via the phone GATT "
                    "server, which a BLE client can't host) — continuing"
                )
            else:
                if not is_pin_accepted(auth):
                    raise RuntimeError("Tripper rejected the PIN")
            self._run(client.run_post_pin_sequence(), timeout=10.0)
            self.on_event("PIN handshake complete")

    async def _send_and_flush(self, frame: bytes, label: str) -> None:
        await self._client.enqueue(frame, label)
        # TripperBleClient's writer calls task_done() only after the GATT write,
        # so latency is measured from the real write, not from enqueue time.
        await self._client._write_queue.join()

    def _run(self, coro, timeout: float):
        import asyncio

        if self._loop is None:  # pragma: no cover - misuse guard
            raise RuntimeError("BleTransport.connect() was not called")
        future = asyncio.run_coroutine_threadsafe(coro, self._loop)
        return future.result(timeout=timeout)

    def send(self, frame: bytes, label: str = "") -> None:
        import concurrent.futures

        if self._client is None:
            raise RuntimeError("BleTransport.connect() was not called")
        if len(frame) != 20:
            raise ValueError(f"frame must be 20 bytes, got {len(frame)}")
        try:
            self._run(self._send_and_flush(bytes(frame), label), timeout=WRITE_TIMEOUT_S)
        except (TimeoutError, concurrent.futures.TimeoutError) as exc:
            raise RuntimeError(
                f"GATT write did not complete within {WRITE_TIMEOUT_S}s (link lost?)"
            ) from exc

    def wait_response(self, timeout: float) -> Optional[bytes]:
        import queue

        try:
            return self._responses.get(timeout=timeout)
        except queue.Empty:
            return None

    def take_unsolicited(self) -> list[bytes]:
        import queue

        out: list[bytes] = []
        if self._responses is None:
            return out
        while True:
            try:
                out.append(self._responses.get_nowait())
            except queue.Empty:
                return out

    def disconnect(self) -> None:
        if self._client is not None:
            try:
                self._run(self._client.disconnect(), timeout=5.0)
            except Exception as exc:  # best effort; the loop is torn down regardless
                self.on_event(f"disconnect failed: {exc}")
            finally:
                self._client = None
        if self._loop is not None:
            self._loop.call_soon_threadsafe(self._loop.stop)
            if self._thread is not None:
                self._thread.join(timeout=2.0)
            if not self._loop.is_running():
                self._loop.close()
            self._loop = None
            self._thread = None
