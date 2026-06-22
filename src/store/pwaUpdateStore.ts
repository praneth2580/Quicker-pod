import { create } from "zustand";

type UpdateStatus = "idle" | "checking" | "reloading" | "upToDate" | "unavailable" | "error";

interface PwaUpdateState {
  registration: ServiceWorkerRegistration | null;
  updateSW: ((reloadPage?: boolean) => Promise<void>) | null;
  status: UpdateStatus;
  statusMessage: string | null;

  setRegistration: (registration: ServiceWorkerRegistration | undefined) => void;
  setUpdateSW: (fn: (reloadPage?: boolean) => Promise<void>) => void;
  forceUpdate: () => Promise<void>;
  clearStatus: () => void;
}

function waitForInstallingWorker(registration: ServiceWorkerRegistration): Promise<void> {
  const worker = registration.installing;
  if (!worker) return Promise.resolve();

  return new Promise((resolve) => {
    const onStateChange = () => {
      if (worker.state === "installed" || worker.state === "activated" || worker.state === "redundant") {
        worker.removeEventListener("statechange", onStateChange);
        resolve();
      }
    };
    worker.addEventListener("statechange", onStateChange);
    onStateChange();
  });
}

async function activateWaitingWorker(
  registration: ServiceWorkerRegistration,
  updateSW: ((reloadPage?: boolean) => Promise<void>) | null,
): Promise<void> {
  if (registration.waiting) {
    registration.waiting.postMessage({ type: "SKIP_WAITING" });
  }
  if (updateSW) {
    await updateSW(true);
  } else {
    window.location.reload();
  }
}

export const usePwaUpdateStore = create<PwaUpdateState>((set, get) => ({
  registration: null,
  updateSW: null,
  status: "idle",
  statusMessage: null,

  setRegistration: (registration) => set({ registration: registration ?? null }),

  setUpdateSW: (fn) => set({ updateSW: fn }),

  clearStatus: () => set({ status: "idle", statusMessage: null }),

  forceUpdate: async () => {
    set({ status: "checking", statusMessage: "Checking for updates…" });

    if (!("serviceWorker" in navigator)) {
      set({
        status: "unavailable",
        statusMessage: "Service workers are not supported in this browser.",
      });
      return;
    }

    let registration = get().registration ?? (await navigator.serviceWorker.getRegistration());
    if (!registration) {
      set({
        status: "unavailable",
        statusMessage: "No service worker registered. Reload the page or reinstall the app.",
      });
      return;
    }

    try {
      await registration.update();
      registration = (await navigator.serviceWorker.getRegistration()) ?? registration;

      if (registration.installing) {
        await waitForInstallingWorker(registration);
        registration = (await navigator.serviceWorker.getRegistration()) ?? registration;
      }

      if (registration.waiting) {
        set({ status: "reloading", statusMessage: "Update found. Reloading…" });
        await activateWaitingWorker(registration, get().updateSW);
        return;
      }

      set({ status: "upToDate", statusMessage: "You are on the latest version." });
    } catch (err) {
      set({
        status: "error",
        statusMessage: err instanceof Error ? err.message : "Update check failed",
      });
    }
  },
}));
