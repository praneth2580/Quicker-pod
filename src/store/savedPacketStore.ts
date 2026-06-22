import { create } from "zustand";
import {
  listSavedPackets,
  addSavedPacket as addSavedPacketToDb,
  removeSavedPacket as removeSavedPacketFromDb,
} from "@/db/repository";
import type { StoredSavedPacket } from "@/db/types";

interface SavedPacketState {
  packets: StoredSavedPacket[];
  loadPackets: () => Promise<void>;
  addPacket: (name: string, hex: string, deviceId?: string) => Promise<StoredSavedPacket>;
  removePacket: (id: number) => Promise<void>;
}

export const useSavedPacketStore = create<SavedPacketState>()((set) => ({
  packets: [],

  loadPackets: async () => {
    const packets = await listSavedPackets();
    set({ packets });
  },

  addPacket: async (name, hex, deviceId) => {
    const record = await addSavedPacketToDb(name, hex, deviceId);
    set((s) => ({ packets: [record, ...s.packets] }));
    return record;
  },

  removePacket: async (id) => {
    await removeSavedPacketFromDb(id);
    set((s) => ({ packets: s.packets.filter((p) => p.id !== id) }));
  },
}));
