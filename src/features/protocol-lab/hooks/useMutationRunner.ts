import { useCallback, useRef } from "react";
import { hexToBytes } from "@/utils";
import { useConnectionStore } from "@/store/connectionStore";
import {
  createMutationJob,
  createMutationResult,
  useMutationStore,
  useProtocolLabStore,
} from "../store";
import { writeCharacteristic } from "../services/bleService";
import { generateMutations, MIN_PACKET_DELAY_MS, MAX_MUTATIONS_PER_RUN } from "../utils/mutation";
import { useProtocolLabPacketLogger } from "../store/packetLoggerStore";
import { bytesToHex } from "@/utils";

export function useMutationRunner() {
  const stopRef = useRef(false);
  const {
    basePacketHex,
    lockHex,
    mode,
    targetByteIndex,
    rangeStart,
    rangeEnd,
    delayMs,
    running,
    setRunning,
    addResult,
    addJob,
  } = useMutationStore();
  const selectedWritable = useProtocolLabStore((s) => s.selectedWritable);
  const addError = useProtocolLabStore((s) => s.addError);
  const { connected } = useConnectionStore();
  const { addSent } = useProtocolLabPacketLogger();

  const stop = useCallback(() => {
    stopRef.current = true;
    setRunning(false);
  }, [setRunning]);

  const run = useCallback(async () => {
    if (!selectedWritable) {
      addError("Select a writable characteristic before running mutations");
      return;
    }
    if (running) return;

    const packets = generateMutations(
      basePacketHex,
      lockHex,
      mode,
      targetByteIndex,
      rangeStart,
      rangeEnd,
    );

    if (packets.length === 0) {
      addError("No mutations generated — check lock bytes and mode");
      return;
    }

    if (packets.length > MAX_MUTATIONS_PER_RUN) {
      addError(
        `Too many mutations (${packets.length}). Max ${MAX_MUTATIONS_PER_RUN} per run — narrow lock bytes or mode.`,
      );
      return;
    }

    const job = createMutationJob({
      basePacketHex,
      lockHex,
      mode,
      targetByteIndex,
      rangeStart,
      rangeEnd,
      delayMs: Math.max(MIN_PACKET_DELAY_MS, delayMs),
    });
    addJob(job);
    stopRef.current = false;
    setRunning(true, job.id);

    const { serviceUuid, characteristicUuid } = selectedWritable;
    const interval = Math.max(MIN_PACKET_DELAY_MS, delayMs);

    for (const packetHex of packets) {
      if (stopRef.current || !useConnectionStore.getState().connected) {
        addResult(
          createMutationResult({
            jobId: job.id,
            packetHex,
            responseHex: null,
            disconnected: !useConnectionStore.getState().connected,
            notes: "Stopped",
          }),
        );
        setRunning(false);
        return;
      }

      try {
        const bytes = hexToBytes(packetHex);
        await writeCharacteristic(serviceUuid, characteristicUuid, bytes);
        addSent(serviceUuid, characteristicUuid, bytes, "mutation");

        const mockResponse = useConnectionStore.getState().mockMode
          ? bytesToHex(new Uint8Array([0xaa, bytes[bytes.length - 1] ?? 0]))
          : null;

        addResult(
          createMutationResult({
            jobId: job.id,
            packetHex,
            responseHex: mockResponse,
            disconnected: false,
            notes: "OK",
          }),
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : "Mutation send failed";
        addError(message);
        addResult(
          createMutationResult({
            jobId: job.id,
            packetHex,
            responseHex: null,
            disconnected: false,
            notes: message,
          }),
        );
        setRunning(false);
        return;
      }

      await new Promise((r) => setTimeout(r, interval));
    }

    setRunning(false);
  }, [
    addError,
    addJob,
    addResult,
    addSent,
    basePacketHex,
    delayMs,
    lockHex,
    mode,
    rangeEnd,
    rangeStart,
    running,
    selectedWritable,
    setRunning,
    targetByteIndex,
  ]);

  return { run, stop, running, canRun: Boolean(selectedWritable) && connected };
}
