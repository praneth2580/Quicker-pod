import { create } from "zustand";
import { listManeuvers, addManeuver as addManeuverToDb, removeManeuver as removeManeuverFromDb } from "@/db/repository";
import type { StoredManeuver } from "@/db/types";

interface ManeuverState {
  maneuvers: StoredManeuver[];
  loadManeuvers: () => Promise<void>;
  addManeuver: (label: string, hex: string) => Promise<StoredManeuver | null>;
  removeManeuver: (id: number) => Promise<void>;
}

export const useManeuverStore = create<ManeuverState>()((set) => ({
  maneuvers: [],

  loadManeuvers: async () => {
    const maneuvers = await listManeuvers();
    set({ maneuvers });
  },

  addManeuver: async (label, hex) => {
    const record = await addManeuverToDb(label, hex);
    set((s) => ({ maneuvers: [...s.maneuvers, record] }));
    return record;
  },

  removeManeuver: async (id) => {
    await removeManeuverFromDb(id);
    set((s) => ({ maneuvers: s.maneuvers.filter((m) => m.id !== id) }));
  },
}));
