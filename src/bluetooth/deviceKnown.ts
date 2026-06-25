import type { KnownDevice } from "@/types";

/**
 * Quicker-pod equivalent of Super Tripper `isDeviceKnown(mac)`.
 *
 * Official app persists bonded MACs in Android SharedPreferences key `knownMacs`
 * after successful PIN entry (`markDeviceAsKnown`). While paired, reconnect uses
 * PKT_CLOSE (0x21 00) instead of PKT_PIN_SHOW (0x21 01).
 *
 * We use Web Bluetooth `device.id` (opaque, not MAC) plus `pinPaired` in
 * localStorage key `quicker-pod-connection`.
 */
export function isDeviceKnown(
  deviceId: string | undefined,
  knownDevices: KnownDevice[],
): boolean {
  if (!deviceId) return false;
  const entry = knownDevices.find((d) => d.id === deviceId);
  return entry?.pinPaired === true;
}

export function describeKnownDevice(
  deviceId: string | undefined,
  knownDevices: KnownDevice[],
): Record<string, unknown> {
  if (!deviceId) {
    return { deviceId: null, isDeviceKnown: false, entry: null };
  }
  const entry = knownDevices.find((d) => d.id === deviceId);
  return {
    deviceId,
    isDeviceKnown: entry?.pinPaired === true,
    pinPaired: entry?.pinPaired ?? false,
    name: entry?.name,
    lastConnected: entry?.lastConnected,
    storageKey: "quicker-pod-connection (knownDevices)",
    officialEquivalent: "SharedPreferences knownMacs (BLE MAC)",
  };
}
