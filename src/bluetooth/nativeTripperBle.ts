import { Capacitor, type PluginListenerHandle } from "@capacitor/core";
import {
  TripperBle,
  type TripperBleAuthEvent,
  type TripperBleDevice,
  type TripperBleLogEvent,
  type TripperBleRxEvent,
} from "tripper-ble";
import { bleDebugLogger } from "./bleDebugLogger";
import {
  buildLoadingScreen,
  buildPinPacket,
  buildSetTimeNowPacket,
  PKT_CLOSE,
  PKT_PING_FW,
  PKT_PING_WP,
  PKT_PIN_SHOW,
} from "./tripper/packets";
import { bytesToHexCompact } from "./hexCompact";
import { parseTripperResponse, isPinAccepted, isPinRejected } from "./tripper/parser";
import type { SendTripperPinResult } from "./tripper/session";

export function isNativeTripperBle(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";
}

let listenersAttached = false;
const handles: PluginListenerHandle[] = [];

type NativeListener = {
  onConnected?: (device: TripperBleDevice) => void;
  onReadyForPin?: (device: TripperBleDevice) => void;
  onDisconnected?: (reason?: string) => void;
  onAuth?: (event: TripperBleAuthEvent) => void;
  onRx?: (event: TripperBleRxEvent) => void;
};

let appListeners: NativeListener = {};

/** Pending AUTH waiters for submitPin. */
let authWaiter: {
  resolve: (event: TripperBleAuthEvent | null) => void;
  timer: ReturnType<typeof setTimeout>;
} | null = null;

export function setNativeTripperListeners(listeners: NativeListener): void {
  appListeners = listeners;
}

export async function ensureNativeTripperListeners(): Promise<void> {
  if (listenersAttached || !isNativeTripperBle()) return;
  listenersAttached = true;

  handles.push(
    await TripperBle.addListener("log", (event: TripperBleLogEvent) => {
      const level = event.level ?? "info";
      if (level === "error") {
        bleDebugLogger.error(event.message, undefined, event.data);
      } else if (level === "warn") {
        bleDebugLogger.warn(event.message, event.data);
      } else if (level === "tx") {
        const hex = typeof event.data?.hex === "string" ? event.data.hex : undefined;
        if (hex) {
          try {
            const cleaned = hex.replace(/[^0-9a-fA-F]/g, "");
            const bytes = new Uint8Array(cleaned.length / 2);
            for (let i = 0; i < cleaned.length; i += 2) {
              bytes[i / 2] = parseInt(cleaned.slice(i, i + 2), 16);
            }
            bleDebugLogger.logTx(bytes, event.message);
          } catch {
            bleDebugLogger.log(event.message, event.data);
          }
        } else {
          bleDebugLogger.log(event.message, event.data);
        }
      } else if (level === "rx") {
        bleDebugLogger.log(event.message, event.data);
      } else {
        bleDebugLogger.log(`[native] ${event.message}`, event.data);
      }
    }),
  );

  handles.push(
    await TripperBle.addListener("connected", (event) => {
      bleDebugLogger.setHandshakeStage("connected");
      appListeners.onConnected?.(event);
    }),
  );

  handles.push(
    await TripperBle.addListener("readyForPin", (event) => {
      bleDebugLogger.setHandshakeStage("show_pin");
      appListeners.onReadyForPin?.(event);
    }),
  );

  handles.push(
    await TripperBle.addListener("rx", (event: TripperBleRxEvent) => {
      try {
        const cleaned = event.hex.replace(/[^0-9a-fA-F]/g, "");
        const bytes = new Uint8Array(cleaned.length / 2);
        for (let i = 0; i < cleaned.length; i += 2) {
          bytes[i / 2] = parseInt(cleaned.slice(i, i + 2), 16);
        }
        bleDebugLogger.logRx(bytes, event.label ?? "GATT server RX");
      } catch {
        bleDebugLogger.log("RX", { hex: event.hex, label: event.label });
      }
      appListeners.onRx?.(event);
    }),
  );

  handles.push(
    await TripperBle.addListener("auth", (event: TripperBleAuthEvent) => {
      bleDebugLogger.log("AUTH via GATT server", {
        accepted: event.accepted,
        hex: event.hex,
      });
      if (authWaiter) {
        clearTimeout(authWaiter.timer);
        const resolve = authWaiter.resolve;
        authWaiter = null;
        resolve(event);
      }
      appListeners.onAuth?.(event);
    }),
  );

  handles.push(
    await TripperBle.addListener("disconnected", (event) => {
      bleDebugLogger.logDisconnect(event.reason ?? "native_disconnected");
      appListeners.onDisconnected?.(event.reason);
    }),
  );
}

