export type BluetoothErrorCode =
  | "CANCELLED"
  | "UNAVAILABLE"
  | "PERMISSION_DENIED"
  | "CONNECTION_FAILED"
  | "NOT_FOUND"
  | "PAIRING_FAILED"
  | "PAIRING_TIMEOUT"
  | "UNKNOWN";

export class BluetoothError extends Error {
  readonly code: BluetoothErrorCode;

  constructor(code: BluetoothErrorCode, message: string, cause?: unknown) {
    super(message);
    this.name = "BluetoothError";
    this.code = code;
    if (cause !== undefined) {
      this.cause = cause;
    }
  }
}

const ERROR_MESSAGES: Record<BluetoothErrorCode, string> = {
  CANCELLED: "Device selection was cancelled.",
  UNAVAILABLE: "Bluetooth is not available. Use Chrome on Android or desktop with BLE support.",
  PERMISSION_DENIED: "Bluetooth permission was denied. Allow access in your browser settings.",
  CONNECTION_FAILED: "Could not connect to the device. Move closer and try again.",
  NOT_FOUND: "Device not found. Pair via Connect first, then use Reconnect.",
  PAIRING_FAILED: "PIN pairing failed. Check the 6-digit code on your Tripper display.",
  PAIRING_TIMEOUT: "PIN pairing timed out. Make sure ignition is on and try again.",
  UNKNOWN: "An unexpected Bluetooth error occurred.",
};

export function getBluetoothErrorMessage(error: unknown): string {
  if (error instanceof BluetoothError) return error.message;
  if (error instanceof Error) return error.message;
  return ERROR_MESSAGES.UNKNOWN;
}

export function mapBluetoothError(error: unknown): BluetoothError {
  if (error instanceof BluetoothError) return error;

  if (error instanceof DOMException) {
    switch (error.name) {
      case "NotFoundError":
        return new BluetoothError("CANCELLED", ERROR_MESSAGES.CANCELLED, error);
      case "NotAllowedError":
      case "SecurityError":
        return new BluetoothError("PERMISSION_DENIED", ERROR_MESSAGES.PERMISSION_DENIED, error);
      case "NetworkError":
        return new BluetoothError("CONNECTION_FAILED", ERROR_MESSAGES.CONNECTION_FAILED, error);
      case "InvalidStateError":
        return new BluetoothError("UNAVAILABLE", ERROR_MESSAGES.UNAVAILABLE, error);
      default:
        return new BluetoothError("UNKNOWN", error.message || ERROR_MESSAGES.UNKNOWN, error);
    }
  }

  if (error instanceof Error) {
    if (error.message.toLowerCase().includes("not supported")) {
      return new BluetoothError("UNAVAILABLE", ERROR_MESSAGES.UNAVAILABLE, error);
    }
    return new BluetoothError("UNKNOWN", error.message, error);
  }

  return new BluetoothError("UNKNOWN", ERROR_MESSAGES.UNKNOWN, error);
}
