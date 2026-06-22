import { create } from "zustand";
import type { BluetoothDeviceInfo, BluetoothServiceInfo } from "@/types";
import { bluetoothManager } from "@/bluetooth/BluetoothManager";
import { upsertDevice } from "@/db/repository";
import { useDeviceStore } from "@/store/deviceStore";

interface ConnectionState {
  connected: boolean;
  scanning: boolean;
  bluetoothSupported: boolean;
  device: BluetoothDeviceInfo | null;
  services: BluetoothServiceInfo[];
  rssi?: number;
  lastError: string | null;

  setScanning: (scanning: boolean) => void;
  requestDevice: () => Promise<void>;
  connect: () => Promise<void>;
  reconnectSavedDevice: (deviceId: string) => Promise<void>;
  disconnect: () => Promise<void>;
  refreshServices: () => Promise<void>;
}

async function persistConnectedDevice(
  device: BluetoothDeviceInfo,
  services: BluetoothServiceInfo[],
): Promise<void> {
  await upsertDevice(device, JSON.stringify(services));
  await useDeviceStore.getState().loadDevices();
}

export const useConnectionStore = create<ConnectionState>()((set, get) => ({
  connected: false,
  scanning: false,
  bluetoothSupported: bluetoothManager.isSupported(),
  device: null,
  services: [],
  rssi: undefined,
  lastError: null,

  setScanning: (scanning) => set({ scanning }),

  requestDevice: async () => {
    set({ scanning: true, lastError: null });
    try {
      const device = await bluetoothManager.requestDevice();
      set({ device, scanning: false });
    } catch (err) {
      set({
        scanning: false,
        lastError: err instanceof Error ? err.message : "Failed to request device",
      });
    }
  },

  connect: async () => {
    set({ lastError: null });
    try {
      const services = await bluetoothManager.connect();
      const device = get().device ?? bluetoothManager.getDeviceInfo();
      if (device) {
        await persistConnectedDevice(device, services);
      }
      set({ connected: true, services, device: device ?? get().device });
    } catch (err) {
      set({
        lastError: err instanceof Error ? err.message : "Connection failed",
        connected: false,
      });
    }
  },

  reconnectSavedDevice: async (deviceId) => {
    set({ scanning: true, lastError: null });
    try {
      const device = await bluetoothManager.connectToPermittedDevice(deviceId);
      set({ device, scanning: false });
      const services = await bluetoothManager.connect();
      await persistConnectedDevice(device, services);
      set({ connected: true, services });
    } catch (err) {
      set({
        scanning: false,
        lastError: err instanceof Error ? err.message : "Reconnect failed",
        connected: false,
      });
    }
  },

  disconnect: async () => {
    await bluetoothManager.disconnect();
    set({ connected: false, device: null, services: [], rssi: undefined });
  },

  refreshServices: async () => {
    try {
      const services = await bluetoothManager.discoverServices();
      set({ services });
      const device = get().device;
      if (device && get().connected) {
        await persistConnectedDevice(device, services);
      }
    } catch (err) {
      set({ lastError: err instanceof Error ? err.message : "Service discovery failed" });
    }
  },
}));
