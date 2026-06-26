import type {
  BluetoothCharacteristicInfo,
  BluetoothDeviceInfo,
  BluetoothEvent,
  BluetoothEventListener,
  BluetoothServiceInfo,
} from "@/types";
import { bytesToHex } from "@/utils";
import { bleDebugLogger, withBleErrorLogging } from "./bleDebugLogger";
import {
  connectGattWithSettle,
  dumpGattServices,
  ensureGattConnected,
  setBleActiveDevice,
} from "./bleGattHelpers";
import { ROYAL_ENFIELD_DEVICE_FILTERS, ROYAL_ENFIELD_OPTIONAL_SERVICES } from "./filters";
import { BluetoothError, mapBluetoothError } from "./errors";
import { logHandshake } from "./tripper/handshakeLog";
import {
  type PairingResult,
  type TripperPairingConfig,
  DEFAULT_PAIRING_CONFIG,
  TRIPPER_CHAR_UUID,
  TRIPPER_SERVICE_UUID,
} from "./pairingConfig";
import { parseTripperResponse } from "./tripper/parser";
import { submitTripperPin } from "./tripperPairing";
import {
  runKnownDeviceHandshake,
  runNewDeviceHandshake,
  runPostPinSequence,
  resetTripperWriteQueue,
  sendTripperPin,
  startHandshake,
  type SendTripperPinResult,
  type StartHandshakeOptions,
} from "./tripper/session";
import { PKT_NAV_IDLE } from "./tripper/packets";
import { useBleDebugStore } from "@/store/bleDebugStore";

type GattCharacteristic = BluetoothRemoteGATTCharacteristic;

function parseProperties(char: GattCharacteristic): BluetoothCharacteristicInfo["properties"] {
  return {
    read: char.properties.read,
    write: char.properties.write,
    writeWithoutResponse: char.properties.writeWithoutResponse,
    notify: char.properties.notify,
    indicate: char.properties.indicate,
  };
}

class BluetoothManager {
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private listeners = new Set<BluetoothEventListener>();
  private notificationHandlers = new Map<string, (event: Event) => void>();
  private lastNavPacket: Uint8Array = PKT_NAV_IDLE;
  private connectionPollTimer: ReturnType<typeof setInterval> | null = null;
  private disconnectHandler: ((event: Event) => void) | null = null;

  isSupported(): boolean {
    return typeof navigator !== "undefined" && "bluetooth" in navigator;
  }

