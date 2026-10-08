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

export function DashboardPage() {
  const { connected, device } = useConnectionStore();
  const { keepaliveEnabled, lastLabel } = useTripperNav();
  const { lastUpdate, listenerEnabled, isAndroid } = useMapsNavListener();

  const turnLabel =
    lastUpdate && !lastUpdate.stopped
      ? lastUpdate.turnText ?? lastUpdate.maneuverName ?? lastLabel
      : lastLabel !== "NAV IDLE"
        ? lastLabel
        : null;

  return (
    <AppLayout title="Home" subtitle="Ride status" hideTitle>
      <div className="space-y-6 animate-nav-rise">
        <section className="nav-hero-turn">
          <div className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-accent/15 blur-2xl animate-nav-breathe" />
          <p className="font-display text-sm font-semibold uppercase tracking-[0.22em] text-accent">
            Quicker Pod
          </p>
          <h1 className="mt-3 max-w-[14ch] font-display text-3xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-4xl">
            {connected ? "Ready for the next turn." : "Pair your Tripper to ride."}
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-muted">
            Motorcycle navigation companion for the Royal Enfield Tripper Pod — link once, then
            mirror Maps turns to the display.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <StatusBadge
              label={connected ? device?.name ?? "Linked" : "Tripper offline"}
              active={connected}
              variant={connected ? "success" : "neutral"}
            />
            <StatusBadge
              label={keepaliveEnabled ? "Keepalive" : "Idle"}
              active={keepaliveEnabled}
              variant={keepaliveEnabled ? "success" : "neutral"}
            />
            {isAndroid && (
              <StatusBadge
                label={listenerEnabled ? "Maps listener" : "Maps off"}
                active={listenerEnabled}
                variant={listenerEnabled ? "success" : "warning"}
              />
            )}
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[1.5rem] border border-line/70 bg-canvas-raised/80 p-5 shadow-lift">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-ink-faint">
              Next turn
            </p>
            <p className="mt-3 font-display text-xl font-bold leading-snug text-ink">
              {turnLabel ?? "No active guidance"}
            </p>
            <p className="mt-2 text-sm text-ink-muted">
              {lastUpdate && !lastUpdate.stopped
                ? formatDistance(lastUpdate.distanceM)
                : "Start Navigate or enable Maps mirroring"}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-line/70 bg-canvas-raised/80 p-5 shadow-lift">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-ink-faint">
              ETA / keepalive
            </p>
            <p className="mt-3 font-display text-xl font-bold text-ink">
              {lastUpdate?.etaSeconds != null && !lastUpdate.stopped
                ? `${Math.max(1, Math.round(lastUpdate.etaSeconds / 60))} min`
                : keepaliveEnabled
                  ? "Streaming"
                  : "Paused"}
            </p>
            <p className="mt-2 text-sm text-ink-muted">
              {connected
                ? "Tripper write path ready"
                : "Connect your pod to send packets"}
            </p>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3">
          <Link to="/navigate">
            <Button fullWidth variant="primary">
              Navigate
            </Button>
          </Link>
          <Link to="/connect">
            <Button fullWidth variant="secondary">
              {connected ? "Device" : "Connect"}
            </Button>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
