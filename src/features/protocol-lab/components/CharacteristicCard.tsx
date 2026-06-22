import { Button } from "@/components/ui/Button";
import type { DetailedCharacteristicInfo } from "../types";
import { formatUuid } from "../utils/formatUuid";

interface CharacteristicCardProps {
  serviceUuid: string;
  characteristic: DetailedCharacteristicInfo;
  expanded: boolean;
  onToggleExpand: () => void;
  onRead: () => void;
  onSubscribe: () => void;
  onSelectWritable: () => void;
  isSelectedWritable: boolean;
}

function PropertyTag({ label, active }: { label: string; active: boolean }) {
  if (!active) return null;
  return (
    <span className="rounded bg-accent/10 px-2 py-0.5 text-[0.65rem] font-medium uppercase text-accent">
      {label}
    </span>
  );
}

export function CharacteristicCard({
  serviceUuid,
  characteristic,
  expanded,
  onToggleExpand,
  onRead,
  onSubscribe,
  onSelectWritable,
  isSelectedWritable,
}: CharacteristicCardProps) {
  const { uuid, properties, descriptors, lastReadValue, name } = characteristic;
  const writable = properties.write || properties.writeWithoutResponse;
  const subscribable = properties.notify || properties.indicate;

  return (
    <div
      className={`rounded-xl border p-3 ${isSelectedWritable ? "border-accent/50 bg-accent/5" : "border-white/10 bg-black/20"}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium text-white">{name ?? formatUuid(uuid, false)}</p>
          <p className="mt-0.5 font-mono text-[0.65rem] text-gray-500">{uuid}</p>
        </div>
        <button
          type="button"
          onClick={onToggleExpand}
          className="shrink-0 rounded-lg px-2 py-1 text-xs text-gray-400 hover:bg-white/5"
        >
          {expanded ? "Hide" : "Details"}
        </button>
      </div>

      <div className="mt-2 flex flex-wrap gap-1">
        <PropertyTag label="Read" active={properties.read} />
        <PropertyTag label="Write" active={writable} />
        <PropertyTag label="Notify" active={properties.notify} />
        <PropertyTag label="Indicate" active={properties.indicate} />
      </div>

      {expanded && (
        <div className="mt-3 space-y-2 border-t border-white/10 pt-3 text-xs text-gray-400">
          <p>
            <span className="text-gray-500">Service:</span> {formatUuid(serviceUuid, false)}
          </p>
          {descriptors.length > 0 ? (
            <div>
              <p className="text-gray-500">Descriptors:</p>
              <ul className="mt-1 space-y-1 font-mono">
                {descriptors.map((d) => (
                  <li key={d.uuid}>{d.uuid}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p>No descriptors</p>
          )}
          {lastReadValue && (
            <p>
              <span className="text-gray-500">Last read:</span>{" "}
              <span className="font-mono text-accent">{lastReadValue}</span>
            </p>
          )}
        </div>
      )}

      <div className="mt-3 grid grid-cols-3 gap-2">
        <Button variant="secondary" disabled={!properties.read} onClick={onRead}>
          Read
        </Button>
        <Button variant="secondary" disabled={!subscribable} onClick={onSubscribe}>
          Subscribe
        </Button>
        <Button
          variant={isSelectedWritable ? "primary" : "secondary"}
          disabled={!writable}
          onClick={onSelectWritable}
        >
          {isSelectedWritable ? "Selected" : "Select TX"}
        </Button>
      </div>
    </div>
  );
}
