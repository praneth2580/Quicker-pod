import { Capacitor } from "@capacitor/core";
import { RideLaunch } from "ride-launch";
import type { KnownDevice } from "@/types";

let hydrated = false;

/** Push saved Tripper pods to the Android home-screen widget. */
export function publishWidgetPods(devices: readonly KnownDevice[]): void {
  if (!Capacitor.isNativePlatform()) return;
  const pods = [...devices]
    .filter((device) => device.id.trim().length > 0)
    .sort((a, b) => b.lastConnected - a.lastConnected)
    .map((device) => ({
      id: device.id,
      name: device.name.trim() || "Tripper",
    }));
  void RideLaunch.syncPods({ pods }).catch(() => {
    /* Widget mirror is best-effort and must not block connect. */
  });
}

/** Remember that storage has loaded without rewriting the widget. */
export function noteWidgetPodsHydrated(): void {
  hydrated = true;
}

/** First publish after connection state has been read from storage. */
export function markWidgetPodsHydrated(devices: readonly KnownDevice[]): void {
  hydrated = true;
  publishWidgetPods(devices);
}

/** Skip until hydration so an empty initial store cannot wipe the widget. */
export function publishWidgetPodsIfReady(devices: readonly KnownDevice[]): void {
  if (!hydrated) return;
  publishWidgetPods(devices);
}
