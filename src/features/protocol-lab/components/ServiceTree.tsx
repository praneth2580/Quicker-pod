import type { DetailedServiceInfo } from "../types";
import { formatUuid } from "../utils/formatUuid";
import { CharacteristicCard } from "./CharacteristicCard";

interface ServiceTreeProps {
  services: DetailedServiceInfo[];
  expandedServices: Record<string, boolean>;
  expandedCharacteristics: Record<string, boolean>;
  selectedWritableKey: string | null;
  onToggleService: (uuid: string) => void;
  onToggleCharacteristic: (key: string) => void;
  onRead: (serviceUuid: string, charUuid: string) => void;
  onSubscribe: (serviceUuid: string, charUuid: string) => void;
  onSelectWritable: (serviceUuid: string, charUuid: string, name?: string) => void;
}

export function ServiceTree({
  services,
  expandedServices,
  expandedCharacteristics,
  selectedWritableKey,
  onToggleService,
  onToggleCharacteristic,
  onRead,
  onSubscribe,
  onSelectWritable,
}: ServiceTreeProps) {
  if (services.length === 0) {
    return (
      <p className="rounded-xl border border-white/10 bg-surface-raised p-6 text-center text-sm text-gray-400">
        No services discovered. Connect a device and refresh.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {services.map((service) => {
        const open = expandedServices[service.uuid] ?? true;
        return (
          <div key={service.uuid} className="rounded-2xl border border-white/10 bg-surface-raised/80">
            <button
              type="button"
              onClick={() => onToggleService(service.uuid)}
              className="flex w-full items-center justify-between gap-3 p-4 text-left"
            >
              <div className="min-w-0">
                <p className="font-semibold text-white">{service.name ?? "Service"}</p>
                <p className="mt-0.5 font-mono text-xs text-gray-500">{formatUuid(service.uuid, false)}</p>
              </div>
              <span className="text-gray-500">{open ? "▼" : "▶"}</span>
            </button>

            {open && (
              <div className="space-y-2 border-t border-white/10 p-3">
                {service.characteristics.map((char) => {
                  const key = `${service.uuid}|${char.uuid}`;
                  return (
                    <CharacteristicCard
                      key={key}
                      serviceUuid={service.uuid}
                      characteristic={char}
                      expanded={expandedCharacteristics[key] ?? false}
                      onToggleExpand={() => onToggleCharacteristic(key)}
                      onRead={() => onRead(service.uuid, char.uuid)}
                      onSubscribe={() => onSubscribe(service.uuid, char.uuid)}
                      onSelectWritable={() => onSelectWritable(service.uuid, char.uuid, char.name)}
                      isSelectedWritable={selectedWritableKey === key}
                    />
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
