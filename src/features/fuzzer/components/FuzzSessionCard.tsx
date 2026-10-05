import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useConnectionStore } from "@/store/connectionStore";
import { COMMAND_LABELS, STRATEGY_LABELS, validateConfig } from "../engine";
import { useFuzzStore } from "../store";
import type { FuzzSession, FuzzSessionStatus } from "../types";

const STATUS_VARIANT: Record<FuzzSessionStatus, "success" | "warning" | "danger" | "neutral"> = {
  draft: "neutral",
  running: "success",
  paused: "warning",
  completed: "success",
  stopped: "neutral",
  error: "danger",
};

interface FuzzSessionCardProps {
  session: FuzzSession;
  running: boolean;
  paused: boolean;
  canStart: boolean;
  remaining: number;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
}

export function FuzzSessionCard({
  session,
  running,
  paused,
  canStart,
  remaining,
  onStart,
  onPause,
  onStop,
}: FuzzSessionCardProps) {
  const connected = useConnectionStore((s) => s.connected);
  const restartActive = useFuzzStore((s) => s.restartActive);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (running) setArmed(false);
  }, [running]);

  const validation = validateConfig(session);
  const progress = session.total > 0 ? Math.round((session.cursor / session.total) * 100) : 0;
  const resuming = session.cursor > 0 && session.cursor < session.total;
  const liveArmNeeded = !session.dryRun && !armed;

  const handlePrimary = () => {
    if (liveArmNeeded) {
      setArmed(true);
      return;
    }
    setArmed(false);
    onStart();
  };

  let primaryLabel: string;
  if (session.dryRun) primaryLabel = resuming ? "Resume dry run" : "Start dry run";
  else if (liveArmNeeded) primaryLabel = resuming ? "Arm live resume" : "Arm live transmit";
  else primaryLabel = `Transmit ${remaining} packet${remaining === 1 ? "" : "s"}`;

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold text-white">{session.name}</h3>
          <p className="mt-1 text-xs text-gray-400">
            {COMMAND_LABELS[session.command]} · {STRATEGY_LABELS[session.strategy]}
            {session.field ? ` · ${session.field}` : ""}
            {session.offset !== null ? ` · byte[${session.offset}]` : ""}
          </p>
        </div>
        <StatusBadge label={session.status} active={running} variant={STATUS_VARIANT[session.status]} />
      </div>

      <div className="mt-4">
        <div className="mb-1 flex justify-between text-xs text-gray-400">
          <span>
            {session.cursor} / {session.total} sent
          </span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-raised">
          <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-surface-raised p-3">
          <p className="text-xs uppercase tracking-wider text-gray-500">Reacted</p>
          <p className="text-lg font-semibold text-warning">{session.reactedCount}</p>
        </div>
        <div className="rounded-xl bg-surface-raised p-3">
          <p className="text-xs uppercase tracking-wider text-gray-500">Confirmed</p>
          <p className="text-lg font-semibold text-success">{session.confirmedCount}</p>
        </div>
        <div className="rounded-xl bg-surface-raised p-3">
          <p className="text-xs uppercase tracking-wider text-gray-500">Mode</p>
          <p className="text-lg font-semibold text-accent">{session.dryRun ? "Dry" : "Live"}</p>
        </div>
      </div>

      {session.lastError && <p className="mt-3 text-sm text-danger">{session.lastError}</p>}
      {!validation.ok && <p className="mt-3 text-sm text-danger">{validation.error}</p>}
      {!session.dryRun && !connected && (
        <p className="mt-3 text-sm text-warning">Not connected — connect a device or switch to dry run.</p>
      )}
      {liveArmNeeded && armed === false && !session.dryRun && (
        <p className="mt-3 text-xs text-gray-500">Live transmit sends real frames to the device. Tap again to confirm.</p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2">
        {running ? (
          <Button variant="secondary" onClick={onPause}>
            Pause
          </Button>
        ) : (
          <Button onClick={handlePrimary} disabled={!canStart || !validation.ok}>
            {primaryLabel}
          </Button>
        )}
        <Button variant="danger" onClick={onStop} disabled={!running && !paused}>
          Stop
        </Button>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <Button
          variant="ghost"
          onClick={() => void restartActive(false)}
          disabled={running || session.cursor === 0}
        >
          Restart (keep results)
        </Button>
        <Button variant="ghost" onClick={() => void restartActive(true)} disabled={running}>
          Restart (clear results)
        </Button>
      </div>

      <p className="mt-3 text-xs text-gray-500">
        Session memory is saved after every packet — pause, close the app, and resume from packet {session.cursor}.
      </p>
    </Card>
  );
}
