import { useState } from "react";
import { AppLayout } from "@/layouts/AppLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PinInput } from "@/components/connect/PinInput";
import { BleLogConsole } from "@/components/ble/BleLogConsole";
import { useBluetoothConnect } from "@/hooks/useBluetoothConnect";
import { ROYAL_ENFIELD_NAME_PREFIX } from "@/bluetooth/filters";
import { validateTripperPin } from "@/bluetooth/pairingConfig";

function formatTimestamp(ms: number): string {
  try {
    return new Date(ms).toLocaleString();
  } catch {
    return String(ms);
  }
}

export function ConnectPage() {
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const {
    connected,
    connecting,
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
  } = useBluetoothConnect();

  const otherDevices = knownDevices.filter((d) => d.id !== currentDevice?.id);
  const showInitialConnect = !hasPairedDevice && !awaitingPin;
  const activeDeviceName = awaitingPinDevice?.name ?? currentDevice?.name;

  const handleStartPairing = () => {
    clearError();
    setPin("");
    setPinError(null);
    void startPairing();
  };

  const handleSubmitPin = () => {
    const validationError = validateTripperPin(pin);
    if (validationError) {
      setPinError(validationError);
      return;
    }
    setPinError(null);
    clearError();
    void submitPin(pin);
  };

  return (
    <AppLayout title="QUICKER-POD" subtitle="Royal Enfield BLE">
      <div className="space-y-4">
        {showInitialConnect && (
          <Card className="text-center">
            <p className="text-lg text-gray-300">Connect your motorcycle</p>
            <p className="mt-2 text-sm text-gray-500">
              Turn ignition on, then select a device starting with{" "}
              <span className="font-mono text-accent">{ROYAL_ENFIELD_NAME_PREFIX}</span> or{" "}
              <span className="font-mono text-accent">RE_DISP</span>.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              After selection, enter the 6-digit PIN shown on your Tripper display.
            </p>
            <Button
              className="mt-6"
              fullWidth
              disabled={!bluetoothSupported || connecting}
              onClick={handleStartPairing}
            >
              {connecting ? "Selecting device…" : "Connect"}
            </Button>
          </Card>
        )}

        {awaitingPin && (
          <Card title="Enter Tripper PIN">
            <div className="space-y-4 text-center">
              <p className="text-sm text-gray-400">
                Enter the 6-digit code shown on your Tripper pod
                {activeDeviceName ? (
                  <>
                    {" "}
                    for <span className="font-medium text-white">{activeDeviceName}</span>
                  </>
                ) : null}
                .
              </p>
              <PinInput
                value={pin}
                onChange={(value) => {
                  setPin(value);
                  if (pinError) setPinError(null);
                }}
                disabled={submittingPin}
                error={pinError}
              />
              <div className="grid grid-cols-2 gap-2">
                <Button
                  fullWidth
                  disabled={submittingPin || pin.length !== 6}
                  onClick={handleSubmitPin}
                >
                  {submittingPin ? "Pairing…" : "Pair"}
                </Button>
                <Button
                  fullWidth
                  variant="ghost"
                  disabled={submittingPin}
                  onClick={() => {
                    setPin("");
                    setPinError(null);
                    void cancelPairing();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

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

        {pairingMessage && (
          <Card className="border-success/30">
            <p className="text-sm text-success">{pairingMessage}</p>
          </Card>
        )}

        {currentDevice && !awaitingPin && (
          <Card title="🏍️ Connected Device">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-wider text-gray-500">Name</p>
                  <p className="truncate font-semibold text-white">{currentDevice.name}</p>
                </div>
                <StatusBadge
                  label={connected ? "Connected" : currentDevice.pinPaired ? "PIN Paired" : "Saved"}
                  active={connected}
                  variant={connected ? "success" : "neutral"}
                />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500">ID</p>
                <p className="font-mono text-sm text-gray-300">{currentDevice.id}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500">First paired</p>
                  <p className="text-gray-400">{formatTimestamp(currentDevice.firstPaired)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500">Last connected</p>
                  <p className="text-gray-400">{formatTimestamp(currentDevice.lastConnected)}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                disabled={connecting || connected}
                onClick={() => {
                  clearError();
                  void reconnect();
                }}
              >
                {connecting ? "Connecting…" : "Reconnect"}
              </Button>
              <Button
                variant="danger"
                disabled={connecting || submittingPin}
                onClick={() => void forgetDevice()}
              >
                Forget Device
              </Button>
            </div>

            {connected && (
              <Button className="mt-2" variant="ghost" fullWidth onClick={() => void disconnect()}>
                Disconnect
              </Button>
            )}
          </Card>
        )}

        {hasPairedDevice && !awaitingPin && (
          <Button
            fullWidth
            variant="secondary"
            disabled={!bluetoothSupported || connecting || submittingPin}
            onClick={handleStartPairing}
          >
            Pair another device
          </Button>
        )}

        {otherDevices.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-medium uppercase tracking-wide text-gray-500">
              Other saved devices
            </h2>
            {otherDevices.map((d) => (
              <Card key={d.id}>
                <div className="min-w-0">
                  <h3 className="truncate font-semibold">{d.name}</h3>
                  <p className="mt-1 font-mono text-xs text-gray-500">{d.id}</p>
                  <p className="mt-2 text-sm text-gray-400">
                    Last connected: {formatTimestamp(d.lastConnected)}
                  </p>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Button
                    variant="secondary"
                    disabled={connecting || connected || submittingPin}
                    onClick={() => {
                      clearError();
                      void reconnectDevice(d.id);
                    }}
                  >
                    Reconnect
                  </Button>
                  <Button variant="ghost" onClick={() => void forgetDevice(d.id)}>
                    Forget
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        <BleLogConsole compact title="Live BLE log" />
      </div>
    </AppLayout>
  );
}
