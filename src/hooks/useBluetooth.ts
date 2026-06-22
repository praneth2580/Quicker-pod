import { useEffect } from "react";
import { bluetoothManager } from "@/bluetooth/BluetoothManager";
import { useConnectionStore } from "@/store/connectionStore";

export function useBluetooth() {
  const { refreshServices } = useConnectionStore();

  useEffect(() => {
    const unsubscribe = bluetoothManager.on((event) => {
      if (event.type === "connected") {
        void refreshServices();
      }
    });

    return unsubscribe;
  }, [refreshServices]);

  return {
    isSupported: bluetoothManager.isSupported(),
    manager: bluetoothManager,
  };
}
