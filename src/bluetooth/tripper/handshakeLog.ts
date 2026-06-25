import { useSettingsStore } from "@/store/settingsStore";
import { bytesToHex } from "@/utils";

const TAG = "[TripperHandshake]";

function shouldLog(): boolean {
  return useSettingsStore.getState().debugMode;
}

export function logHandshake(message: string, data?: Record<string, unknown>): void {
  if (!shouldLog()) return;
  if (data) {
    console.info(TAG, message, data);
  } else {
    console.info(TAG, message);
  }
}

/** Always logged — rare, high-signal pairing branch decisions. */
export function logHandshakeDecision(message: string, data: Record<string, unknown>): void {
  console.info(TAG, message, data);
}

export function logEnqueuePacket(label: string, packet: Uint8Array): void {
  if (!shouldLog()) return;
  const opcode = packet[0] ?? 0;
  console.info(TAG, `enqueuePacket → ${label}`, {
    opcode: `0x${opcode.toString(16).padStart(2, "0")}`,
    hex: bytesToHex(packet),
  });
}

export function logWriteCharacteristic(
  label: string,
  packet: Uint8Array,
  writeMode: "withResponse" | "withoutResponse",
): void {
  if (!shouldLog()) return;
  const opcode = packet[0] ?? 0;
  console.info(TAG, `writeCharacteristic → ${label}`, {
    writeMode,
    opcode: `0x${opcode.toString(16).padStart(2, "0")}`,
    hex: bytesToHex(packet),
  });
}
