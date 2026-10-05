import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useFuzzStore } from "../store";

interface SessionPickerProps {
  running: boolean;
}

export function SessionPicker({ running }: SessionPickerProps) {
  const sessions = useFuzzStore((s) => s.sessions);
  const activeId = useFuzzStore((s) => s.activeId);
  const selectSession = useFuzzStore((s) => s.selectSession);
  const deleteSession = useFuzzStore((s) => s.deleteSession);
  const createSession = useFuzzStore((s) => s.createSession);
  const newSessionConfig = useFuzzStore((s) => s.newSessionConfig);

  const handleNew = () => {
    if (running) return;
    void createSession(newSessionConfig());
  };

  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-white">Sessions</h3>
        <Button onClick={handleNew} disabled={running}>
          New session
        </Button>
      </div>

      {sessions.length > 0 && (
        <div className="mt-3 flex gap-2">
          <select
            className="w-full rounded-xl border border-white/10 bg-surface-raised px-4 py-3 text-white disabled:opacity-50"
            value={activeId ?? ""}
            onChange={(e) => void selectSession(e.target.value)}
            disabled={running}
          >
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — {s.status} ({s.cursor}/{s.total})
              </option>
            ))}
          </select>
          <Button
            variant="danger"
            onClick={() => activeId && void deleteSession(activeId)}
            disabled={running || !activeId}
          >
            Delete
          </Button>
        </div>
      )}
    </Card>
  );
}
