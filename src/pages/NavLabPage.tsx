import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useConnectionStore } from "@/store/connectionStore";
import { useTripperNav } from "@/hooks/useTripperNav";
import {
  GOOGLE_MANEUVERS,
  type GoogleManeuverDef,
} from "@/bluetooth/tripper/maneuvers";

function byteHex(n: number): string {
  return `0x${n.toString(16).padStart(2, "0").toUpperCase()}`;
}

function bytesKey(m: GoogleManeuverDef): string {
  return `${m.byte5}:${m.byte6}`;
}

/** First maneuver per distinct Tripper icon bytes (for faster visual sweeps). */
function uniqueByBytes(list: GoogleManeuverDef[]): GoogleManeuverDef[] {
  const seen = new Set<string>();
  const out: GoogleManeuverDef[] = [];
  for (const m of list) {
    const key = bytesKey(m);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(m);
  }
  return out;
}

function aliasesFor(m: GoogleManeuverDef, all: GoogleManeuverDef[]): string[] {
  const key = bytesKey(m);
  return all.filter((x) => bytesKey(x) === key && x.name !== m.name).map((x) => x.displayName);
}

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const id = window.setTimeout(() => resolve(), ms);
    const onAbort = () => {
      window.clearTimeout(id);
      reject(new DOMException("Aborted", "AbortError"));
    };
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

type SweepPhase = "idle" | "running" | "paused" | "done" | "error";

