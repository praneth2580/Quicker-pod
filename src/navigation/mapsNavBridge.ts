/**
 * Bridges Android Maps notification events → Tripper nav session.
 * Web / non-Android: no-op status helpers only.
 */

import { Capacitor, type PluginListenerHandle } from "@capacitor/core";
import {
  NavNotifications,
  type MapsNavUpdateEvent,
  type NavListenerStatus,
} from "nav-notifications";
import { tripperNavSession } from "@/bluetooth/tripper/navSession";
import { useMapsNavStore } from "@/store/mapsNavStore";

export function isMapsNavNative(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";
}

let started = false;
const handles: PluginListenerHandle[] = [];
let visibilityBound = false;

async function applyMapsEvent(event: MapsNavUpdateEvent): Promise<void> {
  useMapsNavStore.getState().setLastUpdate(event);
  if (!useMapsNavStore.getState().mirroringEnabled) return;

  if (event.stopped) {
    try {
      await tripperNavSession.applyExternalNavUpdate({ stopped: true, distanceM: 0 });
      tripperNavSession.setKeepaliveEnabled(false);
    } catch {
      // Pod may be disconnected — UI still shows the Maps stop.
    }
    return;
  }

  if (event.rerouting) {
    try {
      await tripperNavSession.applyExternalNavUpdate({
        idle: true,
        distanceM: 0,
      });
      tripperNavSession.setKeepaliveEnabled(true);
    } catch {
      /* ignore */
    }
    return;
  }

  const distanceM = event.distanceM ?? 0;
  const update = {
    distanceM,
    etaSeconds: event.etaSeconds ?? undefined,
    maneuverName: event.maneuverName ?? undefined,
    maneuverByte: event.maneuverName ? undefined : 0x00,
  };

  try {
    await tripperNavSession.applyExternalNavUpdate(update);
    tripperNavSession.setKeepaliveEnabled(true);
  } catch {
    /* Tripper not connected — store still updated for UI */
  }
}

function bindResumeRefresh(): void {
  if (visibilityBound || typeof document === "undefined") return;
  visibilityBound = true;

  const refresh = () => {
    if (document.visibilityState === "visible") {
      void refreshMapsNavStatus();
    }
  };

  document.addEventListener("visibilitychange", refresh);
  window.addEventListener("focus", () => {
    void refreshMapsNavStatus();
  });
}

export async function startMapsNavBridge(): Promise<void> {
  if (started) return;
  started = true;

  if (!isMapsNavNative()) {
    useMapsNavStore.getState().setStatus({
      supported: false,
      listenerAvailable: false,
      enabled: false,
      connected: false,
    });
    return;
  }

  bindResumeRefresh();

  try {
    const status = await NavNotifications.getStatus();
    useMapsNavStore.getState().setStatus(status);
  } catch {
    useMapsNavStore.getState().setStatus({
      supported: true,
      listenerAvailable: false,
      enabled: false,
      connected: false,
    });
  }

  handles.push(
    await NavNotifications.addListener("statusChange", (status: NavListenerStatus) => {
      useMapsNavStore.getState().setStatus(status);
    }),
  );

  handles.push(
    await NavNotifications.addListener("navUpdate", (event: MapsNavUpdateEvent) => {
      void applyMapsEvent(event);
    }),
  );

  try {
    await NavNotifications.requestCurrent();
  } catch {
    /* optional */
  }
}

export async function refreshMapsNavStatus(): Promise<NavListenerStatus> {
  if (!isMapsNavNative()) {
    const status = {
      supported: false,
      listenerAvailable: false,
      enabled: false,
      connected: false,
    };
    useMapsNavStore.getState().setStatus(status);
    return status;
  }
  const status = await NavNotifications.getStatus();
  useMapsNavStore.getState().setStatus(status);
  return status;
}

export async function openMapsNotificationAccessSettings(): Promise<void> {
  if (!isMapsNavNative()) {
    throw new Error("Maps notification mirroring is Android-only.");
  }
  // Prefer openSettings alias; fall back for older plugin builds.
  if (typeof NavNotifications.openSettings === "function") {
    await NavNotifications.openSettings();
  } else {
    await NavNotifications.openNotificationAccessSettings();
  }
}

/** Open Android App info (for Allow restricted settings on sideload). */
export async function openMapsAppInfoSettings(): Promise<void> {
  if (!isMapsNavNative()) {
    throw new Error("Maps notification mirroring is Android-only.");
  }
  if (typeof NavNotifications.openAppInfo !== "function") {
    throw new Error("openAppInfo is not available in this APK build.");
  }
  await NavNotifications.openAppInfo();
}

/** Explicit enabled check (does not assume Settings return = granted). */
export async function isMapsNotificationAccessEnabled(): Promise<boolean> {
  if (!isMapsNavNative()) return false;
  if (typeof NavNotifications.isEnabled === "function") {
    const result = await NavNotifications.isEnabled();
    return result.enabled;
  }
  const status = await NavNotifications.getStatus();
  return status.enabled;
}
