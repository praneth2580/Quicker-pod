import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { AppLayout } from "@/layouts/AppLayout";
import { Card } from "@/components/ui/Card";
import { Toggle } from "@/components/ui/Toggle";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useSettingsStore } from "@/store/settingsStore";
import { useApkUpdateStore } from "@/store/apkUpdateStore";
import { useMapsNavListener } from "@/hooks/useMapsNavListener";
import { NotificationAccessGuide } from "@/components/maps/NotificationAccessGuide";
import { RideLaunch } from "ride-launch";
import { RIDE_DEEP_LINK } from "@/ride/constants";
import { requestRideReconnect } from "@/ride/rideReconnect";
import { useConnectionStore } from "@/store/connectionStore";

const DEV_LINKS = [
  {
    path: "/protocol-lab",
    title: "Protocol Lab",
    description: "GATT explorer, packet monitor, sender",
  },
  {
    path: "/fuzzer",
    title: "Fuzzer",
    description: "Structured fuzz sessions",
  },
  {
    path: "/ble-debug",
    title: "BLE Debug",
    description: "Handshake and TX/RX console",
  },
  {
    path: "/nav-lab",
    title: "Nav Lab",
    description: "Cycle maneuvers on the pod",
  },
  {
    path: "/dev",
    title: "Dev hub",
    description: "All developer tools",
  },
] as const;

function apkPhaseColor(phase: ReturnType<typeof useApkUpdateStore.getState>["phase"]): string {
  switch (phase) {
    case "upToDate":
      return "text-success";
    case "available":
    case "downloading":
    case "installing":
      return "text-accent";
    case "error":
      return "text-danger";
    default:
      return "text-ink-muted";
  }
}

