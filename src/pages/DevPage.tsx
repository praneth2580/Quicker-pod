import { Link } from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";
import { Card } from "@/components/ui/Card";

const DEV_TOOLS = [
  {
    path: "/opcode-probe",
    title: "Opcode probe",
    description:
      "Send unused opcodes and the gaps after 0x50, and record the BLE notification.",
  },
  {
    path: "/nav-lab",
    title: "Nav Lab",
    description:
      "Cycle every Google → Tripper maneuver and compare the pod icon to expected bytes.",
  },
  {
    path: "/protocol-lab",
    title: "Protocol Lab",
    description: "GATT explorer, packet monitor, sender, mutation runner, and export.",
  },
  {
    path: "/fuzzer",
    title: "Fuzzer",
    description: "Structured fuzz sessions against Tripper frames and fields.",
  },
  {
    path: "/ble-debug",
    title: "BLE Debug",
    description: "Handshake stages, TX/RX log console, and connection diagnostics.",
  },
] as const;

export function DevPage() {
  return (
    <AppLayout title="Developer tools" subtitle="Research & diagnostics">
      <div className="space-y-4 animate-nav-rise">
        <Card>
          <p className="text-sm text-ink-muted">
            Protocol research stays here so Home, Navigate, Connect, and Settings stay focused on
            the companion experience. Open these from Settings → Developer tools.
          </p>
        </Card>

        <div className="space-y-3">
          {DEV_TOOLS.map((tool) => (
            <Link key={tool.path} to={tool.path} className="block">
              <Card className="transition-colors hover:border-accent/40">
                <div className="flex items-start gap-4">
                  <div className="min-w-0">
                    <h3 className="font-display text-base font-semibold text-ink">{tool.title}</h3>
                    <p className="mt-1 text-sm text-ink-muted">{tool.description}</p>
                  </div>
                  <span className="ml-auto self-center text-ink-faint">›</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <Link to="/settings" className="text-sm font-semibold text-accent underline-offset-2 hover:underline">
          ← Back to Settings
        </Link>
      </div>
    </AppLayout>
  );
}
