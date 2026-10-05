import { Card } from "@/components/ui/Card";
import { REACTION_STATES } from "../engine";
import { useFuzzStore } from "../store";
import type { ReactionState } from "../types";

function stateLabel(state: ReactionState): string {
  return REACTION_STATES.find((r) => r.value === state)?.label ?? state;
}

interface FindingsCardProps {
  onReview: (resultId: string) => void;
}

export function FindingsCard({ onReview }: FindingsCardProps) {
  const results = useFuzzStore((s) => s.results);
  const findings = results.filter((r) => r.confirmed);

  if (findings.length === 0) return null;

  return (
    <Card title={`Confirmed findings (${findings.length})`} subtitle="Packets you verified the device reacted to.">
      <div className="space-y-2">
        {findings.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => onReview(r.id)}
            className="block w-full rounded-xl border border-success/30 bg-success/10 p-3 text-left transition-colors hover:border-success/60"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-sm text-success">
                {r.mutatedField} = {r.valueLabel}
              </span>
              <span className="shrink-0 text-xs uppercase tracking-wider text-gray-400">{stateLabel(r.reactionState)}</span>
            </div>
            <p className="mt-1 break-all font-mono text-xs text-gray-400">{r.packetHex}</p>
            {r.observation && <p className="mt-1 text-sm text-white">{r.observation}</p>}
          </button>
        ))}
      </div>
    </Card>
  );
}
