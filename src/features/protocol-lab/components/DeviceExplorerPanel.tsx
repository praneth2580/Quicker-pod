import { useCallback, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useConnectionStore } from "@/store/connectionStore";
import { ServiceTree } from "../components/ServiceTree";
import { useProtocolLabStore } from "../store";
import {
  discoverDetailedServices,
  readCharacteristic,
  subscribeCharacteristic,
  formatReadValue,
} from "../services/bleService";
import { formatRssi } from "@/utils/format";

export function DeviceExplorerPanel() {
  const { connected, device, mockConnect, bluetoothSupported } = useConnectionStore();
  const {
    detailedServices,
    expandedServices,
    expandedCharacteristics,
    selectedWritable,
    setDetailedServices,
    toggleService,
    toggleCharacteristic,
    setSelectedWritable,
    addSubscribed,
    addError,
  } = useProtocolLabStore();

  const selectedKey = selectedWritable
    ? `${selectedWritable.serviceUuid}|${selectedWritable.characteristicUuid}`
    : null;

  const refresh = useCallback(async () => {
    try {
      const services = await discoverDetailedServices();
      setDetailedServices(services);
    } catch (err) {
      addError(err instanceof Error ? err.message : "Discovery failed");
    }
  }, [addError, setDetailedServices]);

  useEffect(() => {
    if (connected) void refresh();
  }, [connected, refresh]);

  const handleRead = async (serviceUuid: string, charUuid: string) => {
    try {
      const value = await readCharacteristic(serviceUuid, charUuid);
      const hex = formatReadValue(value);
      const current = useProtocolLabStore.getState().detailedServices;
      setDetailedServices(
        current.map((s) =>
          s.uuid !== serviceUuid
            ? s
            : {
                ...s,
                characteristics: s.characteristics.map((c) =>
                  c.uuid !== charUuid ? c : { ...c, lastReadValue: hex },
                ),
              },
        ),
      );
    } catch (err) {
      addError(err instanceof Error ? err.message : "Read failed");
    }
  };

  const handleSubscribe = async (serviceUuid: string, charUuid: string) => {
    try {
      await subscribeCharacteristic(serviceUuid, charUuid);
      addSubscribed(`${serviceUuid}|${charUuid}`);
    } catch (err) {
      addError(err instanceof Error ? err.message : "Subscribe failed");
    }
  };

  const handleMockConnect = () => {
    mockConnect({ id: "mock:lab", name: "Tripper Pod (Mock)", rssi: -55 });
    void refresh();
  };

  return (
    <div className="space-y-4">
      <Card title="Device">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Name</span>
            <span>{device?.name ?? "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">ID</span>
            <span className="font-mono text-xs">{device?.id ?? "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Signal</span>
            <span>{formatRssi(device?.rssi)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">State</span>
            <StatusBadge label={connected ? "Connected" : "Disconnected"} active={connected} />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button variant="secondary" fullWidth onClick={() => void refresh()} disabled={!connected}>
            Refresh Services
          </Button>
          {!connected && !bluetoothSupported && (
            <Button fullWidth onClick={handleMockConnect}>
              Mock Connect
            </Button>
          )}
        </div>
      </Card>

      <ServiceTree
        services={detailedServices}
        expandedServices={expandedServices}
        expandedCharacteristics={expandedCharacteristics}
        selectedWritableKey={selectedKey}
        onToggleService={toggleService}
        onToggleCharacteristic={toggleCharacteristic}
        onRead={(s, c) => void handleRead(s, c)}
        onSubscribe={(s, c) => void handleSubscribe(s, c)}
        onSelectWritable={(s, c, name) => setSelectedWritable({ serviceUuid: s, characteristicUuid: c, name })}
      />
    </div>
  );
}
