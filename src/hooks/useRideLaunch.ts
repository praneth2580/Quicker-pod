import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { App as CapApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { useSettingsStore } from "@/store/settingsStore";
import { useConnectionStore } from "@/store/connectionStore";
import { isRideDeepLink, requestRideReconnect } from "@/ride/rideReconnect";

/**
 * Foreground-only ride launch:
 * - Deep link / widget / NFC → reconnect + go to Connect
 * - Optional auto-reconnect when app opens/resumes (setting)
 * Never scans while the app is closed.
 */
export function useRideLaunch(): void {
  const navigate = useNavigate();
  const autoReconnectOnOpen = useSettingsStore((s) => s.autoReconnectOnOpen);
  const handledLaunchUrl = useRef(false);
  const lastAutoAt = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const listeners: { remove: () => Promise<void> }[] = [];

    const runDeepLink = async (url: string) => {
      if (!isRideDeepLink(url) || cancelled) return;
      navigate("/connect", { replace: false });
      const result = await requestRideReconnect("deep_link");
      if (!result.ok && result.message) {
        useConnectionStore.setState({ lastError: result.message });
      }
    };

    const runAutoOpen = async () => {
      if (!autoReconnectOnOpen || cancelled) return;
      const now = Date.now();
      if (now - lastAutoAt.current < 8_000) return;
      lastAutoAt.current = now;
      if (useConnectionStore.getState().connected) return;
      const result = await requestRideReconnect("app_open");
      if (!result.ok && result.reason === "no_device") return;
      if (!result.ok && result.message) {
        useConnectionStore.setState({
          lastError: result.message,
        });
      }
    };

    void (async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          const launch = await CapApp.getLaunchUrl();
          if (launch?.url && isRideDeepLink(launch.url)) {
            handledLaunchUrl.current = true;
            await runDeepLink(launch.url);
          }
        } catch {
          /* ignore */
        }

        listeners.push(
          await CapApp.addListener("appUrlOpen", ({ url }) => {
            void runDeepLink(url);
          }),
        );

        listeners.push(
          await CapApp.addListener("appStateChange", ({ isActive }) => {
            if (isActive) void runAutoOpen();
          }),
        );
      }

      // Browser / first paint (and native when not launched via deep link)
      if (!handledLaunchUrl.current) {
        const href = typeof window !== "undefined" ? window.location.href : "";
        if (isRideDeepLink(href)) {
          handledLaunchUrl.current = true;
          await runDeepLink(href);
        } else {
          await runAutoOpen();
        }
      }
    })();

    return () => {
      cancelled = true;
      listeners.forEach((l) => {
        void l.remove();
      });
    };
  }, [autoReconnectOnOpen, navigate]);
}
