import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { NAVIGATION_MANEUVERS } from "@/services/mockData";
import { hexToBytes } from "@/utils";
import type { NavigationManeuver } from "@/types";
import { useProtocolLabPacketLogger } from "../store/packetLoggerStore";

const NAV_SERVICE = "0000fff2-0000-1000-8000-00805f9b34fb";
const NAV_CHAR = "0000fff2-0000-1000-8000-00805f9b34fb";

export function SimulatorPanel() {
  const addSent = useProtocolLabPacketLogger((s) => s.addSent);

  const simulate = (_maneuver: NavigationManeuver, hex: string) => {
    const bytes = hexToBytes(hex);
    addSent(NAV_SERVICE, NAV_CHAR, bytes, "nav-simulator");
  };

  return (
    <div className="space-y-4">
      <Card subtitle="Simulate navigation commands. Packets appear in the Monitor tab.">
        <p className="text-sm text-gray-400">
          Placeholder packets for protocol exploration. Map to Tripper protocol as reverse
          engineering progresses.
        </p>
      </Card>

      <div className="grid gap-3">
        {NAVIGATION_MANEUVERS.map((m) => (
          <Card key={m.maneuver}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">{m.label}</h3>
                <pre className="mt-1 font-mono text-sm text-accent">{m.hex}</pre>
              </div>
              <Button variant="secondary" onClick={() => simulate(m.maneuver, m.hex)}>
                Simulate
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
