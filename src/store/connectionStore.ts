import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BluetoothDeviceInfo, BluetoothServiceInfo, KnownDevice, PairingPhase } from "@/types";
import { bluetoothManager } from "@/bluetooth/BluetoothManager";
import { TRIPPER_CHAR_UUID, TRIPPER_SERVICE_UUID } from "@/bluetooth/pairingConfig";
import { getBluetoothErrorMessage } from "@/bluetooth/errors";
import type { TripperPairingConfig } from "@/bluetooth/pairingConfig";
import { DEFAULT_PAIRING_CONFIG } from "@/bluetooth/pairingConfig";
import { upsertDevice, removeDevice as removeDeviceFromDb } from "@/db/repository";
import { useDeviceStore } from "@/store/deviceStore";
import { useSettingsStore } from "@/store/settingsStore";

interface ConnectionState {
  connected: boolean;
  connecting: boolean;
  pairingPhase: PairingPhase;
  awaitingPinDevice: BluetoothDeviceInfo | null;
  bluetoothSupported: boolean;
  device: BluetoothDeviceInfo | null;
  currentDevice?: KnownDevice;
  knownDevices: KnownDevice[];
  services: BluetoothServiceInfo[];
  rssi?: number;
  lastError: string | null;
  pairingMessage: string | null;

  clearError: () => void;
  startPairing: () => Promise<void>;
  submitPin: (pin: string) => Promise<void>;
  cancelPairing: () => Promise<void>;
  reconnect: () => Promise<void>;
  reconnectDevice: (deviceId: string) => Promise<void>;
  forgetDevice: (deviceId?: string) => Promise<void>;
  disconnect: () => Promise<void>;
  refreshServices: () => Promise<void>;
}

function getPairingConfig(): TripperPairingConfig {
  const settings = useSettingsStore.getState();
  const config: TripperPairingConfig = {
    ...DEFAULT_PAIRING_CONFIG,
    pinEncoding: settings.pinEncoding,
  };

  if (settings.pairingServiceUuid && settings.pairingWriteUuid) {
    config.serviceUuid = settings.pairingServiceUuid;
    config.writeCharacteristicUuid = settings.pairingWriteUuid;
    if (settings.pairingNotifyUuid) {
      config.notifyCharacteristicUuid = settings.pairingNotifyUuid;
    }
  }

  return config;
}

function toKnownDevice(info: BluetoothDeviceInfo, existing?: KnownDevice, pinPaired = false): KnownDevice {
  const now = Date.now();
  return {
    id: info.id,
    name: info.name,
    firstPaired: existing?.firstPaired ?? now,
    lastConnected: now,
    pinPaired: pinPaired || existing?.pinPaired,
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

async function finalizeConnection(
  info: BluetoothDeviceInfo,
  pinPaired: boolean,
  get: () => ConnectionState,
  set: (partial: Partial<ConnectionState>) => void,
): Promise<void> {
  const existing = get().knownDevices.find((d) => d.id === info.id);
  const knownDevice = toKnownDevice(info, existing, pinPaired);
  const knownDevices = upsertKnownDevice(get().knownDevices, knownDevice);
  const services = await bluetoothManager.connect();

  try {
    await bluetoothManager.subscribeToNotifications(TRIPPER_SERVICE_UUID, TRIPPER_CHAR_UUID);
  } catch {
    // Tripper service may be unavailable until pairing completes
  }

  await persistConnectedDevice(info, services);
  set({
    device: info,
    currentDevice: knownDevice,
    knownDevices,
    connected: true,
    connecting: false,
    pairingPhase: "idle",
    awaitingPinDevice: null,
    services,
    pairingMessage: pinPaired ? "PIN accepted. Tripper paired successfully." : null,
  });
}

export const useConnectionStore = create<ConnectionState>()(
  persist(
    (set, get) => ({
      connected: false,
      connecting: false,
      pairingPhase: "idle",
      awaitingPinDevice: null,
      bluetoothSupported: bluetoothManager.isSupported(),
      device: null,
      currentDevice: undefined,
      knownDevices: [],
      services: [],
      rssi: undefined,
      lastError: null,
      pairingMessage: null,

      clearError: () => set({ lastError: null, pairingMessage: null }),

      startPairing: async () => {
        set({ connecting: true, lastError: null, pairingMessage: null });
        try {
          await bluetoothManager.connectNewDevice();
          const info = bluetoothManager.getDeviceInfo();
          if (!info) {
            throw new Error("No device selected.");
          }

          await bluetoothManager.connectGatt();
          await bluetoothManager.runNewDeviceHandshake();
          set({
            connecting: false,
            pairingPhase: "awaiting_pin",
            awaitingPinDevice: info,
            device: info,
          });
        } catch (err) {
          set({
            connecting: false,
            pairingPhase: "idle",
            awaitingPinDevice: null,
            lastError: getBluetoothErrorMessage(err),
          });
        }
      },

      submitPin: async (pin) => {
        const pending = get().awaitingPinDevice ?? get().device;
        if (!pending) {
          set({ lastError: "Select your Tripper in the Bluetooth picker first." });
          return;
        }

        set({ pairingPhase: "submitting_pin", lastError: null, pairingMessage: null });
        try {
          const result = await bluetoothManager.pairWithPin(pin, getPairingConfig());
          await bluetoothManager.runPostPinSequence();
          await finalizeConnection(pending, true, get, set);
          set({ pairingMessage: result.message });
        } catch (err) {
          set({
            pairingPhase: "awaiting_pin",
            lastError: getBluetoothErrorMessage(err),
          });
        }
      },

      cancelPairing: async () => {
        await bluetoothManager.disconnect();
        set({
          pairingPhase: "idle",
          awaitingPinDevice: null,
          connected: false,
          device: get().currentDevice ? toDeviceInfo(get().currentDevice!) : null,
          services: [],
        });
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
        set({ connecting: true, lastError: null, pairingMessage: null });
        try {
          const known = get().knownDevices.find((d) => d.id === deviceId);
          const info = await bluetoothManager.connectToPermittedDevice(deviceId);

          if (known?.pinPaired) {
            await bluetoothManager.connectGatt();
            await bluetoothManager.runKnownDeviceHandshake();
            await finalizeConnection(info, true, get, set);
            return;
          }

          await bluetoothManager.connectGatt();
          set({
            device: info,
            awaitingPinDevice: info,
            connecting: false,
            pairingPhase: "awaiting_pin",
          });
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
          pairingPhase: "idle",
          awaitingPinDevice: null,
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
        set({ connected: false, services: [], rssi: undefined, pairingPhase: "idle" });
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
