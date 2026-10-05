/**
 * Candidate generation for the Fuzzer — a TypeScript port of the core rules in
 * `tripper-sdk/fuzzing/{mutator,encoding}.py`.
 *
 * Invariants (shared with the Python framework):
 *   - Every candidate changes exactly ONE field or byte; all other payload
 *     bytes stay identical to the base.
 *   - The CRC is NEVER mutated. `finalizeFrame()` always recomputes it with the
 *     SDK's existing `appendTripperCrc` (bluetooth/tripper/crc.ts).
 *   - The command header (payload bytes 0–1) is protected unless `allowHeader`
 *     is set — the same characteristic also carries firmware-OTA blocks.
 */

import {
  DIR_N,
  MAN_FORWARD,
  PACKET_SIZE,
  PAYLOAD_CRC_LEN,
  ROAD_STREET,
  SCREEN_TBT,
} from "@/bluetooth/tripper/constants";
import { appendTripperCrc } from "@/bluetooth/tripper/crc";
import {
  buildCompassPacket,
  buildNavPacket,
  buildSetTimePacket,
} from "@/bluetooth/tripper/packets";
import { GOOGLE_MANEUVERS, navManeuverToByte } from "@/bluetooth/tripper/maneuvers";
import { bytesToHex, hexToBytes } from "@/utils";
import type {
  FuzzCommand,
  FuzzSessionConfig,
  FuzzStrategy,
  ReactionState,
} from "./types";

export const MAX_FUZZ_VALUES = 1024;
export const MIN_FUZZ_DELAY_MS = 500;
export const DEFAULT_FUZZ_DELAY_MS = 800;
export const DEFAULT_FUZZ_TIMEOUT_MS = 700;
export const HEADER_OFFSETS = [0, 1] as const;

/** A safe, inert nav frame used as the default `raw` base. */
export const DEFAULT_RAW_BASE_HEX = "10 11 3C 00 00 04 40 15 00 00 41 00 04 03 00 00 00 00 10 50";

// ---------------------------------------------------------------------------
// Integer encodings (encoding.py)
// ---------------------------------------------------------------------------

export const ENCODINGS = [
  "uint8",
  "uint16_le",
  "uint16_be",
  "uint24_le",
  "uint24_be",
  "uint32_le",
  "uint32_be",
] as const;

export type Encoding = (typeof ENCODINGS)[number];

const ENCODING_WIDTHS: Record<Encoding, number> = {
  uint8: 1,
  uint16_le: 2,
  uint16_be: 2,
  uint24_le: 3,
  uint24_be: 3,
  uint32_le: 4,
  uint32_be: 4,
};

const BOUNDARY_VALUES = [
  0, 1, 2, 10, 50, 99, 100, 127, 128, 255, 256, 257, 500, 1000, 65535,
] as const;

export function isEncoding(value: string): value is Encoding {
  return (ENCODINGS as readonly string[]).includes(value);
}

export function encodingWidth(encoding: string): number {
  if (!isEncoding(encoding)) throw new Error(`unknown encoding: ${encoding}`);
  return ENCODING_WIDTHS[encoding];
}

export function maxEncodingValue(encoding: string): number {
  return 2 ** (8 * encodingWidth(encoding)) - 1;
}

export function canRepresent(value: number, encoding: string): boolean {
  return value >= 0 && value <= maxEncodingValue(encoding);
}

export function encodeInt(value: number, encoding: string): Uint8Array {
  const width = encodingWidth(encoding);
  if (!canRepresent(value, encoding)) {
    throw new Error(`${value} does not fit in ${encoding}`);
  }
  const little = encoding.endsWith("_le") || encoding === "uint8";
  const out = new Uint8Array(width);
  for (let i = 0; i < width; i += 1) {
    const byteIndex = little ? i : width - 1 - i;
    out[byteIndex] = Math.floor(value / 2 ** (8 * i)) & 0xff;
  }
  return out;
}

export function boundaryValues(encoding: string): number[] {
  return BOUNDARY_VALUES.filter((v) => canRepresent(v, encoding));
}

// ---------------------------------------------------------------------------
// Payload / frame helpers (mutator.py)
// ---------------------------------------------------------------------------

