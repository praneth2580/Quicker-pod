import { AppLayout } from "@/layouts/AppLayout";
import { Card } from "@/components/ui/Card";
import { Toggle } from "@/components/ui/Toggle";
import { Button } from "@/components/ui/Button";
import { useSettingsStore } from "@/store/settingsStore";
import { usePacketStore } from "@/store/packetStore";
import { downloadText, readTextFile } from "@/utils/format";

export function SettingsPage() {
  const { darkMode, debugMode, experimentalMode, toggleDarkMode, setDebugMode, setExperimentalMode } =
    useSettingsStore();
  const { exportLogs, importLogs, clearLogs } = usePacketStore();

  const handleExport = () => {
    downloadText(`quicker-pod-logs-${Date.now()}.txt`, exportLogs());
  };

  const handleImport = async () => {
    const content = await readTextFile();
    if (content) importLogs(content);
  };

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

        <Card title="Packet Logs">
          <div className="grid gap-2">
            <Button variant="secondary" onClick={handleExport}>
              Export Logs
            </Button>
            <Button variant="secondary" onClick={() => void handleImport()}>
              Import Logs
            </Button>
            <Button variant="danger" onClick={clearLogs}>
              Clear All Logs
            </Button>
          </div>
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
