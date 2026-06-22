import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useConnectionStore } from "@/store/connectionStore";
import { useProtocolLabStore } from "../store";
import { useProtocolLabPacketLogger } from "../store/packetLoggerStore";
import { useMutationStore } from "../store";
import { exportJson, exportCsv } from "../utils/export";
import type { SessionExportData } from "../types";
import { readTextFile } from "@/utils/format";

export function ExportPanel() {
  const device = useConnectionStore((s) => s.device);
  const connected = useConnectionStore((s) => s.connected);
  const detailedServices = useProtocolLabStore((s) => s.detailedServices);
  const { notifications, sentPackets, receivedPackets } = useProtocolLabPacketLogger();
  const results = useMutationStore((s) => s.results);

  const buildSession = (): SessionExportData => ({
    exportedAt: new Date().toISOString(),
    device: device ? { id: device.id, name: device.name } : null,
    connected,
    services: detailedServices,
    notifications,
    sentPackets,
    receivedPackets,
    mutationResults: results,
  });

  const handleExportJson = () => {
    exportJson(`quicker-pod-session-${Date.now()}.json`, buildSession());
  };

  const handleExportCsv = () => {
    const session = buildSession();
    const rows: string[][] = [];

    for (const n of session.notifications) {
      rows.push(["notification", n.timestamp, n.serviceUuid, n.characteristicUuid, n.payloadHex, n.notes ?? ""]);
    }
    for (const p of session.sentPackets) {
      rows.push(["sent", p.timestamp, p.serviceUuid, p.characteristicUuid, p.payloadHex, p.notes ?? ""]);
    }
    for (const r of session.mutationResults) {
      rows.push(["mutation", r.timestamp, "", "", r.packetHex, r.notes]);
    }

    exportCsv(
      `quicker-pod-session-${Date.now()}.csv`,
      ["type", "timestamp", "serviceUuid", "characteristicUuid", "payload", "notes"],
      rows,
    );
  };

  const handleImportJson = async () => {
    const content = await readTextFile();
    if (!content) return;
    try {
      const data = JSON.parse(content) as SessionExportData;
      if (data.notifications || data.sentPackets || data.receivedPackets) {
        await useProtocolLabPacketLogger.getState().importFromSession({
          notifications: data.notifications,
          sentPackets: data.sentPackets,
          receivedPackets: data.receivedPackets,
        });
      }
      if (data.services) {
        useProtocolLabStore.getState().setDetailedServices(data.services);
      }
      if (data.mutationResults) {
        for (const result of data.mutationResults) {
          useMutationStore.getState().addResult(result);
        }
      }
    } catch {
      useProtocolLabStore.getState().addError("Failed to import session JSON");
    }
  };

  return (
    <div className="space-y-4">
      <Card title="Session Export" subtitle="Export full protocol lab session">
        <ul className="mb-4 space-y-1 text-sm text-gray-400">
          <li>• Services, characteristics, descriptors</li>
          <li>• Notifications and sent packets</li>
          <li>• Mutation results</li>
          <li>• Device information</li>
        </ul>
        <div className="grid gap-2">
          <Button variant="secondary" onClick={handleExportJson}>
            Export JSON
          </Button>
          <Button variant="secondary" onClick={handleExportCsv}>
            Export CSV
          </Button>
          <Button variant="ghost" onClick={() => void handleImportJson()}>
            Import JSON Session
          </Button>
        </div>
      </Card>

      <Card title="Summary">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-black/20 p-3">
            <p className="text-gray-500">Services</p>
            <p className="text-xl font-semibold text-white">{detailedServices.length}</p>
          </div>
          <div className="rounded-lg bg-black/20 p-3">
            <p className="text-gray-500">Notifications</p>
            <p className="text-xl font-semibold text-white">{notifications.length}</p>
          </div>
          <div className="rounded-lg bg-black/20 p-3">
            <p className="text-gray-500">Sent</p>
            <p className="text-xl font-semibold text-white">{sentPackets.length}</p>
          </div>
          <div className="rounded-lg bg-black/20 p-3">
            <p className="text-gray-500">Mutations</p>
            <p className="text-xl font-semibold text-white">{results.length}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
