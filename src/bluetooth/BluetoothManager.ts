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
import {
  ensureNativeTripperListeners,
  isNativeTripperBle,
  nativeDisconnect,
  nativeReconnect,
  nativeRunPostPinSequence,
  nativeStartPairing,
  nativeSubmitPin,
  nativeWritePacket,
  setNativeTripperListeners,
} from "./nativeTripperBle";

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

function nativeTripperServices(): BluetoothServiceInfo[] {
  return [
    {
      uuid: TRIPPER_SERVICE_UUID,
      characteristics: [
        {
          uuid: TRIPPER_CHAR_UUID,
          properties: {
            read: false,
            write: true,
            writeWithoutResponse: true,
            notify: false,
            indicate: false,
          },
        },
      ],
    },
  ];
}

class BluetoothManager {
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private listeners = new Set<BluetoothEventListener>();
  private notificationHandlers = new Map<string, (event: Event) => void>();
  private lastNavPacket: Uint8Array = PKT_NAV_IDLE;
  private connectionPollTimer: ReturnType<typeof setInterval> | null = null;
  private disconnectHandler: ((event: Event) => void) | null = null;

  /** Capacitor Android path (GATT server + client). */
  private nativeMode = false;
  private nativeDevice: BluetoothDeviceInfo | null = null;
  private nativeConnected = false;
  /** True after native startPairing already sent SHOW PIN / known handshake. */
  private nativeHandshakeDone = false;

  isNativeBle(): boolean {
    return isNativeTripperBle();
  }

  isSupported(): boolean {
    if (isNativeTripperBle()) return true;
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
    if (this.nativeMode && this.nativeDevice) return this.nativeDevice;
    if (!this.device) return null;
    return {
      id: this.device.id,
      name: this.device.name || "Unknown Device",
    };
  }

  isConnected(): boolean {
    if (this.nativeMode) return this.nativeConnected;
    return Boolean(this.server?.connected && this.device?.gatt?.connected);
  }

  async connectNewDevice(): Promise<BluetoothDeviceInfo> {
    if (!this.isSupported()) {
      throw new BluetoothError(
        "UNAVAILABLE",
        "Bluetooth is not available. Use Chrome on Android/desktop, or the Quicker Pod Android app.",
      );
    }

    if (isNativeTripperBle()) {
      return this.nativeConnectNewDevice();
    }

    try {
      bleDebugLogger.log("Requesting device");
      const device = await navigator.bluetooth.requestDevice({
        filters: ROYAL_ENFIELD_DEVICE_FILTERS,
        optionalServices: ROYAL_ENFIELD_OPTIONAL_SERVICES,
      });
      return this.attachDevice(device);
    } catch (error) {
      bleDebugLogger.error("requestDevice failed", error);
      throw mapBluetoothError(error);
    }
  }

  private async nativeConnectNewDevice(): Promise<BluetoothDeviceInfo> {
    this.nativeMode = true;
    await ensureNativeTripperListeners();
    setNativeTripperListeners({
      onDisconnected: () => this.handleNativeDisconnect(),
      onConnected: (d) => {
        this.nativeDevice = { id: d.address, name: d.name };
        this.nativeConnected = true;
        useBleDebugStore.getState().setGattConnected(true);
        useBleDebugStore.getState().setDeviceName(d.name);
      },
    });

    bleDebugLogger.log("Native TripperBle startPairing (GATT server + scan)");
    try {
      const device = await nativeStartPairing({ knownDevice: false });
      this.nativeDevice = { id: device.address, name: device.name };
      this.nativeConnected = true;
      this.nativeHandshakeDone = true;
      useBleDebugStore.getState().setDeviceName(device.name);
      useBleDebugStore.getState().setGattConnected(true);
      this.emit({ type: "device-found", payload: this.nativeDevice });
      return this.nativeDevice;
    } catch (error) {
      bleDebugLogger.error("native startPairing failed", error);
      throw mapBluetoothError(error);
    }
  }

