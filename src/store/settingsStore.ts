import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  darkMode: boolean;
  debugMode: boolean;
  experimentalMode: boolean;

  toggleDarkMode: () => void;
  setDebugMode: (enabled: boolean) => void;
  setExperimentalMode: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      darkMode: true,
      debugMode: false,
      experimentalMode: false,

      toggleDarkMode: () =>
        set((state) => {
          const darkMode = !state.darkMode;
          document.documentElement.classList.toggle("dark", darkMode);
          return { darkMode };
        }),

      setDebugMode: (enabled) => set({ debugMode: enabled }),
      setExperimentalMode: (enabled) => set({ experimentalMode: enabled }),
    }),
    {
      name: "opentripper-settings",
      onRehydrateStorage: () => (state) => {
        if (state?.darkMode !== false) {
          document.documentElement.classList.add("dark");
        }
      },
    },
  ),
);
