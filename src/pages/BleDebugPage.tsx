import { useCallback, useEffect } from "react";
import { AppLayout } from "@/layouts/AppLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { BleLogConsole } from "@/components/ble/BleLogConsole";
import { bleDebugLogger } from "@/bluetooth/bleDebugLogger";
import { useBleDebugStore } from "@/store/bleDebugStore";
import { useConnectionStore } from "@/store/connectionStore";

const STAGE_LABELS: Record<string, string> = {
  idle: "Idle",
  connecting: "Connecting",
  connected: "Connected",
  services_discovered: "Services discovered",
  notifications_enabled: "Notifications enabled",
  show_pin: "SHOW PIN sent",
  set_time: "SET TIME sent",
  ping_fw: "PING FW sent",
  ping_wp: "PING WP sent",
  ready: "Ready",
  disconnected: "Disconnected",
};

export function BleDebugPage() {
  const {
    gattConnected,
    deviceName,
    handshakeStage,
    lastDisconnectReason,
    events,
    services,
    clear,
    syncFromLogger,
  } = useBleDebugStore();
  const connected = useConnectionStore((s) => s.connected);

  useEffect(() => {
    syncFromLogger();
  }, [syncFromLogger]);

  const downloadLog = useCallback(() => {
    bleDebugLogger.downloadLogFile("tripper-debug.log");
  }, []);

  const downloadSession = useCallback(() => {
    bleDebugLogger.downloadSessionJson("tripper-session.json");
  }, []);

  const txEvents = events.filter((e) => e.level === "tx");
  const rxEvents = events.filter((e) => e.level === "rx");

  return (
    <AppLayout title="BLE Debug" subtitle="Tripper connection diagnostics">
      <div className="space-y-4">
        <BleLogConsole title="Live BLE log" />

        <Card>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge
              label={gattConnected ? "GATT connected" : "GATT disconnected"}
              active={gattConnected}
              variant={gattConnected ? "success" : "neutral"}
            />
            <StatusBadge
              label={connected ? "App connected" : "App offline"}
              active={connected}
              variant={connected ? "success" : "neutral"}
            />
            <StatusBadge
              label={STAGE_LABELS[handshakeStage] ?? handshakeStage}
              active={handshakeStage !== "idle" && handshakeStage !== "disconnected"}
              variant="neutral"
            />
          </div>
          <div className="mt-3 space-y-1 text-sm text-gray-400">
            <p>
              Device: <span className="font-mono text-gray-200">{deviceName ?? "—"}</span>
            </p>
            <p>
              Handshake:{" "}
              <span className="font-mono text-accent">{STAGE_LABELS[handshakeStage] ?? handshakeStage}</span>
            </p>
            {lastDisconnectReason && (
              <p className="text-red-400">
                Last disconnect: <span className="font-mono">{lastDisconnectReason}</span>
              </p>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="secondary" onClick={downloadLog}>
              Download tripper-debug.log
            </Button>
            <Button variant="secondary" onClick={downloadSession}>
              Export session JSON
            </Button>
            <Button variant="secondary" onClick={clear}>
              Clear all
            </Button>
          </div>
        </Card>

        <Card>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
            GATT Services ({services.length})
          </h3>
          {services.length === 0 ? (
            <p className="text-sm text-gray-500">Connect to a device to discover services.</p>
          ) : (
            <ul className="space-y-3 text-xs">
              {services.map((svc) => (
                <li key={svc.uuid} className="rounded-lg bg-white/5 p-2">
                  <p className="font-mono text-accent">{svc.uuid}</p>
                  <ul className="mt-1 space-y-1 pl-2">
                    {svc.characteristics.map((c) => (
                      <li key={c.uuid} className="font-mono text-gray-400">
                        {c.uuid}
                        <span className="ml-2 text-gray-600">
                          {[
                            c.properties.read && "R",
                            c.properties.write && "W",
                            c.properties.writeWithoutResponse && "WnR",
                            c.properties.notify && "N",
                            c.properties.indicate && "I",
                          ]
                            .filter(Boolean)
                            .join("")}
                        </span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
            Packets — TX ({txEvents.length}) / RX ({rxEvents.length})
          </h3>
          <div className="max-h-40 overflow-y-auto rounded-lg bg-black/30 p-2 font-mono text-xs">
            {[...txEvents.slice(-20), ...rxEvents.slice(-20)]
              .sort((a, b) => a.epochMs - b.epochMs)
              .map((e) => (
                <div key={e.id} className={e.level === "tx" ? "text-cyan-400" : "text-green-400"}>
                  {e.timestamp.slice(11, 23)} [{e.tag}] {e.message}
                  {e.data?.hex ? ` ${String(e.data.hex)}` : ""}
                </div>
              ))}
            {txEvents.length === 0 && rxEvents.length === 0 && (
              <p className="text-gray-600">No packets yet.</p>
            )}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
