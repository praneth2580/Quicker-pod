import { useEffect, useState } from "react";
import { AppLayout } from "@/layouts/AppLayout";
import { Card } from "@/components/ui/Card";
import { useFuzzStore } from "../store";
import { useFuzzRunner } from "../hooks/useFuzzRunner";
import { SessionPicker } from "../components/SessionPicker";
import { FuzzSetupCard } from "../components/FuzzSetupCard";
import { FuzzSessionCard } from "../components/FuzzSessionCard";
import { FindingsCard } from "../components/FindingsCard";
import { FuzzResultsTable } from "../components/FuzzResultsTable";
import { ReactionConfirmDialog } from "../components/ReactionConfirmDialog";

export function FuzzerPage() {
  const hydrated = useFuzzStore((s) => s.hydrated);
  const activeId = useFuzzStore((s) => s.activeId);
  const sessions = useFuzzStore((s) => s.sessions);
  const active = sessions.find((s) => s.id === activeId) ?? null;

  const {
    start,
    pause,
    stop,
    running,
    paused,
    canStart,
    remaining,
    pendingReactionId,
    clearPendingReaction,
  } = useFuzzRunner();

  const [reviewId, setReviewId] = useState<string | null>(null);

  // A pause-on-reaction event opens the confirm dialog automatically.
  useEffect(() => {
    if (pendingReactionId) setReviewId(pendingReactionId);
  }, [pendingReactionId]);

  useEffect(() => {
    document.title = "Fuzzer — Quicker-pod";
    return () => {
      document.title = "Quicker-pod";
    };
  }, []);

  const closeDialog = () => {
    setReviewId(null);
    clearPendingReaction();
  };

  const showSetup = active && !running && active.status !== "paused";

  return (
    <AppLayout title="Fuzzer" subtitle="Resumable brute-force & protocol discovery">
      <div className="space-y-4">
        <Card className="border-accent/20">
          <p className="text-sm text-gray-300">
            Brute-forces one field or byte at a time, recomputes the CRC for every packet, and keeps the
            command header protected. Sessions are saved to this device — pause and resume anytime.
          </p>
        </Card>

        {!hydrated ? (
          <Card>
            <p className="text-sm text-gray-400">Loading sessions…</p>
          </Card>
        ) : (
          <>
            <SessionPicker running={running} />
            {!active ? (
              <Card>
                <p className="text-sm text-gray-400">No session yet. Tap “New session” to configure an attack.</p>
              </Card>
            ) : (
              <>
                <FuzzSessionCard
                  session={active}
                  running={running}
                  paused={paused}
                  canStart={canStart}
                  remaining={remaining}
                  onStart={start}
                  onPause={pause}
                  onStop={stop}
                />
                {showSetup && <FuzzSetupCard session={active} />}
                <FindingsCard onReview={setReviewId} />
                <FuzzResultsTable running={running} onReview={setReviewId} />
              </>
            )}
          </>
        )}
      </div>

      {reviewId && <ReactionConfirmDialog resultId={reviewId} onClose={closeDialog} />}
    </AppLayout>
  );
}
