import type { CharacteristicProperties } from "@/types";

export type ProtocolLabTab =
  | "explorer"
  | "notifications"
  | "sender"
  | "mutation"
  | "simulator"
  | "export";

export interface GattDescriptorInfo {
  uuid: string;
}

export interface DetailedCharacteristicInfo {
  uuid: string;
  name?: string;
  properties: CharacteristicProperties;
  descriptors: GattDescriptorInfo[];
  lastReadValue?: string;
}

export interface DetailedServiceInfo {
  uuid: string;
  name?: string;
  characteristics: DetailedCharacteristicInfo[];
}

export interface CharacteristicRef {
  serviceUuid: string;
  characteristicUuid: string;
  name?: string;
}

export interface ProtocolLogEntry {
  id: string;
  timestamp: string;
  direction: "TX" | "RX";
  serviceUuid: string;
  characteristicUuid: string;
  payloadHex: string;
  notes?: string;
}

export type MutationMode =
  | "single-byte"
  | "byte-range"
  | "increment"
  | "decrement"
  | "dictionary-single"
  | "dictionary-double";

export interface MutationJob {
  id: string;
  basePacketHex: string;
  lockHex: string;
  mode: MutationMode;
  targetByteIndex: number;
  rangeStart: number;
  rangeEnd: number;
  delayMs: number;
  status: "idle" | "running" | "stopped" | "completed" | "error";
  createdAt: string;
}

export interface MutationResult {
  id: string;
  jobId: string;
  packetHex: string;
  responseHex: string | null;
  disconnected: boolean;
  notes: string;
  timestamp: string;
}

export interface SessionExportData {
  exportedAt: string;
  device: { id: string; name: string } | null;
  connected: boolean;
  services: DetailedServiceInfo[];
  notifications: ProtocolLogEntry[];
  sentPackets: ProtocolLogEntry[];
  receivedPackets: ProtocolLogEntry[];
  mutationResults: MutationResult[];
}

// Future extension points
export interface PacketReplayJob {
  id: string;
  packets: string[];
}

export interface ProtocolDecoder {
  id: string;
  name: string;
  decode: (payload: Uint8Array) => string;
}

export interface DeviceFingerprint {
  deviceId: string;
  serviceUuids: string[];
  capturedAt: string;
}
