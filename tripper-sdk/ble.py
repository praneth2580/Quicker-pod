"""Async BLE client for the Royal Enfield Tripper pod (requires bleak)."""

from __future__ import annotations

import asyncio
from typing import Awaitable, Callable, Optional

from packets import (
    PKT_CLOSE,
    PKT_PING_FW,
    PKT_PING_WP,
    PKT_PIN_SHOW,
    build_loading_screen,
    build_pin_packet,
    build_set_time_now_packet,
    to_hex,
)
from parser import TripperResponse, is_pin_accepted, parse_response

try:
    from bleak import BleakClient, BleakScanner
except ImportError as exc:  # pragma: no cover
    raise ImportError("bleak is required: pip install bleak") from exc

DEVICE_NAME = "RE_DISP"
SERVICE_UUID = "01FF0100-BA5E-F4EE-5CA1-EB1E5E4B1CE0"
CHAR_UUID = "01FF0101-BA5E-F4EE-5CA1-EB1E5E4B1CE0"
CCCD_UUID = "00002902-0000-1000-8000-00805f9b34fb"

DELAY_PRE_HANDSHAKE_S = 0.2
DELAY_SHOW_PIN_UI_S = 0.3
DELAY_CLOSE_TO_TIME_S = 0.2
DELAY_TIME_TO_PING_S = 0.15
DELAY_PING_TO_READY_S = 0.3
DELAY_INTER_WRITE_S = 0.08

NotificationHandler = Callable[[TripperResponse], Awaitable[None] | None]


class TripperBleClient:
    def __init__(self, device_address: Optional[str] = None) -> None:
        self.device_address = device_address
        self._client: Optional[BleakClient] = None
        self._write_queue: asyncio.Queue[tuple[bytes, str]] = asyncio.Queue()
        self._writer_task: Optional[asyncio.Task] = None
        self.on_notification: Optional[NotificationHandler] = None
        self.known_device: bool = False

    @property
    def connected(self) -> bool:
        return bool(self._client and self._client.is_connected)

    async def scan(self, timeout: float = 8.0) -> list[str]:
        devices = await BleakScanner.discover(timeout=timeout)
        return [
            d.address
            for d in devices
            if (d.name or "").upper() == DEVICE_NAME or DEVICE_NAME in (d.name or "")
        ]

    async def connect(self, address: Optional[str] = None) -> None:
        addr = address or self.device_address
        if not addr:
            found = await self.scan()
            if not found:
                raise RuntimeError(f"No device named {DEVICE_NAME} found")
            addr = found[0]
        self.device_address = addr
        self._client = BleakClient(addr)
        await self._client.connect()
        try:
            await self._client.start_notify(CHAR_UUID, self._on_notify)
        except Exception:
            pass
        self._writer_task = asyncio.create_task(self._write_loop())

    async def disconnect(self) -> None:
        if self._writer_task:
            self._writer_task.cancel()
            self._writer_task = None
        if self._client:
            await self._client.disconnect()
            self._client = None

    def _on_notify(self, _handle: int, data: bytearray) -> None:
        response = parse_response(bytes(data))
        if self.on_notification:
            result = self.on_notification(response)
            if asyncio.iscoroutine(result):
                asyncio.create_task(result)

    async def _write_loop(self) -> None:
        assert self._client is not None
        while self.connected:
            packet, label = await self._write_queue.get()
            await self._client.write_gatt_char(CHAR_UUID, packet, response=False)
            self._write_queue.task_done()
            await asyncio.sleep(DELAY_INTER_WRITE_S)

    async def enqueue(self, packet: bytes, label: str = "") -> None:
        await self._write_queue.put((packet, label))

    async def start_handshake(self, *, known_device: bool = False) -> None:
        """Mirror Super Tripper startHandshake() sequence."""
        self.known_device = known_device
        await asyncio.sleep(DELAY_PRE_HANDSHAKE_S)
        await self.enqueue(build_loading_screen(), "LOADING")
        if known_device:
            await self.enqueue(PKT_CLOSE, "CLOSE/RESUME")
            await asyncio.sleep(DELAY_CLOSE_TO_TIME_S)
            await self.enqueue(build_set_time_now_packet(), "SET TIME")
            await asyncio.sleep(DELAY_TIME_TO_PING_S)
            await self.enqueue(PKT_PING_FW, "PING FW")
            await self.enqueue(PKT_PING_FW, "PING FW")
            await asyncio.sleep(DELAY_PING_TO_READY_S)
        else:
            await self.enqueue(PKT_PIN_SHOW, "SHOW PIN")
            await asyncio.sleep(DELAY_SHOW_PIN_UI_S)

    async def run_post_pin_sequence(self) -> None:
        """Mirror Super Tripper submitPin() timer chain."""
        await asyncio.sleep(0.15)
        await self.enqueue(build_set_time_now_packet(), "SET TIME")
        await asyncio.sleep(0.15)
        await self.enqueue(PKT_PING_FW, "PING FW")
        await asyncio.sleep(0.35)
        await self.enqueue(PKT_PING_WP, "PING WP")
        await asyncio.sleep(0.1)
        await self.enqueue(PKT_PING_WP, "PING WP")

    async def send_pin(self, code: str) -> TripperResponse:
        packet = build_pin_packet(code)
        await self.enqueue(packet, f"PIN {code}")

        # Wait briefly for AUTH notification
        fut: asyncio.Future[TripperResponse] = asyncio.get_running_loop().create_future()

        previous = self.on_notification

        async def capture(resp: TripperResponse) -> None:
            if resp.label == "AUTH" and not fut.done():
                fut.set_result(resp)
            if previous:
                result = previous(resp)
                if asyncio.iscoroutine(result):
                    await result

        self.on_notification = capture
        try:
            return await asyncio.wait_for(fut, timeout=5.0)
        finally:
            self.on_notification = previous

    async def pair(self, pin: str, *, known_device: bool = False) -> bool:
        await self.start_handshake(known_device=known_device)
        if known_device:
            return True
        auth = await self.send_pin(pin)
        if not is_pin_accepted(auth):
            return False
        await self.run_post_pin_sequence()
        return True
