import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useConnectionStore } from "@/store/connectionStore";
import { useTripperNav } from "@/hooks/useTripperNav";
import { bytesToHex } from "@/utils/hex";
import {
  DEFAULT_PROBE_KINDS,
  OPCODE_PROBES,
  PROBE_KIND_LABEL,
  PROBE_KIND_ORDER,
  opcodeHex,
  probesByKind,
  type OpcodeProbeDef,
  type ProbeKind,
} from "@/features/opcode-probe/catalog";
import {
  replySummary,
  runOpcodeProbe,
  type ProbeOutcome,
} from "@/features/opcode-probe/runProbe";

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("Stopped", "AbortError"));
      return;
    }
    const id = window.setTimeout(() => resolve(), ms);
    const onAbort = () => {
      window.clearTimeout(id);
      reject(new DOMException("Stopped", "AbortError"));
    };
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

function summaryClass(outcome: ProbeOutcome | undefined): string {
  if (!outcome) return "text-ink-faint";
  if (outcome.kind === "error") return "text-danger";
  if (outcome.kind === "timeout") return "text-ink-muted";
  if (outcome.response?.label === "NACK") return "text-warning";
  if (outcome.response?.description === "unhandled command") return "text-accent";
  return "text-success";
}

export function OpcodeProbePage() {
  const connected = useConnectionStore((s) => s.connected);
  const { keepaliveEnabled, setKeepaliveEnabled } = useTripperNav();

  const [selected, setSelected] = useState<Set<string>>(() => {
    const ids = OPCODE_PROBES.filter((probe) => DEFAULT_PROBE_KINDS.has(probe.kind)).map(
      (probe) => probe.id,
    );
    return new Set(ids);
  });
  const [timeoutMs, setTimeoutMs] = useState(800);
  const [gapMs, setGapMs] = useState(250);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, ProbeOutcome>>({});

  const abortRef = useRef<AbortController | null>(null);
  const keepaliveWasOn = useRef(false);

  const selectedCount = selected.size;
  const running = runningId !== null;

  const counts = useMemo(() => {
    let reply = 0;
    let nack = 0;
    let unhandled = 0;
    let silent = 0;
    let failed = 0;
    for (const outcome of Object.values(results)) {
      if (outcome.kind === "error") failed += 1;
      else if (outcome.kind === "timeout") silent += 1;
      else if (outcome.response?.label === "NACK") nack += 1;
      else if (outcome.response?.description === "unhandled command") unhandled += 1;
      else reply += 1;
    }
    return { reply, nack, unhandled, silent, failed };
  }, [results]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setRunningId(null);
  }, []);

  useEffect(() => () => abortRef.current?.abort(), []);

  useEffect(() => {
    if (!connected && running) {
      stop();
      setStatusMsg("Disconnected.");
    }
  }, [connected, running, stop]);

  const toggleId = (id: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleKind = (kind: ProbeKind) => {
    const ids = probesByKind(kind).map((probe) => probe.id);
    setSelected((current) => {
      const next = new Set(current);
      const allOn = ids.every((id) => next.has(id));
      for (const id of ids) {
        if (allOn) next.delete(id);
        else next.add(id);
      }
      return next;
    });
  };

  const runOne = useCallback(
    async (probe: OpcodeProbeDef, signal: AbortSignal, restoreKeepalive: boolean) => {
      setRunningId(probe.id);
      setStatusMsg(`Sending ${probe.name}…`);
      setResults((current) => {
        if (!(probe.id in current)) return current;
        const next = { ...current };
        delete next[probe.id];
        return next;
      });
      const outcome = await runOpcodeProbe(probe, timeoutMs, signal);
      setResults((current) => ({ ...current, [probe.id]: outcome }));
      setStatusMsg(`${probe.name}: ${replySummary(outcome, probe.opcode)}`);
      if (restoreKeepalive) {
        setRunningId(null);
        if (keepaliveWasOn.current) setKeepaliveEnabled(true);
      }
      return outcome;
    },
    [setKeepaliveEnabled, timeoutMs],
  );

  const sendProbe = (probe: OpcodeProbeDef) => {
    if (!connected || running) return;
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    keepaliveWasOn.current = keepaliveEnabled;
    setKeepaliveEnabled(false);
    void runOne(probe, ac.signal, true).catch(() => {
      setRunningId(null);
    });
  };

  const sweep = async () => {
    if (!connected || running) return;
    const queue = OPCODE_PROBES.filter((probe) => selected.has(probe.id));
    if (queue.length === 0) {
      setStatusMsg("Select at least one opcode.");
      return;
    }

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    keepaliveWasOn.current = keepaliveEnabled;
    setKeepaliveEnabled(false);
    setStatusMsg(null);

    try {
      for (let i = 0; i < queue.length; i += 1) {
        if (ac.signal.aborted) break;
        await runOne(queue[i], ac.signal, false);
        if (i < queue.length - 1) await sleep(gapMs, ac.signal);
      }
      if (!ac.signal.aborted) setStatusMsg("Sweep finished.");
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        setStatusMsg(error instanceof Error ? error.message : "Sweep stopped");
      }
    } finally {
      setRunningId(null);
      abortRef.current = null;
      if (keepaliveWasOn.current) setKeepaliveEnabled(true);
    }
  };

  return (
    <AppLayout title="Opcode probe" subtitle="Notification replies only">
      <div className="space-y-4 animate-nav-rise">
        <Card>
          <p className="text-sm text-ink-muted">
            Sends unused opcodes, the holes inside the known map, and the next slots after{" "}
            <span className="font-mono text-ink">0x50</span>. Each result is the next BLE
            notification. Nothing here records what the pod screen shows.
          </p>
          <p className="mt-2 text-sm text-ink-muted">
            A missing notification is silence on the link. It is not a display observation. Keepalive
            is paused while a probe is in flight so a nav retransmit is not counted as the reply.
          </p>
        </Card>

        <Card title="Run">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Reply window (ms)"
              type="number"
              min={200}
              max={5000}
              value={timeoutMs}
              onChange={(event) => setTimeoutMs(Number(event.target.value) || 800)}
            />
            <Input
              label="Gap between probes (ms)"
              type="number"
              min={0}
              max={5000}
              value={gapMs}
              onChange={(event) => setGapMs(Number(event.target.value) || 0)}
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={() => void sweep()} disabled={!connected || running || selectedCount === 0}>
              {running ? "Sending…" : `Sweep selected (${selectedCount})`}
            </Button>
            {running ? (
              <Button variant="danger" onClick={stop}>
                Stop
              </Button>
            ) : null}
          </div>
          {!connected && (
            <p className="mt-3 text-sm text-warning">Connect a Tripper before sending.</p>
          )}
          {statusMsg && <p className="mt-3 text-sm text-ink">{statusMsg}</p>}
          {Object.keys(results).length > 0 && (
            <p className="mt-3 font-mono text-xs text-ink-muted">
              known {counts.reply} · unhandled {counts.unhandled} · nack {counts.nack} · silent{" "}
              {counts.silent} · error {counts.failed}
            </p>
          )}
        </Card>

        {PROBE_KIND_ORDER.map((kind) => {
          const probes = probesByKind(kind);
          const selectedInKind = probes.filter((probe) => selected.has(probe.id)).length;
          return (
            <Card
              key={kind}
              title={PROBE_KIND_LABEL[kind]}
              subtitle={`${selectedInKind} of ${probes.length} selected`}
            >
              <label className="mb-3 flex items-center gap-2 text-sm text-ink-muted">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-current"
                  checked={selectedInKind === probes.length}
                  onChange={() => toggleKind(kind)}
                  disabled={running}
                />
                Select this group
              </label>
              <div className="space-y-3">
                {probes.map((probe) => (
                  <ProbeRow
                    key={probe.id}
                    probe={probe}
                    checked={selected.has(probe.id)}
                    running={runningId === probe.id}
                    busy={running}
                    connected={connected}
                    outcome={results[probe.id]}
                    onToggle={() => toggleId(probe.id)}
                    onSend={() => sendProbe(probe)}
                  />
                ))}
              </div>
            </Card>
          );
        })}

        <Link to="/dev" className="text-sm font-semibold text-accent underline-offset-2 hover:underline">
          ← Developer tools
        </Link>
      </div>
    </AppLayout>
  );
}

