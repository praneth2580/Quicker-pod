import { useEffect, useState } from "react";
import { migrateFromLocalStorage } from "@/db/repository";
import { useProtocolLabPacketLogger } from "@/features/protocol-lab/store/packetLoggerStore";
import { useMutationStore } from "@/features/protocol-lab/store";
import { useDeviceStore } from "@/store/deviceStore";
import { useSavedPacketStore } from "@/store/savedPacketStore";

export function useDbInit(): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      await migrateFromLocalStorage();
      await Promise.all([
        useProtocolLabPacketLogger.getState().hydrateFromDb(),
        useMutationStore.getState().hydrateFromDb(),
        useDeviceStore.getState().loadDevices(),
        useSavedPacketStore.getState().loadPackets(),
      ]);
      if (!cancelled) setReady(true);
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, []);

  return ready;
}
