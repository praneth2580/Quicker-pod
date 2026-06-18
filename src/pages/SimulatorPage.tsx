import { AppLayout } from "@/layouts/AppLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { NAVIGATION_MANEUVERS } from "@/services/mockData";
import { usePacketStore } from "@/store/packetStore";
import { hexToBytes } from "@/utils";
import type { NavigationManeuver } from "@/types";

export function SimulatorPage() {
  const { addSentPacket } = usePacketStore();

  const simulate = (_maneuver: NavigationManeuver, hex: string) => {
    const bytes = hexToBytes(hex);
    addSentPacket(bytes, "0000fff2-0000-1000-8000-00805f9b34fb", "nav-sim");
  };

  return (
    <AppLayout title="Navigation Simulator" subtitle="Maneuver Packet Generator">
      <div className="space-y-4">
        <Card subtitle="Simulate navigation commands. Packets will appear in the console.">
          <p className="text-sm text-gray-400">
            These are placeholder packets for protocol exploration. Map to Tripper protocol as
            reverse engineering progresses.
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
                <Button
                  variant="secondary"
                  onClick={() => simulate(m.maneuver, m.hex)}
                >
                  Simulate
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
