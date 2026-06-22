import { create } from "zustand";
import type { BluetoothDeviceInfo, BluetoothServiceInfo } from "@/types";
import { bluetoothManager } from "@/bluetooth/BluetoothManager";

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
  disconnect: () => Promise<void>;
  refreshServices: () => Promise<void>;
}

export const useConnectionStore = create<ConnectionState>()((set) => ({
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
      set({ connected: true, services });
    } catch (err) {
      set({
        lastError: err instanceof Error ? err.message : "Connection failed",
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
    } catch (err) {
      set({ lastError: err instanceof Error ? err.message : "Service discovery failed" });
    }
  },
}));
