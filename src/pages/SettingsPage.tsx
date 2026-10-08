import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { AppLayout } from "@/layouts/AppLayout";
import { Card } from "@/components/ui/Card";
import { Toggle } from "@/components/ui/Toggle";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useSettingsStore } from "@/store/settingsStore";
import { usePwaUpdateStore } from "@/store/pwaUpdateStore";
import { usePwaInstall } from "@/hooks/usePwaInstall";
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
  const { installed } = usePwaInstall();
  const { status, statusMessage, forceUpdate, clearStatus } = usePwaUpdateStore();
  const isUpdating = status === "checking" || status === "reloading";
  const {
    isAndroid,
    listenerEnabled,
    listenerConnected,
    mirroringEnabled,
    setMirroringEnabled,
  } = useMapsNavListener();

  const isNative = Capacitor.isNativePlatform();
  const [nfcSupported, setNfcSupported] = useState(false);
  const [nfcEnabled, setNfcEnabled] = useState(false);
  const [nfcBusy, setNfcBusy] = useState(false);
  const [nfcMessage, setNfcMessage] = useState<string | null>(null);
  const [rideTestMsg, setRideTestMsg] = useState<string | null>(null);

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
          title="Start a ride"
          subtitle="No background scanning — connect only when you choose"
        >
          <div className="space-y-4">
            <Toggle
              label="Auto-reconnect when I open the app"
              description="If a PIN-paired Tripper is saved, retry connect for ~45s after launch/resume (turn ignition on)."
              checked={autoReconnectOnOpen}
              onChange={setAutoReconnectOnOpen}
            />

            <div className="rounded-2xl border border-line/60 bg-canvas-sunk/40 p-4 text-sm text-ink-muted">
              <p className="font-medium text-ink">Home screen widget</p>
              <p className="mt-1">
                Long-press the home screen → Widgets → <strong>Quicker Pod</strong> → add{" "}
                <strong>Connect Tripper</strong>. Tap it to open the app and reconnect. Nothing runs
                until you tap.
              </p>
            </div>

            {isNative && (
              <div className="rounded-2xl border border-line/60 bg-canvas-sunk/40 p-4 text-sm text-ink-muted">
                <p className="font-medium text-ink">NFC tag</p>
                <p className="mt-1">
                  Write {RIDE_DEEP_LINK} to a blank tag and stick it on the bike. Tap with your phone
                  to open Quicker Pod and reconnect.
                </p>
                {!nfcSupported ? (
                  <p className="mt-2 text-warning">This device has no NFC hardware.</p>
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
              Test reconnect now
            </Button>
            {rideTestMsg && <p className="text-sm text-ink-muted">{rideTestMsg}</p>}
          </div>
        </Card>

        <Card
          title="Notification Access"
          subtitle="Required for Google Maps → Tripper mirroring"
        >
          <p className="mb-3 text-sm text-ink">
            Status:{" "}
            <span className={listenerEnabled ? "text-success font-semibold" : "text-warning font-semibold"}>
              {!isAndroid ? "Android only" : listenerEnabled ? "Enabled" : "Not Enabled"}
            </span>
            {isAndroid && listenerConnected ? " · Listening" : null}
          </p>

          {!isAndroid ? (
            <p className="text-sm text-ink-muted">
              Install the Android APK to use NotificationListenerService. You will enable access
              manually in Android Settings — the app never grants it silently.
            </p>
          ) : (
            <div className="space-y-3">
              <Toggle
                label="Forward Maps turns to Tripper"
                description="Uses applyExternalNavUpdate on the existing nav write path"
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
