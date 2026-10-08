import { useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PinInput } from "@/components/connect/PinInput";
import { useBluetoothConnect } from "@/hooks/useBluetoothConnect";
import { ROYAL_ENFIELD_NAME_PREFIX } from "@/bluetooth/filters";
import { validateTripperPin } from "@/bluetooth/pairingConfig";
import { isNativeTripperBle } from "@/bluetooth/nativeTripperBle";

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
    <AppLayout title="Connect" subtitle="Tripper link" hideTitle>
      <div className="space-y-5 animate-nav-rise">
        <section className="relative overflow-hidden rounded-[1.75rem] border border-line/60 bg-canvas-raised/90 p-6 shadow-panel">
          <div className="pointer-events-none absolute -left-6 bottom-0 h-28 w-28 rounded-full bg-accent/10 blur-2xl animate-nav-breathe" />
          <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-accent">
            Quicker Pod
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink">
            Connect
          </h1>
          <p className="mt-2 max-w-sm text-sm text-ink-muted">
            Ignition on, Tripper awake — then pair over Bluetooth. Once linked, Navigate and Maps
            mirroring can drive the display.
          </p>
        </section>

        {showInitialConnect && (
          <div className="rounded-[1.5rem] border border-line/70 bg-canvas-raised/85 p-6 text-center shadow-lift">
            <p className="font-display text-xl font-bold text-ink">Find your motorcycle</p>
            <p className="mt-2 text-sm text-ink-muted">
              Select a device starting with{" "}
              <span className="font-mono text-accent">{ROYAL_ENFIELD_NAME_PREFIX}</span> or{" "}
              <span className="font-mono text-accent">RE_DISP</span>, then enter the 6-digit PIN on
              the pod.
            </p>
            <Button
              className="mt-6"
              fullWidth
              disabled={!bluetoothSupported || connecting}
              onClick={handleStartPairing}
            >
              {connecting ? "Selecting device…" : "Connect Tripper"}
            </Button>
          </div>
        )}

        {awaitingPin && (
          <Card title="Enter Tripper PIN">
            <div className="space-y-4 text-center">
              <p className="text-sm text-ink-muted">
                Enter the 6-digit code shown on your Tripper pod
                {activeDeviceName ? (
                  <>
                    {" "}
                    for <span className="font-medium text-ink">{activeDeviceName}</span>
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
          <div className="rounded-2xl border border-warning/35 bg-warning/10 p-4 text-sm text-warning">
            {isNativeTripperBle()
              ? "Bluetooth is unavailable. Enable Bluetooth and grant BLE permissions, then retry."
              : "Web Bluetooth is not available here. Use Chrome, or the Quicker Pod Android app for full Tripper pairing."}
          </div>
        )}

        {bluetoothSupported && isNativeTripperBle() && showInitialConnect && (
          <p className="text-sm text-ink-muted">
            Native Android BLE hosts a GATT server so Tripper can send AUTH. Scan finds{" "}
            <span className="font-mono text-accent">RE_</span> devices — the PIN appears on the pod.
          </p>
        )}

        {lastError && (
          <div className="rounded-2xl border border-danger/35 bg-danger/10 p-4 text-sm text-danger">
            {lastError}
          </div>
        )}

        {pairingMessage && (
          <div className="rounded-2xl border border-success/35 bg-success/10 p-4 text-sm text-success">
            {pairingMessage}
          </div>
        )}

        {currentDevice && !awaitingPin && (
          <div className="rounded-[1.5rem] border border-line/70 bg-canvas-raised/90 p-5 shadow-lift">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-ink-faint">
                  Linked device
                </p>
                <p className="mt-1 truncate font-display text-xl font-bold text-ink">
                  {currentDevice.name}
                </p>
                <p className="mt-1 font-mono text-xs text-ink-faint">{currentDevice.id}</p>
              </div>
              <StatusBadge
                label={connected ? "Connected" : currentDevice.pinPaired ? "Paired" : "Saved"}
                active={connected}
                variant={connected ? "success" : "neutral"}
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-ink-faint">First paired</p>
                <p className="text-ink-muted">{formatTimestamp(currentDevice.firstPaired)}</p>
              </div>
              <div>
                <p className="text-xs text-ink-faint">Last connected</p>
                <p className="text-ink-muted">{formatTimestamp(currentDevice.lastConnected)}</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
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
                Forget
              </Button>
            </div>

            {connected && (
              <div className="mt-3 grid gap-2">
                <Link to="/navigate">
                  <Button fullWidth variant="primary">
                    Start Navigate
                  </Button>
                </Link>
                <Button variant="ghost" fullWidth onClick={() => void disconnect()}>
                  Disconnect
                </Button>
              </div>
            )}
          </div>
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
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-faint">
              Other saved devices
            </h2>
            {otherDevices.map((d) => (
              <div
                key={d.id}
                className="rounded-2xl border border-line/70 bg-canvas-raised/80 p-4 shadow-lift"
              >
                <h3 className="truncate font-display font-semibold text-ink">{d.name}</h3>
                <p className="mt-1 font-mono text-xs text-ink-faint">{d.id}</p>
                <p className="mt-2 text-sm text-ink-muted">
                  Last connected: {formatTimestamp(d.lastConnected)}
                </p>
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
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
