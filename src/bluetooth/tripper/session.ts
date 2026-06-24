import { TRIPPER_CHAR_UUID, TRIPPER_SERVICE_UUID } from "./constants";
import {
  buildHandshakePacket,
  buildLoadingScreen,
  buildSetTimeNowPacket,
  PKT_PING_FW,
  PKT_PING_WP,
  PKT_PIN_SHOW,
} from "./packets";
import { isPinAccepted, parseTripperResponse } from "./parser";

type GattServer = BluetoothRemoteGATTServer;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function writeTripperPacket(
  server: GattServer,
  packet: Uint8Array,
  serviceUuid = TRIPPER_SERVICE_UUID,
  charUuid = TRIPPER_CHAR_UUID,
): Promise<void> {
  const service = await server.getPrimaryService(serviceUuid);
  const char = await service.getCharacteristic(charUuid);
  await char.writeValue(packet);
}

async function ensureNotifications(
  server: GattServer,
  serviceUuid = TRIPPER_SERVICE_UUID,
  charUuid = TRIPPER_CHAR_UUID,
): Promise<void> {
  const service = await server.getPrimaryService(serviceUuid);
  const char = await service.getCharacteristic(charUuid);
  if (char.properties.notify || char.properties.indicate) {
    await char.startNotifications();
  }
}

export async function runTripperConnectSetup(server: GattServer): Promise<void> {
  await ensureNotifications(server);
  await writeTripperPacket(server, buildLoadingScreen());
}

/** New device: show PIN screen on Tripper display. */
export async function runNewDeviceHandshake(server: GattServer): Promise<void> {
  await runTripperConnectSetup(server);
  await writeTripperPacket(server, PKT_PIN_SHOW);
  await delay(300);
}

/** Known device reconnect: close session, sync time, ping firmware. */
export async function runKnownDeviceHandshake(server: GattServer): Promise<void> {
  await runTripperConnectSetup(server);
  await writeTripperPacket(server, buildHandshakePacket(false));
  await delay(200);
  await writeTripperPacket(server, buildSetTimeNowPacket());
  await delay(150);
  await writeTripperPacket(server, PKT_PING_FW);
  await writeTripperPacket(server, PKT_PING_FW);
  await delay(300);
}

/** Post-PIN sequence from Super Tripper submitPin(). */
export async function runPostPinSequence(server: GattServer): Promise<void> {
  await delay(150);
  await writeTripperPacket(server, buildSetTimeNowPacket());
  await delay(150);
  await writeTripperPacket(server, PKT_PING_FW);
  await delay(350);
  await writeTripperPacket(server, PKT_PING_WP);
  await delay(100);
  await writeTripperPacket(server, PKT_PING_WP);
}

export async function waitForAuthResponse(
  server: GattServer,
  timeoutMs: number,
  serviceUuid = TRIPPER_SERVICE_UUID,
  charUuid = TRIPPER_CHAR_UUID,
): Promise<ReturnType<typeof parseTripperResponse> | null> {
  const service = await server.getPrimaryService(serviceUuid);
  const char = await service.getCharacteristic(charUuid);

  return new Promise((resolve) => {
    let settled = false;

    const finish = (value: ReturnType<typeof parseTripperResponse> | null) => {
      if (settled) return;
      settled = true;
      char.removeEventListener("characteristicvaluechanged", onChange);
      clearTimeout(timer);
      resolve(value);
    };

    const onChange = (event: Event) => {
      const target = event.target as BluetoothRemoteGATTCharacteristic;
      if (!target.value) return;
      const bytes = new Uint8Array(target.value.buffer);
      const parsed = parseTripperResponse(bytes);
      if (parsed.label === "AUTH") finish(parsed);
    };

    const timer = setTimeout(() => finish(null), timeoutMs);
    char.addEventListener("characteristicvaluechanged", onChange);
    void char.startNotifications().catch(() => finish(null));
  });
}

export { isPinAccepted };
