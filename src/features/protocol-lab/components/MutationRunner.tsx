import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { HexInput } from "./HexInput";
import { useMutationStore, useProtocolLabStore } from "../store";
import { useMutationRunner } from "../hooks/useMutationRunner";
import type { MutationMode } from "../types";
import { formatUuid } from "../utils/formatUuid";
import { MIN_PACKET_DELAY_MS } from "../utils/mutation";

const MODES: { value: MutationMode; label: string }[] = [
  { value: "single-byte", label: "Single Byte" },
  { value: "byte-range", label: "Byte Range" },
  { value: "increment", label: "Increment" },
  { value: "decrement", label: "Decrement" },
  { value: "dictionary-single", label: "Dictionary 00–FF" },
  { value: "dictionary-double", label: "Dictionary 00 00–FF FF" },
];

export function MutationRunner() {
  const selectedWritable = useProtocolLabStore((s) => s.selectedWritable);
  const {
    basePacketHex,
    lockHex,
    mode,
    targetByteIndex,
    rangeStart,
    rangeEnd,
    delayMs,
    results,
    setBasePacketHex,
    setLockHex,
    setMode,
    setTargetByteIndex,
    setRange,
    setDelayMs,
    clearResults,
  } = useMutationStore();
  const { run, stop, running, canRun } = useMutationRunner();

  return (
    <div className="space-y-4">
      <Card subtitle="Guided mutation — lock bytes you want to keep fixed">
        {!selectedWritable ? (
          <p className="text-sm text-warning">Select a writable characteristic to enable mutations.</p>
        ) : (
          <p className="text-xs text-gray-400">
            TX → {formatUuid(selectedWritable.characteristicUuid, false)}
          </p>
        )}

        <div className="mt-4 space-y-4">
          <HexInput label="Base Packet" value={basePacketHex} onChange={setBasePacketHex} />
          <HexInput
            label="Lock Bytes (prefix)"
            value={lockHex}
            onChange={setLockHex}
          />

          <label className="block">
            <span className="mb-2 block text-sm text-gray-400">Mutation Mode</span>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as MutationMode)}
              className="w-full rounded-xl border border-white/10 bg-surface-raised px-4 py-3 text-white"
            >
              {MODES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Target Byte Index"
              type="number"
              min={0}
              value={targetByteIndex}
              onChange={(e) => setTargetByteIndex(Number(e.target.value))}
            />
            <Input
              label={`Delay (ms, min ${MIN_PACKET_DELAY_MS})`}
              type="number"
              min={MIN_PACKET_DELAY_MS}
              value={delayMs}
              onChange={(e) => setDelayMs(Number(e.target.value))}
            />
            <Input
              label="Range Start"
              type="number"
              min={0}
              value={rangeStart}
              onChange={(e) => setRange(Number(e.target.value), rangeEnd)}
            />
            <Input
              label="Range End"
              type="number"
              min={0}
              value={rangeEnd}
              onChange={(e) => setRange(rangeStart, Number(e.target.value))}
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button onClick={() => void run()} disabled={!canRun || running}>
            {running ? "Running…" : "Start Mutation"}
          </Button>
          <Button variant="danger" onClick={stop} disabled={!running}>
            Stop
          </Button>
        </div>

        <p className="mt-3 text-xs text-gray-500">
          Safety: max 2 packets/sec (500ms min), stops on disconnect or error. Requires explicit
          start — never auto-sends.
        </p>
      </Card>

      <Card title="Results">
        <div className="mb-3 flex justify-end">
          <Button variant="ghost" onClick={clearResults}>
            Clear Results
          </Button>
        </div>
        <div className="max-h-[40vh] overflow-x-auto">
          <table className="w-full min-w-[32rem] text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-gray-500">
                <th className="p-2">Time</th>
                <th className="p-2">Packet</th>
                <th className="p-2">Response</th>
                <th className="p-2">DC</th>
                <th className="p-2">Notes</th>
              </tr>
            </thead>
            <tbody>
              {results.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500">
                    No mutation results yet
                  </td>
                </tr>
              ) : (
                results
                  .slice()
                  .reverse()
                  .map((r) => (
                    <tr key={r.id} className="border-b border-white/5 font-mono">
                      <td className="p-2 text-gray-400">{r.timestamp}</td>
                      <td className="p-2 text-accent">{r.packetHex}</td>
                      <td className="p-2 text-success">{r.responseHex ?? "—"}</td>
                      <td className="p-2">{r.disconnected ? "Yes" : "—"}</td>
                      <td className="p-2 text-gray-400">{r.notes}</td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
