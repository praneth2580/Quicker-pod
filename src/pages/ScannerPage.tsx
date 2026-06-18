import { useMemo, useState } from "react";
import { AppLayout } from "@/layouts/AppLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useConnectionStore } from "@/store/connectionStore";
import { MOCK_DEVICES } from "@/services/mockData";
import { formatRssi } from "@/utils/format";

export function ScannerPage() {
  const [filter, setFilter] = useState("");
  const [discovered, setDiscovered] = useState(MOCK_DEVICES);
  const {
    connected,
    scanning,
    bluetoothSupported,
    device,
    requestDevice,
    connect,
    disconnect,
    mockConnect,
    mockDisconnect,
    lastError,
  } = useConnectionStore();

  const filtered = useMemo(() => {
    const q = filter.toLowerCase();
    return discovered.filter(
      (d) => d.name.toLowerCase().includes(q) || d.id.toLowerCase().includes(q),
    );
  }, [discovered, filter]);

  const handleScan = async () => {
    if (bluetoothSupported) {
      await requestDevice();
      await connect();
    } else {
      setDiscovered(MOCK_DEVICES);
    }
  };

  const handleMockConnect = (mockDevice: (typeof MOCK_DEVICES)[0]) => {
    mockConnect(mockDevice);
  };

  return (
    <AppLayout title="Device Scanner" subtitle="Discover BLE Devices">
      <div className="space-y-4">
        <Card>
          <div className="flex flex-col gap-3">
            <Input
              label="Filter devices"
              placeholder="Search by name or ID..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={handleScan} disabled={scanning}>
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
          <Card subtitle="Web Bluetooth unavailable — showing mock devices">
            <p className="text-sm text-gray-400">
              Use Chrome on Android or desktop for real BLE scanning. Mock mode is enabled for
              development.
            </p>
          </Card>
        )}

        {lastError && (
          <Card className="border-danger/30">
            <p className="text-sm text-danger">{lastError}</p>
          </Card>
        )}

        <div className="space-y-3">
          {filtered.map((d) => {
            const isActive = device?.id === d.id && connected;
            return (
              <Card key={d.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold">{d.name}</h3>
                    <p className="mt-1 font-mono text-xs text-gray-500">{d.id}</p>
                    <p className="mt-2 text-sm text-gray-400">RSSI: {formatRssi(d.rssi)}</p>
                  </div>
                  <StatusBadge label={isActive ? "Active" : "Idle"} active={isActive} />
                </div>
                <div className="mt-4">
                  {isActive ? (
                    <Button variant="danger" fullWidth onClick={() => mockDisconnect()}>
                      Disconnect
                    </Button>
                  ) : (
                    <Button
                      fullWidth
                      variant="secondary"
                      onClick={() =>
                        bluetoothSupported ? void handleScan() : handleMockConnect(d)
                      }
                    >
                      Connect
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
