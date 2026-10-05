import { useCallback, useEffect, useRef, useState } from "react";
import { bluetoothManager } from "@/bluetooth/BluetoothManager";
import { parseTripperResponse } from "@/bluetooth/tripper/parser";
import { bytesToHex } from "@/utils";
import { formatTime } from "@/utils/format";
import { useConnectionStore } from "@/store/connectionStore";
import { buildCandidate, MIN_FUZZ_DELAY_MS, validateConfig } from "../engine";
import { useFuzzStore } from "../store";
import type { FuzzResult, FuzzResultStatus } from "../types";

type LoopControl = "idle" | "running" | "paused" | "stopped";

interface PendingResponse {
  id: number;
  charUuid: string;
  resolve: (bytes: Uint8Array) => void;
  cancel: () => void;
}

function normUuid(uuid: string): string {
  return uuid.toLowerCase().replace(/-/g, "");
}

function charMatches(received: string, target: string): boolean {
  const a = normUuid(received);
  const b = normUuid(target);
  return a === b || (b.length >= 8 && a.endsWith(b.slice(-8)));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let resultCounter = 0;
function makeResultId(sequence: number): string {
  resultCounter += 1;
  return `fres-${Date.now()}-${sequence}-${resultCounter}`;
}

export function useFuzzRunner() {
  const running = useFuzzStore((s) => s.running);
  const paused = useFuzzStore((s) => s.paused);
  const activeId = useFuzzStore((s) => s.activeId);
  const sessions = useFuzzStore((s) => s.sessions);
  const connected = useConnectionStore((s) => s.connected);

  const active = sessions.find((s) => s.id === activeId) ?? null;

  const controlRef = useRef<LoopControl>("idle");
  const pendingRef = useRef<PendingResponse | null>(null);
  const pendingSeqRef = useRef(0);
  const stopReasonRef = useRef<string | null>(null);
  const [pendingReactionId, setPendingReactionId] = useState<string | null>(null);

  // Correlate inbound notifications with the in-flight packet, and treat a
  // disconnect mid-run as an automatic pause (not an error).
  useEffect(() => {
    const unsub = bluetoothManager.on((event) => {
      if (event.type === "disconnected" && controlRef.current === "running") {
        stopReasonRef.current = "Disconnected mid-run — reconnect and resume.";
        controlRef.current = "paused";
        pendingRef.current?.cancel();
        return;
      }
      if (event.type !== "notification" && event.type !== "packet-received") return;
      const payload = event.payload as
        | { serviceUuid: string; characteristicUuid: string; payload: Uint8Array }
        | undefined;
      if (!payload?.payload) return;
      const pending = pendingRef.current;
      if (pending && charMatches(payload.characteristicUuid, pending.charUuid)) {
        pending.resolve(payload.payload);
      }
    });
    return unsub;
  }, []);

  const waitForResponse = useCallback((charUuid: string, timeoutMs: number): Promise<Uint8Array | null> => {
    return new Promise((resolve) => {
      pendingSeqRef.current += 1;
      const myId = pendingSeqRef.current;
      const finish = (value: Uint8Array | null) => {
        if (pendingRef.current?.id !== myId) return;
        pendingRef.current = null;
        clearTimeout(timer);
        resolve(value);
      };
      const timer = setTimeout(() => finish(null), timeoutMs);
      pendingRef.current = {
        id: myId,
        charUuid,
        resolve: (bytes) => finish(bytes),
        cancel: () => finish(null),
      };
    });
  }, []);

  const runLoop = useCallback(async () => {
    const store = useFuzzStore.getState();

    while (controlRef.current === "running") {
      const session = useFuzzStore.getState().getActiveSession();
      if (!session) break;

      const i = session.cursor;
      if (i >= session.total) {
        await store.setStatus("completed");
        break;
      }

      if (!session.dryRun && !bluetoothManager.isConnected()) {
        stopReasonRef.current = "Disconnected — reconnect and resume.";
        controlRef.current = "paused";
        break;
      }

      const value = session.values[i];
      const sentAt = formatTime(new Date());
      const resultId = makeResultId(i);

      let result: FuzzResult;
      try {
        const built = buildCandidate(session, value);
        const common = {
          id: resultId,
          sessionId: session.id,
          sequence: i,
          value,
          valueLabel: built.valueLabel,
          mutatedField: built.mutatedField,
          packetHex: built.packetHex,
          crc: built.crc,
          encoding: built.encoding,
          sentAt,
          confirmed: false,
          reactionState: "unknown" as const,
          observation: "",
          notes: "",
        };

        if (session.dryRun) {
          result = {
            ...common,
            transmitted: false,
            responseHex: null,
            responseLabel: null,
            latencyMs: null,
            status: "dry-run",
            reacted: false,
          };
        } else {
          const t0 = performance.now();
          const respPromise = waitForResponse(session.characteristicUuid, session.responseTimeoutMs);
          try {
            await bluetoothManager.writeCharacteristic(
              session.serviceUuid,
              session.characteristicUuid,
              built.frame,
            );
          } catch (writeErr) {
            pendingRef.current?.cancel();
            throw writeErr;
          }
          const response = await respPromise;
          if (response) {
            const parsed = parseTripperResponse(response);
            result = {
              ...common,
              transmitted: true,
              responseHex: bytesToHex(response),
              responseLabel: `${parsed.label} — ${parsed.description}`,
              latencyMs: Math.round(performance.now() - t0),
              status: "response",
              reacted: true,
            };
          } else {
            result = {
              ...common,
              transmitted: true,
              responseHex: null,
              responseLabel: null,
              latencyMs: null,
              status: "sent",
              reacted: false,
            };
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Transmit failed";
        const status: FuzzResultStatus = /out of range|outside|does not fit|header/i.test(message)
          ? "skipped"
          : "error";
        result = {
          id: resultId,
          sessionId: session.id,
          sequence: i,
          value,
          valueLabel: String(value),
          mutatedField: "—",
          packetHex: "",
          crc: 0,
          encoding: null,
          sentAt,
          transmitted: false,
          responseHex: null,
          responseLabel: null,
          latencyMs: null,
          status,
          reacted: false,
          confirmed: false,
          reactionState: "unknown",
          observation: "",
          notes: message,
        };
        await store.appendResult(result);
        await store.advanceCursor(i + 1);
        if (status === "error") {
          stopReasonRef.current = message;
          controlRef.current = "stopped";
          await store.setStatus("error", message);
          break;
        }
        continue;
      }

      await store.appendResult(result);
      await store.advanceCursor(i + 1);

      if (result.reacted && session.pauseOnReaction) {
        controlRef.current = "paused";
        setPendingReactionId(result.id);
        break;
      }

      await sleep(session.dryRun ? 0 : Math.max(MIN_FUZZ_DELAY_MS, session.delayMs));
    }

    // Settle final status/flags based on how the loop ended.
    const store2 = useFuzzStore.getState();
    const session = store2.getActiveSession();
    if (controlRef.current === "paused") {
      await store2.setStatus("paused", stopReasonRef.current);
      store2.setPaused(true);
    } else if (controlRef.current === "stopped" && session && session.status !== "error") {
      await store2.setStatus("stopped");
      store2.setPaused(false);
    }
    stopReasonRef.current = null;
    controlRef.current = "idle";
    store2.setRunning(false);
  }, [waitForResponse]);

  const start = useCallback(async () => {
    const store = useFuzzStore.getState();
    const session = store.getActiveSession();
    if (!session || store.running) return;

    const validation = validateConfig(session);
    if (!validation.ok) {
      await store.setStatus("error", validation.error);
      return;
    }
    if (!session.dryRun && !bluetoothManager.isConnected()) {
      await store.setStatus("error", "Connect a device, or enable Dry run to preview packets.");
      return;
    }
    if (session.cursor >= session.total) {
      await store.setStatus("completed");
      return;
    }

    if (!session.dryRun) {
      try {
        await bluetoothManager.subscribeToNotifications(session.serviceUuid, session.characteristicUuid);
      } catch {
        // Tripper often has no client-side notify; responses may be invisible.
      }
    }

    stopReasonRef.current = null;
    controlRef.current = "running";
    store.setRunning(true);
    store.setPaused(false);
    await store.setStatus("running", null);
    void runLoop();
  }, [runLoop]);

  const pause = useCallback(() => {
    if (controlRef.current === "running") {
      controlRef.current = "paused";
      pendingRef.current?.cancel();
    }
  }, []);

  const stop = useCallback(() => {
    if (controlRef.current === "running" || controlRef.current === "paused") {
      controlRef.current = "stopped";
      pendingRef.current?.cancel();
    }
  }, []);

  const clearPendingReaction = useCallback(() => setPendingReactionId(null), []);

  const remaining = active ? Math.max(0, active.total - active.cursor) : 0;
  const atEnd = Boolean(active && active.cursor >= active.total && active.total > 0);
  const canStart = Boolean(active) && !running && remaining > 0 && (active?.dryRun || connected);

  return {
    start,
    pause,
    stop,
    running,
    paused,
    canStart,
    atEnd,
    remaining,
    pendingReactionId,
    clearPendingReaction,
  };
}
