import { useEffect, type ReactNode } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useBluetooth } from "@/hooks/useBluetooth";
import { useDbInit } from "@/hooks/useDbInit";
import { usePwaInstallInit } from "@/hooks/usePwaInstall";
import { useProtocolLabBle } from "@/features/protocol-lab/hooks/useProtocolLabBle";
import { LEGACY_ROUTE_TABS } from "@/features/protocol-lab/utils/tabs";
import { RequireConnection } from "@/components/connect/RequireConnection";
import { DashboardPage } from "@/pages/DashboardPage";
import { ConnectPage } from "@/pages/ConnectPage";
import { NavigatePage } from "@/pages/NavigatePage";
import { NavLabPage } from "@/pages/NavLabPage";
import { DevPage } from "@/pages/DevPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { ProtocolLabPage } from "@/features/protocol-lab/pages/ProtocolLabPage";
import { FuzzerPage } from "@/features/fuzzer/pages/FuzzerPage";
import { BleDebugPage } from "@/pages/BleDebugPage";
import { startMapsNavBridge } from "@/navigation/mapsNavBridge";
import { useRideLaunch } from "@/hooks/useRideLaunch";
import { useApkUpdateInit } from "@/hooks/useApkUpdateInit";
import { useConnectionStore } from "@/store/connectionStore";

function LegacyProtocolLabRedirect({ legacyPath }: { legacyPath: string }) {
  const tab = LEGACY_ROUTE_TABS[legacyPath] ?? "explorer";
  return <Navigate to={`/protocol-lab?tab=${tab}`} replace />;
}

function HomeRedirect() {
  const connected = useConnectionStore((s) => s.connected);
  return <Navigate to={connected ? "/dashboard" : "/connect"} replace />;
}

function Guarded({ children }: { children: ReactNode }) {
  return <RequireConnection>{children}</RequireConnection>;
}

/** Functional companion shell (Capacitor / APK). Landing is a separate Vite entry. */
export default function App() {
  useBluetooth();
  useProtocolLabBle();
  usePwaInstallInit();
  useDbInit();
  useRideLaunch();
  useApkUpdateInit();
  useEffect(() => {
    void startMapsNavBridge();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/app" element={<HomeRedirect />} />
      <Route path="/download" element={<HomeRedirect />} />
      <Route path="/connect" element={<ConnectPage />} />
      <Route path="/scanner" element={<Navigate to="/connect" replace />} />

      <Route
        path="/dashboard"
        element={
          <Guarded>
            <DashboardPage />
          </Guarded>
        }
      />
      <Route
        path="/navigate"
        element={
          <Guarded>
            <NavigatePage />
          </Guarded>
        }
      />
      <Route
        path="/settings"
        element={
          <Guarded>
            <SettingsPage />
          </Guarded>
        }
      />

      <Route
        path="/nav-lab"
        element={
          <Guarded>
            <NavLabPage />
          </Guarded>
        }
      />
      <Route
        path="/dev"
        element={
          <Guarded>
            <DevPage />
          </Guarded>
        }
      />
      <Route path="/lab" element={<Navigate to="/protocol-lab" replace />} />
      <Route path="/monitor" element={<Navigate to="/protocol-lab?tab=notifications" replace />} />
      <Route path="/send" element={<Navigate to="/protocol-lab?tab=sender" replace />} />
      <Route
        path="/protocol-lab"
        element={
          <Guarded>
            <ProtocolLabPage />
          </Guarded>
        }
      />
      <Route
        path="/fuzzer"
        element={
          <Guarded>
            <FuzzerPage />
          </Guarded>
        }
      />
      <Route
        path="/ble-debug"
        element={
          <Guarded>
            <BleDebugPage />
          </Guarded>
        }
      />

      <Route path="/explorer" element={<LegacyProtocolLabRedirect legacyPath="explorer" />} />
      <Route path="/console" element={<LegacyProtocolLabRedirect legacyPath="console" />} />
      <Route path="/transmit" element={<LegacyProtocolLabRedirect legacyPath="transmit" />} />
      <Route path="/simulator" element={<LegacyProtocolLabRedirect legacyPath="simulator" />} />
    </Routes>
  );
}
