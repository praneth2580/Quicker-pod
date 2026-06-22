/** How the 6-digit Tripper PIN is encoded before writing to the pairing characteristic. */
export type PinEncoding = "ascii" | "bcd" | "framed";

export interface TripperPairingConfig {
  /** When set, skip auto-discovery and use these UUIDs. */
  serviceUuid?: string;
  writeCharacteristicUuid?: string;
  notifyCharacteristicUuid?: string;
  pinEncoding: PinEncoding;
  responseTimeoutMs: number;
}

export const DEFAULT_PAIRING_CONFIG: TripperPairingConfig = {
  pinEncoding: "ascii",
  responseTimeoutMs: 5000,
};

/** Bluetooth SIG adopted 16-bit service UUID base (32 hex chars without dashes). */
const SIG_UUID_BASE = "00001000800000805f9b34fb";

const STANDARD_16BIT_SERVICES = new Set([
  "1800", "1801", "180a", "180f", "180d", "1805", "1812",
]);

export interface PairingTarget {
  serviceUuid: string;
  writeCharacteristicUuid: string;
  notifyCharacteristicUuid?: string;
}

export interface PairingResult {
  success: boolean;
  target: PairingTarget;
  encoding: PinEncoding;
  response?: Uint8Array;
  message: string;
}

export function validateTripperPin(pin: string): string | null {
  const normalized = pin.replace(/\s/g, "");
  if (!/^\d{6}$/.test(normalized)) {
    return "Enter the 6-digit code shown on your Tripper display.";
  }
  return null;
}

export function normalizeTripperPin(pin: string): string {
  return pin.replace(/\D/g, "").slice(0, 6);
}

export function isLikelyVendorService(uuid: string): boolean {
  const compact = uuid.toLowerCase().replace(/-/g, "");
  if (compact.length === 4) {
    return !STANDARD_16BIT_SERVICES.has(compact);
  }
  if (compact.length !== 32) return false;
  return !compact.endsWith(SIG_UUID_BASE);
}

export function encodePinPayload(pin: string, encoding: PinEncoding): Uint8Array {
  const digits = normalizeTripperPin(pin);
  if (digits.length !== 6) {
    throw new Error("PIN must be exactly 6 digits.");
  }

  switch (encoding) {
    case "ascii":
      return Uint8Array.from(digits, (d) => d.charCodeAt(0));
    case "bcd": {
      const bytes = new Uint8Array(3);
      for (let i = 0; i < 3; i += 1) {
        const high = Number(digits[i * 2]);
        const low = Number(digits[i * 2 + 1]);
        bytes[i] = (high << 4) | low;
      }
      return bytes;
    }
    case "framed": {
      const frame = new Uint8Array(30);
      frame[0] = 0xa5;
      frame[1] = 0x50; // 'P' — pairing frame (experimental)
      const pinBytes = Uint8Array.from(digits, (d) => d.charCodeAt(0));
      frame.set(pinBytes, 2);
      let checksum = 0;
      for (let i = 1; i < 28; i += 1) checksum = (checksum + frame[i]) & 0xff;
      frame[28] = checksum;
      frame[29] = 0x7f;
      return frame;
    }
    default:
      return encodePinPayload(pin, "ascii");
  }
}

export function isPairingResponseSuccess(response: Uint8Array | undefined): boolean {
  if (!response?.length) return true;
  const text = Array.from(response)
    .map((b) => (b >= 32 && b < 127 ? String.fromCharCode(b) : ""))
    .join("");
  if (/PWD:N|FAIL|ERROR|DENIED/i.test(text)) return false;
  if (/PWD:Y|OK|SUCCESS|PAIRED/i.test(text)) return true;
  return response[0] !== 0x00;
}