function ProbeRow({
  probe,
  checked,
  running,
  busy,
  connected,
  outcome,
  onToggle,
  onSend,
}: {
  probe: OpcodeProbeDef;
  checked: boolean;
  running: boolean;
  busy: boolean;
  connected: boolean;
  outcome?: ProbeOutcome;
  onToggle: () => void;
  onSend: () => void;
}) {
  const rxHex = outcome?.response ? bytesToHex(outcome.response.raw) : null;

  return (
    <div className="rounded-2xl border border-line/60 bg-canvas-sunk/40 p-3">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 shrink-0 accent-current"
          checked={checked}
          onChange={onToggle}
          disabled={busy}
          aria-label={`Include ${probe.name}`}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="font-medium text-ink">{probe.name}</span>
            <span className="font-mono text-xs text-ink-muted">
              {opcodeHex(probe.opcode)}
              {probe.sub ? ` ${opcodeHex(probe.sub)}` : ""}
            </span>
          </div>
          <p className="mt-1 text-sm text-ink-muted">{probe.why}</p>
          {running && !outcome && (
            <p className="mt-2 text-sm text-ink-muted">Waiting for notification…</p>
          )}
          {outcome && (
            <div className="mt-2 space-y-1">
              <p className={`text-sm font-medium ${summaryClass(outcome)}`}>
                {replySummary(outcome, probe.opcode)}
              </p>
              <p className="break-all font-mono text-[0.7rem] text-ink-faint">TX {outcome.txHex}</p>
              {rxHex && (
                <p className="break-all font-mono text-[0.7rem] text-ink">RX {rxHex}</p>
              )}
              {outcome.response && outcome.response.description !== outcome.response.label && (
                <p className="text-xs text-ink-muted">{outcome.response.description}</p>
              )}
            </div>
          )}
        </div>
        <Button
          variant="secondary"
          className="shrink-0 px-3"
          disabled={!connected || busy}
          onClick={onSend}
        >
          {running ? "…" : "Send"}
        </Button>
      </div>
    </div>
  );
}
