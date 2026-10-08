import { create } from "zustand";
import type { MapsNavUpdateEvent, NavListenerStatus } from "nav-notifications";

interface MapsNavState {
  status: NavListenerStatus;
  lastUpdate: MapsNavUpdateEvent | null;
  mirroringEnabled: boolean;
  setStatus: (status: NavListenerStatus) => void;
  setLastUpdate: (update: MapsNavUpdateEvent | null) => void;
  setMirroringEnabled: (enabled: boolean) => void;
}

export const useMapsNavStore = create<MapsNavState>((set) => ({
  status: { supported: false, enabled: false, connected: false },
  lastUpdate: null,
  mirroringEnabled: true,
  setStatus: (status) => set({ status }),
  setLastUpdate: (lastUpdate) => set({ lastUpdate }),
  setMirroringEnabled: (mirroringEnabled) => set({ mirroringEnabled }),
}));
