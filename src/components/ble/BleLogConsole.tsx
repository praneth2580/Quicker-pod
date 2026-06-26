import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  bleDebugLogger,
  formatBleEventLine,
  type BleDebugEvent,
} from "@/bluetooth/bleDebugLogger";
import { useBleDebugStore } from "@/store/bleDebugStore";

function levelColor(level: string): string {
  switch (level) {
    case "error":
      return "text-red-400";
    case "warn":
      return "text-amber-400";
    case "tx":
      return "text-cyan-400";
    case "rx":
      return "text-green-400";
    case "hs":
      return "text-accent";
    default:
      return "text-gray-300";
  }
}

interface BleLogConsoleProps {
  /** Shorter max height for inline panels (e.g. Connect page). */
  compact?: boolean;
  /** Show clear button alongside copy. */
  showClear?: boolean;
  title?: string;
}

export function BleLogConsole({
  compact = false,
  showClear = true,
  title = "Live BLE log",
}: BleLogConsoleProps) {
  const events = useBleDebugStore((s) => s.events);
  const handshakeStage = useBleDebugStore((s) => s.handshakeStage);
  const syncFromLogger = useBleDebugStore((s) => s.syncFromLogger);
  const clear = useBleDebugStore((s) => s.clear);
  const logEndRef = useRef<HTMLDivElement>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    const unsub = bleDebugLogger.subscribe(() => syncFromLogger());
    syncFromLogger();
    return unsub;
  }, [syncFromLogger]);

  useEffect(() => {
    if (autoScroll) {
      logEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [events.length, autoScroll]);

  const handleCopy = useCallback(async () => {
    const ok = await bleDebugLogger.copyLogToClipboard();
    setCopyState(ok ? "copied" : "failed");
    window.setTimeout(() => setCopyState("idle"), 2000);
  }, []);

  const maxHeight = compact ? "max-h-48" : "max-h-[55vh]";

  return (
    <Card>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            {title} ({events.length})
          </h3>
          <p className="text-xs text-gray-600">
            Stage: <span className="font-mono text-accent">{handshakeStage}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() => void handleCopy()}
            disabled={events.length === 0}
          >
            {copyState === "copied" ? "Copied!" : copyState === "failed" ? "Copy failed" : "Copy logs"}
          </Button>
          <Button
            variant="secondary"
            onClick={() => setAutoScroll((v) => !v)}
          >
            {autoScroll ? "Auto-scroll on" : "Auto-scroll off"}
          </Button>
          {showClear && (
            <Button variant="secondary" onClick={clear} disabled={events.length === 0}>
              Clear
            </Button>
          )}
        </div>
      </div>

      <div
        className={`${maxHeight} overflow-y-auto rounded-lg border border-white/10 bg-black/40 p-2 font-mono text-xs leading-relaxed`}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        {events.length === 0 ? (
          <p className="text-gray-600">No BLE events yet. Connect to a Tripper to start logging.</p>
        ) : (
          events.map((e) => <LogLine key={e.id} event={e} />)
        )}
        <div ref={logEndRef} />
      </div>
    </Card>
  );
}

function LogLine({ event }: { event: BleDebugEvent }) {
  const line = formatBleEventLine(event);
  const time = event.timestamp.slice(11, 23);

  return (
    <div className={`border-b border-white/5 py-1 last:border-0 ${levelColor(event.level)}`}>
      <span className="text-gray-600">{time}</span>{" "}
      <span className="select-all whitespace-pre-wrap break-all">{line.slice(line.indexOf("["))}</span>
    </div>
  );
}