export function payloadOf(packet: Uint8Array): Uint8Array {
  if (packet.length === PAYLOAD_CRC_LEN) return packet.slice(0, PAYLOAD_CRC_LEN);
  if (packet.length === PACKET_SIZE) return packet.slice(0, PAYLOAD_CRC_LEN);
  throw new Error(`expected ${PAYLOAD_CRC_LEN} or ${PACKET_SIZE} bytes, got ${packet.length}`);
}

/** Append a freshly computed CRC to an 18-byte payload → 20-byte frame. */
export function finalizeFrame(payload: Uint8Array): Uint8Array {
  if (payload.length !== PAYLOAD_CRC_LEN) {
    throw new Error(`payload must be ${PAYLOAD_CRC_LEN} bytes, got ${payload.length}`);
  }
  return appendTripperCrc(payload);
}

export function frameCrc(frame: Uint8Array): number {
  if (frame.length !== PACKET_SIZE) {
    throw new Error(`frame must be ${PACKET_SIZE} bytes, got ${frame.length}`);
  }
  return ((frame[18] & 0xff) << 8) | (frame[19] & 0xff);
}

function checkSpan(offset: number, width: number, allowHeader: boolean): void {
  if (!Number.isInteger(offset) || offset < 0 || offset + width > PAYLOAD_CRC_LEN) {
    throw new Error(
      `bytes ${offset}..${offset + width - 1} are outside the 18-byte payload ` +
        `(CRC bytes 18–19 can never be mutated)`,
    );
  }
  const touchesHeader = HEADER_OFFSETS.some((h) => h >= offset && h < offset + width);
  if (!allowHeader && touchesHeader) {
    throw new Error(
      "offsets 0–1 are the command header; mutating them can select unrelated commands " +
        "(including firmware OTA). Enable 'Allow header' to override deliberately.",
    );
  }
}

function withBytes(base: Uint8Array, offset: number, data: Uint8Array): Uint8Array {
  const buf = base.slice();
  buf.set(data, offset);
  return buf;
}

// ---------------------------------------------------------------------------
// Command schemas (mutator.py NAV_SCHEMA / COMPASS_SCHEMA / TIME_SCHEMA)
// ---------------------------------------------------------------------------

/** byte-5 values both maneuver tables in the SDK can emit (0xFF sentinel dropped). */
export function documentedManeuverBytes(): number[] {
  const values = new Set<number>();
  for (const m of GOOGLE_MANEUVERS) values.add(m.byte5);
  for (let i = 0; i < 64; i += 1) values.add(navManeuverToByte(i));
  values.delete(0xff);
  return [...values].sort((a, b) => a - b);
}

export const COMMAND_LABELS: Record<FuzzCommand, string> = {
  nav: "Navigation (0x10 11)",
  compass: "Compass (0x10 11 41)",
  time: "Set time (0x50)",
  raw: "Raw frame",
};

export const STRATEGY_LABELS: Record<FuzzStrategy, string> = {
  field: "Field sweep",
  byte: "Single byte",
  bit: "Bit toggle",
  encoding: "Integer encoding",
};

interface NavDefaults {
  screen: number;
  distMeters: number;
  maneuver: number;
  heading: number;
  speedFlags: number;
  roadType: number;
  etaMinutes: number;
}

const NAV_DEFAULTS: NavDefaults = {
  screen: SCREEN_TBT,
  distMeters: 200,
  maneuver: MAN_FORWARD,
  heading: 0x40,
  speedFlags: 0x40,
  roadType: ROAD_STREET,
  etaMinutes: 0,
};

interface FieldSpec {
  /** Largest value the field can carry before the builder truncates it. */
  max: number;
  /** Recommended default value plan for this field. */
  defaults: () => number[];
  description: string;
}

