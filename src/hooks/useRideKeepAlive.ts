import { useEffect } from "react";
import { TripperBle } from "tripper-ble";
import { isNativeTripperBle } from "@/bluetooth/nativeTripperBle";
import { useConnectionStore } from "@/store/connectionStore";

/**
 * Ensures the Android ride foreground notification stays in sync with
 * connection state (native also auto-starts on GATT connect).
 */
export function useRideKeepAlive() {
  const connected = useConnectionStore((s) => s.connected);
  const deviceName = useConnectionStore((s) => s.device?.name ?? s.currentDevice?.name);

  useEffect(() => {
    if (!isNativeTripperBle()) return;

    if (connected) {
      void TripperBle.startKeepAlive({
        deviceName: deviceName ?? "Tripper",
        text: "Linked — keeping Bluetooth alive for navigation",
      }).catch(() => undefined);
    } else {
      void TripperBle.stopKeepAlive().catch(() => undefined);
    }
  }, [connected, deviceName]);
}
