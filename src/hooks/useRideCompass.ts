import { useEffect, useRef } from "react";
import { bearingToDirection } from "@/bluetooth/tripper/packets";
import { tripperNavSession } from "@/bluetooth/tripper/navSession";
import { useConnectionStore } from "@/store/connectionStore";
import { useMapsNavStore } from "@/store/mapsNavStore";
import { useSettingsStore } from "@/store/settingsStore";

function headingDegrees(event: DeviceOrientationEvent): number | null {
  const webkit = event as DeviceOrientationEvent & { webkitCompassHeading?: number };
  if (typeof webkit.webkitCompassHeading === "number" && !Number.isNaN(webkit.webkitCompassHeading)) {
    return webkit.webkitCompassHeading;
  }
  if (event.alpha == null || Number.isNaN(event.alpha)) return null;
  return (360 - event.alpha) % 360;
}

/** While Maps is not guiding, push the phone heading to the pod compass screen. */
export function useRideCompass() {
  const enabled = useSettingsStore((s) => s.compassWhenIdle);
  const connected = useConnectionStore((s) => s.connected);
  const lastUpdate = useMapsNavStore((s) => s.lastUpdate);
  const mirroring = useMapsNavStore((s) => s.mirroringEnabled);
  const callActive = useMapsNavStore((s) => s.callActive);
  const lastSector = useRef<number | null>(null);

  const guiding =
    mirroring && lastUpdate != null && !lastUpdate.stopped && !lastUpdate.rerouting;

  useEffect(() => {
    if (!enabled || !connected || guiding || callActive) return;

    let disposed = false;
    let sawAbsolute = false;
    const onOrientation = (event: DeviceOrientationEvent) => {
      if (disposed) return;
      if (event.absolute) sawAbsolute = true;
      else if (sawAbsolute) return;
      const heading = headingDegrees(event);
      if (heading == null) return;
      const sector = bearingToDirection(heading);
      if (lastSector.current === sector) return;
      lastSector.current = sector;
      void tripperNavSession.sendCompass(sector).catch(() => undefined);
    };

    const start = async () => {
      const orientation = DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<PermissionState>;
      };
      if (typeof orientation.requestPermission === "function") {
        try {
          const result = await orientation.requestPermission();
          if (result !== "granted" || disposed) return;
        } catch {
          return;
        }
      }
      if (disposed) return;
      window.addEventListener("deviceorientationabsolute", onOrientation as EventListener);
      window.addEventListener("deviceorientation", onOrientation);
    };

    void start();
    return () => {
      disposed = true;
      window.removeEventListener("deviceorientationabsolute", onOrientation as EventListener);
      window.removeEventListener("deviceorientation", onOrientation);
      lastSector.current = null;
    };
  }, [enabled, connected, guiding, callActive]);
}