  private handleNativeDisconnect(): void {
    this.nativeConnected = false;
    this.nativeHandshakeDone = false;
    useBleDebugStore.getState().setGattConnected(false);
    this.emit({ type: "disconnected" });
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
        "Bluetooth is not available. Use Chrome on Android/desktop, or the Quicker Pod Android app.",
      );
    }

    if (isNativeTripperBle()) {
      this.nativeMode = true;
      this.nativeHandshakeDone = false;
      this.nativeDevice = {
        id: deviceId,
        name: this.nativeDevice?.id === deviceId ? this.nativeDevice.name : "Tripper",
      };
      await ensureNativeTripperListeners();
      setNativeTripperListeners({
        onDisconnected: () => this.handleNativeDisconnect(),
        onConnected: (d) => {
          this.nativeDevice = { id: d.address, name: d.name };
          this.nativeConnected = true;
          useBleDebugStore.getState().setGattConnected(true);
          useBleDebugStore.getState().setDeviceName(d.name);
        },
      });
      this.emit({ type: "device-found", payload: this.nativeDevice });
      return this.nativeDevice;
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
    if (this.nativeMode) {
      if (!this.nativeConnected) {
        throw new BluetoothError("NOT_FOUND", "Native BLE not connected.");
      }
      throw new BluetoothError(
        "UNAVAILABLE",
        "Web GATT server handle is unavailable on Capacitor; use TripperBle plugin APIs.",
      );
    }
    if (!this.device) {
      throw new BluetoothError("NOT_FOUND", "No device selected.");
    }
    this.server = await ensureGattConnected(this.device);
    return this.server;
  }

  async startTripperHandshake(options: StartHandshakeOptions): Promise<void> {
    if (this.nativeMode || isNativeTripperBle()) {
      this.nativeMode = true;
      // startPairing already ran SHOW PIN; skip duplicate handshake on first connect.
      if (this.nativeHandshakeDone && !options.knownDevice) {
        bleDebugLogger.log("Native handshake already completed during startPairing");
        return;
      }
      const address = options.deviceId ?? this.nativeDevice?.id;
      if (!address) {
        throw new BluetoothError("NOT_FOUND", "No device address for native reconnect.");
      }
      bleDebugLogger.log("Native TripperBle reconnect/handshake", {
        address,
        knownDevice: options.knownDevice,
        source: options.source,
      });
      const device = await nativeReconnect({
        address,
        knownDevice: options.knownDevice,
      });
      this.nativeDevice = { id: device.address, name: device.name };
      this.nativeConnected = true;
      this.nativeHandshakeDone = true;
      useBleDebugStore.getState().setGattConnected(true);
      return;
    }

    const server = await this.ensureConnected();
    await startHandshake(server, options);
  }

  async runNewDeviceHandshake(): Promise<void> {
    if (this.nativeMode) return;
    const server = await this.ensureConnected();
    await runNewDeviceHandshake(server);
  }

  async runKnownDeviceHandshake(): Promise<void> {
    if (this.nativeMode) {
      await this.startTripperHandshake({ knownDevice: true, source: "runKnownDeviceHandshake" });
      return;
    }
    const server = await this.ensureConnected();
    await runKnownDeviceHandshake(server);
  }

  async runPostPinSequence(): Promise<void> {
    if (this.nativeMode || isNativeTripperBle()) {
      await nativeRunPostPinSequence();
      return;
    }
    const server = await this.ensureConnected();
    await runPostPinSequence(server);
  }

  async sendTripperPin(
    pin: string,
    config: TripperPairingConfig = DEFAULT_PAIRING_CONFIG,
  ): Promise<SendTripperPinResult> {
    if (this.nativeMode || isNativeTripperBle()) {
      return nativeSubmitPin(pin, config.responseTimeoutMs);
    }

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

  async connectGatt(): Promise<BluetoothRemoteGATTServer | null> {
    if (this.nativeMode || isNativeTripperBle()) {
      this.nativeMode = true;
      // Native connect is performed inside startPairing / startTripperHandshake.
      this.lastNavPacket = PKT_NAV_IDLE;
      return null;
    }

    if (!this.device?.gatt) {
      throw new BluetoothError("NOT_FOUND", "No device selected.");
    }

    try {
      this.server = await connectGattWithSettle(this.device);
      this.lastNavPacket = PKT_NAV_IDLE;
      return this.server;
    } catch (error) {
      bleDebugLogger.error("connectGatt failed", error);
      throw mapBluetoothError(error);
    }
  }

  async connect(): Promise<BluetoothServiceInfo[]> {
    if (this.nativeMode || isNativeTripperBle()) {
      this.nativeMode = true;
      const services = nativeTripperServices();
      this.emit({ type: "connected", payload: services });
      return services;
    }

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
    if (this.nativeMode || isNativeTripperBle()) {
      await nativeDisconnect();
      this.nativeConnected = false;
      this.nativeHandshakeDone = false;
      this.cleanup();
      this.emit({ type: "disconnected" });
      return;
    }
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
    if (this.nativeMode || isNativeTripperBle()) {
      return nativeTripperServices();
    }
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
    if (this.nativeMode || isNativeTripperBle()) {
      await nativeWritePacket(data);
      this.emit({
        type: "packet-sent",
        payload: { serviceUuid, characteristicUuid, payload: data },
      });
      return;
    }

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
    if (this.nativeMode || isNativeTripperBle()) {
      // AUTH / RX arrive via phone GATT server callbacks — no client CCCD needed.
      bleDebugLogger.log("subscribeToNotifications skipped on native (GATT server RX)");
      return;
    }
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
