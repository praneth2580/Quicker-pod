import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PinEncoding } from "@/bluetooth/pairingConfig";

interface SettingsState {
  darkMode: boolean;
  debugMode: boolean;
  experimentalMode: boolean;
  iosInstallHintOpen: boolean;
  /** When true, try reconnecting the saved Tripper when the app opens/resumes. */
  autoReconnectOnOpen: boolean;
  pairingServiceUuid: string;
  pairingWriteUuid: string;
  pairingNotifyUuid: string;
  pinEncoding: PinEncoding;

  toggleDarkMode: () => void;
  setDebugMode: (enabled: boolean) => void;
  setExperimentalMode: (enabled: boolean) => void;
  setIosInstallHintOpen: (open: boolean) => void;
  setAutoReconnectOnOpen: (enabled: boolean) => void;
  setPairingUuids: (serviceUuid: string, writeUuid: string, notifyUuid: string) => void;
  setPinEncoding: (encoding: PinEncoding) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      darkMode: false,
      debugMode: false,
      experimentalMode: false,
      iosInstallHintOpen: false,
      autoReconnectOnOpen: true,
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
      setAutoReconnectOnOpen: (enabled) => set({ autoReconnectOnOpen: enabled }),
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
        autoReconnectOnOpen: state.autoReconnectOnOpen,
        pairingServiceUuid: state.pairingServiceUuid,
        pairingWriteUuid: state.pairingWriteUuid,
        pairingNotifyUuid: state.pairingNotifyUuid,
        pinEncoding: state.pinEncoding,
      }),
      onRehydrateStorage: () => (state) => {
        document.documentElement.classList.toggle("dark", state?.darkMode === true);
      },
    },
  ),
);
