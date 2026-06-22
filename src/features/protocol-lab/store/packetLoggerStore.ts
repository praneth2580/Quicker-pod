import { create } from "zustand";
import { persist } from "zustand/middleware";
import { bytesToHex } from "@/utils";
import { formatTime } from "@/utils/format";
import type { ProtocolLogEntry } from "../types";

let logCounter = 0;

function nextId(): string {
  logCounter += 1;
  return `plog-${Date.now()}-${logCounter}`;
}

function createEntry(
  direction: "TX" | "RX",
  serviceUuid: string,
  characteristicUuid: string,
  payload: Uint8Array,
  notes?: string,
): ProtocolLogEntry {
  return {
    id: nextId(),
    timestamp: formatTime(new Date()),
    direction,
    serviceUuid,
    characteristicUuid,
    payloadHex: bytesToHex(payload),
    notes,
  };
}

interface PacketLoggerState {
  sentPackets: ProtocolLogEntry[];
  receivedPackets: ProtocolLogEntry[];
  notifications: ProtocolLogEntry[];

  addSent: (serviceUuid: string, characteristicUuid: string, payload: Uint8Array, notes?: string) => void;
  addReceived: (serviceUuid: string, characteristicUuid: string, payload: Uint8Array, notes?: string) => void;
  addNotification: (serviceUuid: string, characteristicUuid: string, payload: Uint8Array, notes?: string) => void;
  clearNotifications: () => void;
  clearAll: () => void;
  getAllNotifications: () => ProtocolLogEntry[];
}

export const useProtocolLabPacketLogger = create<PacketLoggerState>()(
  persist(
    (set, get) => ({
      sentPackets: [],
      receivedPackets: [],
      notifications: [],

      addSent: (serviceUuid, characteristicUuid, payload, notes) => {
        const entry = createEntry("TX", serviceUuid, characteristicUuid, payload, notes);
        set((s) => ({ sentPackets: [...s.sentPackets, entry] }));
      },

      addReceived: (serviceUuid, characteristicUuid, payload, notes) => {
        const entry = createEntry("RX", serviceUuid, characteristicUuid, payload, notes);
        set((s) => ({ receivedPackets: [...s.receivedPackets, entry] }));
      },

      addNotification: (serviceUuid, characteristicUuid, payload, notes) => {
        const entry = createEntry("RX", serviceUuid, characteristicUuid, payload, notes ?? "notification");
        set((s) => ({ notifications: [...s.notifications, entry] }));
      },

      clearNotifications: () => set({ notifications: [] }),
      clearAll: () => set({ sentPackets: [], receivedPackets: [], notifications: [] }),
      getAllNotifications: () => get().notifications,
    }),
    { name: "quicker-pod-protocol-logs" },
  ),
);
