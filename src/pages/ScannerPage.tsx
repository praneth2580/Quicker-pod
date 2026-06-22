import { useMemo } from "react";
import { AppLayout } from "@/layouts/AppLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useConnectionStore } from "@/store/connectionStore";
import { formatRssi } from "@/utils/format";

export function ScannerPage() {
  const {
    connected,
    scanning,
    bluetoothSupported,
    device,
    requestDevice,
    connect,
    disconnect,
    lastError,
  } = useConnectionStore();

  const devices = useMemo(() => (device ? [device] : []), [device]);

  const handleScan = async () => {
    await requestDevice();
    const { device: selected, lastError: err } = useConnectionStore.getState();
    if (selected && !err) {
      await connect();
    }
  };

  return (
    <AppLayout title="Device Scanner" subtitle="Discover BLE Devices">
      <div className="space-y-4">
        <Card>
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={() => void handleScan()} disabled={scanning || !bluetoothSupported}>
                {scanning ? "Scanning…" : "Scan BLE"}
              </Button>
              <Button
                variant="danger"
                onClick={() => void disconnect()}
                disabled={!connected}
              >
                Disconnect
              </Button>
            </div>
          </div>
        </Card>

        {!bluetoothSupported && (
          <Card className="border-warning/30">
            <p className="text-sm text-warning">
              Web Bluetooth is not available in this browser. Use Chrome on Android or desktop.
            </p>
          </Card>
        )}

        {lastError && (
          <Card className="border-danger/30">
            <p className="text-sm text-danger">{lastError}</p>
          </Card>
        )}

        {devices.length === 0 ? (
          <Card>
            <p className="text-center text-sm text-gray-400">
              No device connected. Tap Scan BLE to select a Tripper Pod.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {devices.map((d) => {
              const isActive = connected;
              return (
                <Card key={d.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold">{d.name}</h3>
                      <p className="mt-1 font-mono text-xs text-gray-500">{d.id}</p>
                      <p className="mt-2 text-sm text-gray-400">RSSI: {formatRssi(d.rssi)}</p>
                    </div>
                    <StatusBadge label={isActive ? "Connected" : "Selected"} active={isActive} />
                  </div>
                  {isActive && (
                    <div className="mt-4">
                      <Button variant="danger" fullWidth onClick={() => void disconnect()}>
                        Disconnect
                      </Button>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
