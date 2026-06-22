import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useProtocolLabStore } from "../store";

export function ErrorConsole() {
  const errors = useProtocolLabStore((s) => s.errors);
  const clearErrors = useProtocolLabStore((s) => s.clearErrors);

  if (errors.length === 0) return null;

  return (
    <Card title="Console" className="border-danger/20">
      <div className="mb-2 flex justify-end">
        <Button variant="ghost" onClick={clearErrors}>
          Clear
        </Button>
      </div>
      <div className="max-h-32 overflow-y-auto font-mono text-xs text-danger">
        {errors.map((e, i) => (
          <p key={`${e}-${i}`} className="border-b border-white/5 py-1">
            {e}
          </p>
        ))}
      </div>
    </Card>
  );
}
