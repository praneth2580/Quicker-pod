import { Link } from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";
import { Card } from "@/components/ui/Card";
import { Toggle } from "@/components/ui/Toggle";
import { Button } from "@/components/ui/Button";
import { useSettingsStore } from "@/store/settingsStore";
import { usePwaUpdateStore } from "@/store/pwaUpdateStore";
import { usePwaInstall } from "@/hooks/usePwaInstall";

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
      return "text-gray-400";
  }
}

export function SettingsPage() {
  const { darkMode, debugMode, experimentalMode, toggleDarkMode, setDebugMode, setExperimentalMode } =
    useSettingsStore();
  const { installed } = usePwaInstall();
  const { status, statusMessage, forceUpdate, clearStatus } = usePwaUpdateStore();
  const isUpdating = status === "checking" || status === "reloading";

  return (
    <AppLayout title="Settings" subtitle="App Configuration">
      <div className="space-y-4">
        <Card title="Appearance">
          <Toggle
            label="Dark Mode"
            description="Cyber diagnostics theme"
            checked={darkMode}
            onChange={() => toggleDarkMode()}
          />
        </Card>

        <Card title="App Updates">
          <p className="mb-4 text-sm text-gray-400">
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

        <Card title="Developer">
          <div className="space-y-3">
            <Toggle
              label="Debug Mode"
              description="Verbose logging and extra info"
              checked={debugMode}
              onChange={setDebugMode}
            />
            <Toggle
              label="Experimental Mode"
              description="Enable unreleased features"
              checked={experimentalMode}
              onChange={setExperimentalMode}
            />
          </div>
        </Card>

        <Card title="Session Data">
          <p className="mb-4 text-sm text-gray-400">
            Packet logs, mutation results, and session export live in Protocol Lab.
          </p>
          <Link to="/protocol-lab?tab=export">
            <Button fullWidth variant="secondary">
              Open Protocol Lab Export
            </Button>
          </Link>
        </Card>

        <Card title="About">
          <p className="text-sm text-gray-400">
            Quicker-pod v0.1.0 — Open-source BLE explorer for Royal Enfield Tripper Pod protocol
            research.
          </p>
        </Card>
      </div>
    </AppLayout>
  );
}
