import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BluetoothDeviceInfo, BluetoothServiceInfo, KnownDevice } from "@/types";
import { bluetoothManager } from "@/bluetooth/BluetoothManager";
import { getBluetoothErrorMessage } from "@/bluetooth/errors";
import { upsertDevice, removeDevice as removeDeviceFromDb } from "@/db/repository";
import { useDeviceStore } from "@/store/deviceStore";

interface ConnectionState {
  connected: boolean;
  connecting: boolean;
  bluetoothSupported: boolean;
  device: BluetoothDeviceInfo | null;
  currentDevice?: KnownDevice;
  knownDevices: KnownDevice[];
  services: BluetoothServiceInfo[];
  rssi?: number;
  lastError: string | null;

  clearError: () => void;
  connectNewDevice: () => Promise<void>;
  reconnect: () => Promise<void>;
  reconnectDevice: (deviceId: string) => Promise<void>;
  forgetDevice: (deviceId?: string) => Promise<void>;
  disconnect: () => Promise<void>;
  refreshServices: () => Promise<void>;
}

function toKnownDevice(info: BluetoothDeviceInfo, existing?: KnownDevice): KnownDevice {
  const now = Date.now();
  return {
    id: info.id,
    name: info.name,
    firstPaired: existing?.firstPaired ?? now,
    lastConnected: now,
  };
}

function toDeviceInfo(known: KnownDevice): BluetoothDeviceInfo {
  return { id: known.id, name: known.name };
}

async function persistConnectedDevice(
  device: BluetoothDeviceInfo,
  services: BluetoothServiceInfo[],
): Promise<void> {
  await upsertDevice(device, JSON.stringify(services));
  await useDeviceStore.getState().loadDevices();
}

function upsertKnownDevice(devices: KnownDevice[], entry: KnownDevice): KnownDevice[] {
  return [...devices.filter((d) => d.id !== entry.id), entry].sort(
    (a, b) => b.lastConnected - a.lastConnected,
  );
}

export const useConnectionStore = create<ConnectionState>()(
  persist(
    (set, get) => ({
      connected: false,
      connecting: false,
      bluetoothSupported: bluetoothManager.isSupported(),
      device: null,
      currentDevice: undefined,
      knownDevices: [],
      services: [],
      rssi: undefined,
      lastError: null,

      clearError: () => set({ lastError: null }),

      connectNewDevice: async () => {
        set({ connecting: true, lastError: null });
        try {
          await bluetoothManager.connectNewDevice();
          const info = bluetoothManager.getDeviceInfo();
          if (!info) {
            throw new Error("No device selected.");
          }

          const existing = get().knownDevices.find((d) => d.id === info.id);
          const knownDevice = toKnownDevice(info, existing);
          const knownDevices = upsertKnownDevice(get().knownDevices, knownDevice);

          set({ device: info, currentDevice: knownDevice, knownDevices });

          const services = await bluetoothManager.connect();
          await persistConnectedDevice(info, services);
          set({ connected: true, connecting: false, services });
        } catch (err) {
          set({
            connecting: false,
            connected: false,
            lastError: getBluetoothErrorMessage(err),
          });
        }
      },

      reconnect: async () => {
        const target = get().currentDevice;
        if (!target) {
          set({ lastError: "No saved device. Connect your motorcycle first." });
          return;
        }
        await get().reconnectDevice(target.id);
      },

      reconnectDevice: async (deviceId) => {
        set({ connecting: true, lastError: null });
        try {
          const known = get().knownDevices.find((d) => d.id === deviceId);
          const info = await bluetoothManager.connectToPermittedDevice(deviceId);
          const knownDevice = toKnownDevice(info, known);
          const knownDevices = upsertKnownDevice(get().knownDevices, knownDevice);

          set({
            device: info,
            currentDevice: knownDevice,
            knownDevices,
            connecting: false,
          });

          const services = await bluetoothManager.connect();
          await persistConnectedDevice(info, services);
          set({ connected: true, services });
        } catch (err) {
          set({
            connecting: false,
            connected: false,
            lastError: getBluetoothErrorMessage(err),
          });
        }
      },

      forgetDevice: async (deviceId) => {
        const id = deviceId ?? get().currentDevice?.id;
        if (!id) return;

        if (get().device?.id === id) {
          await bluetoothManager.disconnect();
        }

        await removeDeviceFromDb(id);
        await useDeviceStore.getState().loadDevices();

        const knownDevices = get().knownDevices.filter((d) => d.id !== id);
        const isCurrent = get().currentDevice?.id === id;

        set({
          knownDevices,
          ...(isCurrent
            ? {
                currentDevice: undefined,
                device: null,
                connected: false,
                services: [],
                rssi: undefined,
              }
            : {}),
        });
      },

      disconnect: async () => {
        await bluetoothManager.disconnect();
        set({ connected: false, services: [], rssi: undefined });
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
          set({ lastError: getBluetoothErrorMessage(err) });
        }
      },
    }),
    {
      name: "quicker-pod-connection",
      partialize: (state) => ({
        currentDevice: state.currentDevice,
        knownDevices: state.knownDevices,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.currentDevice) {
          state.device = toDeviceInfo(state.currentDevice);
        }
      },
    },
  ),
);
