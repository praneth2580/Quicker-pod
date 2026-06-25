import {
  DELAY_CLOSE_TO_TIME_MS,
  DELAY_INTER_WRITE_MS,
  DELAY_PING_TO_READY_MS,
  DELAY_POST_PIN_SET_TIME_MS,
  DELAY_POST_PIN_TO_PING_MS,
  DELAY_POST_PIN_WP_GAP_MS,
  DELAY_PRE_HANDSHAKE_MS,
  DELAY_SHOW_PIN_UI_MS,
  DELAY_TIME_TO_PING_MS,
  TRIPPER_CHAR_UUID,
  TRIPPER_SERVICE_UUID,
} from "./constants";
import {
  logEnqueuePacket,
  logHandshake,
  logHandshakeDecision,
  logWriteCharacteristic,
} from "./handshakeLog";
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
type GattCharacteristic = BluetoothRemoteGATTCharacteristic;

export interface StartHandshakeOptions {
  /** Web Bluetooth device id (opaque; official app uses BLE MAC). */
  deviceId?: string;
  /** Mirrors Super Tripper isDeviceKnown(mac). */
  knownDevice: boolean;
  /** Caller label for logs (e.g. startPairing, reconnectDevice). */
  source?: string;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getTripperCharacteristic(
  server: GattServer,
  serviceUuid = TRIPPER_SERVICE_UUID,
  charUuid = TRIPPER_CHAR_UUID,
): Promise<GattCharacteristic> {
  const service = await server.getPrimaryService(serviceUuid);
  return service.getCharacteristic(charUuid);
}

/** Prefer write-without-response — Tripper char is typically props=0x04 only. */
export async function writeTripperPacket(
  server: GattServer,
  packet: Uint8Array,
  label: string,
  serviceUuid = TRIPPER_SERVICE_UUID,
  charUuid = TRIPPER_CHAR_UUID,
): Promise<void> {
  logEnqueuePacket(label, packet);

  const char = await getTripperCharacteristic(server, serviceUuid, charUuid);

  if (char.properties.writeWithoutResponse) {
    logWriteCharacteristic(label, packet, "withoutResponse");
    await char.writeValueWithoutResponse(packet);
    return;
  }

  if (char.properties.write) {
    logWriteCharacteristic(label, packet, "withResponse");
    await char.writeValue(packet);
    return;
  }

  throw new Error("Tripper characteristic is not writable");
}

async function enableTripperNotificationsIfSupported(
  char: GattCharacteristic,
): Promise<boolean> {
  if (!char.properties.notify && !char.properties.indicate) {
    logHandshake("notifications skipped — char has no notify/indicate", {
      properties: char.properties,
      note: "Tripper hardware often props=0x04 only; CCCD absent on pod char",
    });
    return false;
  }

  await char.startNotifications();
  logHandshake("notifications enabled (Web Bluetooth writes CCCD 0x0100)", {
    properties: char.properties,
  });
  return true;
}

/**
 * Mirror onServicesDiscovered → setCharacteristicNotification → postDelayed(200ms).
 */
export async function prepareTripperChannel(
  server: GattServer,
  serviceUuid = TRIPPER_SERVICE_UUID,
  charUuid = TRIPPER_CHAR_UUID,
): Promise<GattCharacteristic> {
  const services = await server.getPrimaryServices();
  logHandshake("services discovered", { count: services.length });

  const char = await getTripperCharacteristic(server, serviceUuid, charUuid);
  const notificationsEnabled = await enableTripperNotificationsIfSupported(char);

  logHandshake(`pre-handshake settle ${DELAY_PRE_HANDSHAKE_MS}ms`, {
    notificationsEnabled,
    beforeStartHandshake: true,
  });
  await delay(DELAY_PRE_HANDSHAKE_MS);

  return char;
}

export async function runTripperConnectSetup(server: GattServer): Promise<void> {
  await prepareTripperChannel(server);
  await writeTripperPacket(server, buildLoadingScreen(), "LOADING SCREEN");
}

/**
 * Unified entry matching Super Tripper `startHandshake()`.
 * knownDevice=true  → PKT_CLOSE (0x21 00) reconnect path
 * knownDevice=false → PKT_PIN_SHOW (0x21 01) new pairing path
 */
export async function startHandshake(
  server: GattServer,
  options: StartHandshakeOptions,
): Promise<void> {
  const { deviceId, knownDevice, source = "unknown" } = options;
  const handshakePacket = knownDevice ? "0x21 00 CLOSE" : "0x21 01 SHOW PIN";

  logHandshakeDecision("startHandshake()", {
    source,
    currentDeviceId: deviceId ?? null,
    isDeviceKnown: knownDevice,
    branch: knownDevice ? "RECONNECT (PKT_CLOSE)" : "NEW DEVICE (PKT_PIN_SHOW)",
    firstHandshakePacket: handshakePacket,
  });

  await runTripperConnectSetup(server);

  if (knownDevice) {
    await writeTripperPacket(server, buildHandshakePacket(false), "CLOSE/RESUME");
    await delay(DELAY_CLOSE_TO_TIME_MS);
    await writeTripperPacket(server, buildSetTimeNowPacket(), "SET TIME");
    await delay(DELAY_TIME_TO_PING_MS);
    await writeTripperPacket(server, PKT_PING_FW, "PING FW (0x03)");
    await delay(DELAY_INTER_WRITE_MS);
    await writeTripperPacket(server, PKT_PING_FW, "PING FW (0x03)");
    await delay(DELAY_PING_TO_READY_MS);
    return;
  }

  await writeTripperPacket(server, PKT_PIN_SHOW, "SHOW PIN");
  await delay(DELAY_SHOW_PIN_UI_MS);
  logHandshake("onReadyForPin — awaiting user PIN entry", { waitMs: DELAY_SHOW_PIN_UI_MS });
}

/** @deprecated Use startHandshake(server, { knownDevice: false }) */
export async function runNewDeviceHandshake(server: GattServer): Promise<void> {
  await startHandshake(server, { knownDevice: false, source: "runNewDeviceHandshake" });
}

/** @deprecated Use startHandshake(server, { knownDevice: true }) */
export async function runKnownDeviceHandshake(server: GattServer): Promise<void> {
  await startHandshake(server, { knownDevice: true, source: "runKnownDeviceHandshake" });
}

/** Post-PIN sequence from Super Tripper submitPin(). */
export async function runPostPinSequence(server: GattServer): Promise<void> {
  await delay(DELAY_POST_PIN_SET_TIME_MS);
  await writeTripperPacket(server, buildSetTimeNowPacket(), "SET TIME");
  await delay(DELAY_POST_PIN_SET_TIME_MS);
  await writeTripperPacket(server, PKT_PING_FW, "PING FW (0x03)");
  await delay(DELAY_POST_PIN_TO_PING_MS);
  await writeTripperPacket(server, PKT_PING_WP, "PING WP (0x30)");
  await delay(DELAY_POST_PIN_WP_GAP_MS);
  await writeTripperPacket(server, PKT_PING_WP, "PING WP (0x30)");
}

export async function waitForAuthResponse(
  server: GattServer,
  timeoutMs: number,
  serviceUuid = TRIPPER_SERVICE_UUID,
  charUuid = TRIPPER_CHAR_UUID,
): Promise<ReturnType<typeof parseTripperResponse> | null> {
  const char = await getTripperCharacteristic(server, serviceUuid, charUuid);

  if (!char.properties.notify && !char.properties.indicate) {
    logHandshake("waitForAuthResponse skipped — no notify on Tripper char", {
      note: "Official app receives AUTH via phone GATT server write, not client notify",
    });
    return null;
  }

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
      const target = event.target as GattCharacteristic;
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
