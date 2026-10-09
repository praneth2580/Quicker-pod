import { bluetoothManager } from "@/bluetooth/BluetoothManager";
import { bleDebugLogger, type BleDebugEvent } from "@/bluetooth/bleDebugLogger";
import { TRIPPER_CHAR_UUID, TRIPPER_SERVICE_UUID } from "@/bluetooth/tripper/constants";
import { parseTripperResponse, type TripperResponse } from "@/bluetooth/tripper/parser";
import { bytesToHex, hexToBytes } from "@/utils/hex";
import { buildProbePacket, type OpcodeProbeDef } from "./catalog";

export type ProbeOutcomeKind = "reply" | "timeout" | "error";

export interface ProbeOutcome {
  kind: ProbeOutcomeKind;
  txHex: string;
  response: TripperResponse | null;
  error: string | null;
}

function bytesFromRxEvent(event: BleDebugEvent): Uint8Array | null {
  if (event.level !== "rx") return null;
  const raw = event.data?.bytes ?? event.data?.hex;
  if (typeof raw !== "string" || raw.length === 0) return null;
  try {
    const bytes = hexToBytes(raw);
    return bytes.length > 0 ? bytes : null;
  } catch {
    return null;
  }
}

/** First RX logged after this call, or null when the window closes. */
function waitForNextRx(timeoutMs: number, signal: AbortSignal): Promise<Uint8Array | null> {
  const startIndex = bleDebugLogger.getEvents().length;

  return new Promise((resolve) => {
    let settled = false;
    const finish = (value: Uint8Array | null) => {
      if (settled) return;
      settled = true;
      signal.removeEventListener("abort", onAbort);
      unsub();
      window.clearTimeout(timer);
      resolve(value);
    };

    const scan = () => {
      const events = bleDebugLogger.getEvents();
      for (let i = startIndex; i < events.length; i += 1) {
        const bytes = bytesFromRxEvent(events[i]);
        if (bytes) {
          finish(bytes);
          return;
        }
      }
    };

    const onAbort = () => finish(null);
    const unsub = bleDebugLogger.subscribe(scan);
    const timer = window.setTimeout(() => finish(null), timeoutMs);
    if (signal.aborted) {
      finish(null);
      return;
    }
    signal.addEventListener("abort", onAbort, { once: true });
    scan();
  });
}

/**
 * Write one zero-padded command and return the next notification.
 * Does not look at the pod display.
 */
export async function runOpcodeProbe(
  probe: OpcodeProbeDef,
  timeoutMs: number,
  signal: AbortSignal,
): Promise<ProbeOutcome> {
  const packet = buildProbePacket(probe.opcode, probe.sub);
  const txHex = bytesToHex(packet);

  if (signal.aborted) {
    return { kind: "error", txHex, response: null, error: "Stopped" };
  }
  if (!bluetoothManager.isConnected()) {
    return { kind: "error", txHex, response: null, error: "Not connected" };
  }

  const rxAbort = new AbortController();
  const onAbort = () => rxAbort.abort();
  signal.addEventListener("abort", onAbort, { once: true });
  const rxPromise = waitForNextRx(timeoutMs, rxAbort.signal);

  try {
    await bluetoothManager.writeCharacteristic(TRIPPER_SERVICE_UUID, TRIPPER_CHAR_UUID, packet);
    const rx = await rxPromise;
    if (signal.aborted) {
      return { kind: "error", txHex, response: null, error: "Stopped" };
    }
    if (!rx) {
      return { kind: "timeout", txHex, response: null, error: null };
    }
    return { kind: "reply", txHex, response: parseTripperResponse(rx), error: null };
  } catch (error) {
    rxAbort.abort();
    return {
      kind: "error",
      txHex,
      response: null,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    signal.removeEventListener("abort", onAbort);
  }
}

export function replySummary(outcome: ProbeOutcome, txOpcode: number): string {
  if (outcome.kind === "error") return outcome.error ?? "Write failed";
  if (outcome.kind === "timeout" || !outcome.response) return "No notification";
  const { label, description, opcode } = outcome.response;
  if (label === "NACK") return "NACK";
  if (description === "unhandled command") return `Unhandled ${label}`;
  if (opcode === txOpcode) return `${label} · same opcode`;
  return label;
}
