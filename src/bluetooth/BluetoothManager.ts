import type {
  BluetoothCharacteristicInfo,
  BluetoothDeviceInfo,
  BluetoothEvent,
  BluetoothEventListener,
  BluetoothServiceInfo,
} from "@/types";
import { bytesToHex } from "@/utils";
import { ROYAL_ENFIELD_DEVICE_FILTERS, ROYAL_ENFIELD_OPTIONAL_SERVICES } from "./filters";
import { BluetoothError, mapBluetoothError } from "./errors";
import { logHandshake } from "./tripper/handshakeLog";
import {
  type PairingResult,
  type TripperPairingConfig,
  DEFAULT_PAIRING_CONFIG,
} from "./pairingConfig";
import { submitTripperPin } from "./tripperPairing";
import {
  runKnownDeviceHandshake,
  runNewDeviceHandshake,
  runPostPinSequence,
  startHandshake,
  type StartHandshakeOptions,
} from "./tripper/session";

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
    return Boolean(this.server?.connected);
  }

  async connectNewDevice(): Promise<BluetoothDevice> {
    if (!this.isSupported()) {
      throw new BluetoothError(
        "UNAVAILABLE",
        "Bluetooth is not available. Use Chrome on Android or desktop with BLE support.",
      );
    }

    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: ROYAL_ENFIELD_DEVICE_FILTERS,
        optionalServices: ROYAL_ENFIELD_OPTIONAL_SERVICES,
      });
      this.attachDevice(device);
      return device;
    } catch (error) {
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
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: !filters?.length,
        optionalServices: filters?.length ? undefined : ["battery_service", "device_information"],
        filters,
      });

      return this.attachDevice(device);
    } catch (error) {
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
      throw mapBluetoothError(error);
    }
  }

  private attachDevice(device: BluetoothDevice): BluetoothDeviceInfo {
    this.device = device;
    device.addEventListener("gattserverdisconnected", () => this.handleDisconnect());

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

  async startTripperHandshake(options: StartHandshakeOptions): Promise<void> {
    const server = this.getGattServer();
    if (!server) throw new BluetoothError("NOT_FOUND", "GATT not connected");
    await startHandshake(server, options);
  }

  async runNewDeviceHandshake(): Promise<void> {
    const server = this.getGattServer();
    if (!server) throw new BluetoothError("NOT_FOUND", "GATT not connected");
    await runNewDeviceHandshake(server);
  }

  async runKnownDeviceHandshake(): Promise<void> {
    const server = this.getGattServer();
    if (!server) throw new BluetoothError("NOT_FOUND", "GATT not connected");
    await runKnownDeviceHandshake(server);
  }

  async runPostPinSequence(): Promise<void> {
    const server = this.getGattServer();
    if (!server) throw new BluetoothError("NOT_FOUND", "GATT not connected");
    await runPostPinSequence(server);
  }

  async connectGatt(): Promise<BluetoothRemoteGATTServer> {
    if (!this.device?.gatt) {
      throw new BluetoothError("NOT_FOUND", "No device selected.");
    }

    try {
      this.server = await this.device.gatt.connect();
      return this.server;
    } catch (error) {
      throw mapBluetoothError(error);
    }
  }

  async connect(): Promise<BluetoothServiceInfo[]> {
    if (!this.server?.connected) {
      await this.connectGatt();
    }

    try {
      const services = await this.discoverServices();
      this.emit({ type: "connected", payload: services });
      return services;
    } catch (error) {
      throw mapBluetoothError(error);
    }
  }

  async pairWithPin(
    pin: string,
    config: TripperPairingConfig = DEFAULT_PAIRING_CONFIG,
  ): Promise<PairingResult> {
    if (!this.server?.connected) {
      await this.connectGatt();
    }
    return submitTripperPin(this.server!, pin, config);
  }

  async disconnect(): Promise<void> {
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
    this.notificationHandlers.forEach((handler, key) => {
      const [serviceUuid, charUuid] = key.split("|");
      void this.getCharacteristic(serviceUuid, charUuid)
        .then((char) => char.removeEventListener("characteristicvaluechanged", handler))
        .catch(() => undefined);
    });
    this.notificationHandlers.clear();
    this.server = null;
  }

  async discoverServices(): Promise<BluetoothServiceInfo[]> {
    if (!this.server) throw new Error("Not connected");

    const services = await this.server.getPrimaryServices();
    const result: BluetoothServiceInfo[] = [];

    for (const service of services) {
      const characteristics = await service.getCharacteristics();
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
    if (!this.server) throw new Error("Not connected");
    const service = await this.server.getPrimaryService(serviceUuid);
    return service.getCharacteristic(characteristicUuid);
  }

  async readCharacteristic(
    serviceUuid: string,
    characteristicUuid: string,
  ): Promise<Uint8Array> {
    const char = await this.getCharacteristic(serviceUuid, characteristicUuid);
    const value = await char.readValue();
    const bytes = new Uint8Array(value.buffer);

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

    let writeMode: "withResponse" | "withoutResponse";
    if (useResponse && char.properties.write) {
      writeMode = "withResponse";
      await char.writeValue(data);
    } else if (char.properties.writeWithoutResponse) {
      writeMode = "withoutResponse";
      await char.writeValueWithoutResponse(data);
    } else if (char.properties.write) {
      writeMode = "withResponse";
      await char.writeValue(data);
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
    await char.startNotifications();
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
    await char.stopNotifications();
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
