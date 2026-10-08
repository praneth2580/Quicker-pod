import { useApkUpdateStore } from "@/store/apkUpdateStore";
import { Button } from "@/components/ui/Button";

export function UpdateBanner() {
  const phase = useApkUpdateStore((s) => s.phase);
  const remote = useApkUpdateStore((s) => s.remote);
  const progress = useApkUpdateStore((s) => s.progress);
  const bannerDismissed = useApkUpdateStore((s) => s.bannerDismissed);
  const needsInstallPermission = useApkUpdateStore((s) => s.needsInstallPermission);
  const startUpdate = useApkUpdateStore((s) => s.startUpdate);
  const openInstallSettings = useApkUpdateStore((s) => s.openInstallSettings);
  const dismissBanner = useApkUpdateStore((s) => s.dismissBanner);

  const busy = phase === "downloading" || phase === "installing";
  const show =
    !bannerDismissed &&
    (phase === "available" || busy) &&
    remote != null;

  if (!show) return null;

  const pct = Math.round(progress * 100);

  return (
    <div className="fixed left-0 right-0 top-0 z-[60] safe-top">
      <div className="mx-auto max-w-lg px-3 pt-2">
        <div className="rounded-[1.25rem] border border-accent/35 bg-canvas-raised/95 p-3 shadow-panel backdrop-blur-glass animate-nav-rise">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className="font-display text-sm font-bold text-ink">
                {busy ? "Updating Quicker Pod" : `Update ${remote.version} available`}
              </p>
              <p className="mt-0.5 text-xs text-ink-muted">
                {busy
                  ? phase === "installing"
                    ? "Confirm install in the system prompt."
                    : `Downloading… ${pct}%`
                  : needsInstallPermission
                    ? "Allow installs from this app first."
                    : "Install the latest APK without leaving the app."}
              </p>
              {phase === "downloading" && (
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-canvas-sunk">
                  <div
                    className="h-full rounded-full bg-accent transition-[width] duration-200"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              )}
            </div>
            <div className="flex shrink-0 flex-col gap-1.5">
              {needsInstallPermission && !busy ? (
                <Button
                  className="!min-h-9 !px-3 !py-1.5 text-xs"
                  onClick={() => void openInstallSettings()}
                >
                  Allow
                </Button>
              ) : (
                <Button
                  className="!min-h-9 !px-3 !py-1.5 text-xs"
                  disabled={busy}
                  onClick={() => void startUpdate()}
                >
                  {busy ? "…" : "Update"}
                </Button>
              )}
              {!busy && (
                <button
                  type="button"
                  className="text-[0.65rem] font-medium text-ink-faint"
                  onClick={dismissBanner}
                >
                  Later
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
