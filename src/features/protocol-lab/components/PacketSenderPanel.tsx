import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { isValidHex, hexToBytes } from "@/utils";
import { HexInput } from "./HexInput";
import { useProtocolLabStore } from "../store";
import { writeCharacteristic } from "../services/bleService";
import { useProtocolLabPacketLogger } from "../store/packetLoggerStore";
import { useConnectionStore } from "@/store/connectionStore";
import { useSavedPacketStore } from "@/store/savedPacketStore";
import { formatUuid } from "../utils/formatUuid";

export function PacketSenderPanel() {
  const [hex, setHex] = useState("");
  const [saveName, setSaveName] = useState("");
  const selectedWritable = useProtocolLabStore((s) => s.selectedWritable);
  const { lastSentHex, lastResponseHex, lastSendError, setLastSend } = useProtocolLabStore();
  const addError = useProtocolLabStore((s) => s.addError);
  const addSent = useProtocolLabPacketLogger((s) => s.addSent);
  const device = useConnectionStore((s) => s.device);
  const savedPackets = useSavedPacketStore((s) => s.packets);
  const addSavedPacket = useSavedPacketStore((s) => s.addPacket);
  const removeSavedPacket = useSavedPacketStore((s) => s.removePacket);

  const handleSend = async () => {
    if (!selectedWritable) {
      addError("Select a writable characteristic first");
      return;
    }
    if (!isValidHex(hex)) {
      setLastSend(null, null, "Invalid HEX input");
      return;
    }

    try {
      const bytes = hexToBytes(hex);
      await writeCharacteristic(
        selectedWritable.serviceUuid,
        selectedWritable.characteristicUuid,
        bytes,
      );
      addSent(selectedWritable.serviceUuid, selectedWritable.characteristicUuid, bytes);
      setLastSend(hex, null, null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Send failed";
      addError(msg);
      setLastSend(hex, null, msg);
    }
  };

  const handleSave = async () => {
    if (!isValidHex(hex)) {
      addError("Enter valid HEX before saving");
      return;
    }
    const name = saveName.trim() || `Packet ${new Date().toLocaleTimeString()}`;
    await addSavedPacket(name, hex.toUpperCase(), device?.id);
    setSaveName("");
  };

  const handleRepeat = () => {
    void handleSend();
  };

  return (
    <div className="space-y-4">
      <Card title="Target Characteristic">
        {selectedWritable ? (
          <div className="space-y-1 text-sm">
            <p className="text-white">{selectedWritable.name ?? "Writable characteristic"}</p>
            <p className="font-mono text-xs text-gray-500">
              {formatUuid(selectedWritable.serviceUuid, false)}
            </p>
            <p className="font-mono text-xs text-gray-500">
              {formatUuid(selectedWritable.characteristicUuid, false)}
            </p>
          </div>
        ) : (
          <p className="text-sm text-warning">
            Select a writable characteristic in Device Explorer first.
          </p>
        )}
      </Card>

      <Card>
        <HexInput label="HEX Packet" value={hex} onChange={setHex} error={lastSendError} />
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button onClick={() => void handleSend()} disabled={!selectedWritable}>
            Send
          </Button>
          <Button variant="secondary" onClick={handleRepeat} disabled={!selectedWritable || !hex}>
            Repeat
          </Button>
        </div>
        <div className="mt-4 space-y-2">
          <Input
            label="Save as"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            placeholder="Optional name"
          />
          <Button fullWidth variant="secondary" onClick={() => void handleSave()} disabled={!isValidHex(hex)}>
            Save to library
          </Button>
        </div>
      </Card>

      {savedPackets.length > 0 && (
        <Card title="Saved packets">
          <div className="space-y-2">
            {savedPackets.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-3 rounded-lg bg-black/20 p-3"
              >
                <button
                  type="button"
                  className="min-w-0 flex-1 text-left"
                  onClick={() => setHex(p.hex)}
                >
                  <p className="truncate text-sm font-medium text-white">{p.name}</p>
                  <p className="mt-1 font-mono text-xs text-accent">{p.hex}</p>
                </button>
                {p.id !== undefined && (
                  <Button variant="ghost" onClick={() => void removeSavedPacket(p.id!)}>
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card title="Last Result">
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-xs uppercase text-gray-500">Last Sent</p>
            <pre className="packet-viewer mt-1 text-accent">{lastSentHex ?? "—"}</pre>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-500">Response</p>
            <pre className="packet-viewer mt-1 text-success">{lastResponseHex ?? "—"}</pre>
          </div>
          {lastSendError && <p className="text-danger">{lastSendError}</p>}
        </div>
      </Card>
    </div>
  );
}
