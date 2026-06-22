import { PacketConsole } from "./PacketConsole";
import { useProtocolLabPacketLogger } from "../store/packetLoggerStore";
import { useProtocolLabStore } from "../store";
import { exportCsv } from "../utils/export";

export function NotificationViewer() {
  const notifications = useProtocolLabPacketLogger((s) => s.notifications);
  const clearNotifications = useProtocolLabPacketLogger((s) => s.clearNotifications);
  const paused = useProtocolLabStore((s) => s.notificationsPaused);
  const setPaused = useProtocolLabStore((s) => s.setNotificationsPaused);

  const handleCopy = async () => {
    const text = notifications
      .map(
        (n) =>
          `${n.timestamp} ${n.direction}\n${n.characteristicUuid}\n${n.payloadHex}`,
      )
      .join("\n\n");
    await navigator.clipboard.writeText(text);
  };

  const handleExport = () => {
    exportCsv(
      `quicker-pod-notifications-${Date.now()}.csv`,
      ["timestamp", "direction", "serviceUuid", "characteristicUuid", "payloadHex", "notes"],
      notifications.map((n) => [
        n.timestamp,
        n.direction,
        n.serviceUuid,
        n.characteristicUuid,
        n.payloadHex,
        n.notes ?? "",
      ]),
    );
  };

  return (
    <PacketConsole
      title="Notification Monitor"
      entries={notifications}
      paused={paused}
      onPause={() => setPaused(!paused)}
      onClear={clearNotifications}
      onCopy={() => void handleCopy()}
      onExport={handleExport}
    />
  );
}
