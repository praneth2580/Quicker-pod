/**
 * Types for the Fuzzer feature — a resumable, session-aware brute-force /
 * differential-probe tool for the Tripper BLE protocol.
 *
 * Mirrors the guarantees of the Python `tripper-sdk/fuzzing` framework:
 * one field/byte changes per candidate, the CRC is always recomputed (never
 * mutated), and the command header (bytes 0–1) is protected by default because
 * the same characteristic also carries firmware-OTA transfers.
 */

export type FuzzCommand = "nav" | "compass" | "time" | "raw";

export type FuzzStrategy =
  | "field" // vary one logical builder field (nav/compass/time)
  | "byte" // set one payload byte to each value
  | "bit" // toggle each bit of one payload byte
  | "encoding"; // write integer values at an offset under one encoding

export type FuzzSessionStatus =
  | "draft"
  | "running"
  | "paused"
  | "completed"
  | "stopped"
  | "error";

/**
 * What the device was observed to do when a candidate was transmitted.
 * Free-text lives in `observation`; this is a coarse, filterable tag.
 */
export type ReactionState =
  | "unknown"
  | "no_change"
  | "screen_change"
  | "left"
  | "right"
  | "straight"
  | "u_turn"
  | "roundabout"
  | "compass"
  | "icon"
  | "text"
  | "disconnect"
  | "other";

export interface FuzzSessionConfig {
  name: string;
  serviceUuid: string;
  characteristicUuid: string;
  command: FuzzCommand;
  strategy: FuzzStrategy;
  /** 20-byte base frame (hex) — used for `raw` and always stored for reproducibility. */
  basePacketHex: string;
  /** Logical field name for the `field` strategy (e.g. "maneuver"). */
  field: string | null;
  /** Payload byte offset for the `byte` / `bit` / `encoding` strategies. */
  offset: number | null;
  /** Integer encoding for the `encoding` strategy (e.g. "uint16_be"). */
  encoding: string | null;
  /** The planned value list (field values, byte values, bit indices, or ints). */
  values: number[];
  /** Permit mutating the command header (bytes 0–1). Off by default. */
  allowHeader: boolean;
  /** Inter-packet delay (ms); floored at MIN_FUZZ_DELAY_MS. */
  delayMs: number;
  /** How long to wait for a correlated response before moving on (ms). */
  responseTimeoutMs: number;
  /** Generate + record packets without transmitting them. */
  dryRun: boolean;
  /** Auto-pause the moment a candidate appears to be reacted upon. */
  pauseOnReaction: boolean;
}

export interface FuzzSession extends FuzzSessionConfig {
  id: string;
  status: FuzzSessionStatus;
  /** Index of the next value to send — the resumable session memory. */
  cursor: number;
  total: number;
  reactedCount: number;
  confirmedCount: number;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
}

export type FuzzResultStatus =
  | "sent" // transmitted, no correlated response within the window
  | "response" // transmitted and a response arrived (candidate reacted)
  | "timeout" // transmit attempted, delivery unconfirmed
  | "error" // transmit failed
  | "dry-run" // generated only, not transmitted
  | "skipped"; // value could not be represented / out of range

export interface FuzzResult {
  id: string;
  sessionId: string;
  /** Position in the plan (matches `FuzzSession.values` index). */
  sequence: number;
  /** The raw plan value (field value, byte value, bit index, or int). */
  value: number;
  valueLabel: string;
  /** Where the mutation landed, e.g. "maneuver" or "byte[5]" or "byte[5].bit3". */
  mutatedField: string;
  /** The exact 20-byte frame built for this candidate (CRC recomputed). */
  packetHex: string;
  crc: number;
  encoding: string | null;
  sentAt: string;
  transmitted: boolean;
  responseHex: string | null;
  responseLabel: string | null;
  latencyMs: number | null;
  status: FuzzResultStatus;
  /** Auto-flagged when a response correlates, or set manually by the user. */
  reacted: boolean;
  /** User confirmed the device physically reacted. */
  confirmed: boolean;
  reactionState: ReactionState;
  /** Free text: "mention what it did". */
  observation: string;
  notes: string;
}

export interface ReactionInput {
  reacted: boolean;
  confirmed: boolean;
  reactionState: ReactionState;
  observation: string;
}