const NAV_FIELDS: Record<string, FieldSpec> = {
  screen: {
    max: 0xff,
    defaults: () => [0x01, 0x14, 0x15, 0x1c, 0x32, 0x3c, 0x3d, 0x41, 0x42],
    description: "Documented screen IDs.",
  },
  distance: {
    max: 0xffff,
    defaults: () => boundaryValues("uint16_be"),
    description: "Boundary values a 16-bit distance field can carry.",
  },
  maneuver: {
    max: 0xff,
    defaults: () => documentedManeuverBytes(),
    description: "Every maneuver byte the SDK's tables can emit.",
  },
  heading: {
    max: 0xff,
    defaults: () => range(0, 256),
    description: "Full 0..255 sweep.",
  },
  speedFlags: {
    max: 0xff,
    defaults: () => [0x00, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80],
    description: "Single-bit values to expose flag bits.",
  },
  roadType: {
    max: 0xff,
    defaults: () => [0x00, 0x01, 0x02, 0x31, 0x41, 0x42, 0xff],
    description: "Documented road types plus edge values.",
  },
  eta: {
    max: 0xff,
    defaults: () => boundaryValues("uint8"),
    description: "uint8 boundaries.",
  },
};

const COMPASS_FIELDS: Record<string, FieldSpec> = {
  direction: {
    max: 0xff,
    defaults: () => range(0, 256),
    description: "Full 0..255 sweep.",
  },
};

const TIME_FIELDS: Record<string, FieldSpec> = {
  hour: {
    max: 0xff,
    defaults: () => [...range(0, 24), 24, 0x7f, 0xff],
    description: "0..23 plus edges.",
  },
  minute: {
    max: 0xff,
    defaults: () => [...range(0, 60, 5), 59, 60, 0xff],
    description: "Coarse sweep.",
  },
};

function fieldSpecs(command: FuzzCommand): Record<string, FieldSpec> {
  switch (command) {
    case "nav":
      return NAV_FIELDS;
    case "compass":
      return COMPASS_FIELDS;
    case "time":
      return TIME_FIELDS;
    default:
      return {};
  }
}

export function fieldsForCommand(command: FuzzCommand): string[] {
  return Object.keys(fieldSpecs(command));
}

export function fieldMax(command: FuzzCommand, field: string): number {
  return fieldSpecs(command)[field]?.max ?? 0xff;
}

export function fieldDescription(command: FuzzCommand, field: string): string {
  return fieldSpecs(command)[field]?.description ?? "";
}

export function recommendedValues(command: FuzzCommand, field: string): number[] {
  return fieldSpecs(command)[field]?.defaults() ?? [];
}

/** Build the 18-byte payload for a `field`-strategy candidate. */
function buildFieldPayload(command: FuzzCommand, field: string, value: number): Uint8Array {
  switch (command) {
    case "nav": {
      const d: NavDefaults = { ...NAV_DEFAULTS };
      switch (field) {
        case "screen":
          d.screen = value;
          break;
        case "distance":
          d.distMeters = value;
          break;
        case "maneuver":
          d.maneuver = value;
          break;
        case "heading":
          d.heading = value;
          break;
        case "speedFlags":
          d.speedFlags = value;
          break;
        case "roadType":
          d.roadType = value;
          break;
        case "eta":
          d.etaMinutes = value;
          break;
        default:
          throw new Error(`unknown nav field '${field}'`);
      }
      return payloadOf(
        buildNavPacket({
          screen: d.screen,
          distMeters: d.distMeters,
          maneuver: d.maneuver,
          heading: d.heading,
          speedFlags: d.speedFlags,
          roadType: d.roadType,
          etaMinutes: d.etaMinutes,
        }),
      );
    }
    case "compass":
      return payloadOf(buildCompassPacket(value, false));
    case "time":
      if (field === "hour") return payloadOf(buildSetTimePacket(value, 0, true));
      if (field === "minute") return payloadOf(buildSetTimePacket(12, value, true));
      throw new Error(`unknown time field '${field}'`);
    default:
      throw new Error(`command '${command}' has no fields`);
  }
}

/** Default base payload for byte/bit/encoding strategies. */
export function defaultBasePayload(config: Pick<FuzzSessionConfig, "command" | "basePacketHex">): Uint8Array {
  switch (config.command) {
    case "nav":
      return payloadOf(buildNavPacket(NAV_DEFAULTS));
    case "compass":
      return payloadOf(buildCompassPacket(DIR_N, false));
    case "time":
      return payloadOf(buildSetTimePacket(12, 0, true));
    case "raw":
      return payloadOf(normalizeFrame(hexToBytes(config.basePacketHex)));
  }
}

