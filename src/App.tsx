import { Routes, Route, Navigate } from "react-router-dom";
import { useBluetooth } from "@/hooks/useBluetooth";
import { useDbInit } from "@/hooks/useDbInit";
import { usePwaInstallInit } from "@/hooks/usePwaInstall";
import { useProtocolLabBle } from "@/features/protocol-lab/hooks/useProtocolLabBle";
import { LEGACY_ROUTE_TABS } from "@/features/protocol-lab/utils/tabs";
import { LandingPage } from "@/pages/LandingPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { ConnectPage } from "@/pages/ConnectPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { ProtocolLabPage } from "@/features/protocol-lab/pages/ProtocolLabPage";

function LegacyProtocolLabRedirect({ legacyPath }: { legacyPath: string }) {
  const tab = LEGACY_ROUTE_TABS[legacyPath] ?? "explorer";
  return <Navigate to={`/protocol-lab?tab=${tab}`} replace />;
}

export default function App() {
  useBluetooth();
  useProtocolLabBle();
  usePwaInstallInit();
  useDbInit();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/connect" element={<ConnectPage />} />
      <Route path="/scanner" element={<Navigate to="/connect" replace />} />
      <Route path="/lab" element={<Navigate to="/protocol-lab" replace />} />
      <Route path="/monitor" element={<Navigate to="/protocol-lab?tab=notifications" replace />} />
      <Route path="/send" element={<Navigate to="/protocol-lab?tab=sender" replace />} />
      <Route path="/protocol-lab" element={<ProtocolLabPage />} />
      <Route path="/settings" element={<SettingsPage />} />

      {/* Legacy routes → Protocol Lab tabs */}
      <Route path="/explorer" element={<LegacyProtocolLabRedirect legacyPath="explorer" />} />
      <Route path="/console" element={<LegacyProtocolLabRedirect legacyPath="console" />} />
      <Route path="/transmit" element={<LegacyProtocolLabRedirect legacyPath="transmit" />} />
      <Route path="/simulator" element={<LegacyProtocolLabRedirect legacyPath="simulator" />} />
    </Routes>
  );
}
