export type PacketDirection = "TX" | "RX";

export interface Packet {
  id: string;
  timestamp: Date;
  direction: PacketDirection;
  serviceUuid?: string;
  characteristicUuid?: string;
  payload: Uint8Array;
}

export interface PacketLogEntry {
  id: string;
  timestamp: string;
  direction: PacketDirection;
  serviceUuid: string;
  characteristicUuid: string;
  payloadHex: string;
}

export interface SavedPacket {
  id: string;
  name: string;
  hex: string;
  createdAt: string;
}

export type NavigationManeuver =
  | "left"
  | "right"
  | "u-turn"
  | "straight"
  | "arrival";

export interface SimulatedManeuver {
  maneuver: NavigationManeuver;
  label: string;
  hex: string;
}
