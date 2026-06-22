import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { isValidHex, hexToBytes } from "@/utils";
import { HexInput } from "./HexInput";
import { useProtocolLabStore } from "../store";
import { writeCharacteristic } from "../services/bleService";
import { formatReadValue } from "../services/bleService";
import { useProtocolLabPacketLogger } from "../store/packetLoggerStore";
import { formatUuid } from "../utils/formatUuid";

export function PacketSenderPanel() {
  const [hex, setHex] = useState("20 01 00 64");
  const selectedWritable = useProtocolLabStore((s) => s.selectedWritable);
  const { lastSentHex, lastResponseHex, lastSendError, setLastSend } = useProtocolLabStore();
  const addError = useProtocolLabStore((s) => s.addError);
  const addSent = useProtocolLabPacketLogger((s) => s.addSent);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

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
      setLastSend(hex, formatReadValue(new Uint8Array([0xaa, bytes[bytes.length - 1] ?? 0])), null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Send failed";
      addError(msg);
      setLastSend(hex, null, msg);
    }
  };

  const handleRepeat = () => {
    const repeat = lastSaved ?? lastSentHex ?? hex;
    setHex(repeat);
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
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Button onClick={() => void handleSend()} disabled={!selectedWritable}>
            Send
          </Button>
          <Button variant="secondary" onClick={() => setLastSaved(hex)} disabled={!isValidHex(hex)}>
            Save
          </Button>
          <Button variant="secondary" onClick={handleRepeat} disabled={!selectedWritable}>
            Repeat
          </Button>
        </div>
      </Card>

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