export function NavLabPage() {
  const connected = useConnectionStore((s) => s.connected);
  const {
    lastLabel,
    lastPacketHex,
    sending,
    lastError,
    keepaliveEnabled,
    setKeepaliveEnabled,
    sendGoogleManeuver,
    sendStopNav,
    sendNavIdle,
  } = useTripperNav();

  const [uniqueOnly, setUniqueOnly] = useState(true);
  const [dwellMs, setDwellMs] = useState(2000);
  const [distanceM, setDistanceM] = useState(200);
  const [etaMinutes, setEtaMinutes] = useState(5);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<SweepPhase>("idle");
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [checklist, setChecklist] = useState<Record<string, "pass" | "fail" | "skip">>({});

  const abortRef = useRef<AbortController | null>(null);
  const pausedRef = useRef(false);
  const indexRef = useRef(0);
  const listRef = useRef<GoogleManeuverDef[]>([]);

  const list = useMemo(
    () => (uniqueOnly ? uniqueByBytes(GOOGLE_MANEUVERS) : GOOGLE_MANEUVERS),
    [uniqueOnly],
  );

  const current = list[Math.min(index, Math.max(0, list.length - 1))] ?? null;
  const aliases = current ? aliasesFor(current, GOOGLE_MANEUVERS) : [];

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    listRef.current = list;
    // Reset position when switching unique/all if index is OOB
    if (index >= list.length) setIndex(0);
  }, [list, index]);

  const stopSweep = useCallback((nextPhase: SweepPhase = "idle") => {
    abortRef.current?.abort();
    abortRef.current = null;
    pausedRef.current = false;
    setPhase(nextPhase);
  }, []);

  useEffect(() => {
    if (!connected && (phase === "running" || phase === "paused")) {
      stopSweep("error");
      setStatusMsg("Disconnected — sweep stopped.");
    }
  }, [connected, phase, stopSweep]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const sendAt = useCallback(
    async (i: number, signal: AbortSignal) => {
      const items = listRef.current;
      const m = items[i];
      if (!m) return;
      if (signal.aborted) throw new DOMException("Aborted", "AbortError");
      if (!connected) throw new Error("Not connected to Tripper");
      setIndex(i);
      setStatusMsg(`Sending ${m.displayName}…`);
      await sendGoogleManeuver(m.name, distanceM, etaMinutes);
      if (signal.aborted) throw new DOMException("Aborted", "AbortError");
      setStatusMsg(`On pod now: ${m.displayName} @ ${distanceM} m`);
    },
    [connected, distanceM, etaMinutes, sendGoogleManeuver],
  );

  const runLoop = useCallback(
    async (startAt: number) => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      pausedRef.current = false;
      setPhase("running");
      setKeepaliveEnabled(false);
      setStatusMsg(null);

      try {
        let i = startAt;
        while (i < listRef.current.length) {
          if (ac.signal.aborted) break;
          while (pausedRef.current) {
            setPhase("paused");
            await sleep(120, ac.signal);
          }
          setPhase("running");
          await sendAt(i, ac.signal);
          await sleep(Math.max(400, dwellMs), ac.signal);
          i += 1;
        }
        if (!ac.signal.aborted) {
          setPhase("done");
          setStatusMsg("Sweep complete. Compare icons on the pod, then Stop nav if needed.");
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        setPhase("error");
        setStatusMsg(err instanceof Error ? err.message : String(err));
      } finally {
        if (abortRef.current === ac) abortRef.current = null;
      }
    },
    [dwellMs, sendAt, setKeepaliveEnabled],
  );

  const onStart = () => {
    if (!connected) {
      setStatusMsg("Connect and pair a Tripper first.");
      return;
    }
    void runLoop(0);
  };

  const onResume = () => {
    if (!connected) return;
    pausedRef.current = false;
    if (phase === "paused") {
      // Continue existing loop (pausedRef cleared); if loop died, restart from current
      if (!abortRef.current) void runLoop(indexRef.current);
      else setPhase("running");
    } else {
      void runLoop(indexRef.current);
    }
  };

  const onPause = () => {
    pausedRef.current = true;
    setPhase("paused");
    setStatusMsg("Paused — pod keeps last frame until you resume or step.");
  };

  const onStop = () => {
    stopSweep("idle");
    setStatusMsg("Sweep stopped.");
  };

  const onPrev = () => {
    if (!connected || phase === "running") return;
    const next = Math.max(0, indexRef.current - 1);
    const ac = new AbortController();
    void sendAt(next, ac.signal).catch((err) => {
      setStatusMsg(err instanceof Error ? err.message : String(err));
    });
  };

  const onNext = () => {
    if (!connected || phase === "running") return;
    const next = Math.min(listRef.current.length - 1, indexRef.current + 1);
    const ac = new AbortController();
    void sendAt(next, ac.signal).catch((err) => {
      setStatusMsg(err instanceof Error ? err.message : String(err));
    });
  };

  const onMark = (result: "pass" | "fail" | "skip") => {
    if (!current) return;
    setChecklist((prev) => ({ ...prev, [current.name]: result }));
  };

  const disabled = !connected || sending;
  const sweeping = phase === "running" || phase === "paused";

  return (
    <AppLayout title="Nav Lab" subtitle="Maneuver sweep — verify pod icons">
      <div className="space-y-4 animate-nav-rise pb-8">
        <section className="rounded-[1.5rem] border border-line/70 bg-canvas-raised/90 p-5 shadow-lift">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge
              label={connected ? "Connected" : "Disconnected"}
              active={connected}
              variant={connected ? "success" : "warning"}
            />
            <StatusBadge
              label={
                phase === "running"
                  ? "Sweeping"
                  : phase === "paused"
                    ? "Paused"
                    : phase === "done"
                      ? "Done"
                      : phase === "error"
                        ? "Error"
                        : "Idle"
              }
              active={phase === "running"}
              variant={
                phase === "error" ? "warning" : phase === "running" ? "success" : "neutral"
              }
            />
            {keepaliveEnabled && (
              <StatusBadge label="Keepalive on" active variant="warning" />
            )}
          </div>
          <p className="mt-3 text-sm text-ink-muted">
            Cycles Google → Tripper maneuvers so you can compare the phone label with the icon on
            the pod. Keepalive is forced off while sweeping to avoid write pile-ups.
          </p>
          {!connected && (
            <p className="mt-2 text-sm text-warning">
              <Link to="/connect" className="font-semibold underline-offset-2 hover:underline">
                Connect
              </Link>{" "}
              a Tripper before starting.
            </p>
          )}
        </section>

        <section className="rounded-[1.5rem] border border-line/70 bg-canvas-raised/85 p-5">
          <h2 className="font-display text-lg font-bold text-ink">Now showing</h2>
          {current ? (
            <div className="mt-3 space-y-2">
              <p className="font-display text-2xl font-bold text-ink">
                {index + 1} / {list.length}
              </p>
              <p className="text-xl font-semibold text-accent">{current.displayName}</p>
              <p className="font-mono text-xs text-ink-muted">{current.name}</p>
              <p className="font-mono text-sm text-ink">
                bytes {byteHex(current.byte5)} · {byteHex(current.byte6)}
              </p>
              {aliases.length > 0 && (
                <p className="text-xs text-ink-faint">
                  Same icon bytes as: {aliases.join(", ")}
                </p>
              )}
              <p className="text-sm text-ink-muted">
                App last label: <span className="text-ink">{lastLabel}</span>
              </p>
              {lastPacketHex && (
                <p className="break-all font-mono text-[0.65rem] text-ink-faint">{lastPacketHex}</p>
              )}
            </div>
          ) : (
            <p className="mt-3 text-sm text-ink-muted">No maneuvers in list.</p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="secondary"
              className="!min-h-10 !px-3 text-xs"
              disabled={!current}
              onClick={() => onMark("pass")}
            >
              Mark match
            </Button>
            <Button
              variant="secondary"
              className="!min-h-10 !px-3 text-xs"
              disabled={!current}
              onClick={() => onMark("fail")}
            >
              Mark mismatch
            </Button>
            <Button
              variant="ghost"
              className="!min-h-10 !px-3 text-xs"
              disabled={!current}
              onClick={() => onMark("skip")}
            >
              Skip
            </Button>
            {current && checklist[current.name] && (
              <StatusBadge
                label={checklist[current.name]}
                active={checklist[current.name] === "pass"}
                variant={
                  checklist[current.name] === "pass"
                    ? "success"
                    : checklist[current.name] === "fail"
                      ? "warning"
                      : "neutral"
                }
              />
            )}
          </div>
        </section>

        <section className="rounded-[1.5rem] border border-line/70 bg-canvas-raised/85 p-5">
          <h2 className="font-display text-lg font-bold text-ink">Controls</h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Input
              label="Dwell (ms)"
              type="number"
              min={400}
              step={100}
              value={dwellMs}
              disabled={sweeping}
              onChange={(e) => setDwellMs(Math.max(400, Number(e.target.value) || 400))}
            />
            <Input
              label="Distance (m)"
              type="number"
              min={0}
              value={distanceM}
              disabled={phase === "running"}
              onChange={(e) => setDistanceM(Number(e.target.value) || 0)}
            />
            <Input
              label="ETA (minutes)"
              type="number"
              min={0}
              value={etaMinutes}
              disabled={phase === "running"}
              onChange={(e) => setEtaMinutes(Number(e.target.value) || 0)}
            />
          </div>

          <div className="mt-3">
            <Toggle
              label="Unique icon bytes only"
              description={`Skip duplicate mappings (${uniqueByBytes(GOOGLE_MANEUVERS).length} of ${GOOGLE_MANEUVERS.length})`}
              checked={uniqueOnly}
              onChange={(v) => {
                if (sweeping) return;
                setUniqueOnly(v);
                setIndex(0);
              }}
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {!sweeping ? (
              <Button fullWidth variant="primary" disabled={!connected} onClick={onStart}>
                Start sweep
              </Button>
            ) : phase === "paused" ? (
              <Button fullWidth variant="primary" disabled={!connected} onClick={onResume}>
                Resume
              </Button>
            ) : (
              <Button fullWidth variant="secondary" onClick={onPause}>
                Pause
              </Button>
            )}
            <Button fullWidth variant="danger" disabled={!sweeping && phase === "idle"} onClick={onStop}>
              Stop
            </Button>
            <Button fullWidth variant="secondary" disabled={disabled || phase === "running"} onClick={onPrev}>
              Prev
            </Button>
            <Button fullWidth variant="secondary" disabled={disabled || phase === "running"} onClick={onNext}>
              Next
            </Button>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button
              variant="ghost"
              disabled={disabled}
              onClick={() =>
                void sendNavIdle()
                  .then(() => setStatusMsg("Sent NAV IDLE"))
                  .catch((e) => setStatusMsg(e instanceof Error ? e.message : String(e)))
              }
            >
              Send idle
            </Button>
            <Button
              variant="ghost"
              disabled={disabled}
              onClick={() =>
                void sendStopNav()
                  .then(() => setStatusMsg("Sent STOP NAV"))
                  .catch((e) => setStatusMsg(e instanceof Error ? e.message : String(e)))
              }
            >
              Stop nav
            </Button>
          </div>

          {(statusMsg || lastError) && (
            <p className="mt-3 text-sm text-ink-muted">
              {statusMsg}
              {lastError ? ` · ${lastError}` : ""}
            </p>
          )}
        </section>

        <section className="rounded-[1.5rem] border border-line/70 bg-canvas-raised/80 p-5">
          <h2 className="font-display text-base font-bold text-ink">Catalog</h2>
          <ul className="mt-3 max-h-64 space-y-1 overflow-y-auto text-sm">
            {list.map((m, i) => {
              const mark = checklist[m.name];
              const active = i === index;
              return (
                <li key={m.name}>
                  <button
                    type="button"
                    disabled={phase === "running" || !connected}
                    className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left transition-colors ${
                      active ? "bg-accent/15 text-ink" : "text-ink-muted hover:bg-canvas-sunk/50"
                    }`}
                    onClick={() => {
                      const ac = new AbortController();
                      void sendAt(i, ac.signal).catch((err) => {
                        setStatusMsg(err instanceof Error ? err.message : String(err));
                      });
                    }}
                  >
                    <span className="w-8 font-mono text-xs text-ink-faint">{i + 1}</span>
                    <span className="min-w-0 flex-1 truncate font-medium">{m.displayName}</span>
                    <span className="font-mono text-[0.65rem] text-ink-faint">
                      {byteHex(m.byte5)}/{byteHex(m.byte6)}
                    </span>
                    {mark && (
                      <span className="text-[0.65rem] uppercase text-ink-faint">{mark}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <div className="flex flex-wrap gap-4 text-sm">
          <Link to="/navigate" className="font-semibold text-accent underline-offset-2 hover:underline">
            ← Navigate
          </Link>
          <Link to="/dev" className="font-semibold text-accent underline-offset-2 hover:underline">
            Developer tools
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
