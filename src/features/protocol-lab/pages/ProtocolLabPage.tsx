import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useConnectionStore } from "@/store/connectionStore";
import { ProtocolLabTabs } from "../components/ProtocolLabTabs";
import { DeviceExplorerPanel } from "../components/DeviceExplorerPanel";
import { NotificationViewer } from "../components/NotificationViewer";
import { PacketSenderPanel } from "../components/PacketSenderPanel";
import { MutationRunner } from "../components/MutationRunner";
import { SimulatorPanel } from "../components/SimulatorPanel";
import { ExportPanel } from "../components/ExportPanel";
import { ErrorConsole } from "../components/ErrorConsole";
import { useProtocolLabStore } from "../store";
import { subscribeAllNotifiable } from "../services/bleService";
import { isProtocolLabTab } from "../utils/tabs";

export function ProtocolLabPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = useProtocolLabStore((s) => s.activeTab);
  const setActiveTab = useProtocolLabStore((s) => s.setActiveTab);
  const detailedServices = useProtocolLabStore((s) => s.detailedServices);
  const addSubscribed = useProtocolLabStore((s) => s.addSubscribed);
  const addError = useProtocolLabStore((s) => s.addError);
  const connected = useConnectionStore((s) => s.connected);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && isProtocolLabTab(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams, setActiveTab]);

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setSearchParams({ tab }, { replace: true });
  };

  const handleSubscribeAll = async () => {
    try {
      const keys = await subscribeAllNotifiable(detailedServices);
      keys.forEach(addSubscribed);
    } catch (err) {
      addError(err instanceof Error ? err.message : "Subscribe all failed");
    }
  };

  useEffect(() => {
    document.title = "Protocol Lab — Quicker-pod";
    return () => {
      document.title = "Quicker-pod";
    };
  }, []);

  return (
    <AppLayout title="Protocol Lab" subtitle="BLE Protocol Reverse Engineering">
      <div className="space-y-4">
        <ProtocolLabTabs active={activeTab} onChange={handleTabChange} />

        {!connected && (
          <Card className="border-warning/30">
            <p className="text-sm text-warning">
              Connect a device from the Connect tab to use Protocol Lab.
            </p>
          </Card>
        )}

        <ErrorConsole />

        {activeTab === "explorer" && <DeviceExplorerPanel />}

        {activeTab === "notifications" && (
          <div className="space-y-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => void handleSubscribeAll()}
              disabled={!connected || detailedServices.length === 0}
            >
              Subscribe All Notify / Indicate
            </Button>
            <NotificationViewer />
          </div>
        )}

        {activeTab === "sender" && <PacketSenderPanel />}
        {activeTab === "mutation" && <MutationRunner />}
        {activeTab === "simulator" && <SimulatorPanel />}
        {activeTab === "export" && <ExportPanel />}
      </div>
    </AppLayout>
  );
}
