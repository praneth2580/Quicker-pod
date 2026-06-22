import { create } from "zustand";
import { bytesToHex } from "@/utils";
import { formatTime } from "@/utils/format";
import { useConnectionStore } from "@/store/connectionStore";
import {
  addPacketLog,
  clearPacketLogs,
  importPacketLogs,
  loadPacketLogs,
} from "@/db/repository";
import type { SessionImportData } from "@/db/types";
import type { ProtocolLogEntry } from "../types";

function createEntry(
  direction: "TX" | "RX",
  serviceUuid: string,
  characteristicUuid: string,
  payload: Uint8Array,
  notes?: string,
): Omit<ProtocolLogEntry, "id"> {
  return {
    timestamp: formatTime(new Date()),
    direction,
    serviceUuid,
    characteristicUuid,
    payloadHex: bytesToHex(payload),
    notes,
  };
}

function currentDeviceId(): string | undefined {
  return useConnectionStore.getState().device?.id;
}

interface PacketLoggerState {
  hydrated: boolean;
  sentPackets: ProtocolLogEntry[];
  receivedPackets: ProtocolLogEntry[];
  notifications: ProtocolLogEntry[];

  hydrateFromDb: () => Promise<void>;
  importFromSession: (data: SessionImportData) => Promise<void>;
  addSent: (serviceUuid: string, characteristicUuid: string, payload: Uint8Array, notes?: string) => void;
  addReceived: (serviceUuid: string, characteristicUuid: string, payload: Uint8Array, notes?: string) => void;
  addNotification: (serviceUuid: string, characteristicUuid: string, payload: Uint8Array, notes?: string) => void;
  clearNotifications: () => void;
  clearAll: () => void;
  getAllNotifications: () => ProtocolLogEntry[];
}

export const useProtocolLabPacketLogger = create<PacketLoggerState>()((set, get) => ({
  hydrated: false,
  sentPackets: [],
  receivedPackets: [],
  notifications: [],

  hydrateFromDb: async () => {
    const data = await loadPacketLogs();
    set({ ...data, hydrated: true });
  },

  importFromSession: async (data) => {
    await importPacketLogs(data);
    await get().hydrateFromDb();
  },

  addSent: (serviceUuid, characteristicUuid, payload, notes) => {
    const base = createEntry("TX", serviceUuid, characteristicUuid, payload, notes);
    void addPacketLog("sent", base, currentDeviceId()).then((entry) => {
      set((s) => ({ sentPackets: [...s.sentPackets, entry] }));
    });
  },

  addReceived: (serviceUuid, characteristicUuid, payload, notes) => {
    const base = createEntry("RX", serviceUuid, characteristicUuid, payload, notes);
    void addPacketLog("received", base, currentDeviceId()).then((entry) => {
      set((s) => ({ receivedPackets: [...s.receivedPackets, entry] }));
    });
  },

  addNotification: (serviceUuid, characteristicUuid, payload, notes) => {
    const base = createEntry("RX", serviceUuid, characteristicUuid, payload, notes ?? "notification");
    void addPacketLog("notification", base, currentDeviceId()).then((entry) => {
      set((s) => ({ notifications: [...s.notifications, entry] }));
    });
  },

  clearNotifications: () => {
    void clearPacketLogs("notification");
    set({ notifications: [] });
  },

  clearAll: () => {
    void clearPacketLogs();
    set({ sentPackets: [], receivedPackets: [], notifications: [] });
  },

  getAllNotifications: () => get().notifications,
}));
