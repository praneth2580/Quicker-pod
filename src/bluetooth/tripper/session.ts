import {
  DELAY_CLOSE_TO_TIME_MS,
  DELAY_INTER_WRITE_MS,
  DELAY_PING_TO_READY_MS,
  DELAY_POST_NOTIFICATIONS_MS,
  DELAY_POST_PIN_TO_PING_MS,
  DELAY_POST_PIN_WP_GAP_MS,
  DELAY_PRE_HANDSHAKE_MS,
  DELAY_SHOW_PIN_UI_MS,
  DELAY_TIME_TO_PING_MS,
  TRIPPER_CHAR_UUID,
  TRIPPER_SERVICE_UUID,
} from "./constants";
import { bleDebugLogger, sleep, withBleErrorLogging } from "../bleDebugLogger";
import {
  assertServerConnected,
  dumpGattServices,
  startNotificationsWithSettle,
} from "../bleGattHelpers";
import { useBleDebugStore } from "@/store/bleDebugStore";
import {
  logEnqueuePacket,
  logHandshake,
  logHandshakeDecision,
  logWriteCharacteristic,
} from "./handshakeLog";
import {
  buildLoadingScreen,
  buildPinPacket,
  buildSetTimeNowPacket,
  PKT_CLOSE,
  PKT_PING_FW,
  PKT_PING_WP,
  PKT_PIN_SHOW,
} from "./packets";
import {
  isPinAccepted,
  isPinRejected,
  parseTripperResponse,
  type TripperResponse,
} from "./parser";

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

export interface SendTripperPinResult {
  response: TripperResponse | null;
  /** True only when an AUTH notify with byte1=0x01 was observed. */
  authVerified: boolean;
}

let writeChain: Promise<void> = Promise.resolve();
let lastWriteAt = 0;
let tripperCharRef: GattCharacteristic | null = null;

function delay(ms: number): Promise<void> {
  return sleep(ms);
}

/** Reset serialized write queue (call on GATT disconnect). */
export function resetTripperWriteQueue(): void {
  writeChain = Promise.resolve();
  lastWriteAt = 0;
  tripperCharRef = null;
}

async function assertConnected(server: GattServer): Promise<GattServer> {
  return assertServerConnected(server);
}

async function getTripperCharacteristic(
  server: GattServer,
  serviceUuid = TRIPPER_SERVICE_UUID,
  charUuid = TRIPPER_CHAR_UUID,
): Promise<GattCharacteristic> {
  if (tripperCharRef) return tripperCharRef;

  const activeServer = await assertConnected(server);
  bleDebugLogger.log("Discovering characteristic", { serviceUuid, charUuid });
  const service = await withBleErrorLogging("getPrimaryService (Tripper)", () =>
    activeServer.getPrimaryService(serviceUuid),
  );
  const char = await withBleErrorLogging("getCharacteristic (Tripper)", () =>
    service.getCharacteristic(charUuid),
  );
  bleDebugLogger.log("Characteristic discovered", {
    uuid: char.uuid,
    properties: {
      read: char.properties.read,
      write: char.properties.write,
      writeWithoutResponse: char.properties.writeWithoutResponse,
      notify: char.properties.notify,
      indicate: char.properties.indicate,
    },
  });
  tripperCharRef = char;
  return char;
}

async function writeTripperPacketImmediate(
  server: GattServer,
  packet: Uint8Array,
  label: string,
  serviceUuid = TRIPPER_SERVICE_UUID,
  charUuid = TRIPPER_CHAR_UUID,
): Promise<void> {
  logEnqueuePacket(label, packet);
  bleDebugLogger.logTx(packet, label);

  const activeServer = await assertConnected(server);
  const char = await getTripperCharacteristic(activeServer, serviceUuid, charUuid);

  if (char.properties.writeWithoutResponse) {
    logWriteCharacteristic(label, packet, "withoutResponse");
    await withBleErrorLogging(`writeWithoutResponse ${label}`, () =>
      char.writeValueWithoutResponse(packet),
    );
    return;
  }

  if (char.properties.write) {
    logWriteCharacteristic(label, packet, "withResponse");
    await withBleErrorLogging(`writeValue ${label}`, () => char.writeValue(packet));
    return;
  }

  throw new Error("Tripper characteristic is not writable");
}

/**
 * Queue a 20-byte Tripper frame with 80 ms inter-write spacing (Super Tripper pumpQueue).
 */
export async function writeTripperPacket(
  server: GattServer,
  packet: Uint8Array,
  label: string,
  serviceUuid = TRIPPER_SERVICE_UUID,
  charUuid = TRIPPER_CHAR_UUID,
): Promise<void> {
  const task = writeChain.then(async () => {
    const elapsed = Date.now() - lastWriteAt;
    if (lastWriteAt > 0 && elapsed < DELAY_INTER_WRITE_MS) {
      await delay(DELAY_INTER_WRITE_MS - elapsed);
    }
    await writeTripperPacketImmediate(server, packet, label, serviceUuid, charUuid);
    lastWriteAt = Date.now();
  });

  writeChain = task.catch(() => undefined);
  await task;
}

