import { useConnectionStore } from "@/store/connectionStore";
import { RIDE_RECONNECT_RETRY_MS, RIDE_RECONNECT_WINDOW_MS } from "./constants";

export type RideReconnectSource = "app_open" | "deep_link" | "widget" | "nfc" | "manual";

export interface RideReconnectResult {
  ok: boolean;
  reason: "connected" | "already_connected" | "no_device" | "busy" | "timeout" | "error" | "aborted";
  message?: string;
}

let inflight: Promise<RideReconnectResult> | null = null;
let abortController: AbortController | null = null;

function resolveKnownRideDeviceId(): string | null {
  const { currentDevice, knownDevices } = useConnectionStore.getState();
  if (currentDevice?.pinPaired) return currentDevice.id;
  const known = knownDevices.find((d) => d.pinPaired);
  return known?.id ?? null;
}

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const id = window.setTimeout(() => resolve(), ms);
    signal.addEventListener(
      "abort",
      () => {
        window.clearTimeout(id);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });
}

/**
 * Attempt reconnect to the saved PIN-paired Tripper.
 * Retries for a short window so ignition can come on after opening the app / tapping widget/NFC.
 * Does not scan in the background when the app is closed.
 */
export async function requestRideReconnect(
  _source: RideReconnectSource = "manual",
): Promise<RideReconnectResult> {
  if (inflight) return inflight;

  const run = async (): Promise<RideReconnectResult> => {
    const store = useConnectionStore.getState();
    if (store.connected) {
      return { ok: true, reason: "already_connected" };
    }
    const deviceId = resolveKnownRideDeviceId();
    if (!deviceId) {
      return {
        ok: false,
        reason: "no_device",
        message: "Pair your Tripper once (PIN) before using auto-reconnect.",
      };
    }
    if (store.connecting || store.pairingPhase === "awaiting_pin") {
      return { ok: false, reason: "busy", message: "Connection already in progress." };
    }

    abortController?.abort();
    const ac = new AbortController();
    abortController = ac;

    const deadline = Date.now() + RIDE_RECONNECT_WINDOW_MS;
    let lastMessage = "";

    try {
      while (Date.now() < deadline) {
        if (ac.signal.aborted) {
          return { ok: false, reason: "aborted" };
        }
        if (useConnectionStore.getState().connected) {
          return { ok: true, reason: "connected" };
        }

        try {
          await useConnectionStore.getState().reconnectDevice(deviceId);
          if (useConnectionStore.getState().connected) {
            return { ok: true, reason: "connected" };
          }
          // Known-device path may still be awaiting PIN (shouldn't for pinPaired).
          if (useConnectionStore.getState().pairingPhase === "awaiting_pin") {
            return {
              ok: false,
              reason: "busy",
              message: "Tripper needs PIN entry — open Connect.",
            };
          }
          lastMessage = useConnectionStore.getState().lastError ?? "Not connected yet";
        } catch (err) {
          lastMessage = err instanceof Error ? err.message : String(err);
        }

        const remaining = deadline - Date.now();
        if (remaining <= 0) break;
        await sleep(Math.min(RIDE_RECONNECT_RETRY_MS, remaining), ac.signal);
      }

      return {
        ok: false,
        reason: "timeout",
        message:
          lastMessage ||
          "Could not reach Tripper. Turn ignition on, then try again from Connect.",
      };
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return { ok: false, reason: "aborted" };
      }
      return {
        ok: false,
        reason: "error",
        message: err instanceof Error ? err.message : String(err),
      };
    } finally {
      if (abortController === ac) abortController = null;
    }
  };

  inflight = run().finally(() => {
    inflight = null;
  });
  return inflight;
}

export function cancelRideReconnect(): void {
  abortController?.abort();
  abortController = null;
}

export function isRideDeepLink(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    const normalized = url.trim().toLowerCase();
    if (normalized.startsWith("quickerpod://ride")) return true;
    const u = new URL(url);
    if (u.protocol === "quickerpod:" && u.hostname === "ride") return true;
    if (u.searchParams.get("action") === "reconnect") return true;
    if (u.hash.includes("ride") || u.hash.includes("action=reconnect")) return true;
    return false;
  } catch {
    return /quickerpod:\/\/ride/i.test(url) || /[?&#]action=reconnect\b/i.test(url);
  }
}
