import { useEffect } from "react";
import { AppLayout } from "@/layouts/AppLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useConnectionStore } from "@/store/connectionStore";
import { ProtocolLabTabs } from "../components/ProtocolLabTabs";
import { DeviceExplorerPanel } from "../components/DeviceExplorerPanel";
import { NotificationViewer } from "../components/NotificationViewer";
import { PacketSenderPanel } from "../components/PacketSenderPanel";
import { MutationRunner } from "../components/MutationRunner";
import { ExportPanel } from "../components/ExportPanel";
import { ErrorConsole } from "../components/ErrorConsole";
import { useProtocolLabStore } from "../store";
import { useProtocolLabBle } from "../hooks/useProtocolLabBle";
import { subscribeAllNotifiable } from "../services/bleService";

export function ProtocolLabPage() {
  useProtocolLabBle();
  const activeTab = useProtocolLabStore((s) => s.activeTab);
  const setActiveTab = useProtocolLabStore((s) => s.setActiveTab);
  const detailedServices = useProtocolLabStore((s) => s.detailedServices);
  const addSubscribed = useProtocolLabStore((s) => s.addSubscribed);
  const addError = useProtocolLabStore((s) => s.addError);
  const connected = useConnectionStore((s) => s.connected);

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
        <ProtocolLabTabs active={activeTab} onChange={setActiveTab} />

        {!connected && (
          <Card className="border-warning/30">
            <p className="text-sm text-warning">
              Connect a device from Scanner or use Mock Connect in the Explorer tab.
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
        {activeTab === "export" && <ExportPanel />}
      </div>
    </AppLayout>
  );
}
