import { Routes, Route } from "react-router-dom";
import { useBluetooth } from "@/hooks/useBluetooth";
import { usePwaInstallInit } from "@/hooks/usePwaInstall";
import { DashboardPage } from "@/pages/DashboardPage";
import { ScannerPage } from "@/pages/ScannerPage";
import { ExplorerPage } from "@/pages/ExplorerPage";
import { ConsolePage } from "@/pages/ConsolePage";
import { TransmitPage } from "@/pages/TransmitPage";
import { SimulatorPage } from "@/pages/SimulatorPage";
import { SettingsPage } from "@/pages/SettingsPage";

export default function App() {
  useBluetooth();
  usePwaInstallInit();

  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/scanner" element={<ScannerPage />} />
      <Route path="/explorer" element={<ExplorerPage />} />
      <Route path="/simulator" element={<SimulatorPage />} />
      <Route path="/console" element={<ConsolePage />} />
      <Route path="/transmit" element={<TransmitPage />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Routes>
  );
}
