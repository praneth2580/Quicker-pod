import { useState } from "react";
import { AppLayout } from "@/layouts/AppLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useConnectionStore } from "@/store/connectionStore";
import { bluetoothManager } from "@/bluetooth/BluetoothManager";
import { usePacketStore } from "@/store/packetStore";
import { bytesToHex } from "@/utils";
import { truncateUuid } from "@/utils/format";

export function ExplorerPage() {
  const { connected, services, refreshServices, mockMode } = useConnectionStore();
  const { addReceivedPacket } = usePacketStore();
  const [activeChar, setActiveChar] = useState<string | null>(null);
  const [lastValue, setLastValue] = useState<string>("");

  const handleRead = async (serviceUuid: string, charUuid: string) => {
    setActiveChar(charUuid);
    try {
      if (mockMode) {
        const mockBytes = new Uint8Array([0xaa, 0xbb, 0xcc, 0xdd]);
        setLastValue(bytesToHex(mockBytes));
        addReceivedPacket(mockBytes, serviceUuid, charUuid);
        return;
      }
      const value = await bluetoothManager.readCharacteristic(serviceUuid, charUuid);
      setLastValue(bytesToHex(value));
    } catch (err) {
      setLastValue(err instanceof Error ? err.message : "Read failed");
    }
  };

  const handleWrite = async (serviceUuid: string, charUuid: string) => {
    const data = new Uint8Array([0x01, 0xff, 0x20]);
    try {
      if (mockMode) {
        usePacketStore.getState().addSentPacket(data, serviceUuid, charUuid);
        return;
      }
      await bluetoothManager.writeCharacteristic(serviceUuid, charUuid, data);
    } catch (err) {
      setLastValue(err instanceof Error ? err.message : "Write failed");
    }
  };

  const handleSubscribe = async (serviceUuid: string, charUuid: string) => {
    try {
      if (mockMode) {
        setLastValue("Subscribed (mock)");
        return;
      }
      await bluetoothManager.subscribeToNotifications(serviceUuid, charUuid);
      setLastValue("Subscribed to notifications");
    } catch (err) {
      setLastValue(err instanceof Error ? err.message : "Subscribe failed");
    }
  };

  if (!connected) {
    return (
      <AppLayout title="Device Explorer" subtitle="GATT Services & Characteristics">
        <Card title="Not Connected">
          <p className="mb-4 text-gray-400">Connect to a device from the scanner first.</p>
          <Button variant="secondary" onClick={() => void refreshServices()}>
            Refresh
          </Button>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Device Explorer" subtitle="GATT Services & Characteristics">
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button variant="ghost" onClick={() => void refreshServices()}>
            Refresh Services
          </Button>
        </div>

        {services.map((service) => (
          <Card key={service.uuid} title={service.name ?? truncateUuid(service.uuid, 13)}>
            <p className="mb-4 font-mono text-xs text-gray-500">{service.uuid}</p>
            <div className="space-y-3">
              {service.characteristics.map((char) => (
                <div
                  key={char.uuid}
                  className={`rounded-xl border p-4 ${activeChar === char.uuid ? "border-accent/50 bg-accent/5" : "border-white/10 bg-surface-raised"}`}
                >
                  <div className="mb-2">
                    <p className="font-medium">{char.name ?? "Characteristic"}</p>
                    <p className="font-mono text-xs text-gray-500">{char.uuid}</p>
                  </div>
                  <div className="mb-3 flex flex-wrap gap-2">
                    {char.properties.read && (
                      <span className="rounded bg-white/5 px-2 py-0.5 text-xs">READ</span>
                    )}
                    {char.properties.write && (
                      <span className="rounded bg-white/5 px-2 py-0.5 text-xs">WRITE</span>
                    )}
                    {char.properties.notify && (
                      <span className="rounded bg-white/5 px-2 py-0.5 text-xs">NOTIFY</span>
                    )}
                    {char.properties.indicate && (
                      <span className="rounded bg-white/5 px-2 py-0.5 text-xs">INDICATE</span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="secondary"
                      disabled={!char.properties.read}
                      onClick={() => void handleRead(service.uuid, char.uuid)}
                    >
                      Read
                    </Button>
                    <Button
                      variant="secondary"
                      disabled={!char.properties.write}
                      onClick={() => void handleWrite(service.uuid, char.uuid)}
                    >
                      Write
                    </Button>
                    <Button
                      variant="secondary"
                      disabled={!char.properties.notify && !char.properties.indicate}
                      onClick={() => void handleSubscribe(service.uuid, char.uuid)}
                    >
                      Notify
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}

        {lastValue && (
          <Card title="Last Result">
            <pre className="font-mono text-sm text-accent">{lastValue}</pre>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
