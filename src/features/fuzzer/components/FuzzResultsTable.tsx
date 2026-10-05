import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useFuzzStore } from "../store";
import type { FuzzResult } from "../types";

const RENDER_LIMIT = 400;

function reactionGlyph(r: FuzzResult): { text: string; className: string } {
  if (r.confirmed) return { text: "✓ confirmed", className: "text-success" };
  if (r.reacted) return { text: "● reacted", className: "text-warning" };
  if (r.status === "error") return { text: "error", className: "text-danger" };
  if (r.status === "skipped") return { text: "skipped", className: "text-gray-500" };
  if (r.status === "dry-run") return { text: "dry", className: "text-gray-500" };
  return { text: "—", className: "text-gray-600" };
}

function rowClass(r: FuzzResult): string {
  if (r.confirmed) return "bg-success/10";
  if (r.reacted) return "bg-warning/10";
  return "";
}

interface FuzzResultsTableProps {
  running: boolean;
  onReview: (resultId: string) => void;
}

export function FuzzResultsTable({ running, onReview }: FuzzResultsTableProps) {
  const results = useFuzzStore((s) => s.results);
  const clearActiveResults = useFuzzStore((s) => s.clearActiveResults);

  const shown = results.slice().reverse().slice(0, RENDER_LIMIT);

  return (
    <Card title={`Results (${results.length})`}>
      <div className="mb-3 flex justify-end">
        <Button variant="ghost" onClick={() => void clearActiveResults()} disabled={running || results.length === 0}>
          Clear results
        </Button>
      </div>
      <div className="max-h-[50vh] overflow-x-auto">
        <table className="w-full min-w-[36rem] text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 text-gray-500">
              <th className="p-2">#</th>
              <th className="p-2">Mutation</th>
              <th className="p-2">Packet</th>
              <th className="p-2">Response</th>
              <th className="p-2">Reaction</th>
              <th className="p-2" />
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">
                  No packets yet — start the session to generate candidates.
                </td>
              </tr>
            ) : (
              shown.map((r) => {
                const glyph = reactionGlyph(r);
                return (
                  <tr key={r.id} className={`border-b border-white/5 font-mono ${rowClass(r)}`}>
                    <td className="p-2 text-gray-500">{r.sequence}</td>
                    <td className="p-2 text-accent">
                      <span className="block">{r.mutatedField}</span>
                      <span className="text-gray-400">{r.valueLabel}</span>
                    </td>
                    <td className="p-2 break-all text-gray-300">{r.packetHex || "—"}</td>
                    <td className="p-2 text-success">{r.responseLabel ?? r.responseHex ?? "—"}</td>
                    <td className={`p-2 ${glyph.className}`}>{glyph.text}</td>
                    <td className="p-2">
                      <button
                        type="button"
                        onClick={() => onReview(r.id)}
                        className="rounded-lg border border-white/10 px-2 py-1 text-xs text-gray-300 hover:border-accent/50 hover:text-white"
                      >
                        {r.confirmed ? "Edit" : "Review"}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {results.length > RENDER_LIMIT && (
        <p className="mt-2 text-xs text-gray-500">Showing the most recent {RENDER_LIMIT} of {results.length}.</p>
      )}
    </Card>
  );
}
