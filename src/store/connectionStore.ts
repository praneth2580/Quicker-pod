import { create } from "zustand";
import type { BluetoothDeviceInfo, BluetoothServiceInfo } from "@/types";
import { bluetoothManager } from "@/bluetooth/BluetoothManager";
import { MOCK_SERVICES } from "@/services/mockData";

interface ConnectionState {
  connected: boolean;
  scanning: boolean;
  bluetoothSupported: boolean;
  device: BluetoothDeviceInfo | null;
  services: BluetoothServiceInfo[];
  rssi?: number;
  lastError: string | null;
  mockMode: boolean;

  setMockMode: (enabled: boolean) => void;
  setScanning: (scanning: boolean) => void;
  requestDevice: () => Promise<void>;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  refreshServices: () => Promise<void>;
  mockConnect: (device: BluetoothDeviceInfo) => void;
  mockDisconnect: () => void;
}

export const useConnectionStore = create<ConnectionState>()((set, get) => ({
  connected: false,
  scanning: false,
  bluetoothSupported: bluetoothManager.isSupported(),
  device: null,
  services: [],
  rssi: undefined,
  lastError: null,
  mockMode: false,

  setMockMode: (enabled) => set({ mockMode: enabled }),
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
    const { mockMode } = get();
    if (mockMode) return;

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
    const { mockMode } = get();
    if (mockMode) {
      get().mockDisconnect();
      return;
    }
    await bluetoothManager.disconnect();
    set({ connected: false, services: [], rssi: undefined });
  },

  refreshServices: async () => {
    const { mockMode } = get();
    if (mockMode) {
      set({ services: MOCK_SERVICES });
      return;
    }
    try {
      const services = await bluetoothManager.discoverServices();
      set({ services });
    } catch (err) {
      set({ lastError: err instanceof Error ? err.message : "Service discovery failed" });
    }
  },

  mockConnect: (device) => {
    set({
      connected: true,
      device,
      services: MOCK_SERVICES,
      rssi: device.rssi,
      mockMode: true,
      lastError: null,
    });
  },

  mockDisconnect: () => {
    set({
      connected: false,
      device: null,
      services: [],
      rssi: undefined,
      mockMode: false,
    });
  },
}));
