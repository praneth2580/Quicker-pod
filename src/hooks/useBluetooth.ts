import { useEffect } from "react";
import { bluetoothManager } from "@/bluetooth/BluetoothManager";
import { bleDebugLogger } from "@/bluetooth/bleDebugLogger";
import { useConnectionStore } from "@/store/connectionStore";
import { useBleDebugStore } from "@/store/bleDebugStore";

export function useBluetooth() {
  const { refreshServices } = useConnectionStore();
  const syncFromLogger = useBleDebugStore((s) => s.syncFromLogger);

  useEffect(() => {
    const unsubLogger = bleDebugLogger.subscribe(() => {
      syncFromLogger();
    });
    syncFromLogger();

    const unsubscribe = bluetoothManager.on((event) => {
      if (event.type === "connected") {
        void refreshServices();
      }
      if (event.type === "disconnected") {
        useConnectionStore.setState({
          connected: false,
          connecting: false,
          services: [],
        });
      }
    });

    return () => {
      unsubLogger();
      unsubscribe();
    };
  }, [refreshServices, syncFromLogger]);

  return {
    isSupported: bluetoothManager.isSupported(),
    manager: bluetoothManager,
  };
}