function normalizeFrame(bytes: Uint8Array): Uint8Array {
  // Accept 18 or 20 bytes; pad/truncate a raw payload to 18 before CRC.
  if (bytes.length >= PACKET_SIZE) return bytes.slice(0, PACKET_SIZE);
  const payload = new Uint8Array(PAYLOAD_CRC_LEN);
  payload.set(bytes.slice(0, PAYLOAD_CRC_LEN));
  return finalizeFrame(payload);
}

// ---------------------------------------------------------------------------
// Candidate construction
// ---------------------------------------------------------------------------

export interface BuiltCandidate {
  frame: Uint8Array;
  packetHex: string;
  crc: number;
  mutatedField: string;
  valueLabel: string;
  encoding: string | null;
}

/**
 * Build the exact frame for one plan value. Pure and deterministic, so a
 * paused session resumes to byte-identical packets after a reload.
 */
export function buildCandidate(
  config: Pick<
    FuzzSessionConfig,
    "command" | "strategy" | "basePacketHex" | "field" | "offset" | "encoding" | "allowHeader"
  >,
  value: number,
): BuiltCandidate {
  let payload: Uint8Array;
  let mutatedField: string;
  let valueLabel: string;
  let encoding: string | null = null;

  switch (config.strategy) {
    case "field": {
      if (!config.field) throw new Error("field strategy requires a field");
      payload = buildFieldPayload(config.command, config.field, value);
      mutatedField = config.field;
      valueLabel = formatValue(value);
      break;
    }
    case "byte": {
      const offset = requireOffset(config.offset);
      checkSpan(offset, 1, config.allowHeader);
      if (value < 0 || value > 0xff) throw new Error(`byte value out of range: ${value}`);
      payload = withBytes(defaultBasePayload(config), offset, Uint8Array.of(value));
      mutatedField = `byte[${offset}]`;
      valueLabel = hexByte(value);
      break;
    }
    case "bit": {
      const offset = requireOffset(config.offset);
      checkSpan(offset, 1, config.allowHeader);
      if (value < 0 || value > 7) throw new Error(`bit index out of range: ${value}`);
      const base = defaultBasePayload(config);
      const original = base[offset];
      const toggled = original ^ (1 << value);
      payload = withBytes(base, offset, Uint8Array.of(toggled));
      mutatedField = `byte[${offset}].bit${value}`;
      valueLabel = `${hexByte(original)} → ${hexByte(toggled)}`;
      break;
    }
    case "encoding": {
      const offset = requireOffset(config.offset);
      if (!config.encoding) throw new Error("encoding strategy requires an encoding");
      const width = encodingWidth(config.encoding);
      checkSpan(offset, width, config.allowHeader);
      if (!canRepresent(value, config.encoding)) {
        throw new Error(`${value} does not fit in ${config.encoding}`);
      }
      payload = withBytes(defaultBasePayload(config), offset, encodeInt(value, config.encoding));
      mutatedField = `${config.encoding}@${offset}`;
      valueLabel = `${value}`;
      encoding = config.encoding;
      break;
    }
    default:
      throw new Error(`unknown strategy: ${config.strategy satisfies never}`);
  }

  const frame = finalizeFrame(payload);
  return {
    frame,
    packetHex: bytesToHex(frame),
    crc: frameCrc(frame),
    mutatedField,
    valueLabel,
    encoding,
  };
}

function requireOffset(offset: number | null): number {
  if (offset === null || offset === undefined) {
    throw new Error("this strategy requires a byte offset");
  }
  return offset;
}

// ---------------------------------------------------------------------------
// Value-list parsing & validation
// ---------------------------------------------------------------------------

/**
 * Parse a user value list: space/comma separated tokens, each decimal, `0xNN`,
 * or an inclusive range `a-b` (either radix). Deduped, order preserved, capped.
 */
