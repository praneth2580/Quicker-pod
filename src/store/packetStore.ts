import { create } from "zustand";
import type { Packet, PacketLogEntry, SavedPacket } from "@/types";
import { bytesToHex } from "@/utils";
import { formatTime } from "@/utils/format";

let packetCounter = 0;

function createPacketId(): string {
  packetCounter += 1;
  return `pkt-${Date.now()}-${packetCounter}`;
}

function toLogEntry(packet: Packet): PacketLogEntry {
  return {
    id: packet.id,
    timestamp: formatTime(packet.timestamp),
    direction: packet.direction,
    serviceUuid: packet.serviceUuid ?? "—",
    characteristicUuid: packet.characteristicUuid ?? "—",
    payloadHex: bytesToHex(packet.payload),
  };
}

interface PacketState {
  sentPackets: Packet[];
  receivedPackets: Packet[];
  savedPackets: SavedPacket[];

  addSentPacket: (payload: Uint8Array, serviceUuid?: string, characteristicUuid?: string) => void;
  addReceivedPacket: (payload: Uint8Array, serviceUuid?: string, characteristicUuid?: string) => void;
  clearLogs: () => void;
  getAllLogs: () => PacketLogEntry[];
  exportLogs: () => string;
  importLogs: (content: string) => void;
  savePacket: (name: string, hex: string) => void;
  removeSavedPacket: (id: string) => void;
}

export const usePacketStore = create<PacketState>()((set, get) => ({
  sentPackets: [],
  receivedPackets: [],
  savedPackets: [],

  addSentPacket: (payload, serviceUuid, characteristicUuid) => {
    const packet: Packet = {
      id: createPacketId(),
      timestamp: new Date(),
      direction: "TX",
      serviceUuid,
      characteristicUuid,
      payload,
    };
    set((state) => ({ sentPackets: [...state.sentPackets, packet] }));
  },

  addReceivedPacket: (payload, serviceUuid, characteristicUuid) => {
    const packet: Packet = {
      id: createPacketId(),
      timestamp: new Date(),
      direction: "RX",
      serviceUuid,
      characteristicUuid,
      payload,
    };
    set((state) => ({ receivedPackets: [...state.receivedPackets, packet] }));
  },

  clearLogs: () => set({ sentPackets: [], receivedPackets: [] }),

  getAllLogs: () => {
    const { sentPackets, receivedPackets } = get();
    const all = [...sentPackets, ...receivedPackets].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
    );
    return all.map(toLogEntry);
  },

  exportLogs: () => {
    const logs = get().getAllLogs();
    return logs
      .map(
        (log) =>
          `[${log.timestamp}] ${log.direction}\nService: ${log.serviceUuid}\nCharacteristic: ${log.characteristicUuid}\n${log.payloadHex}`,
      )
      .join("\n\n");
  },

  importLogs: (content) => {
    const blocks = content.split("\n\n").filter(Boolean);
    const received: Packet[] = [];

    for (const block of blocks) {
      const lines = block.split("\n");
      const header = lines[0] ?? "";
      const payloadLine = lines.find((l) => /^[0-9A-F ]+$/i.test(l.trim()));
      if (!header || !payloadLine) continue;

      const match = header.match(/\[(\d{2}:\d{2}:\d{2})\] (TX|RX)/);
      if (!match) continue;

      const [, time, direction] = match;
      const [hours, minutes, seconds] = time.split(":").map(Number);
      const timestamp = new Date();
      timestamp.setHours(hours, minutes, seconds, 0);

      const hexBytes = payloadLine
        .trim()
        .split(/\s+/)
        .map((h) => parseInt(h, 16));

      received.push({
        id: createPacketId(),
        timestamp,
        direction: direction as "TX" | "RX",
        payload: new Uint8Array(hexBytes),
      });
    }

    const sent = received.filter((p) => p.direction === "TX");
    const rx = received.filter((p) => p.direction === "RX");
    set({ sentPackets: sent, receivedPackets: rx });
  },

  savePacket: (name, hex) => {
    const saved: SavedPacket = {
      id: createPacketId(),
      name,
      hex,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ savedPackets: [...state.savedPackets, saved] }));
  },

  removeSavedPacket: (id) => {
    set((state) => ({
      savedPackets: state.savedPackets.filter((p) => p.id !== id),
    }));
  },
}));
