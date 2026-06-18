import { create } from "zustand";
import { useSettingsStore } from "@/store/settingsStore";

const DISMISS_KEY = "quicker-pod-install-dismissed";

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isIosDevice(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && (navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

let teardownListeners: (() => void) | null = null;

interface PwaInstallState {
  deferred: BeforeInstallPromptEvent | null;
  installed: boolean;
  dismissed: boolean;
  isIos: boolean;

  init: () => () => void;
  dismissBanner: () => void;
  promptInstall: () => Promise<void>;
}

export const usePwaInstallStore = create<PwaInstallState>((set, get) => ({
  deferred: null,
  installed: isStandalone(),
  dismissed: localStorage.getItem(DISMISS_KEY) === "true",
  isIos: isIosDevice(),

  init: () => {
    if (!teardownListeners) {
      const onBeforeInstall = (e: Event) => {
        e.preventDefault();
        set({ deferred: e as BeforeInstallPromptEvent });
      };

      const onInstalled = () => {
        set({ installed: true, deferred: null });
      };

      window.addEventListener("beforeinstallprompt", onBeforeInstall);
      window.addEventListener("appinstalled", onInstalled);

      teardownListeners = () => {
        window.removeEventListener("beforeinstallprompt", onBeforeInstall);
        window.removeEventListener("appinstalled", onInstalled);
        teardownListeners = null;
      };
    }

    return () => undefined;
  },

  dismissBanner: () => {
    localStorage.setItem(DISMISS_KEY, "true");
    set({ dismissed: true });
  },

  promptInstall: async () => {
    const { deferred, isIos } = get();
    if (deferred) {
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      if (outcome === "accepted") {
        set({ deferred: null, installed: true });
      }
      return;
    }

    if (isIos) {
      useSettingsStore.getState().setIosInstallHintOpen(true);
    }
  },
}));

export function usePwaInstall() {
  const { installed, dismissed, deferred, isIos, dismissBanner, promptInstall } =
    usePwaInstallStore();

  const canInstall = !installed && (Boolean(deferred) || isIos);
  const showBanner = canInstall && !dismissed;
  const showInstallIcon = canInstall && dismissed;

  return {
    installed,
    dismissed,
    deferred,
    isIos,
    canInstall,
    showBanner,
    showInstallIcon,
    dismissBanner,
    promptInstall,
  };
}
