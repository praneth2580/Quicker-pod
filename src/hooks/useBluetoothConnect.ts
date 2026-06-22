import { useConnectionStore } from "@/store/connectionStore";

export function useBluetoothConnect() {
  const connected = useConnectionStore((s) => s.connected);
  const connecting = useConnectionStore((s) => s.connecting);
  const bluetoothSupported = useConnectionStore((s) => s.bluetoothSupported);
  const currentDevice = useConnectionStore((s) => s.currentDevice);
  const knownDevices = useConnectionStore((s) => s.knownDevices);
  const lastError = useConnectionStore((s) => s.lastError);
  const connectNewDevice = useConnectionStore((s) => s.connectNewDevice);
  const reconnect = useConnectionStore((s) => s.reconnect);
  const reconnectDevice = useConnectionStore((s) => s.reconnectDevice);
  const forgetDevice = useConnectionStore((s) => s.forgetDevice);
  const disconnect = useConnectionStore((s) => s.disconnect);
  const clearError = useConnectionStore((s) => s.clearError);

  const hasPairedDevice = Boolean(currentDevice);

  return {
    connected,
    connecting,
    bluetoothSupported,
    currentDevice,
    knownDevices,
    lastError,
    hasPairedDevice,
    connectNewDevice,
    reconnect,
    reconnectDevice,
    forgetDevice,
    disconnect,
    clearError,
  };
}
