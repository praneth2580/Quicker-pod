import { useState } from "react";
import { AppLayout } from "@/layouts/AppLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { usePacketStore } from "@/store/packetStore";
import { useConnectionStore } from "@/store/connectionStore";
import { bluetoothManager } from "@/bluetooth/BluetoothManager";
import { EXAMPLE_PACKETS } from "@/services/mockData";
import { hexToBytes, isValidHex } from "@/utils";

const DEFAULT_SERVICE = "0000fff0-0000-1000-8000-00805f9b34fb";
const DEFAULT_CHAR = "0000fff1-0000-1000-8000-00805f9b34fb";

export function TransmitPage() {
  const [hex, setHex] = useState("01 FF 20");
  const [error, setError] = useState<string | null>(null);
  const [repeating, setRepeating] = useState(false);
  const { addSentPacket, savePacket, savedPackets } = usePacketStore();
  const { connected, mockMode } = useConnectionStore();

  const handleSend = async () => {
    setError(null);
    if (!isValidHex(hex)) {
      setError("Invalid hex string");
      return;
    }

    try {
      const bytes = hexToBytes(hex);
      if (mockMode || !connected) {
        addSentPacket(bytes, DEFAULT_SERVICE, DEFAULT_CHAR);
        return;
      }
      await bluetoothManager.writeCharacteristic(DEFAULT_SERVICE, DEFAULT_CHAR, bytes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Send failed");
    }
  };

  const handleSave = () => {
    if (!isValidHex(hex)) {
      setError("Invalid hex string");
      return;
    }
    savePacket(`Packet ${savedPackets.length + 1}`, hex);
  };

  const handleRepeat = () => {
    if (repeating) {
      setRepeating(false);
      return;
    }
    setRepeating(true);
    const interval = setInterval(() => {
      if (!usePacketStore.getState()) return;
      void handleSend();
    }, 1000);
    setTimeout(() => {
      clearInterval(interval);
      setRepeating(false);
    }, 5000);
  };

  return (
    <AppLayout title="Packet Sender" subtitle="Manual HEX Transmission">
      <div className="space-y-4">
        <Card>
          <Input
            label="HEX Payload"
            mono
            value={hex}
            onChange={(e) => setHex(e.target.value.toUpperCase())}
            placeholder="01 FF 20"
          />
          {error && <p className="mt-2 text-sm text-danger">{error}</p>}

          <div className="mt-4 grid grid-cols-3 gap-2">
            <Button onClick={() => void handleSend()}>Send</Button>
            <Button variant="secondary" onClick={handleSave}>
              Save
            </Button>
            <Button variant={repeating ? "danger" : "secondary"} onClick={handleRepeat}>
              {repeating ? "Stop" : "Repeat"}
            </Button>
          </div>
        </Card>

        <Card title="Examples">
          <div className="space-y-2">
            {EXAMPLE_PACKETS.map((pkt) => (
              <button
                key={pkt.name}
                type="button"
                onClick={() => setHex(pkt.hex)}
                className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-surface-raised px-4 py-3 text-left hover:border-accent/30"
              >
                <span className="text-sm text-gray-400">{pkt.name}</span>
                <span className="font-mono text-accent">{pkt.hex}</span>
              </button>
            ))}
          </div>
        </Card>

        {savedPackets.length > 0 && (
          <Card title="Saved Packets">
            <div className="space-y-2">
              {savedPackets.map((pkt) => (
                <button
                  key={pkt.id}
                  type="button"
                  onClick={() => setHex(pkt.hex)}
                  className="flex w-full items-center justify-between rounded-lg border border-white/10 px-4 py-3 text-left hover:border-accent/30"
                >
                  <span>{pkt.name}</span>
                  <span className="font-mono text-sm text-accent">{pkt.hex}</span>
                </button>
              ))}
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
