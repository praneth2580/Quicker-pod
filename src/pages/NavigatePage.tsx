import { useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useConnectionStore } from "@/store/connectionStore";
import { useTripperNav } from "@/hooks/useTripperNav";
import { useMapsNavListener } from "@/hooks/useMapsNavListener";
import {
  openMapsNotificationAccessSettings,
  refreshMapsNavStatus,
} from "@/navigation/mapsNavBridge";
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
  const connected = useConnectionStore((s) => s.connected);
  const {
    keepaliveEnabled,
    callIconActive,
    lastLabel,
    lastPacketHex,
    sending,
    lastError,
    setKeepaliveEnabled,
    sendNavIdle,
    sendStopNav,
    sendGoogleManeuver,
    setCallIconActive,
  } = useTripperNav();
  const {
    status,
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
    if (!connected) {
      setStatusMsg("Connect and pair a Tripper first.");
      return;
    }
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

  const disabled = !connected || busy || sending;
  const liveTurn =
    lastUpdate && !lastUpdate.stopped
      ? lastUpdate.turnText ?? lastUpdate.maneuverName ?? null
      : null;
  const liveDistance = lastUpdate && !lastUpdate.stopped ? lastUpdate.distanceM : null;
  const liveEta = lastUpdate && !lastUpdate.stopped ? lastUpdate.etaSeconds : null;

  const openAccess = async () => {
    try {
      await openMapsNotificationAccessSettings();
      setTimeout(() => void refreshMapsNavStatus(), 800);
    } catch (error) {
      setStatusMsg(error instanceof Error ? error.message : String(error));
    }
  };

  return (
    <AppLayout title="Navigate" subtitle="Turn-by-turn" hideTitle>
      <div className="space-y-5 animate-nav-rise">
        {/* Primary guidance surface */}
        <section className="nav-hero-turn">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/25 animate-nav-pulse-ring" />
          </div>

          <div className="relative flex flex-wrap items-center gap-2">
            <StatusBadge
              label={connected ? "Tripper linked" : "Tripper offline"}
              active={connected}
            />
            <StatusBadge
              label={keepaliveEnabled ? "Keepalive on" : "Keepalive off"}
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
                {liveEta != null
                  ? formatEta(liveEta)
                  : keepaliveEnabled
                    ? "Live"
                    : "—"}
              </p>
            </div>
          </div>

          {!connected && (
            <p className="relative mt-5 text-sm text-ink-muted">
              Pair on{" "}
              <Link to="/connect" className="font-semibold text-accent underline-offset-2 hover:underline">
                Connect
              </Link>{" "}
              before sending turns to the pod.
            </p>
          )}
        </section>

        {/* Maps notification mirror */}
        <section className="rounded-[1.5rem] border border-line/70 bg-canvas-raised/90 p-5 shadow-lift">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold text-ink">Maps mirroring</h2>
              <p className="mt-1 text-sm text-ink-muted">
                Read Google Maps navigation notifications and forward turns to Tripper.
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
              Notification access is available in the Quicker Pod Android APK. On web, use manual
              guidance below to test packets.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              <Toggle
                label="Forward to Tripper"
                description="When on, Maps turns call applyExternalNavUpdate and enable keepalive"
                checked={mirroringEnabled}
                onChange={setMirroringEnabled}
              />

              {!listenerEnabled ? (
                <div className="rounded-2xl border border-warning/30 bg-warning/10 p-4">
                  <p className="text-sm text-ink">
                    Enable <strong>Notification access</strong> for Quicker Pod so it can read Maps
                    turn banners. After a sideload, you may need App info → ⋮ →{" "}
                    <strong>Allow restricted settings</strong> first.
                  </p>
                  <Button className="mt-3" fullWidth variant="primary" onClick={() => void openAccess()}>
                    Open notification access
                  </Button>
                  <Button
                    className="mt-2"
                    fullWidth
                    variant="ghost"
                    onClick={() => void refreshMapsNavStatus()}
                  >
                    Refresh status
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-ink-muted">
                  Listener {listenerConnected ? "connected" : "granted — waiting for service"}. Start
                  navigation in Google Maps; turns appear above and stream to the pod when linked.
                </p>
              )}

              {lastUpdate && (
                <div className="rounded-2xl bg-canvas-sunk/60 p-3 text-xs text-ink-muted">
                  <p className="font-mono">
                    {lastUpdate.stopped
                      ? "Navigation ended"
                      : `${lastUpdate.packageName} · ${lastUpdate.maneuverName ?? "?"} · ${formatDistance(lastUpdate.distanceM)}`}
                  </p>
                  {lastUpdate.turnText && (
                    <p className="mt-1 text-ink">{lastUpdate.turnText}</p>
                  )}
                </div>
              )}

              {status.supported && (
                <p className="text-[0.7rem] text-ink-faint">
                  Settings → Apps → Special app access → Notification access → Quicker Pod
                </p>
              )}
            </div>
          )}
        </section>

        {/* Session controls */}
        <section className="rounded-[1.5rem] border border-line/70 bg-canvas-raised/85 p-5 shadow-lift">
          <h2 className="font-display text-lg font-bold text-ink">Session</h2>
          <div className="mt-3 space-y-3">
            <Toggle
              label="Keepalive"
              description="Re-send last nav frame every 1s while connected"
              checked={keepaliveEnabled}
              onChange={setKeepaliveEnabled}
            />
            <Toggle
              label="Call icon"
              description="While keepalive runs, send call-icon instead of last nav"
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
                Idle + keepalive
              </Button>
              <Button
                variant="danger"
                disabled={disabled}
                onClick={() => void run("STOP NAV", () => sendStopNav())}
              >
                Stop nav
              </Button>
            </div>
          </div>
        </section>

        {/* Manual guidance (secondary) */}
        <section className="rounded-[1.5rem] border border-line/70 bg-canvas-raised/80 p-5">
          <button
            type="button"
            className="flex w-full items-center justify-between text-left"
            onClick={() => setShowManual((v) => !v)}
          >
            <div>
              <h2 className="font-display text-lg font-bold text-ink">Manual guidance</h2>
              <p className="mt-1 text-sm text-ink-muted">Test turns without Maps</p>
            </div>
            <span className="text-ink-faint">{showManual ? "▾" : "▸"}</span>
          </button>

          {showManual && (
            <div className="mt-4 space-y-3">
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

        {(lastPacketHex || statusMsg || lastError) && (
          <section className="rounded-2xl border border-line/60 bg-canvas-sunk/50 p-4">
            <p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-ink-faint">
              {lastLabel}
            </p>
            {lastPacketHex && (
              <pre className="packet-viewer break-all text-xs">{lastPacketHex}</pre>
            )}
            {(statusMsg || lastError) && (
              <p className={`mt-3 text-sm ${lastError ? "text-danger" : "text-ink-muted"}`}>
                {lastError ?? statusMsg}
              </p>
            )}
          </section>
        )}
      </div>
    </AppLayout>
  );
}