  on(listener: BluetoothEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(event: BluetoothEvent): void {
    this.listeners.forEach((listener) => listener(event));
  }

  getDevice(): BluetoothDevice | null {
    return this.device;
  }

  getDeviceInfo(): BluetoothDeviceInfo | null {
    if (!this.device) return null;
    return {
      id: this.device.id,
      name: this.device.name || "Unknown Device",
    };
  }

  isConnected(): boolean {
    return Boolean(this.server?.connected && this.device?.gatt?.connected);
  }

  async connectNewDevice(): Promise<BluetoothDevice> {
    if (!this.isSupported()) {
      throw new BluetoothError(
        "UNAVAILABLE",
        "Bluetooth is not available. Use Chrome on Android or desktop with BLE support.",
      );
    }

    try {
      bleDebugLogger.log("Requesting device");
      const device = await navigator.bluetooth.requestDevice({
        filters: ROYAL_ENFIELD_DEVICE_FILTERS,
        optionalServices: ROYAL_ENFIELD_OPTIONAL_SERVICES,
      });
      this.attachDevice(device);
      return device;
    } catch (error) {
      bleDebugLogger.error("requestDevice failed", error);
      throw mapBluetoothError(error);
    }
  }

  async requestDevice(filters?: BluetoothLEScanFilter[]): Promise<BluetoothDeviceInfo> {
    if (!this.isSupported()) {
      throw new BluetoothError(
        "UNAVAILABLE",
        "Bluetooth is not available. Use Chrome on Android or desktop with BLE support.",
      );
    }

    try {
      bleDebugLogger.log("Requesting device");
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: !filters?.length,
        optionalServices: filters?.length ? undefined : ["battery_service", "device_information"],
        filters,
      });

      return this.attachDevice(device);
    } catch (error) {
      bleDebugLogger.error("requestDevice failed", error);
      throw mapBluetoothError(error);
    }
  }

  async getPermittedDevices(): Promise<BluetoothDeviceInfo[]> {
    if (!this.isSupported() || !navigator.bluetooth.getDevices) {
      return [];
    }
    const devices = await navigator.bluetooth.getDevices();
    return devices.map((d) => ({
      id: d.id,
      name: d.name || "Unknown Device",
    }));
  }

  async connectToPermittedDevice(deviceId: string): Promise<BluetoothDeviceInfo> {
    if (!this.isSupported()) {
      throw new BluetoothError(
        "UNAVAILABLE",
        "Bluetooth is not available. Use Chrome on Android or desktop with BLE support.",
      );
    }
    if (!navigator.bluetooth.getDevices) {
      throw new BluetoothError(
        "UNAVAILABLE",
        "Reconnect requires a browser with getDevices() support.",
      );
    }

    try {
      const devices = await navigator.bluetooth.getDevices();
      const device = devices.find((d) => d.id === deviceId);
      if (!device) {
        throw new BluetoothError(
          "NOT_FOUND",
          "Device not permitted. Use Connect once, then try Reconnect.",
        );
      }

      return this.attachDevice(device);
    } catch (error) {
      bleDebugLogger.error("connectToPermittedDevice failed", error);
      throw mapBluetoothError(error);
    }
  }

  private startConnectionPolling(): void {
    this.stopConnectionPolling();
    this.connectionPollTimer = setInterval(() => {
      const connected = this.device?.gatt?.connected ?? false;
      bleDebugLogger.logGattConnected(connected);
      useBleDebugStore.getState().setGattConnected(connected);
      useBleDebugStore.getState().syncFromLogger();
    }, 1000);
  }

  private stopConnectionPolling(): void {
    if (this.connectionPollTimer) {
      clearInterval(this.connectionPollTimer);
      this.connectionPollTimer = null;
    }
  }

  private attachDevice(device: BluetoothDevice): BluetoothDeviceInfo {
    if (this.disconnectHandler && this.device) {
      this.device.removeEventListener("gattserverdisconnected", this.disconnectHandler);
    }

    this.device = device;
    setBleActiveDevice(device);
    useBleDebugStore.getState().setDeviceName(device.name || "Unknown Device");

    this.disconnectHandler = (event: Event) => {
      bleDebugLogger.logDisconnect("gattserverdisconnected", event);
      bleDebugLogger.log("Disconnect event");
      this.handleDisconnect();
    };
    device.addEventListener("gattserverdisconnected", this.disconnectHandler);
    this.startConnectionPolling();

    const info: BluetoothDeviceInfo = {
      id: device.id,
      name: device.name || "Unknown Device",
    };

    this.emit({ type: "device-found", payload: info });
    return info;
  }

  getGattServer(): BluetoothRemoteGATTServer | null {
    return this.server?.connected ? this.server : null;
  }

  async ensureConnected(): Promise<BluetoothRemoteGATTServer> {
    if (!this.device) {
      throw new BluetoothError("NOT_FOUND", "No device selected.");
    }
    this.server = await ensureGattConnected(this.device);
    return this.server;
  }

  async startTripperHandshake(options: StartHandshakeOptions): Promise<void> {
    const server = await this.ensureConnected();
    await startHandshake(server, options);
  }

  async runNewDeviceHandshake(): Promise<void> {
    const server = await this.ensureConnected();
    await runNewDeviceHandshake(server);
  }

  async runKnownDeviceHandshake(): Promise<void> {
    const server = await this.ensureConnected();
    await runKnownDeviceHandshake(server);
  }

  async runPostPinSequence(): Promise<void> {
    const server = await this.ensureConnected();
    await runPostPinSequence(server);
  }

  async sendTripperPin(
    pin: string,
    config: TripperPairingConfig = DEFAULT_PAIRING_CONFIG,
  ): Promise<SendTripperPinResult> {
    if (!this.server?.connected) {
      await this.connectGatt();
    }

    if (config.pinEncoding !== "tripper20") {
      const legacy = await submitTripperPin(this.server!, pin, config);
      return {
        response: legacy.response
          ? parseTripperResponse(legacy.response)
          : null,
        authVerified: legacy.success && Boolean(legacy.response),
      };
    }

    return sendTripperPin(this.server!, pin, config.responseTimeoutMs);
  }

  getLastNavPacket(): Uint8Array {
    return this.lastNavPacket;
  }

  setLastNavPacket(packet: Uint8Array): void {
    this.lastNavPacket = packet;
  }

  async connectGatt(): Promise<BluetoothRemoteGATTServer> {
    if (!this.device?.gatt) {
      throw new BluetoothError("NOT_FOUND", "No device selected.");
    }

    try {
      this.server = await connectGattWithSettle(this.device);
      this.lastNavPacket = PKT_NAV_IDLE;
      await dumpGattServices(this.server);
      return this.server;
    } catch (error) {
      bleDebugLogger.error("connectGatt failed", error);
      throw mapBluetoothError(error);
    }
  }

  async connect(): Promise<BluetoothServiceInfo[]> {
    if (!this.server?.connected) {
      await this.connectGatt();
    } else {
      await this.ensureConnected();
    }

    try {
      const services = await this.discoverServices();
      this.emit({ type: "connected", payload: services });
      return services;
    } catch (error) {
      bleDebugLogger.error("connect/discoverServices failed", error);
      throw mapBluetoothError(error);
    }
  }

  async pairWithPin(
    pin: string,
    config: TripperPairingConfig = DEFAULT_PAIRING_CONFIG,
  ): Promise<PairingResult> {
    const result = await this.sendTripperPin(pin, config);
    return {
      success: result.authVerified || result.response === null,
      target: {
        serviceUuid: config.serviceUuid ?? TRIPPER_SERVICE_UUID,
        writeCharacteristicUuid: config.writeCharacteristicUuid ?? TRIPPER_CHAR_UUID,
        notifyCharacteristicUuid: config.notifyCharacteristicUuid,
      },
      encoding: config.pinEncoding,
      response: result.response?.raw,
      message: result.authVerified
        ? "PIN accepted. Device paired successfully."
        : "PIN sent. AUTH could not be confirmed in the browser (Tripper uses phone GATT server).",
    };
  }

  async disconnect(): Promise<void> {
    bleDebugLogger.log("Disconnecting (user initiated)");
    if (this.server?.connected) {
      this.server.disconnect();
    }
    this.cleanup();
    this.emit({ type: "disconnected" });
  }

  private handleDisconnect(): void {
    this.cleanup();
    this.emit({ type: "disconnected" });
  }

  private cleanup(): void {
    resetTripperWriteQueue();
    this.notificationHandlers.clear();
    this.server = null;
    setBleActiveDevice(this.device);
    useBleDebugStore.getState().setGattConnected(false);
    if (this.device) {
      this.startConnectionPolling();
    }
  }

  async discoverServices(): Promise<BluetoothServiceInfo[]> {
    const server = await this.ensureConnected();

    const services = await withBleErrorLogging("discoverServices getPrimaryServices", () =>
      server.getPrimaryServices(),
    );
    const result: BluetoothServiceInfo[] = [];

    for (const service of services) {
      const characteristics = await withBleErrorLogging(
        `discoverServices getCharacteristics ${service.uuid}`,
        () => service.getCharacteristics(),
      );
      result.push({
        uuid: service.uuid,
        characteristics: characteristics.map((char) => ({
          uuid: char.uuid,
          properties: parseProperties(char),
        })),
      });
    }

    return result;
  }

  private async getCharacteristic(
    serviceUuid: string,
    characteristicUuid: string,
  ): Promise<GattCharacteristic> {
    const server = await this.ensureConnected();
    bleDebugLogger.log("Discovering characteristic", { serviceUuid, characteristicUuid });
    const service = await withBleErrorLogging("getPrimaryService failed", () =>
      server.getPrimaryService(serviceUuid),
    );
    const char = await withBleErrorLogging("getCharacteristic failed", () =>
      service.getCharacteristic(characteristicUuid),
    );
    bleDebugLogger.log("Characteristic discovered", {
      uuid: char.uuid,
      properties: parseProperties(char),
    });
    return char;
  }

  async readCharacteristic(
    serviceUuid: string,
    characteristicUuid: string,
  ): Promise<Uint8Array> {
    const char = await this.getCharacteristic(serviceUuid, characteristicUuid);
    const value = await withBleErrorLogging("readValue failed", () => char.readValue());
    const bytes = new Uint8Array(value.buffer);

    bleDebugLogger.logRx(bytes, "readCharacteristic");
    this.emit({
      type: "packet-received",
      payload: {
        serviceUuid,
        characteristicUuid,
        payload: bytes,
      },
    });

    return bytes;
  }

  async writeCharacteristic(
    serviceUuid: string,
    characteristicUuid: string,
    data: Uint8Array,
    withResponse?: boolean,
  ): Promise<void> {
    const char = await this.getCharacteristic(serviceUuid, characteristicUuid);
    const useResponse =
      withResponse ?? (char.properties.write && !char.properties.writeWithoutResponse);

    bleDebugLogger.logTx(data, "writeCharacteristic");

    let writeMode: "withResponse" | "withoutResponse";
    if (useResponse && char.properties.write) {
      writeMode = "withResponse";
      await withBleErrorLogging("writeValue failed", () => char.writeValue(data));
    } else if (char.properties.writeWithoutResponse) {
      writeMode = "withoutResponse";
      await withBleErrorLogging("writeValueWithoutResponse failed", () =>
        char.writeValueWithoutResponse(data),
      );
    } else if (char.properties.write) {
      writeMode = "withResponse";
      await withBleErrorLogging("writeValue failed", () => char.writeValue(data));
    } else {
      throw new BluetoothError("NOT_FOUND", "Characteristic is not writable");
    }

    logHandshake("writeCharacteristic (BluetoothManager)", {
      serviceUuid,
      characteristicUuid,
      writeMode,
      opcode: `0x${(data[0] ?? 0).toString(16).padStart(2, "0")}`,
      hex: bytesToHex(data),
    });

    this.emit({
      type: "packet-sent",
      payload: { serviceUuid, characteristicUuid, payload: data },
    });
  }

  async subscribeToNotifications(
    serviceUuid: string,
    characteristicUuid: string,
  ): Promise<void> {
    const char = await this.getCharacteristic(serviceUuid, characteristicUuid);
    if (!char.properties.notify && !char.properties.indicate) {
      return;
    }

    const key = `${serviceUuid}|${characteristicUuid}`;

    const handler = (event: Event) => {
      const target = event.target as GattCharacteristic;
      const value = target.value;
      if (!value) return;
      const bytes = new Uint8Array(value.buffer);

      bleDebugLogger.logRx(bytes, "notification");
      this.emit({
        type: "notification",
        payload: { serviceUuid, characteristicUuid, payload: bytes },
      });
      this.emit({
        type: "packet-received",
        payload: { serviceUuid, characteristicUuid, payload: bytes },
      });
    };

    char.addEventListener("characteristicvaluechanged", handler);
    this.notificationHandlers.set(key, handler);
    await withBleErrorLogging("startNotifications failed", () => char.startNotifications());
  }

  async unsubscribeFromNotifications(
    serviceUuid: string,
    characteristicUuid: string,
  ): Promise<void> {
    const char = await this.getCharacteristic(serviceUuid, characteristicUuid);
    const key = `${serviceUuid}|${characteristicUuid}`;
    const handler = this.notificationHandlers.get(key);
    if (handler) {
      char.removeEventListener("characteristicvaluechanged", handler);
      this.notificationHandlers.delete(key);
    }
    await withBleErrorLogging("stopNotifications failed", () => char.stopNotifications());
  }

  formatPayload(bytes: Uint8Array): string {
    return bytesToHex(bytes);
  }
}

export const bluetoothManager = new BluetoothManager();
export { BluetoothManager };
export { BluetoothError, mapBluetoothError, getBluetoothErrorMessage } from "./errors";
export {
  ROYAL_ENFIELD_NAME_PREFIX,
  ROYAL_ENFIELD_DEVICE_FILTERS,
  ROYAL_ENFIELD_OPTIONAL_SERVICES,
} from "./filters";
export type { TripperPairingConfig, PinEncoding, PairingResult, PairingTarget } from "./pairingConfig";
export { DEFAULT_PAIRING_CONFIG, validateTripperPin, normalizeTripperPin } from "./pairingConfig";
export { submitTripperPin, discoverPairingTarget } from "./tripperPairing";
export * as tripper from "./tripper";
export { bleDebugLogger } from "./bleDebugLogger";
