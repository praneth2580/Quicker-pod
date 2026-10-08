import { Link } from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useConnectionStore } from "@/store/connectionStore";
import { useTripperNav } from "@/hooks/useTripperNav";
import { useMapsNavListener } from "@/hooks/useMapsNavListener";

function formatDistance(m: number | null | undefined): string {
  if (m == null) return "—";
  if (m >= 1000) return `${(m / 1000).toFixed(1)} km`;
  return `${Math.round(m)} m`;
}

function formatEta(seconds: number | null | undefined): string {
  if (seconds == null) return "—";
  const mins = Math.max(1, Math.round(seconds / 60));
  return `${mins} min`;
}

export function DashboardPage() {
  const { device, disconnect } = useConnectionStore();
  const { keepaliveEnabled, lastLabel } = useTripperNav();
  const { lastUpdate, listenerEnabled, isAndroid, mirroringEnabled } = useMapsNavListener();

  const live =
    lastUpdate && !lastUpdate.stopped
      ? {
          turn: lastUpdate.turnText ?? lastUpdate.maneuverName ?? lastLabel,
          distance: lastUpdate.distanceM,
          eta: lastUpdate.etaSeconds,
        }
      : lastLabel !== "NAV IDLE"
        ? { turn: lastLabel, distance: null as number | null, eta: null as number | null }
        : null;

  return (
    <AppLayout title="Ride" subtitle={device?.name ?? "Linked"} hideTitle>
      <div className="space-y-5 animate-nav-rise">
        <section className="nav-hero-turn">
          <div className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-accent/15 blur-2xl animate-nav-breathe" />
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-1/2 top-[60%] h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/20 animate-nav-pulse-ring" />
          </div>

          <div className="relative flex flex-wrap items-center gap-2">
            <StatusBadge label="Linked" active variant="success" />
            <StatusBadge
              label={keepaliveEnabled ? "Live" : "Idle"}
              active={keepaliveEnabled}
              variant={keepaliveEnabled ? "success" : "neutral"}
            />
            {isAndroid && (
              <StatusBadge
                label={mirroringEnabled && listenerEnabled ? "Maps" : "Maps off"}
                active={Boolean(mirroringEnabled && listenerEnabled)}
                variant={mirroringEnabled && listenerEnabled ? "success" : "warning"}
              />
            )}
          </div>

          <p className="relative mt-6 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-ink-faint">
            Next turn
          </p>
          <h1 className="relative mt-2 font-display text-3xl font-extrabold leading-[1.1] tracking-tight text-ink sm:text-4xl">
            {live?.turn ?? "Ready when you are"}
          </h1>
          <p className="relative mt-3 text-sm text-ink-muted">
            {live
              ? "Guidance is streaming to your Tripper."
              : "Open Navigate to mirror Maps or send a turn."}
          </p>

          <div className="relative mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-canvas-sunk/50 px-4 py-3 transition-transform active:scale-[0.98]">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-ink-faint">
                Distance
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-accent">
                {formatDistance(live?.distance)}
              </p>
            </div>
            <div className="rounded-2xl bg-canvas-sunk/50 px-4 py-3 transition-transform active:scale-[0.98]">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-ink-faint">
                ETA
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-ink">
                {live?.eta != null ? formatEta(live.eta) : keepaliveEnabled ? "Live" : "—"}
              </p>
            </div>
          </div>
        </section>

        <Link to="/navigate" className="block">
          <Button fullWidth className="!min-h-14 text-base shadow-glow">
            Open Navigate
          </Button>
        </Link>

        <button
          type="button"
          onClick={() => void disconnect()}
          className="w-full rounded-2xl px-4 py-3 text-sm font-medium text-ink-faint transition-colors hover:bg-canvas-sunk/60 hover:text-ink-muted active:scale-[0.98]"
        >
          Disconnect Tripper
        </button>
      </div>
    </AppLayout>
  );
}
