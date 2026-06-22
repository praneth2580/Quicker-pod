import { useConnectionStore } from "@/store/connectionStore";

export function useBluetoothConnect() {
  const connected = useConnectionStore((s) => s.connected);
  const connecting = useConnectionStore((s) => s.connecting);
  const pairingPhase = useConnectionStore((s) => s.pairingPhase);
  const awaitingPinDevice = useConnectionStore((s) => s.awaitingPinDevice);
  const bluetoothSupported = useConnectionStore((s) => s.bluetoothSupported);
  const currentDevice = useConnectionStore((s) => s.currentDevice);
  const knownDevices = useConnectionStore((s) => s.knownDevices);
  const lastError = useConnectionStore((s) => s.lastError);
  const pairingMessage = useConnectionStore((s) => s.pairingMessage);
  const startPairing = useConnectionStore((s) => s.startPairing);
  const submitPin = useConnectionStore((s) => s.submitPin);
  const cancelPairing = useConnectionStore((s) => s.cancelPairing);
  const reconnect = useConnectionStore((s) => s.reconnect);
  const reconnectDevice = useConnectionStore((s) => s.reconnectDevice);
  const forgetDevice = useConnectionStore((s) => s.forgetDevice);
  const disconnect = useConnectionStore((s) => s.disconnect);
  const clearError = useConnectionStore((s) => s.clearError);

  const hasPairedDevice = Boolean(currentDevice);
  const awaitingPin = pairingPhase === "awaiting_pin" || pairingPhase === "submitting_pin";
  const submittingPin = pairingPhase === "submitting_pin";

  return {
    connected,
    connecting,
    pairingPhase,
    awaitingPin,
    submittingPin,
    awaitingPinDevice,
    bluetoothSupported,
    currentDevice,
    knownDevices,
    lastError,
    pairingMessage,
    hasPairedDevice,
    startPairing,
    submitPin,
    cancelPairing,
    reconnect,
    reconnectDevice,
    forgetDevice,
    disconnect,
    clearError,
  };
}
