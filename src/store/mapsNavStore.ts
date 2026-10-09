import { create } from "zustand";
import type { CallUpdateEvent, MapsNavUpdateEvent, NavListenerStatus } from "nav-notifications";

interface MapsNavState {
  status: NavListenerStatus;
  lastUpdate: MapsNavUpdateEvent | null;
  mirroringEnabled: boolean;
  callActive: boolean;
  callerName: string | null;
  callText: string | null;
  setStatus: (status: NavListenerStatus) => void;
  setLastUpdate: (update: MapsNavUpdateEvent | null) => void;
  setMirroringEnabled: (enabled: boolean) => void;
  setCall: (event: CallUpdateEvent) => void;
}

export const useMapsNavStore = create<MapsNavState>((set) => ({
  status: { supported: false, listenerAvailable: false, enabled: false, connected: false },
  lastUpdate: null,
  mirroringEnabled: true,
  callActive: false,
  callerName: null,
  callText: null,
  setStatus: (status) => set({ status }),
  setLastUpdate: (lastUpdate) => set({ lastUpdate }),
  setMirroringEnabled: (mirroringEnabled) => set({ mirroringEnabled }),
  setCall: (event) =>
    set({
      callActive: event.active,
      callerName: event.active ? event.callerName : null,
      callText: event.active ? event.text : null,
    }),
}));
