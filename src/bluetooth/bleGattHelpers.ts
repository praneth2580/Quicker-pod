import { bleDebugLogger, sleep, withBleErrorLogging } from "./bleDebugLogger";
import { useBleDebugStore } from "@/store/bleDebugStore";
import type { DiscoveredService } from "@/store/bleDebugStore";

type GattServer = BluetoothRemoteGATTServer;

let activeDevice: BluetoothDevice | null = null;

export function setBleActiveDevice(device: BluetoothDevice | null): void {
  activeDevice = device;
}

export function getBleActiveDevice(): BluetoothDevice | null {
  return activeDevice;
}

function charProperties(char: BluetoothRemoteGATTCharacteristic) {
  return {
    read: char.properties.read,
    write: char.properties.write,
    writeWithoutResponse: char.properties.writeWithoutResponse,
    notify: char.properties.notify,
    indicate: char.properties.indicate,
  };
}

/** Dump all GATT services and characteristics to console + debug store. */
export async function dumpGattServices(server: GattServer): Promise<DiscoveredService[]> {
  bleDebugLogger.log("Discovering service");
  const services = await withBleErrorLogging("getPrimaryServices failed", () =>
    server.getPrimaryServices(),
  );
  bleDebugLogger.log("Service discovered", { count: services.length });

  const result: DiscoveredService[] = [];

  for (const service of services) {
    bleDebugLogger.log("Service", { uuid: service.uuid });
    const characteristics = await withBleErrorLogging(
      `getCharacteristics failed for ${service.uuid}`,
      () => service.getCharacteristics(),
    );

    const detailedChars = characteristics.map((c) => {
      const props = charProperties(c);
      bleDebugLogger.log("Characteristic", { uuid: c.uuid, properties: props });
      return { uuid: c.uuid, properties: props };
    });

    result.push({ uuid: service.uuid, characteristics: detailedChars });
  }

  useBleDebugStore.getState().setServices(result);
  bleDebugLogger.setHandshakeStage("services_discovered");
  return result;
}

/** Attach a global notification listener that logs [RX] for every notify. */
export function attachNotificationLogger(char: BluetoothRemoteGATTCharacteristic): void {
  const handler = (event: Event) => {
    const target = event.target as BluetoothRemoteGATTCharacteristic;
    if (!target.value) return;
    const data = new Uint8Array(target.value.buffer);
    bleDebugLogger.logRx(data);
  };
  char.addEventListener("characteristicvaluechanged", handler);
}

/** Ensure GATT is connected; reconnect if needed. */
export async function ensureGattConnected(device: BluetoothDevice): Promise<GattServer> {
  if (!device.gatt) {
    throw new Error("Device has no GATT interface");
  }

  if (!device.gatt.connected) {
    bleDebugLogger.log("Reconnecting");
    const server = await withBleErrorLogging("gatt.connect failed on reconnect", () =>
      device.gatt!.connect(),
    );
    bleDebugLogger.log("Connected");
    useBleDebugStore.getState().setGattConnected(true);
    await sleep(1000);
    return server;
  }

  return device.gatt;
}

/** Reconnect if the given server reference is stale/disconnected. */
export async function assertServerConnected(server: GattServer): Promise<GattServer> {
  if (server.connected) return server;
  if (!activeDevice) {
    throw new Error("GATT server disconnected and no active device for reconnect");
  }
  return ensureGattConnected(activeDevice);
}

/** Connect with post-connect settle delay. */
export async function connectGattWithSettle(device: BluetoothDevice): Promise<GattServer> {
  bleDebugLogger.log("Connecting...");
  const server = await withBleErrorLogging("gatt.connect failed", () => device.gatt!.connect());
  bleDebugLogger.log("Connected");
  useBleDebugStore.getState().setGattConnected(true);
  bleDebugLogger.setHandshakeStage("connected");
  await sleep(1000);
  return server;
}

/** Enable notifications with post-enable settle delay. */
export async function startNotificationsWithSettle(
  char: BluetoothRemoteGATTCharacteristic,
): Promise<void> {
  bleDebugLogger.log("Starting notifications");
  await withBleErrorLogging("startNotifications failed", () => char.startNotifications());
  attachNotificationLogger(char);
  bleDebugLogger.log("Notifications enabled");
  bleDebugLogger.setHandshakeStage("notifications_enabled");
  await sleep(500);
}
