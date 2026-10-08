import { useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  openMapsAppInfoSettings,
  openMapsNotificationAccessSettings,
  refreshMapsNavStatus,
} from "@/navigation/mapsNavBridge";

interface NotificationAccessGuideProps {
  /** True when Notification Listener access is granted. */
  enabled: boolean;
  /** True when the listener service is connected. */
  connected?: boolean;
  /** Compact layout for the Navigate page banner. */
  compact?: boolean;
  /** Optional error/status line from the parent. */
  onError?: (message: string | null) => void;
}

/**
 * Step-by-step guide for enabling Notification Listener access on sideloaded
 * Android builds (Allow restricted settings → Notification access → return).
 */
export function NotificationAccessGuide({
  enabled,
  connected = false,
  compact = false,
  onError,
}: NotificationAccessGuideProps) {
  const [busy, setBusy] = useState<"appInfo" | "access" | "refresh" | null>(null);

  const run = async (kind: "appInfo" | "access" | "refresh", action: () => Promise<void>) => {
    setBusy(kind);
    onError?.(null);
    try {
      await action();
    } catch (error) {
      onError?.(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(null);
    }
  };

  if (enabled) {
    return (
      <p className="text-sm text-ink-muted">
        Notification access is on
        {connected ? " and listening" : " — waiting for the listener service"}. You can turn it off
        anytime in Android Settings → Notification access.
      </p>
    );
  }

  return (
    <div
      className={
        compact
          ? "rounded-2xl border border-warning/30 bg-warning/10 p-4 space-y-4"
          : "space-y-4"
      }
    >
      <div>
        <p className={`font-medium text-ink ${compact ? "text-sm" : "text-base"}`}>
          How to enable
        </p>
        <p className="mt-1 text-sm text-ink-muted">
          Android will not grant this silently. Follow the steps below, then return — status is
          re-checked automatically.
        </p>
      </div>

      <ol className="space-y-4">
        <li className="space-y-2">
          <div className="flex items-start gap-3">
            <StepNumber n={1} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink">Allow restricted settings</p>
              <p className="mt-0.5 text-sm text-ink-muted">
                Needed on Android 13+ after a manual APK install if the Notification access toggle
                is greyed out. In App info, tap <strong>⋮</strong> →{" "}
                <strong>Allow restricted settings</strong>.
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            fullWidth
            disabled={busy !== null}
            onClick={() => void run("appInfo", openMapsAppInfoSettings)}
          >
            {busy === "appInfo" ? "Opening…" : "Open App info"}
          </Button>
        </li>

        <li className="space-y-2">
          <div className="flex items-start gap-3">
            <StepNumber n={2} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink">Enable Notification access</p>
              <p className="mt-0.5 text-sm text-ink-muted">
                Select <strong>Quicker Pod</strong> and turn access <strong>on</strong>.
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            fullWidth
            disabled={busy !== null}
            onClick={() => void run("access", openMapsNotificationAccessSettings)}
          >
            {busy === "access" ? "Opening…" : "Enable Notification Access"}
          </Button>
        </li>

        <li className="space-y-2">
          <div className="flex items-start gap-3">
            <StepNumber n={3} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink">Return here</p>
              <p className="mt-0.5 text-sm text-ink-muted">
                We verify the real setting — closing Settings alone does not mean access was
                granted.
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            fullWidth
            disabled={busy !== null}
            onClick={() => void run("refresh", async () => { await refreshMapsNavStatus(); })}
          >
            {busy === "refresh" ? "Checking…" : "Refresh status"}
          </Button>
        </li>
      </ol>
    </div>
  );
}

function StepNumber({ n }: { n: number }) {
  return (
    <span
      className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-bold text-accent"
      aria-hidden
    >
      {n}
    </span>
  );
}
