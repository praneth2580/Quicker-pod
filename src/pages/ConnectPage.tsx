import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";
import { Button } from "@/components/ui/Button";
import { PinInput } from "@/components/connect/PinInput";
import { useBluetoothConnect } from "@/hooks/useBluetoothConnect";
import { ROYAL_ENFIELD_NAME_PREFIX } from "@/bluetooth/filters";
import { validateTripperPin } from "@/bluetooth/pairingConfig";
import { isNativeTripperBle } from "@/bluetooth/nativeTripperBle";

export function ConnectPage() {
  const navigate = useNavigate();
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
    clearError,
  } = useBluetoothConnect();

  const otherDevices = knownDevices.filter((d) => d.id !== currentDevice?.id);
  const activeDeviceName = awaitingPinDevice?.name ?? currentDevice?.name;

  // Once linked, enter the app — nothing else is available before this.
  useEffect(() => {
    if (connected && !awaitingPin) {
      navigate("/dashboard", { replace: true });
    }
  }, [connected, awaitingPin, navigate]);

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
    <AppLayout title="Connect" subtitle="Link your Tripper to continue" hideTitle gate>
      <div className="flex min-h-[calc(100dvh-7rem)] flex-col justify-center space-y-6 animate-nav-rise">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-[2rem] border border-line/50 bg-canvas-raised/90 p-7 shadow-panel">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/20 animate-nav-pulse-ring" />
            <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-accent/15 blur-3xl animate-nav-breathe" />
            <div className="absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-accent/10 blur-2xl animate-nav-breathe" />
          </div>

          <div className="relative text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-accent-soft shadow-glow ring-1 ring-accent/25">
              <svg viewBox="0 0 24 24" className="h-9 w-9 text-accent" fill="none" aria-hidden>
                <path
                  d="M7.5 8.5a5 5 0 0 1 9 0M5 11a8 8 0 0 1 14 0"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
                <circle cx="12" cy="16.5" r="1.75" fill="currentColor" />
              </svg>
            </div>
            <p className="font-display text-xs font-semibold uppercase tracking-[0.22em] text-accent">
              Quicker Pod
            </p>
            <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Connect first
            </h1>
            <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-ink-muted">
              Ignition on, Tripper awake — then link over Bluetooth. Ride and Navigate unlock after
              you connect.
            </p>
          </div>
        </section>

        {!bluetoothSupported && (
          <div className="rounded-2xl border border-warning/35 bg-warning/10 p-4 text-sm text-warning">
            {isNativeTripperBle()
              ? "Bluetooth is unavailable. Enable Bluetooth and grant BLE permissions, then retry."
              : "Web Bluetooth is not available here. Use Chrome, or the Quicker Pod Android app."}
          </div>
        )}

        {awaitingPin ? (
          <section className="rounded-[1.75rem] border border-line/60 bg-canvas-raised/95 p-6 shadow-lift animate-nav-rise">
            <p className="text-center text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-ink-faint">
              Enter PIN
            </p>
            <p className="mt-2 text-center text-sm text-ink-muted">
              6-digit code on your Tripper
              {activeDeviceName ? (
                <>
                  {" "}
                  for <span className="font-semibold text-ink">{activeDeviceName}</span>
                </>
              ) : null}
            </p>
            <div className="mt-5">
              <PinInput
                value={pin}
                onChange={(value) => {
                  setPin(value);
                  if (pinError) setPinError(null);
                }}
                disabled={submittingPin}
                error={pinError}
              />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2">
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
          </section>
        ) : (
          <section className="space-y-3">
            {hasPairedDevice && currentDevice ? (
              <>
                <div className="rounded-[1.75rem] border border-line/60 bg-canvas-raised/95 p-5 shadow-lift">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-ink-faint">
                    Saved Tripper
                  </p>
                  <p className="mt-1 truncate font-display text-xl font-bold text-ink">
                    {currentDevice.name}
                  </p>
                  <Button
                    className="mt-5"
                    fullWidth
                    disabled={!bluetoothSupported || connecting}
                    onClick={() => {
                      clearError();
                      void reconnect();
                    }}
                  >
                    {connecting ? "Connecting…" : "Reconnect"}
                  </Button>
                  <Button
                    className="mt-2"
                    fullWidth
                    variant="ghost"
                    disabled={connecting || submittingPin}
                    onClick={() => void forgetDevice()}
                  >
                    Forget device
                  </Button>
                </div>
                <Button
                  fullWidth
                  variant="secondary"
                  disabled={!bluetoothSupported || connecting}
                  onClick={handleStartPairing}
                >
                  Pair a different Tripper
                </Button>
              </>
            ) : (
              <div className="rounded-[1.75rem] border border-line/60 bg-canvas-raised/95 p-6 text-center shadow-lift">
                <p className="font-display text-xl font-bold text-ink">Find your motorcycle</p>
                <p className="mt-2 text-sm text-ink-muted">
                  Select{" "}
                  <span className="font-mono text-accent">{ROYAL_ENFIELD_NAME_PREFIX}</span> or{" "}
                  <span className="font-mono text-accent">RE_DISP</span>, then enter the PIN on the
                  pod.
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

            {otherDevices.length > 0 && (
              <div className="space-y-2 pt-2">
                <p className="px-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-ink-faint">
                  Other devices
                </p>
                {otherDevices.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center gap-3 rounded-2xl border border-line/50 bg-canvas-raised/80 px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display font-semibold text-ink">{d.name}</p>
                    </div>
                    <Button
                      variant="secondary"
                      className="!min-h-10 !px-3 !py-2 text-xs"
                      disabled={connecting || submittingPin}
                      onClick={() => {
                        clearError();
                        void reconnectDevice(d.id);
                      }}
                    >
                      Link
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </section>
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

        <p className="pb-2 text-center text-xs text-ink-faint">
          Tabs stay locked until your Tripper is linked.
        </p>
      </div>
    </AppLayout>
  );
}
