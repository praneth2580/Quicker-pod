import { create } from "zustand";
import { formatTripperResponse } from "@/bluetooth/tripper";
import { TRIPPER_CHAR_UUID } from "@/bluetooth/tripper/constants";
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

function tripperNotes(payload: Uint8Array, characteristicUuid: string): string | undefined {
  if (payload.length !== 20) return undefined;
  const compact = characteristicUuid.toLowerCase().replace(/-/g, "");
  const tripperChar = TRIPPER_CHAR_UUID.replace(/-/g, "");
  if (!compact.endsWith(tripperChar.slice(-8))) return undefined;
  return formatTripperResponse(payload);
}

function createEntry(
  direction: "TX" | "RX",
  serviceUuid: string,
  characteristicUuid: string,
  payload: Uint8Array,
  notes?: string,
): Omit<ProtocolLogEntry, "id"> {
  const decoded = tripperNotes(payload, characteristicUuid);
  const mergedNotes = [notes, decoded].filter(Boolean).join(" · ") || undefined;
  return {
    timestamp: formatTime(new Date()),
    direction,
    serviceUuid,
    characteristicUuid,
    payloadHex: bytesToHex(payload),
    notes: mergedNotes,
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
