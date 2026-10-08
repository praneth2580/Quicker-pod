import { useState } from "react";
import { AppLayout } from "@/layouts/AppLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useTripperNav } from "@/hooks/useTripperNav";
import { useMapsNavListener } from "@/hooks/useMapsNavListener";
import { NotificationAccessGuide } from "@/components/maps/NotificationAccessGuide";
import { GOOGLE_MANEUVERS } from "@/bluetooth/tripper/maneuvers";

const QUICK_MANEUVERS = [
  { name: "STRAIGHT", label: "Straight" },
  { name: "TURN_LEFT", label: "Left" },
  { name: "TURN_RIGHT", label: "Right" },
  { name: "TURN_U_TURN_CLOCKWISE", label: "U-turn" },
  { name: "DEPART", label: "Depart" },
  { name: "DESTINATION_LEFT", label: "Arrive" },
] as const;

function formatDistance(m: number | null | undefined): string {
  if (m == null) return "—";
  if (m >= 1000) return `${(m / 1000).toFixed(1)} km`;
  return `${Math.round(m)} m`;
}

function formatEta(seconds: number | null | undefined): string {
  if (seconds == null) return "—";
  const mins = Math.max(0, Math.round(seconds / 60));
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

export function NavigatePage() {
  const {
    keepaliveEnabled,
    callIconActive,
    lastLabel,
    sending,
    lastError,
    setKeepaliveEnabled,
    sendNavIdle,
    sendStopNav,
    sendGoogleManeuver,
    setCallIconActive,
  } = useTripperNav();
  const {
    lastUpdate,
    mirroringEnabled,
    setMirroringEnabled,
    isAndroid,
    listenerEnabled,
    listenerConnected,
  } = useMapsNavListener();

  const [distanceM, setDistanceM] = useState(200);
  const [etaMinutes, setEtaMinutes] = useState(5);
  const [maneuverName, setManeuverName] = useState("TURN_LEFT");
  const [busy, setBusy] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [showManual, setShowManual] = useState(false);

  const run = async (label: string, action: () => Promise<void>) => {
    setBusy(true);
    setStatusMsg(null);
    try {
      await action();
      setStatusMsg(`Sent: ${label}`);
    } catch (error) {
      setStatusMsg(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  };

  const disabled = busy || sending;
  const liveTurn =
    lastUpdate && !lastUpdate.stopped
      ? lastUpdate.turnText ?? lastUpdate.maneuverName ?? null
      : null;
  const liveDistance = lastUpdate && !lastUpdate.stopped ? lastUpdate.distanceM : null;
  const liveEta = lastUpdate && !lastUpdate.stopped ? lastUpdate.etaSeconds : null;

  return (
    <AppLayout title="Navigate" subtitle="Turn-by-turn" hideTitle>
      <div className="space-y-5 animate-nav-rise">
        <section className="nav-hero-turn">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/25 animate-nav-pulse-ring" />
          </div>

          <div className="relative flex flex-wrap items-center gap-2">
            <StatusBadge label="Tripper linked" active />
            <StatusBadge
              label={keepaliveEnabled ? "Keepalive" : "Paused"}
              active={keepaliveEnabled}
            />
          </div>

          <p className="relative mt-6 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-ink-faint">
            Next maneuver
          </p>
          <h1 className="relative mt-2 font-display text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-4xl">
            {liveTurn ?? (lastLabel !== "NAV IDLE" ? lastLabel : "Waiting for guidance")}
          </h1>

          <div className="relative mt-6 grid grid-cols-2 gap-4">
            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-ink-faint">
                Distance
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-accent">
                {formatDistance(liveDistance ?? (showManual ? distanceM : null))}
              </p>
            </div>
            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-ink-faint">
                ETA
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-ink">
                {liveEta != null ? formatEta(liveEta) : keepaliveEnabled ? "Live" : "—"}
              </p>
            </div>
          </div>
        </section>

        {/* Maps — primary path */}
        <section className="rounded-[1.5rem] border border-line/60 bg-canvas-raised/90 p-5 shadow-lift">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold text-ink">Maps mirroring</h2>
              <p className="mt-1 text-sm text-ink-muted">
                Forward Google Maps turns to Tripper.
              </p>
            </div>
            <StatusBadge
              label={
                !isAndroid
                  ? "Android only"
                  : listenerConnected
                    ? "Listening"
                    : listenerEnabled
                      ? "Enabled"
                      : "Off"
              }
              active={listenerConnected}
              variant={!isAndroid ? "neutral" : listenerEnabled ? "success" : "warning"}
            />
          </div>

          {!isAndroid ? (
            <p className="mt-4 text-sm text-ink-muted">
              Use the Android app for Maps mirroring, or test turns with Manual below.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              <Toggle
                label="Forward to Tripper"
                description="Maps turns stream to the pod while linked"
                checked={mirroringEnabled}
                onChange={setMirroringEnabled}
              />
              <NotificationAccessGuide
                enabled={listenerEnabled}
                connected={listenerConnected}
                compact
                onError={setStatusMsg}
              />
              {listenerEnabled && !lastUpdate && (
                <p className="text-sm text-ink-muted">
                  Start turn-by-turn in Google Maps — guidance appears above.
                </p>
              )}
            </div>
          )}
        </section>

        {/* Session — minimal */}
        <section className="rounded-[1.5rem] border border-line/60 bg-canvas-raised/85 p-5 shadow-lift">
          <h2 className="font-display text-lg font-bold text-ink">Session</h2>
          <div className="mt-3 space-y-3">
            <Toggle
              label="Keepalive"
              description="Re-send the last nav frame every second"
              checked={keepaliveEnabled}
              onChange={setKeepaliveEnabled}
            />
            <Toggle
              label="Call icon"
              description="Show call icon instead of last turn while keepalive runs"
              checked={callIconActive}
              onChange={setCallIconActive}
            />
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="primary"
                disabled={disabled}
                onClick={() =>
                  void run("NAV IDLE + keepalive", async () => {
                    await sendNavIdle();
                    setKeepaliveEnabled(true);
                  })
                }
              >
                Idle
              </Button>
              <Button
                variant="danger"
                disabled={disabled}
                onClick={() => void run("STOP NAV", () => sendStopNav())}
              >
                Stop
              </Button>
            </div>
          </div>
        </section>

        {/* Manual — collapsed */}
        <section className="rounded-[1.5rem] border border-line/60 bg-canvas-raised/80 p-5">
          <button
            type="button"
            className="flex w-full items-center justify-between text-left"
            onClick={() => setShowManual((v) => !v)}
          >
            <div>
              <h2 className="font-display text-lg font-bold text-ink">Manual test</h2>
              <p className="mt-1 text-sm text-ink-muted">Send turns without Maps</p>
            </div>
            <span
              className={`text-ink-faint transition-transform duration-300 ${showManual ? "rotate-90" : ""}`}
            >
              ›
            </span>
          </button>

          {showManual && (
            <div className="mt-4 space-y-3 animate-nav-rise">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Distance (m)"
                  type="number"
                  min={0}
                  value={distanceM}
                  onChange={(e) => setDistanceM(Number(e.target.value) || 0)}
                />
                <Input
                  label="ETA (minutes)"
                  type="number"
                  min={0}
                  value={etaMinutes}
                  onChange={(e) => setEtaMinutes(Number(e.target.value) || 0)}
                />
              </div>

              <label className="block text-sm">
                <span className="mb-2 block text-ink-muted">Maneuver</span>
                <select
                  value={maneuverName}
                  onChange={(e) => setManeuverName(e.target.value)}
                  className="w-full rounded-2xl border border-line/80 bg-canvas-raised px-3 py-3 text-ink outline-none focus:border-accent"
                >
                  {GOOGLE_MANEUVERS.map((m) => (
                    <option key={m.name} value={m.name}>
                      {m.displayName}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex flex-wrap gap-2">
                {QUICK_MANEUVERS.map((m) => (
                  <Button
                    key={m.name}
                    variant="secondary"
                    className="!min-h-10 !px-3 !py-2 text-xs"
                    disabled={disabled}
                    onClick={() => {
                      setManeuverName(m.name);
                      void run(m.label, () =>
                        sendGoogleManeuver(m.name, distanceM, etaMinutes),
                      );
                    }}
                  >
                    {m.label}
                  </Button>
                ))}
              </div>

              <Button
                fullWidth
                variant="primary"
                disabled={disabled}
                onClick={() =>
                  void run(maneuverName, () =>
                    sendGoogleManeuver(maneuverName, distanceM, etaMinutes),
                  )
                }
              >
                Send guidance
              </Button>
            </div>
          )}
        </section>

        {(statusMsg || lastError) && (
          <p className={`text-sm ${lastError ? "text-danger" : "text-ink-muted"}`}>
            {lastError ?? statusMsg}
          </p>
        )}
      </div>
    </AppLayout>
  );
}
