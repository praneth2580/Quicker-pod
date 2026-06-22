import { create } from "zustand";
import { listDevices, removeDevice as removeDeviceFromDb } from "@/db/repository";
import type { StoredDevice } from "@/db/types";

interface DeviceState {
  savedDevices: StoredDevice[];
  loading: boolean;
  loadDevices: () => Promise<void>;
  removeDevice: (id: string) => Promise<void>;
}

export const useDeviceStore = create<DeviceState>()((set) => ({
  savedDevices: [],
  loading: false,

  loadDevices: async () => {
    set({ loading: true });
    try {
      const savedDevices = await listDevices();
      set({ savedDevices, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  removeDevice: async (id) => {
    await removeDeviceFromDb(id);
    set((s) => ({ savedDevices: s.savedDevices.filter((d) => d.id !== id) }));
  },
}));
