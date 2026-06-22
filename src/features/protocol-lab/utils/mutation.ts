import { bytesToHex, hexToBytes } from "@/utils";
import type { MutationMode } from "../types";

export function applyLock(base: Uint8Array, lockHex: string): boolean[] {
  const lockBytes = lockHex.trim() ? hexToBytes(lockHex) : new Uint8Array(0);
  return Array.from(base).map((_, i) => i < lockBytes.length);
}

export function generateMutations(
  baseHex: string,
  lockHex: string,
  mode: MutationMode,
  targetByteIndex: number,
  rangeStart: number,
  rangeEnd: number,
): string[] {
  const base = hexToBytes(baseHex);
  const locked = applyLock(base, lockHex);
  const results: string[] = [];

  const clone = () => new Uint8Array(base);
  const push = (bytes: Uint8Array) => results.push(bytesToHex(bytes));

  const mutableIndices = base
    .map((_, i) => i)
    .filter((i) => !locked[i]);

  switch (mode) {
    case "single-byte": {
      const idx = mutableIndices.includes(targetByteIndex) ? targetByteIndex : mutableIndices[0];
      if (idx === undefined) break;
      for (let v = 0; v <= 255; v++) {
        const b = clone();
        b[idx] = v;
        push(b);
      }
      break;
    }
    case "byte-range": {
      const start = Math.max(0, rangeStart);
      const end = Math.min(base.length - 1, rangeEnd);
      for (let i = start; i <= end; i++) {
        if (locked[i]) continue;
        for (let v = 0; v <= 255; v++) {
          const b = clone();
          b[i] = v;
          push(b);
        }
      }
      break;
    }
    case "increment": {
      for (const idx of mutableIndices) {
        const b = clone();
        b[idx] = (b[idx] + 1) & 0xff;
        push(b);
      }
      break;
    }
    case "decrement": {
      for (const idx of mutableIndices) {
        const b = clone();
        b[idx] = (b[idx] - 1) & 0xff;
        push(b);
      }
      break;
    }
    case "dictionary-single": {
      for (const idx of mutableIndices) {
        for (let v = 0; v <= 255; v++) {
          const b = clone();
          b[idx] = v;
          push(b);
        }
      }
      break;
    }
    case "dictionary-double": {
      const indices = mutableIndices.slice(0, 2);
      if (indices.length < 2) break;
      const [a, bIdx] = indices;
      for (let v1 = 0; v1 <= 255; v1++) {
        for (let v2 = 0; v2 <= 255; v2++) {
          const b = clone();
          b[a] = v1;
          b[bIdx] = v2;
          push(b);
        }
      }
      break;
    }
  }

  return [...new Set(results)];
}

export const MIN_PACKET_DELAY_MS = 500;
export const DEFAULT_PACKET_DELAY_MS = 1000;
export const MAX_MUTATIONS_PER_RUN = 256;
