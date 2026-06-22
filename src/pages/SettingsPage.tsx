import { Link } from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";
import { Card } from "@/components/ui/Card";
import { Toggle } from "@/components/ui/Toggle";
import { Button } from "@/components/ui/Button";
import { useSettingsStore } from "@/store/settingsStore";

export function SettingsPage() {
  const { darkMode, debugMode, experimentalMode, toggleDarkMode, setDebugMode, setExperimentalMode } =
    useSettingsStore();

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
