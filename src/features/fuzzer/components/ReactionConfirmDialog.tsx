import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { REACTION_STATES } from "../engine";
import { useFuzzStore } from "../store";
import type { ReactionState } from "../types";

interface ReactionConfirmDialogProps {
  resultId: string;
  onClose: () => void;
}

export function ReactionConfirmDialog({ resultId, onClose }: ReactionConfirmDialogProps) {
  const result = useFuzzStore((s) => s.results.find((r) => r.id === resultId) ?? null);
  const setReaction = useFuzzStore((s) => s.setReaction);

  const [reactionState, setReactionState] = useState<ReactionState>("unknown");
  const [observation, setObservation] = useState("");

  useEffect(() => {
    if (result) {
      setReactionState(result.reactionState);
      setObservation(result.observation);
    }
  }, [result]);

  if (!result) return null;

  const save = (confirmed: boolean, reacted: boolean) => {
    void setReaction(resultId, {
      reacted,
      confirmed,
      reactionState: confirmed ? reactionState : "no_change",
      observation,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-white/10 bg-surface-glass p-5 shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-white">Confirm reaction</h3>
            <p className="mt-1 text-sm text-gray-400">Packet #{result.sequence} — did the device do something?</p>
          </div>
          <StatusPill status={result.status} />
        </div>

        <div className="mt-4 space-y-3 rounded-xl bg-surface-raised p-3 text-xs">
          <Row label="Mutation" value={`${result.mutatedField} = ${result.valueLabel}`} accent="accent" />
          <Row label="Packet" value={result.packetHex || "—"} accent="accent" mono />
          <Row label="CRC" value={result.packetHex ? `0x${result.crc.toString(16).padStart(4, "0").toUpperCase()}` : "—"} mono />
          <Row label="Response" value={result.responseLabel ?? result.responseHex ?? "none captured"} accent="success" />
          {result.latencyMs !== null && <Row label="Latency" value={`${result.latencyMs} ms`} />}
        </div>

        <label className="mt-4 block">
          <span className="mb-2 block text-sm text-gray-400">What did it do?</span>
          <select
            className="w-full rounded-xl border border-white/10 bg-surface-raised px-4 py-3 text-white"
            value={reactionState}
            onChange={(e) => setReactionState(e.target.value as ReactionState)}
          >
            {REACTION_STATES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-3 block">
          <span className="mb-2 block text-sm text-gray-400">Describe it (saved with the packet)</span>
          <textarea
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
            rows={3}
            placeholder="e.g. Display showed a left-turn arrow and beeped once."
            className="w-full rounded-xl border border-white/10 bg-surface-raised px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </label>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button onClick={() => save(true, true)}>Confirm reaction</Button>
          <Button variant="secondary" onClick={() => save(false, false)}>
            Not a reaction
          </Button>
        </div>
        <Button variant="ghost" fullWidth className="mt-2" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  accent,
  mono,
}: {
  label: string;
  value: string;
  accent?: "accent" | "success";
  mono?: boolean;
}) {
  const color = accent === "accent" ? "text-accent" : accent === "success" ? "text-success" : "text-gray-300";
  return (
    <div className="flex justify-between gap-3">
      <span className="shrink-0 text-gray-500">{label}</span>
      <span className={`text-right ${color} ${mono ? "font-mono break-all" : ""}`}>{value}</span>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  return (
    <span className="shrink-0 rounded-full border border-white/10 bg-surface-raised px-3 py-1 text-xs uppercase tracking-wider text-gray-300">
      {status}
    </span>
  );
}
