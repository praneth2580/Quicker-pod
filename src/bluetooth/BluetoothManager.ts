import type {
  BluetoothCharacteristicInfo,
  BluetoothDeviceInfo,
  BluetoothEvent,
  BluetoothEventListener,
  BluetoothServiceInfo,
} from "@/types";
import { bytesToHex } from "@/utils";

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

  async requestDevice(filters?: BluetoothLEScanFilter[]): Promise<BluetoothDeviceInfo> {
    if (!this.isSupported()) {
      throw new Error("Web Bluetooth is not supported in this browser");
    }

    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: !filters?.length,
      optionalServices: filters?.length ? undefined : ["battery_service", "device_information"],
      filters,
    });

    this.device = device;
    device.addEventListener("gattserverdisconnected", () => this.handleDisconnect());

    const info: BluetoothDeviceInfo = {
      id: device.id,
      name: device.name || "Unknown Device",
    };

    this.emit({ type: "device-found", payload: info });
    return info;
  }

  async connect(): Promise<BluetoothServiceInfo[]> {
    if (!this.device?.gatt) {
      throw new Error("No device selected");
    }

    this.server = await this.device.gatt.connect();
    const services = await this.discoverServices();
    this.emit({ type: "connected", payload: services });
    return services;
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
    withResponse = true,
  ): Promise<void> {
    const char = await this.getCharacteristic(serviceUuid, characteristicUuid);
    if (withResponse) {
      await char.writeValue(data);
    } else {
      await char.writeValueWithoutResponse(data);
    }

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
