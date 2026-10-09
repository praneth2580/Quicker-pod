import { appendTripperCrc, blankPayload } from "@/bluetooth/tripper/crc";

/** Which hole in the known opcode map this probe is checking. */
export type ProbeKind = "baseline" | "unused" | "next" | "companion" | "low" | "sub" | "ota";

export interface OpcodeProbeDef {
  id: string;
  kind: ProbeKind;
  /** Payload byte 0. */
  opcode: number;
  /** Payload byte 1. Remaining payload bytes stay 0. */
  sub: number;
  name: string;
  why: string;
}

export const PROBE_KIND_LABEL: Record<ProbeKind, string> = {
  baseline: "Known reply",
  unused: "Named, never sent",
  next: "After 0x50",
  companion: "+1 slots",
  low: "Other holes",
  sub: "Unused sub-bytes",
  ota: "OTA reply bytes",
};

export const PROBE_KIND_ORDER: ProbeKind[] = [
  "baseline",
  "unused",
  "next",
  "companion",
  "sub",
  "low",
  "ota",
];

/** Kinds included the first time the page opens. */
export const DEFAULT_PROBE_KINDS = new Set<ProbeKind>([
  "baseline",
  "unused",
  "next",
  "companion",
  "sub",
]);

export const OPCODE_PROBES: OpcodeProbeDef[] = [
  {
    id: "ping-fw",
    kind: "baseline",
    opcode: 0x03,
    sub: 0x00,
    name: "CMD_PING_FW",
    why: "Known command. A notification here means replies are reaching the app.",
  },
  {
    id: "future-0b",
    kind: "unused",
    opcode: 0x0b,
    sub: 0x00,
    name: "CMD_FUTURE_0B",
    why: "Public constant in TripperProtocol. No builder writes it.",
  },
  {
    id: "cmd-60",
    kind: "next",
    opcode: 0x60,
    sub: 0x00,
    name: "0x60",
    why: "Next 0x10 step after CMD_SET_TIME (0x50). Not declared as a command.",
  },
  {
    id: "cmd-70",
    kind: "next",
    opcode: 0x70,
    sub: 0x00,
    name: "0x70",
    why: "Slot after 0x60 on the same grid.",
  },
  {
    id: "cmd-11",
    kind: "companion",
    opcode: 0x11,
    sub: 0x00,
    name: "0x11 as command",
    why: "0x11 is only documented as the nav sub-byte, never as byte 0.",
  },
  {
    id: "cmd-31",
    kind: "companion",
    opcode: 0x31,
    sub: 0x00,
    name: "0x31",
    why: "Same +1 shape as handshake (0x21) sitting beside waypoint ping (0x30).",
  },
  {
    id: "cmd-41",
    kind: "companion",
    opcode: 0x41,
    sub: 0x00,
    name: "0x41",
    why: "+1 beside keepalive (0x40). 0x41 is a screen and a road type, not a command.",
  },
  {
    id: "cmd-51",
    kind: "companion",
    opcode: 0x51,
    sub: 0x00,
    name: "0x51",
    why: "+1 beside set-time (0x50).",
  },
  {
    id: "hs-02",
    kind: "sub",
    opcode: 0x21,
    sub: 0x02,
    name: "Handshake 0x02",
    why: "Handshake byte 1 stops at 0x01 (show PIN). This is the next value.",
  },
  {
    id: "nav-12",
    kind: "sub",
    opcode: 0x10,
    sub: 0x12,
    name: "Nav sub 0x12",
    why: "Nav packets only name sub-byte 0x11.",
  },
  {
    id: "nav-00",
    kind: "sub",
    opcode: 0x10,
    sub: 0x00,
    name: "Nav sub 0x00",
    why: "Hole before the documented nav sub-byte.",
  },
  {
    id: "ka-01",
    kind: "sub",
    opcode: 0x40,
    sub: 0x01,
    name: "Keepalive 0x01",
    why: "Local constant only. The app never sends this sub-byte.",
  },
  {
    id: "ka-06",
    kind: "sub",
    opcode: 0x40,
    sub: 0x06,
    name: "Keepalive 0x06",
    why: "First unused sub-byte after the call-icon keepalive (0x05).",
  },
  {
    id: "cmd-00",
    kind: "low",
    opcode: 0x00,
    sub: 0x00,
    name: "0x00",
    why: "Below the first real command.",
  },
  {
    id: "cmd-01",
    kind: "low",
    opcode: 0x01,
    sub: 0x00,
    name: "0x01",
    why: "Hole between 0x00 and NACK (0x02).",
  },
  {
    id: "cmd-0c",
    kind: "low",
    opcode: 0x0c,
    sub: 0x00,
    name: "0x0C",
    why: "First hole after the reserved 0x0B.",
  },
  {
    id: "cmd-0f",
    kind: "low",
    opcode: 0x0f,
    sub: 0x00,
    name: "0x0F",
    why: "Last hole before NAVIGATE (0x10).",
  },
  {
    id: "cmd-12",
    kind: "low",
    opcode: 0x12,
    sub: 0x00,
    name: "0x12",
    why: "First primary opcode after NAVIGATE.",
  },
  {
    id: "cmd-1f",
    kind: "low",
    opcode: 0x1f,
    sub: 0x00,
    name: "0x1F",
    why: "Last hole before DEVICE_ID (0x20).",
  },
  {
    id: "cmd-22",
    kind: "low",
    opcode: 0x22,
    sub: 0x00,
    name: "0x22",
    why: "First hole after HANDSHAKE (0x21).",
  },
  {
    id: "cmd-2f",
    kind: "low",
    opcode: 0x2f,
    sub: 0x00,
    name: "0x2F",
    why: "Last hole before waypoint ping (0x30).",
  },
  {
    id: "cmd-3f",
    kind: "low",
    opcode: 0x3f,
    sub: 0x00,
    name: "0x3F",
    why: "Last hole before keepalive (0x40).",
  },
  {
    id: "cmd-4f",
    kind: "low",
    opcode: 0x4f,
    sub: 0x00,
    name: "0x4F",
    why: "Last hole before set-time (0x50).",
  },
  {
    id: "cmd-5f",
    kind: "low",
    opcode: 0x5f,
    sub: 0x00,
    name: "0x5F",
    why: "Last byte before the next grid slot, 0x60.",
  },
  ...[0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a].map(
    (opcode): OpcodeProbeDef => ({
      id: `ota-${opcode.toString(16)}`,
      kind: "ota",
      opcode,
      sub: 0x00,
      name: `0x${opcode.toString(16).toUpperCase().padStart(2, "0")}`,
      why: "Pod→phone firmware-update reply in the Royal Enfield app, sent here as a command.",
    }),
  ),
];

export function probesByKind(kind: ProbeKind): OpcodeProbeDef[] {
  return OPCODE_PROBES.filter((probe) => probe.kind === kind);
}

/** 20-byte frame: opcode, optional sub-byte, zeros, CRC-16. */
export function buildProbePacket(opcode: number, sub = 0): Uint8Array {
  const payload = blankPayload();
  payload[0] = opcode & 0xff;
  payload[1] = sub & 0xff;
  return appendTripperCrc(payload);
}

export function opcodeHex(value: number): string {
  return `0x${(value & 0xff).toString(16).toUpperCase().padStart(2, "0")}`;
}
