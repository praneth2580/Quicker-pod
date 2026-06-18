import { Link } from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useConnectionStore } from "@/store/connectionStore";
import { usePacketStore } from "@/store/packetStore";
import { formatRssi } from "@/utils/format";
import { bytesToHex } from "@/utils";

export function DashboardPage() {
  const { connected, bluetoothSupported, device, rssi, lastError } = useConnectionStore();
  const { sentPackets, receivedPackets } = usePacketStore();

  const lastSent = sentPackets[sentPackets.length - 1];
  const lastReceived = receivedPackets[receivedPackets.length - 1];

  return (
    <AppLayout title="Dashboard" subtitle="Tripper Pod Diagnostics">
      <div className="space-y-4">
        <Card title="Bluetooth Status">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-surface-raised p-4">
              <p className="text-xs uppercase tracking-wider text-gray-500">API</p>
              <StatusBadge
                label={bluetoothSupported ? "Available" : "Unsupported"}
                active={bluetoothSupported}
                variant={bluetoothSupported ? "success" : "danger"}
              />
            </div>
            <div className="rounded-xl bg-surface-raised p-4">
              <p className="text-xs uppercase tracking-wider text-gray-500">Connection</p>
              <StatusBadge
                label={connected ? "Connected" : "Disconnected"}
                active={connected}
                variant={connected ? "success" : "neutral"}
              />
            </div>
          </div>
        </Card>

        <Card title="Device">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Name</span>
              <span className="font-medium">{device?.name ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">ID</span>
              <span className="font-mono text-sm">{device?.id ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Signal</span>
              <span className="font-mono">{formatRssi(rssi)}</span>
            </div>
          </div>
        </Card>

        <Card title="Last Packets">
          <div className="space-y-4">
            <div>
              <p className="mb-1 text-xs uppercase tracking-wider text-gray-500">Last Sent</p>
              <pre className="overflow-x-auto rounded-lg bg-black/40 p-3 font-mono text-sm text-accent">
                {lastSent ? bytesToHex(lastSent.payload) : "—"}
              </pre>
            </div>
            <div>
              <p className="mb-1 text-xs uppercase tracking-wider text-gray-500">Last Received</p>
              <pre className="overflow-x-auto rounded-lg bg-black/40 p-3 font-mono text-sm text-success">
                {lastReceived ? bytesToHex(lastReceived.payload) : "—"}
              </pre>
            </div>
          </div>
        </Card>

        {lastError && (
          <Card className="border-danger/30">
            <p className="text-sm text-danger">{lastError}</p>
          </Card>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Link to="/scanner">
            <Button fullWidth variant="primary">
              Scan Devices
            </Button>
          </Link>
          <Link to="/console">
            <Button fullWidth variant="secondary">
              Packet Console
            </Button>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
