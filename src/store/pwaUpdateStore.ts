import { create } from "zustand";

type UpdateStatus = "idle" | "checking" | "reloading" | "upToDate" | "unavailable" | "error";

interface PwaUpdateState {
  registration: ServiceWorkerRegistration | null;
  swUrl: string | null;
  scope: string | null;
  updateSW: ((reloadPage?: boolean) => Promise<void>) | null;
  status: UpdateStatus;
  statusMessage: string | null;

  setRegistration: (registration: ServiceWorkerRegistration | undefined) => void;
  setSwConfig: (swUrl: string, scope: string) => void;
  setUpdateSW: (fn: (reloadPage?: boolean) => Promise<void>) => void;
  forceUpdate: () => Promise<void>;
  clearStatus: () => void;
}

function resolveSwUrl(baseUrl: string): string {
  return `${baseUrl.replace(/\/?$/, "/")}sw.js`;
}

function resolveScope(baseUrl: string): string {
  return baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
}

function resolveScriptUrl(swUrl: string): string {
  return new URL(swUrl, window.location.origin).href;
}

function getWorkerScriptUrl(registration: ServiceWorkerRegistration): string | undefined {
  return (
    registration.active?.scriptURL ??
    registration.waiting?.scriptURL ??
    registration.installing?.scriptURL
  );
}

function hasLiveWorker(registration: ServiceWorkerRegistration): boolean {
  return !!(registration.active || registration.waiting || registration.installing);
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

async function waitForControllerChange(timeoutMs = 5000): Promise<void> {
  if (!navigator.serviceWorker.controller) return;

  await new Promise<void>((resolve) => {
    const timeout = window.setTimeout(resolve, timeoutMs);
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      () => {
        window.clearTimeout(timeout);
        resolve();
      },
      { once: true },
    );
  });
}

async function activateWaitingWorker(registration: ServiceWorkerRegistration): Promise<void> {
  if (registration.waiting) {
    registration.waiting.postMessage({ type: "SKIP_WAITING" });
    await waitForControllerChange();
  }
  window.location.reload();
}

async function getScopedRegistration(scope: string): Promise<ServiceWorkerRegistration | undefined> {
  return navigator.serviceWorker.getRegistration(scope);
}

async function registerServiceWorker(swUrl: string, scope: string): Promise<ServiceWorkerRegistration> {
  return navigator.serviceWorker.register(swUrl, { scope, type: "classic" });
}

async function ensureRegistration(
  swUrl: string,
  scope: string,
): Promise<ServiceWorkerRegistration> {
  let registration = await getScopedRegistration(scope);
  const expectedScriptUrl = resolveScriptUrl(swUrl);

  if (registration) {
    const scriptUrl = getWorkerScriptUrl(registration);
    const isStale =
      !hasLiveWorker(registration) || (scriptUrl !== undefined && scriptUrl !== expectedScriptUrl);

    if (isStale) {
      await registration.unregister();
      registration = undefined;
    }
  }

  if (!registration) {
    registration = await registerServiceWorker(swUrl, scope);
  }

  return registration;
}

async function checkForUpdate(registration: ServiceWorkerRegistration): Promise<ServiceWorkerRegistration> {
  try {
    await registration.update();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const isNotFound =
      message.includes("Not found") || (err instanceof DOMException && err.name === "NotFoundError");

    if (!isNotFound) throw err;

    const { swUrl, scope } = usePwaUpdateStore.getState();
    if (!swUrl || !scope) throw err;

    await registration.unregister();
    return ensureRegistration(swUrl, scope);
  }

  return (await getScopedRegistration(registration.scope)) ?? registration;
}

export const usePwaUpdateStore = create<PwaUpdateState>((set, get) => ({
  registration: null,
  swUrl: null,
  scope: null,
  updateSW: null,
  status: "idle",
  statusMessage: null,

  setRegistration: (registration) => set({ registration: registration ?? null }),

  setSwConfig: (swUrl, scope) => set({ swUrl, scope }),

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

    const baseUrl = import.meta.env.BASE_URL;
    const swUrl = get().swUrl ?? resolveSwUrl(baseUrl);
    const scope = get().scope ?? resolveScope(baseUrl);

    try {
      let registration = await ensureRegistration(swUrl, scope);
      set({ registration, swUrl, scope });

      registration = await checkForUpdate(registration);

      if (registration.installing) {
        await waitForInstallingWorker(registration);
        registration = (await getScopedRegistration(scope)) ?? registration;
      }

      if (registration.waiting) {
        set({ status: "reloading", statusMessage: "Update found. Reloading…" });
        await activateWaitingWorker(registration);
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
