import { useEffect } from "react";
import { startMapsNavBridge } from "@/navigation/mapsNavBridge";
import { useMapsNavStore } from "@/store/mapsNavStore";

/** Subscribe to Maps notification bridge status + last turn update. */
export function useMapsNavListener() {
  const status = useMapsNavStore((s) => s.status);
  const lastUpdate = useMapsNavStore((s) => s.lastUpdate);
  const mirroringEnabled = useMapsNavStore((s) => s.mirroringEnabled);
  const setMirroringEnabled = useMapsNavStore((s) => s.setMirroringEnabled);

  useEffect(() => {
    void startMapsNavBridge();
  }, []);

  return {
    status,
    lastUpdate,
    mirroringEnabled,
    setMirroringEnabled,
    isAndroid: status.supported,
    listenerEnabled: status.enabled,
    listenerConnected: status.connected,
  };
}
