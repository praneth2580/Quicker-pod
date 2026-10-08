import { Link } from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";
import { Card } from "@/components/ui/Card";
import { Toggle } from "@/components/ui/Toggle";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useSettingsStore } from "@/store/settingsStore";
import { usePwaUpdateStore } from "@/store/pwaUpdateStore";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import { useMapsNavListener } from "@/hooks/useMapsNavListener";
import {
  openMapsNotificationAccessSettings,
  refreshMapsNavStatus,
} from "@/navigation/mapsNavBridge";

const DEV_LINKS = [
  {
    path: "/protocol-lab",
    title: "Protocol Lab",
    description: "GATT explorer, packet monitor, sender, mutations",
  },
  {
    path: "/fuzzer",
    title: "Fuzzer",
    description: "Structured fuzz sessions against Tripper frames",
  },
  {
    path: "/ble-debug",
    title: "BLE Debug",
    description: "Handshake stages and TX/RX log console",
  },
  {
    path: "/dev",
    title: "Dev hub",
    description: "All developer tools in one place",
  },
] as const;

function statusColor(status: ReturnType<typeof usePwaUpdateStore.getState>["status"]): string {
  switch (status) {
    case "upToDate":
      return "text-success";
    case "error":
    case "unavailable":
      return "text-warning";
    case "checking":
    case "reloading":
      return "text-accent";
    default:
      return "text-ink-muted";
  }
}

