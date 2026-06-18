import { AppLayout } from "@/layouts/AppLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { usePacketStore } from "@/store/packetStore";
import { downloadText } from "@/utils/format";

export function ConsolePage() {
  const sentPackets = usePacketStore((s) => s.sentPackets);
  const receivedPackets = usePacketStore((s) => s.receivedPackets);
  const { clearLogs, exportLogs, getAllLogs } = usePacketStore();
  const logs = getAllLogs();
  void sentPackets;
  void receivedPackets;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(exportLogs());
  };

  const handleExport = () => {
    downloadText(`opentripper-logs-${Date.now()}.txt`, exportLogs());
  };

  return (
    <AppLayout title="Packet Console" subtitle="Live BLE Traffic Log">
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <Button variant="danger" onClick={clearLogs}>
            Clear
          </Button>
          <Button variant="secondary" onClick={handleExport}>
            Export
          </Button>
          <Button variant="secondary" onClick={() => void handleCopy()}>
            Copy
          </Button>
        </div>

        <Card className="p-0">
          <div className="max-h-[60vh] overflow-y-auto p-4">
            {logs.length === 0 ? (
              <p className="text-center text-gray-500">No packets logged yet</p>
            ) : (
              <div className="space-y-4 font-mono text-sm">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className={`rounded-lg border p-3 ${log.direction === "TX" ? "border-accent/20 bg-accent/5" : "border-success/20 bg-success/5"}`}
                  >
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{log.timestamp}</span>
                      <span
                        className={
                          log.direction === "TX" ? "text-accent" : "text-success"
                        }
                      >
                        {log.direction}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">S: {log.serviceUuid}</p>
                    <p className="text-xs text-gray-500">C: {log.characteristicUuid}</p>
                    <p className="mt-2 text-base tracking-wider">{log.payloadHex}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
