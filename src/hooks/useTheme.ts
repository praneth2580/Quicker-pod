import { useEffect } from "react";
import { useSettingsStore } from "@/store/settingsStore";

export function useTheme() {
  const { darkMode, toggleDarkMode } = useSettingsStore();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return { darkMode, toggleDarkMode };
}
