import { useEffect } from "react";
import { bluetoothManager } from "@/bluetooth/BluetoothManager";
import { useConnectionStore } from "@/store/connectionStore";
import { usePacketStore } from "@/store/packetStore";

export function useBluetooth() {
  const { refreshServices } = useConnectionStore();
  const { addSentPacket, addReceivedPacket } = usePacketStore();

  useEffect(() => {
    const unsubscribe = bluetoothManager.on((event) => {
      switch (event.type) {
        case "connected":
          void refreshServices();
          break;
        case "packet-sent": {
          const payload = event.payload as {
            serviceUuid: string;
            characteristicUuid: string;
            payload: Uint8Array;
          };
          addSentPacket(payload.payload, payload.serviceUuid, payload.characteristicUuid);
          break;
        }
        case "packet-received":
        case "notification": {
          const payload = event.payload as {
            serviceUuid: string;
            characteristicUuid: string;
            payload: Uint8Array;
          };
          addReceivedPacket(payload.payload, payload.serviceUuid, payload.characteristicUuid);
          break;
        }
        default:
          break;
      }
    });

    return unsubscribe;
  }, [addReceivedPacket, addSentPacket, refreshServices]);

  return {
    isSupported: bluetoothManager.isSupported(),
    manager: bluetoothManager,
  };
}
