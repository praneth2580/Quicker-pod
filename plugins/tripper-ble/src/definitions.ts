import type { PluginListenerHandle } from "@capacitor/core";

export interface TripperBleDevice {
  address: string;
  name: string;
  rssi?: number;
}

export interface StartPairingOptions {
  /** Scan timeout in ms (default 15000). */
  scanTimeoutMs?: number;
  /** Prefer this BLE address if already known. */
  address?: string;
  /** When true, run known-device handshake (CLOSE → SET TIME → PING). */
  knownDevice?: boolean;
  /** Optional 20-byte loading screen packet as hex (spaces optional). */
  loadingScreenHex?: string;
  /** Optional SHOW PIN / CLOSE packet hex override. */
  handshakeHex?: string;
}

export interface ReconnectOptions {
  address: string;
  knownDevice?: boolean;
  loadingScreenHex?: string;
  handshakeHex?: string;
}

export interface SubmitPinOptions {
  /** 6-digit PIN — plugin builds 0x20 frame + CRC16 if packetHex omitted. */
  pin?: string;
  /** Pre-built 20-byte PIN frame as hex (preferred; CRC stays in TypeScript). */
  packetHex?: string;
}

export interface WritePacketOptions {
  hex: string;
}

export interface KeepAliveOptions {
  /** Device name shown in the ongoing notification. */
  deviceName?: string;
  /** Subtitle / body text for the notification. */
  text?: string;
}

export type TripperBleEventName =
  | "connected"
  | "readyForPin"
  | "rx"
  | "auth"
  | "disconnected"
  | "log";

export interface TripperBleConnectedEvent {
  address: string;
  name: string;
}

export interface TripperBleReadyForPinEvent {
  address: string;
  name: string;
}

export interface TripperBleRxEvent {
  hex: string;
  /** Parsed label when known (AUTH, OS_VERSION, …). */
  label?: string;
}

export interface TripperBleAuthEvent {
  hex: string;
  accepted: boolean;
}

export interface TripperBleDisconnectedEvent {
  reason?: string;
}

export interface TripperBleLogEvent {
  message: string;
  level?: "info" | "warn" | "error" | "tx" | "rx";
  data?: Record<string, unknown>;
}

export interface TripperBlePlugin {
  isAvailable(): Promise<{ available: boolean }>;

  /**
   * Start GATT server → scan/connect → SHOW PIN (or known-device path).
   * Resolves when ready for PIN (new device) or when already-paired handshake finishes.
   */
  startPairing(options?: StartPairingOptions): Promise<TripperBleDevice>;

  /** Reconnect to a known MAC address with the official dual-role sequence. */
  reconnect(options: ReconnectOptions): Promise<TripperBleDevice>;

  /** Write PIN frame; AUTH arrives via `auth` / `rx` events from GATT server. */
  submitPin(options: SubmitPinOptions): Promise<{ submitted: boolean }>;

  /** Queue a raw 20-byte Tripper frame (WRITE_TYPE_NO_RESPONSE, ~80 ms spacing). */
  writePacket(options: WritePacketOptions): Promise<void>;

  disconnect(): Promise<void>;

  /**
   * Start the ride foreground service + ongoing notification.
   * Keeps the process alive for BLE while the app is backgrounded.
   * Requests POST_NOTIFICATIONS on Android 13+ when needed.
   */
  startKeepAlive(options?: KeepAliveOptions): Promise<{ started: boolean }>;

  /** Update the ongoing keep-alive notification text. */
  updateKeepAlive(options?: KeepAliveOptions): Promise<void>;

  /** Stop the foreground service and dismiss the notification. */
  stopKeepAlive(): Promise<void>;

  addListener(
    eventName: "connected",
    listenerFunc: (event: TripperBleConnectedEvent) => void,
  ): Promise<PluginListenerHandle>;

  addListener(
    eventName: "readyForPin",
    listenerFunc: (event: TripperBleReadyForPinEvent) => void,
  ): Promise<PluginListenerHandle>;

  addListener(
    eventName: "rx",
    listenerFunc: (event: TripperBleRxEvent) => void,
  ): Promise<PluginListenerHandle>;

  addListener(
    eventName: "auth",
    listenerFunc: (event: TripperBleAuthEvent) => void,
  ): Promise<PluginListenerHandle>;

  addListener(
    eventName: "disconnected",
    listenerFunc: (event: TripperBleDisconnectedEvent) => void,
  ): Promise<PluginListenerHandle>;

  addListener(
    eventName: "log",
    listenerFunc: (event: TripperBleLogEvent) => void,
  ): Promise<PluginListenerHandle>;

  removeAllListeners(): Promise<void>;
}

export type { PluginListenerHandle };