export function parseValueList(input: string): number[] {
  const tokens = input.split(/[\s,]+/).filter(Boolean);
  const seen = new Set<number>();
  const out: number[] = [];
  const push = (n: number) => {
    if (Number.isFinite(n) && !seen.has(n)) {
      seen.add(n);
      out.push(n);
    }
  };
  for (const token of tokens) {
    const rangeMatch = token.match(/^(0x[0-9a-f]+|\d+)\s*-\s*(0x[0-9a-f]+|\d+)$/i);
    if (rangeMatch) {
      const start = parseToken(rangeMatch[1]);
      const end = parseToken(rangeMatch[2]);
      if (start !== null && end !== null) {
        const step = start <= end ? 1 : -1;
        for (let n = start; step > 0 ? n <= end : n >= end; n += step) {
          push(n);
          if (out.length >= MAX_FUZZ_VALUES) return out;
        }
      }
      continue;
    }
    const n = parseToken(token);
    if (n !== null) push(n);
    if (out.length >= MAX_FUZZ_VALUES) return out;
  }
  return out;
}

function parseToken(token: string): number | null {
  const n = /^0x[0-9a-f]+$/i.test(token) ? parseInt(token.slice(2), 16) : Number(token);
  return Number.isFinite(n) ? n : null;
}

/** Render a value list back into an editable string (hex for byte-sized values). */
export function formatValueList(values: number[], hex: boolean): string {
  return values.map((v) => (hex && v <= 0xff ? hexByte(v) : String(v))).join(" ");
}

export function formatValue(value: number): string {
  return value <= 0xff ? `${hexByte(value)} (${value})` : `${value}`;
}

export function hexByte(value: number): string {
  return `0x${(value & 0xff).toString(16).padStart(2, "0").toUpperCase()}`;
}

function range(start: number, end: number, step = 1): number[] {
  const out: number[] = [];
  for (let n = start; n < end; n += step) out.push(n);
  return out;
}

export interface ConfigValidation {
  ok: boolean;
  error: string | null;
}

/**
 * Validate a session config before it runs: byte offsets in range, encodings
 * that fit, header protection honored, representable values, and a sane plan
 * size. Mirrors the eager checks the Python mutator performs.
 */
export function validateConfig(config: FuzzSessionConfig): ConfigValidation {
  try {
    if (config.values.length === 0) {
      return { ok: false, error: "No values to send — the plan is empty." };
    }
    if (config.values.length > MAX_FUZZ_VALUES) {
      return { ok: false, error: `Plan exceeds the ${MAX_FUZZ_VALUES}-packet ceiling.` };
    }
    if (config.strategy === "field" && !config.field) {
      return { ok: false, error: "Choose a field to sweep." };
    }
    if (config.strategy === "field" && config.command === "raw") {
      return { ok: false, error: "Field sweep needs a nav/compass/time command, not a raw frame." };
    }
    if (
      (config.strategy === "byte" || config.strategy === "bit" || config.strategy === "encoding") &&
      config.offset === null
    ) {
      return { ok: false, error: "Set a byte offset for this strategy." };
    }
    if (config.command === "raw" && hexToBytes(config.basePacketHex).length === 0) {
      return { ok: false, error: "Provide a base frame for the raw command." };
    }
    // Building the first and last candidate surfaces span/header/encoding errors.
    buildCandidate(config, config.values[0]);
    buildCandidate(config, config.values[config.values.length - 1]);
    return { ok: true, error: null };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Invalid configuration." };
  }
}

export const REACTION_STATES: { value: ReactionState; label: string }[] = [
  { value: "unknown", label: "Unknown" },
  { value: "no_change", label: "No change" },
  { value: "screen_change", label: "Screen changed" },
  { value: "left", label: "Turn left icon" },
  { value: "right", label: "Turn right icon" },
  { value: "straight", label: "Straight icon" },
  { value: "u_turn", label: "U-turn icon" },
  { value: "roundabout", label: "Roundabout" },
  { value: "compass", label: "Compass heading" },
  { value: "icon", label: "Other icon" },
  { value: "text", label: "Text / number" },
  { value: "disconnect", label: "Disconnected / crashed" },
  { value: "other", label: "Other (see notes)" },
];
