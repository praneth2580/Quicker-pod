import { bluetoothManager } from "@/bluetooth/BluetoothManager";
import { useConnectionStore } from "@/store/connectionStore";
import { bytesToHex } from "@/utils";
import type { DetailedServiceInfo } from "../types";
import { MOCK_DETAILED_SERVICES } from "./mockData";

type GattCharacteristic = BluetoothRemoteGATTCharacteristic;

function parseProperties(char: GattCharacteristic) {
  return {
    read: char.properties.read,
    write: char.properties.write,
    writeWithoutResponse: char.properties.writeWithoutResponse,
    notify: char.properties.notify,
    indicate: char.properties.indicate,
  };
}

export async function discoverDetailedServices(): Promise<DetailedServiceInfo[]> {
  const { mockMode } = useConnectionStore.getState();
  if (mockMode) return MOCK_DETAILED_SERVICES;

  if (!bluetoothManager.isConnected()) {
    throw new Error("Not connected to a device");
  }

  const server = bluetoothManager.getDevice()?.gatt;
  if (!server?.connected) throw new Error("GATT server not connected");

  const services = await server.getPrimaryServices();
  const result: DetailedServiceInfo[] = [];

  for (const service of services) {
    const characteristics = await service.getCharacteristics();
    const detailedChars = await Promise.all(
      characteristics.map(async (char) => {
        let descriptors: { uuid: string }[] = [];
        try {
          const descs = await char.getDescriptors();
          descriptors = descs.map((d) => ({ uuid: d.uuid }));
        } catch {
          descriptors = [];
        }
        return {
          uuid: char.uuid,
          properties: parseProperties(char),
          descriptors,
        };
      }),
    );

    result.push({ uuid: service.uuid, characteristics: detailedChars });
  }

  return result;
}

export async function readCharacteristic(
  serviceUuid: string,
  characteristicUuid: string,
): Promise<Uint8Array> {
  const { mockMode } = useConnectionStore.getState();
  if (mockMode) return new Uint8Array([0x20, 0x01, 0x00, 0x64]);
  return bluetoothManager.readCharacteristic(serviceUuid, characteristicUuid);
}

export async function writeCharacteristic(
  serviceUuid: string,
  characteristicUuid: string,
  data: Uint8Array,
): Promise<void> {
  const { mockMode } = useConnectionStore.getState();
  if (mockMode) return;
  await bluetoothManager.writeCharacteristic(serviceUuid, characteristicUuid, data);
}

export async function subscribeCharacteristic(
  serviceUuid: string,
  characteristicUuid: string,
): Promise<void> {
  const { mockMode } = useConnectionStore.getState();
  if (mockMode) return;
  await bluetoothManager.subscribeToNotifications(serviceUuid, characteristicUuid);
}

export async function subscribeAllNotifiable(
  services: DetailedServiceInfo[],
): Promise<string[]> {
  const keys: string[] = [];
  for (const service of services) {
    for (const char of service.characteristics) {
      if (char.properties.notify || char.properties.indicate) {
        const key = `${service.uuid}|${char.uuid}`;
        try {
          await subscribeCharacteristic(service.uuid, char.uuid);
          keys.push(key);
        } catch {
          // skip unsupported
        }
      }
    }
  }
  return keys;
}

export function formatReadValue(bytes: Uint8Array): string {
  return bytesToHex(bytes);
}