function packetHex(bytes: Uint8Array): string {
  return bytesToHexCompact(bytes);
}

export async function nativeIsAvailable(): Promise<boolean> {
  if (!isNativeTripperBle()) return false;
  try {
    const result = await TripperBle.isAvailable();
    return result.available;
  } catch {
    return false;
  }
}

export async function nativeStartPairing(options?: {
  address?: string;
  knownDevice?: boolean;
}): Promise<TripperBleDevice> {
  await ensureNativeTripperListeners();
  const loadingScreenHex = packetHex(buildLoadingScreen());
  const handshakeHex = packetHex(options?.knownDevice ? PKT_CLOSE : PKT_PIN_SHOW);
  return TripperBle.startPairing({
    address: options?.address,
    knownDevice: options?.knownDevice ?? false,
    scanTimeoutMs: 15_000,
    loadingScreenHex,
    handshakeHex,
  });
}

export async function nativeReconnect(options: {
  address: string;
  knownDevice: boolean;
}): Promise<TripperBleDevice> {
  await ensureNativeTripperListeners();
  const loadingScreenHex = packetHex(buildLoadingScreen());
  const handshakeHex = packetHex(options.knownDevice ? PKT_CLOSE : PKT_PIN_SHOW);
  return TripperBle.reconnect({
    address: options.address,
    knownDevice: options.knownDevice,
    loadingScreenHex,
    handshakeHex,
  });
}

export async function nativeSubmitPin(
  pin: string,
  timeoutMs = 5000,
): Promise<SendTripperPinResult> {
  await ensureNativeTripperListeners();
  const packet = buildPinPacket(pin);
  const packetHexStr = packetHex(packet);

  const authPromise = new Promise<TripperBleAuthEvent | null>((resolve) => {
    if (authWaiter) {
      clearTimeout(authWaiter.timer);
      authWaiter.resolve(null);
    }
    const timer = setTimeout(() => {
      authWaiter = null;
      resolve(null);
    }, timeoutMs);
    authWaiter = { resolve, timer };
  });

  await TripperBle.submitPin({ packetHex: packetHexStr });
  bleDebugLogger.logTx(packet, "PIN (native)");

  const auth = await authPromise;
  if (!auth) {
    return { response: null, authVerified: false };
  }

  const cleaned = auth.hex.replace(/[^0-9a-fA-F]/g, "");
  const bytes = new Uint8Array(cleaned.length / 2);
  for (let i = 0; i < cleaned.length; i += 2) {
    bytes[i / 2] = parseInt(cleaned.slice(i, i + 2), 16);
  }
  const response = parseTripperResponse(bytes);
  if (isPinRejected(response)) {
    throw new Error("Incorrect PIN. Enter the 6-digit code shown on your Tripper display.");
  }
  return {
    response,
    authVerified: isPinAccepted(response) || auth.accepted,
  };
}

export async function nativeWritePacket(packet: Uint8Array): Promise<void> {
  await ensureNativeTripperListeners();
  await TripperBle.writePacket({ hex: packetHex(packet) });
  bleDebugLogger.logTx(packet, "writePacket (native)");
}

export async function nativeDisconnect(): Promise<void> {
  if (!isNativeTripperBle()) return;
  try {
    await TripperBle.disconnect();
  } catch {
    // ignore
  }
}

export async function nativeRunPostPinSequence(): Promise<void> {
  bleDebugLogger.setHandshakeStage("set_time");
  await nativeWritePacket(buildSetTimeNowPacket());
  await sleep(150);
  bleDebugLogger.setHandshakeStage("ping_fw");
  await nativeWritePacket(PKT_PING_FW);
  await nativeWritePacket(PKT_PING_FW);
  await sleep(200);
  bleDebugLogger.setHandshakeStage("ping_wp");
  await nativeWritePacket(PKT_PING_WP);
  await sleep(100);
  await nativeWritePacket(PKT_PING_WP);
  bleDebugLogger.setHandshakeStage("ready");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
