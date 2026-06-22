import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { HexInput } from "./HexInput";
import { useProtocolLabStore } from "../store";
import { writeCharacteristic } from "../services/bleService";
import { useProtocolLabPacketLogger } from "../store/packetLoggerStore";
import { useManeuverStore } from "@/store/maneuverStore";
import { hexToBytes, isValidHex } from "@/utils";
import type { StoredManeuver } from "@/db/types";

export function SimulatorPanel() {
  const [label, setLabel] = useState("");
  const [hex, setHex] = useState("");
  const maneuvers = useManeuverStore((s) => s.maneuvers);
  const addManeuverToStore = useManeuverStore((s) => s.addManeuver);
  const removeManeuverFromStore = useManeuverStore((s) => s.removeManeuver);
  const selectedWritable = useProtocolLabStore((s) => s.selectedWritable);
  const addError = useProtocolLabStore((s) => s.addError);
  const addSent = useProtocolLabPacketLogger((s) => s.addSent);

  const addManeuver = async () => {
    if (!label.trim() || !isValidHex(hex)) {
      addError("Enter a label and valid HEX packet to save a maneuver");
      return;
    }
    await addManeuverToStore(label.trim(), hex.toUpperCase());
    setLabel("");
    setHex("");
  };

  const simulate = async (maneuver: StoredManeuver) => {
    if (!selectedWritable) {
      addError("Select a writable characteristic in Explorer first");
      return;
    }
    try {
      const bytes = hexToBytes(maneuver.hex);
      await writeCharacteristic(
        selectedWritable.serviceUuid,
        selectedWritable.characteristicUuid,
        bytes,
      );
      addSent(
        selectedWritable.serviceUuid,
        selectedWritable.characteristicUuid,
        bytes,
        `simulator: ${maneuver.label}`,
      );
    } catch (err) {
      addError(err instanceof Error ? err.message : "Simulation send failed");
    }
  };

  return (
    <div className="space-y-4">
      <Card subtitle="Define and send navigation-style packets as the Tripper protocol is mapped.">
        <p className="text-sm text-gray-400">
          No predefined maneuvers — add your own packet definitions from protocol research.
          Packets are sent to the selected writable characteristic and appear in Monitor.
        </p>
      </Card>

      <Card title="Add maneuver">
        <div className="space-y-3">
          <Input
            label="Label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Left turn"
          />
          <HexInput label="HEX packet" value={hex} onChange={setHex} />
          <Button fullWidth variant="secondary" onClick={() => void addManeuver()}>
            Save maneuver
          </Button>
        </div>
      </Card>

      {maneuvers.length === 0 ? (
        <Card>
          <p className="text-center text-sm text-gray-400">No maneuvers saved yet.</p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {maneuvers.map((m) => (
            <Card key={m.id}>
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold">{m.label}</h3>
                  <pre className="mt-1 font-mono text-sm text-accent">{m.hex}</pre>
                </div>
                <div className="flex shrink-0 flex-col gap-2">
                  <Button variant="secondary" onClick={() => void simulate(m)}>
                    Send
                  </Button>
                  {m.id !== undefined && (
                    <Button variant="ghost" onClick={() => void removeManeuverFromStore(m.id!)}>
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
