import { create } from "zustand";
import {
  bleDebugLogger,
  type BleDebugEvent,
  type HandshakeStage,
} from "@/bluetooth/bleDebugLogger";

export interface DiscoveredCharacteristic {
  uuid: string;
  properties: {
    read: boolean;
    write: boolean;
    writeWithoutResponse: boolean;
    notify: boolean;
    indicate: boolean;
  };
}

export interface DiscoveredService {
  uuid: string;
  characteristics: DiscoveredCharacteristic[];
}

interface BleDebugState {
  gattConnected: boolean;
  deviceName: string | null;
  handshakeStage: HandshakeStage;
  lastDisconnectReason: string | null;
  events: BleDebugEvent[];
  services: DiscoveredService[];

  syncFromLogger: () => void;
  setGattConnected: (connected: boolean) => void;
  setDeviceName: (name: string | null) => void;
  setServices: (services: DiscoveredService[]) => void;
  clear: () => void;
}

export const useBleDebugStore = create<BleDebugState>()((set) => ({
  gattConnected: false,
  deviceName: null,
  handshakeStage: "idle",
  lastDisconnectReason: null,
  events: [],
  services: [],

  syncFromLogger: () =>
    set({
      events: bleDebugLogger.getEvents(),
      handshakeStage: bleDebugLogger.getHandshakeStage(),
      lastDisconnectReason: bleDebugLogger.getLastDisconnectReason(),
    }),

  setGattConnected: (connected) => set({ gattConnected: connected }),
  setDeviceName: (name) => set({ deviceName: name }),
  setServices: (services) => set({ services }),
  clear: () => {
    bleDebugLogger.clear();
    set({
      gattConnected: false,
      handshakeStage: "idle",
      lastDisconnectReason: null,
      events: [],
      services: [],
    });
  },
}));
