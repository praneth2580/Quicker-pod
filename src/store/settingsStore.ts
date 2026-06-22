import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PinEncoding } from "@/bluetooth/pairingConfig";

interface SettingsState {
  darkMode: boolean;
  debugMode: boolean;
  experimentalMode: boolean;
  iosInstallHintOpen: boolean;
  pairingServiceUuid: string;
  pairingWriteUuid: string;
  pairingNotifyUuid: string;
  pinEncoding: PinEncoding;

  toggleDarkMode: () => void;
  setDebugMode: (enabled: boolean) => void;
  setExperimentalMode: (enabled: boolean) => void;
  setIosInstallHintOpen: (open: boolean) => void;
  setPairingUuids: (serviceUuid: string, writeUuid: string, notifyUuid: string) => void;
  setPinEncoding: (encoding: PinEncoding) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      darkMode: true,
      debugMode: false,
      experimentalMode: false,
      iosInstallHintOpen: false,
      pairingServiceUuid: "",
      pairingWriteUuid: "",
      pairingNotifyUuid: "",
      pinEncoding: "ascii",

      toggleDarkMode: () =>
        set((state) => {
          const darkMode = !state.darkMode;
          document.documentElement.classList.toggle("dark", darkMode);
          return { darkMode };
        }),

      setDebugMode: (enabled) => set({ debugMode: enabled }),
      setExperimentalMode: (enabled) => set({ experimentalMode: enabled }),
      setIosInstallHintOpen: (open) => set({ iosInstallHintOpen: open }),
      setPairingUuids: (serviceUuid, writeUuid, notifyUuid) =>
        set({ pairingServiceUuid: serviceUuid, pairingWriteUuid: writeUuid, pairingNotifyUuid: notifyUuid }),
      setPinEncoding: (encoding) => set({ pinEncoding: encoding }),
    }),
    {
      name: "quicker-pod-settings",
      partialize: (state) => ({
        darkMode: state.darkMode,
        debugMode: state.debugMode,
        experimentalMode: state.experimentalMode,
        pairingServiceUuid: state.pairingServiceUuid,
        pairingWriteUuid: state.pairingWriteUuid,
        pairingNotifyUuid: state.pairingNotifyUuid,
        pinEncoding: state.pinEncoding,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.darkMode !== false) {
          document.documentElement.classList.add("dark");
        }
      },
    },
  ),
);