async function enableTripperNotificationsIfSupported(
  char: GattCharacteristic,
): Promise<boolean> {
  if (!char.properties.notify && !char.properties.indicate) {
    logHandshake("notifications skipped — char has no notify/indicate", {
      properties: char.properties,
      note: "Tripper hardware often props=0x04 only; CCCD absent on pod char",
    });
    bleDebugLogger.warn("Notifications skipped — characteristic has no notify/indicate", {
      properties: char.properties,
    });
    return false;
  }

  await startNotificationsWithSettle(char);
  logHandshake("notifications enabled (Web Bluetooth writes CCCD 0x0100)", {
    properties: char.properties,
  });
  return true;
}

/**
 * Service discovery → notifications → settle BEFORE any Tripper packets.
 * Mirrors onServicesDiscovered → setCharacteristicNotification → postDelayed(200ms).
 */
export async function prepareTripperChannel(
  server: GattServer,
  serviceUuid = TRIPPER_SERVICE_UUID,
  charUuid = TRIPPER_CHAR_UUID,
): Promise<GattCharacteristic> {
  const activeServer = await assertConnected(server);
  await dumpGattServices(activeServer);
  logHandshake("services discovered", {
    count: useBleDebugStore.getState().services.length,
  });

  const char = await getTripperCharacteristic(activeServer, serviceUuid, charUuid);
  const notificationsEnabled = await enableTripperNotificationsIfSupported(char);

  logHandshake(`pre-handshake settle ${DELAY_PRE_HANDSHAKE_MS}ms`, {
    notificationsEnabled,
    postNotificationsMs: DELAY_POST_NOTIFICATIONS_MS,
    beforeStartHandshake: true,
  });
  await delay(DELAY_PRE_HANDSHAKE_MS);

  return char;
}

/**
 * Connect setup: discover services + enable notifications BEFORE sending any packets.
 */
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
    await writeTripperPacket(server, PKT_CLOSE, "CLOSE/RESUME");
    await delay(DELAY_CLOSE_TO_TIME_MS);
    bleDebugLogger.setHandshakeStage("set_time");
    await writeTripperPacket(server, buildSetTimeNowPacket(), "SET TIME");
    await delay(DELAY_TIME_TO_PING_MS);
    bleDebugLogger.setHandshakeStage("ping_fw");
    await writeTripperPacket(server, PKT_PING_FW, "PING FW (0x03)");
    await writeTripperPacket(server, PKT_PING_FW, "PING FW (0x03)");
    await delay(DELAY_PING_TO_READY_MS);
    bleDebugLogger.setHandshakeStage("ready");
    return;
  }

  bleDebugLogger.setHandshakeStage("show_pin");
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

/**
 * Send 6-digit PIN (0x20 + ASCII digits + CRC) and optionally wait for AUTH notify.
 * Official app receives AUTH via phone GATT server — Web Bluetooth often cannot confirm.
 */
export async function sendTripperPin(
  server: GattServer,
  pin: string,
  timeoutMs = 5000,
): Promise<SendTripperPinResult> {
  const packet = buildPinPacket(pin);
  await writeTripperPacket(server, packet, "PIN (6 digits)");

  const response = await waitForAuthResponse(server, timeoutMs);
  if (response && isPinRejected(response)) {
    throw new Error("Incorrect PIN. Enter the 6-digit code shown on your Tripper display.");
  }

  return {
    response,
    authVerified: response ? isPinAccepted(response) : false,
  };
}

/** Post-PIN sequence from Super Tripper submitPin() / logcat timeline. */
export async function runPostPinSequence(server: GattServer): Promise<void> {
  bleDebugLogger.setHandshakeStage("set_time");
  await writeTripperPacket(server, buildSetTimeNowPacket(), "SET TIME");
  await delay(DELAY_TIME_TO_PING_MS);
  bleDebugLogger.setHandshakeStage("ping_fw");
  await writeTripperPacket(server, PKT_PING_FW, "PING FW (0x03)");
  await writeTripperPacket(server, PKT_PING_FW, "PING FW (0x03)");
  await delay(DELAY_POST_PIN_TO_PING_MS);
  bleDebugLogger.setHandshakeStage("ping_wp");
  await writeTripperPacket(server, PKT_PING_WP, "PING WP (0x30)");
  await delay(DELAY_POST_PIN_WP_GAP_MS);
  await writeTripperPacket(server, PKT_PING_WP, "PING WP (0x30)");
  bleDebugLogger.setHandshakeStage("ready");
}

export async function waitForAuthResponse(
  server: GattServer,
  timeoutMs: number,
  serviceUuid = TRIPPER_SERVICE_UUID,
  charUuid = TRIPPER_CHAR_UUID,
): Promise<TripperResponse | null> {
  const char = await getTripperCharacteristic(server, serviceUuid, charUuid);

  if (!char.properties.notify && !char.properties.indicate) {
    logHandshake("waitForAuthResponse skipped — no notify on Tripper char", {
      note: "Official app receives AUTH via phone GATT server write, not client notify",
    });
    return null;
  }

  return new Promise((resolve) => {
    let settled = false;

    const finish = (value: TripperResponse | null) => {
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
      bleDebugLogger.logRx(bytes, "AUTH wait");
      const parsed = parseTripperResponse(bytes);
      if (parsed.label === "AUTH") finish(parsed);
    };

    const timer = setTimeout(() => finish(null), timeoutMs);
    char.addEventListener("characteristicvaluechanged", onChange);
    void char.startNotifications().catch(() => finish(null));
  });
}

export { isPinAccepted, isPinRejected };