export function SettingsPage() {
  const {
    darkMode,
    debugMode,
    experimentalMode,
    autoReconnectOnOpen,
    pairingServiceUuid,
    pairingWriteUuid,
    pairingNotifyUuid,
    pinEncoding,
    toggleDarkMode,
    setDebugMode,
    setExperimentalMode,
    setAutoReconnectOnOpen,
    setPairingUuids,
    setPinEncoding,
  } = useSettingsStore();
  const {
    phase: apkPhase,
    message: apkMessage,
    remote,
    installedVersion,
    progress,
    needsInstallPermission,
    checkForUpdate,
    startUpdate,
    openInstallSettings,
  } = useApkUpdateStore();
  const apkBusy =
    apkPhase === "checking" || apkPhase === "downloading" || apkPhase === "installing";
  const {
    isAndroid,
    listenerEnabled,
    listenerConnected,
    mirroringEnabled,
    setMirroringEnabled,
  } = useMapsNavListener();
  const { device, disconnect, forgetDevice } = useConnectionStore();

  const isNative = Capacitor.isNativePlatform();
  const [nfcSupported, setNfcSupported] = useState(false);
  const [nfcEnabled, setNfcEnabled] = useState(false);
  const [nfcBusy, setNfcBusy] = useState(false);
  const [nfcMessage, setNfcMessage] = useState<string | null>(null);
  const [rideTestMsg, setRideTestMsg] = useState<string | null>(null);
  const [tapCount, setTapCount] = useState(0);

  useEffect(() => {
    if (!isNative) return;
    void RideLaunch.getNfcStatus()
      .then((s) => {
        setNfcSupported(s.supported);
        setNfcEnabled(s.enabled);
      })
      .catch(() => {
        setNfcSupported(false);
        setNfcEnabled(false);
      });
  }, [isNative]);

  const writeNfcTag = async () => {
    setNfcMessage(null);
    setNfcBusy(true);
    try {
      const result = await RideLaunch.writeRideNfcTag();
      setNfcMessage(
        result.written
          ? `Tag written (${result.uri}). Tap it with this phone to open Quicker Pod and reconnect.`
          : "Write finished without confirmation.",
      );
    } catch (err) {
      setNfcMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setNfcBusy(false);
      void RideLaunch.getNfcStatus()
        .then((s) => {
          setNfcSupported(s.supported);
          setNfcEnabled(s.enabled);
        })
        .catch(() => undefined);
    }
  };

  const cancelNfc = () => {
    void RideLaunch.cancelNfcWrite().finally(() => {
      setNfcBusy(false);
      setNfcMessage("NFC write cancelled.");
    });
  };

  const revealDevTools = () => {
    const next = tapCount + 1;
    setTapCount(next);
    if (next >= 5) {
      setDebugMode(true);
      setTapCount(0);
    }
  };

  return (
    <AppLayout title="Settings" subtitle="Preferences" hideTitle>
      <div className="space-y-4 animate-nav-rise">
        <section className="rounded-[1.5rem] border border-line/60 bg-canvas-raised/90 p-5 shadow-lift">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-ink-faint">
                Device
              </p>
              <p className="mt-1 truncate font-display text-xl font-bold text-ink">
                {device?.name ?? "Tripper"}
              </p>
            </div>
            <StatusBadge label="Linked" active variant="success" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={() => void disconnect()}>
              Disconnect
            </Button>
            <Button
              variant="ghost"
              onClick={() => void forgetDevice()}
            >
              Forget
            </Button>
          </div>
        </section>

        <Card title="Appearance">
          <Toggle
            label="Night ride mode"
            description="Darker canvas for low light"
            checked={darkMode}
            onChange={() => toggleDarkMode()}
          />
        </Card>

        <Card title="Start a ride" subtitle="Connect only when you choose">
          <div className="space-y-4">
            <Toggle
              label="Auto-reconnect on open"
              description="Retry linking a saved Tripper for ~45s after launch"
              checked={autoReconnectOnOpen}
              onChange={setAutoReconnectOnOpen}
            />

            {isNative && (
              <div className="rounded-2xl border border-line/60 bg-canvas-sunk/40 p-4 text-sm text-ink-muted">
                <p className="font-medium text-ink">NFC tag</p>
                <p className="mt-1">
                  Write {RIDE_DEEP_LINK} to a blank tag. Tap to open and reconnect.
                </p>
                {!nfcSupported ? (
                  <p className="mt-2 text-warning">No NFC hardware on this device.</p>
                ) : !nfcEnabled ? (
                  <p className="mt-2 text-warning">NFC is off — enable it in system settings.</p>
                ) : (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      variant="primary"
                      disabled={nfcBusy}
                      onClick={() => void writeNfcTag()}
                    >
                      {nfcBusy ? "Hold tag to phone…" : "Write NFC tag"}
                    </Button>
                    {nfcBusy && (
                      <Button variant="ghost" onClick={cancelNfc}>
                        Cancel
                      </Button>
                    )}
                  </div>
                )}
                {nfcMessage && <p className="mt-2 text-ink">{nfcMessage}</p>}
              </div>
            )}

            <Button
              variant="secondary"
              fullWidth
              onClick={() => {
                setRideTestMsg(null);
                void requestRideReconnect("manual").then((r) => {
                  if (r.ok) {
                    setRideTestMsg("Connected (or already connected).");
                  } else {
                    setRideTestMsg(r.message ?? r.reason);
                    if (r.message) {
                      useConnectionStore.setState({ lastError: r.message });
                    }
                  }
                });
              }}
            >
              Test reconnect
            </Button>
            {rideTestMsg && <p className="text-sm text-ink-muted">{rideTestMsg}</p>}
          </div>
        </Card>

        <Card title="Maps access" subtitle="Required for Google Maps → Tripper">
          <p className="mb-3 text-sm text-ink">
            Status:{" "}
            <span className={listenerEnabled ? "font-semibold text-success" : "font-semibold text-warning"}>
              {!isAndroid ? "Android only" : listenerEnabled ? "Enabled" : "Not Enabled"}
            </span>
            {isAndroid && listenerConnected ? " · Listening" : null}
          </p>

          {!isAndroid ? (
            <p className="text-sm text-ink-muted">
              Install the Android APK to use notification mirroring.
            </p>
          ) : (
            <div className="space-y-3">
              <Toggle
                label="Forward Maps turns"
                description="Uses the existing nav write path"
                checked={mirroringEnabled}
                onChange={setMirroringEnabled}
                disabled={!listenerEnabled}
              />
              <NotificationAccessGuide
                enabled={listenerEnabled}
                connected={listenerConnected}
              />
            </div>
          )}
        </Card>

        <Card title="Updates" subtitle="Sideload the latest APK from GitHub Releases">
          {installedVersion && (
            <p className="mb-3 text-sm text-ink-muted">
              Installed:{" "}
              <span className="font-medium text-ink">v{installedVersion}</span>
              {remote?.version ? (
                <>
                  {" "}
                  · Latest:{" "}
                  <span className="font-medium text-ink">v{remote.version}</span>
                </>
              ) : null}
            </p>
          )}

          {apkPhase === "downloading" && (
            <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-canvas-sunk">
              <div
                className="h-full rounded-full bg-accent transition-[width] duration-200"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            {needsInstallPermission && (
              <Button
                fullWidth
                variant="primary"
                disabled={apkBusy}
                onClick={() => void openInstallSettings()}
              >
                Allow install permission
              </Button>
            )}
            {apkPhase === "available" ||
            apkPhase === "downloading" ||
            apkPhase === "installing" ? (
              <Button
                fullWidth
                variant={needsInstallPermission ? "secondary" : "primary"}
                disabled={apkBusy || needsInstallPermission}
                onClick={() => void startUpdate()}
              >
                {apkPhase === "downloading"
                  ? `Downloading… ${Math.round(progress * 100)}%`
                  : apkPhase === "installing"
                    ? "Opening installer…"
                    : `Update to v${remote?.version ?? ""}`}
              </Button>
            ) : (
              <Button
                fullWidth
                variant="secondary"
                disabled={apkBusy}
                onClick={() => void checkForUpdate()}
              >
                {apkPhase === "checking" ? "Checking…" : "Check for update"}
              </Button>
            )}
          </div>
          {apkMessage && (
            <p className={`mt-3 text-sm ${apkPhaseColor(apkPhase)}`}>{apkMessage}</p>
          )}
        </Card>

        {debugMode && (
          <Card title="Developer tools" subtitle="Hidden from everyday use">
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
                description="Turn off to hide these tools"
                checked={debugMode}
                onChange={setDebugMode}
              />
              <Toggle
                label="Experimental mode"
                description="Unreleased pairing overrides"
                checked={experimentalMode}
                onChange={setExperimentalMode}
              />
            </div>
          </Card>
        )}

        {experimentalMode && (
          <Card title="PIN pairing (experimental)">
            <p className="mb-4 text-sm text-ink-muted">
              Override auto-discovered pairing UUIDs. Leave blank to auto-detect.
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

        <button
          type="button"
          onClick={revealDevTools}
          className="w-full rounded-2xl px-4 py-4 text-center text-sm text-ink-faint"
        >
          Quicker Pod · tap logo area 5× for developer tools
        </button>
      </div>
    </AppLayout>
  );
}
