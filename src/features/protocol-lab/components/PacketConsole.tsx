import { Button } from "@/components/ui/Button";
import type { ProtocolLogEntry } from "../types";

interface PacketConsoleProps {
  entries: ProtocolLogEntry[];
  paused: boolean;
  onPause: () => void;
  onClear: () => void;
  onCopy: () => void;
  onExport: () => void;
  title?: string;
}

export function PacketConsole({
  entries,
  paused,
  onPause,
  onClear,
  onCopy,
  onExport,
  title = "Live Log",
}: PacketConsoleProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {paused && (
          <span className="rounded-full bg-warning/20 px-2 py-0.5 text-xs text-warning">Paused</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Button variant="secondary" onClick={onPause}>
          {paused ? "Resume" : "Pause"}
        </Button>
        <Button variant="danger" onClick={onClear}>
          Clear
        </Button>
        <Button variant="secondary" onClick={onCopy}>
          Copy
        </Button>
        <Button variant="secondary" onClick={onExport}>
          Export
        </Button>
      </div>

      <div className="max-h-[50vh] overflow-y-auto rounded-xl border border-white/10 bg-black/30 p-3">
        {entries.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">No packets yet</p>
        ) : (
          <div className="space-y-3 font-mono text-sm">
            {entries.map((log) => (
              <div
                key={log.id}
                className={`rounded-lg border p-3 ${
                  log.direction === "TX" ? "border-accent/20 bg-accent/5" : "border-success/20 bg-success/5"
                }`}
              >
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{log.timestamp}</span>
                  <span className={log.direction === "TX" ? "text-accent" : "text-success"}>
                    {log.direction}
                  </span>
                </div>
                <p className="mt-1 text-[0.65rem] text-gray-500">S: {log.serviceUuid}</p>
                <p className="text-[0.65rem] text-gray-500">C: {log.characteristicUuid}</p>
                <p className="mt-2 tracking-wider text-white">{log.payloadHex}</p>
                {log.notes && <p className="mt-1 text-xs text-gray-500">{log.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
