import { CMD_NAVIGATE } from "./constants";
import { crc16 } from "./crc";

export interface TripperResponse {
  opcode: number;
  label: string;
  description: string;
  raw: Uint8Array;
}

function bcdVersion(byteVal: number): number {
  return ((byteVal >> 4) * 10) + (byteVal & 0x0f);
}

export function parseTripperResponse(data: Uint8Array): TripperResponse {
  if (!data.length) {
    return { opcode: 0, label: "EMPTY", description: "empty notification", raw: data };
  }

  const opcode = data[0] & 0xff;

  if (opcode === 0x02) {
    return { opcode, label: "NACK", description: "NAK — command rejected", raw: data };
  }

  if (opcode === 0x03) {
    if (data.length >= 3) {
      const majorRaw = data[1] & 0xff;
      const minorRaw = data[2] & 0xff;
      const major = bcdVersion(majorRaw);
      const minor = bcdVersion(minorRaw);
      return {
        opcode,
        label: "OS_VERSION",
        description: `Firmware v0x${majorRaw.toString(16).padStart(2, "0")}.0x${minorRaw.toString(16).padStart(2, "0")} (${major}.${minor})`,
        raw: data,
      };
    }
    return { opcode, label: "OS_VERSION", description: "OS version short", raw: data };
  }

  if (opcode === CMD_NAVIGATE) {
    return { opcode, label: "NAV_ACK", description: "NAV ACK", raw: data };
  }

  if (opcode === 0x30) {
    if (data.length >= 8) {
      const chars: string[] = [];
      for (let i = 1; i < 8; i += 1) {
        const b = data[i] & 0xff;
        if (b === 0) break;
        if (b > 1 && b < 0x7f) chars.push(String.fromCharCode(b));
      }
      return { opcode, label: "SERIAL", description: `Serial: "${chars.join("")}"`, raw: data };
    }
    return { opcode, label: "SERIAL", description: "Serial short", raw: data };
  }

  if (opcode === 0x50) {
    return { opcode, label: "TIME_ACK", description: "Time ACK", raw: data };
  }

  if (opcode === 0x20) {
    const accepted = data.length > 1 && (data[1] & 0xff) === 0x01;
    return {
      opcode,
      label: "AUTH",
      description: accepted ? "PIN accepted" : "PIN rejected",
      raw: data,
    };
  }

  if (opcode === 0x21) {
    return { opcode, label: "SESSION", description: "Session handshake", raw: data };
  }

  return {
    opcode,
    label: `0x${opcode.toString(16).padStart(2, "0").toUpperCase()}`,
    description: "unhandled command",
    raw: data,
  };
}

export function isPinAccepted(response: TripperResponse): boolean {
  return response.label === "AUTH" && response.description === "PIN accepted";
}

export function formatTripperResponse(data: Uint8Array): string {
  const parsed = parseTripperResponse(data);
  return `${parsed.label}: ${parsed.description}`;
}

export function verifyPacketCrc(packet: Uint8Array): boolean {
  if (packet.length !== 20) return false;
  const expected = crc16(packet.slice(0, 18));
  const actual = ((packet[18] & 0xff) << 8) | (packet[19] & 0xff);
  return expected === actual;
}
