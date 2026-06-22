import { useEffect } from "react";
import { bluetoothManager } from "@/bluetooth/BluetoothManager";
import { useConnectionStore } from "@/store/connectionStore";
import { useProtocolLabPacketLogger } from "../store/packetLoggerStore";
import { useProtocolLabStore, useMutationStore } from "../store";

export function useProtocolLabBle() {
  const { connected } = useConnectionStore();
  const notificationsPaused = useProtocolLabStore((s) => s.notificationsPaused);
  const { addNotification, addSent, addReceived } = useProtocolLabPacketLogger();
  const addError = useProtocolLabStore((s) => s.addError);
  const setRunning = useMutationStore((s) => s.setRunning);

  useEffect(() => {
    const unsub = bluetoothManager.on((event) => {
      if (notificationsPaused && (event.type === "notification" || event.type === "packet-received")) {
        return;
      }

      const payload = event.payload as {
        serviceUuid: string;
        characteristicUuid: string;
        payload: Uint8Array;
      } | undefined;

      if (!payload?.payload) return;

      switch (event.type) {
        case "packet-sent":
          addSent(payload.serviceUuid, payload.characteristicUuid, payload.payload);
          break;
        case "notification":
          addNotification(payload.serviceUuid, payload.characteristicUuid, payload.payload);
          break;
        case "packet-received":
          addReceived(payload.serviceUuid, payload.characteristicUuid, payload.payload);
          break;
        case "disconnected":
          setRunning(false);
          break;
        case "error":
          addError(String(event.payload ?? "Bluetooth error"));
          break;
        default:
          break;
      }
    });

    return unsub;
  }, [addError, addNotification, addReceived, addSent, notificationsPaused, setRunning]);

  useEffect(() => {
    if (!connected && useMutationStore.getState().running) {
      setRunning(false);
    }
  }, [connected, setRunning]);
}