export function SettingsPage() {
  const {
    darkMode,
    debugMode,
    experimentalMode,
    pairingServiceUuid,
    pairingWriteUuid,
    pairingNotifyUuid,
    pinEncoding,
    toggleDarkMode,
    setDebugMode,
    setExperimentalMode,
    setPairingUuids,
    setPinEncoding,
  } = useSettingsStore();
  const { installed } = usePwaInstall();
  const { status, statusMessage, forceUpdate, clearStatus } = usePwaUpdateStore();
  const isUpdating = status === "checking" || status === "reloading";
  const {
    isAndroid,
    listenerAvailable,
    listenerEnabled,
    listenerConnected,
    mirroringEnabled,
    setMirroringEnabled,
  } = useMapsNavListener();

  return (
    <AppLayout title="Settings" subtitle="Companion preferences">
      <div className="space-y-4 animate-nav-rise">
        <Card title="Appearance">
          <Toggle
            label="Night ride mode"
            description="Optional darker canvas for low light — daylight is the default look"
            checked={darkMode}
            onChange={() => toggleDarkMode()}
          />
        </Card>

        <Card
          title="Maps notification access"
          subtitle="Required for Google Maps → Tripper mirroring"
        >
          <div className="mb-3 flex flex-wrap gap-2">
            <StatusBadge
              label={
                !isAndroid
                  ? "Android only"
                  : !listenerAvailable
                    ? "Core build"
                    : listenerConnected
                      ? "Listening"
                      : listenerEnabled
                        ? "Enabled"
                        : "Disabled"
              }
              active={listenerConnected}
              variant={
                !isAndroid || !listenerAvailable
                  ? "neutral"
                  : listenerEnabled
                    ? "success"
                    : "warning"
              }
            />
          </div>

          {!isAndroid ? (
            <p className="text-sm text-ink-muted">
              Install the Android APK for Maps mirroring. The default download installs cleanly;
              auto Maps needs the optional <code className="text-ink">-maps</code> APK (or use Manual
              guidance).
            </p>
          ) : !listenerAvailable ? (
            <div className="space-y-3">
              <p className="text-sm text-ink-muted">
                This installable build omits notification access so Google Play Protect will not block
                sideload. Pairing and Manual guidance still work. For automatic Google Maps → Tripper
                mirroring, install the <code className="text-ink">quicker-pod-*-maps.apk</code> release
                asset via USB (<code className="text-ink">adb install</code>) or tap Install anyway if
                Play Protect warns about sensitive data.
              </p>
              <Button variant="secondary" onClick={() => void refreshMapsNavStatus()}>
                Refresh
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Toggle
                label="Forward Maps turns to Tripper"
                description="Uses applyExternalNavUpdate on the existing nav write path"
                checked={mirroringEnabled}
                onChange={setMirroringEnabled}
              />
              <p className="text-sm text-ink-muted">
                Android Settings → Apps → Special app access → Notification access → enable{" "}
                <strong>Quicker Pod</strong>. Then start turn-by-turn in Google Maps.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="primary"
                  onClick={() => void openMapsNotificationAccessSettings()}
                >
                  Open access
                </Button>
                <Button variant="secondary" onClick={() => void refreshMapsNavStatus()}>
                  Refresh
                </Button>
              </div>
            </div>
          )}
        </Card>

        <Card title="App updates">
          <p className="mb-4 text-sm text-ink-muted">
            {installed
              ? "Check for a newer version of the installed app and reload if one is available."
              : "Force-check for updates to the service worker and cached app files."}
          </p>
          <Button
            fullWidth
            variant="secondary"
            disabled={isUpdating}
            onClick={() => {
              clearStatus();
              void forceUpdate();
            }}
          >
            {isUpdating ? "Checking…" : "Force update"}
          </Button>
          {statusMessage && (
            <p className={`mt-3 text-sm ${statusColor(status)}`}>{statusMessage}</p>
          )}
        </Card>

        <Card title="Developer tools" subtitle="Protocol lab, fuzzer, and BLE diagnostics">
          <div className="space-y-2">
            {DEV_LINKS.map((tool) => (
              <Link
                key={tool.path}
                to={tool.path}
                className="flex items-center justify-between gap-3 rounded-2xl border border-line/60 bg-canvas-sunk/40 px-4 py-3 transition-colors hover:border-accent/40"
              >
                <div className="min-w-0">
                  <p className="font-medium text-ink">{tool.title}</p>
                  <p className="text-sm text-ink-muted">{tool.description}</p>
                </div>
                <span className="text-ink-faint">›</span>
              </Link>
            ))}
          </div>
          <div className="mt-4 space-y-3">
            <Toggle
              label="Debug mode"
              description="Verbose logging and extra info"
              checked={debugMode}
              onChange={setDebugMode}
            />
            <Toggle
              label="Experimental mode"
              description="Enable unreleased pairing overrides"
              checked={experimentalMode}
              onChange={setExperimentalMode}
            />
          </div>
        </Card>

        {experimentalMode && (
          <Card title="PIN pairing (experimental)">
            <p className="mb-4 text-sm text-ink-muted">
              Override auto-discovered pairing UUIDs from Protocol Lab. Leave blank to auto-detect.
            </p>
            <div className="space-y-3">
              <Input
                label="Service UUID"
                value={pairingServiceUuid}
                onChange={(e) =>
                  setPairingUuids(e.target.value, pairingWriteUuid, pairingNotifyUuid)
                }
                placeholder="Auto-discover"
              />
              <Input
                label="Write characteristic UUID"
                value={pairingWriteUuid}
                onChange={(e) =>
                  setPairingUuids(pairingServiceUuid, e.target.value, pairingNotifyUuid)
                }
                placeholder="Auto-discover"
              />
              <Input
                label="Notify characteristic UUID"
                value={pairingNotifyUuid}
                onChange={(e) =>
                  setPairingUuids(pairingServiceUuid, pairingWriteUuid, e.target.value)
                }
                placeholder="Optional"
              />
              <label className="block text-sm">
                <span className="mb-2 block text-ink-muted">PIN encoding</span>
                <select
                  value={pinEncoding}
                  onChange={(e) => setPinEncoding(e.target.value as typeof pinEncoding)}
                  className="w-full rounded-2xl border border-line/80 bg-canvas-raised px-3 py-2 text-ink outline-none focus:border-accent"
                >
                  <option value="ascii">ASCII digits</option>
                  <option value="bcd">BCD (3 bytes)</option>
                  <option value="framed">30-byte framed (experimental)</option>
                </select>
              </label>
            </div>
          </Card>
        )}

        <Card title="About">
          <p className="text-sm text-ink-muted">
            Quicker Pod v0.1.0 — open-source motorcycle navigation companion for the Royal Enfield
            Tripper Pod. Protocol research tools live under Developer tools above.
          </p>
          <Link
            to="/download"
            className="mt-3 inline-block text-sm font-semibold text-accent underline-offset-2 hover:underline"
          >
            APK download page
          </Link>
        </Card>
      </div>
    </AppLayout>
  );
}
