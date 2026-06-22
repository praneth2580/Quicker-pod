import type { DetailedServiceInfo, MutationJob, MutationResult, ProtocolLogEntry } from "@/features/protocol-lab/types";

export interface StoredDevice {
  id: string;
  name: string;
  rssi?: number;
  lastConnectedAt: string;
  connectionCount: number;
  notes?: string;
  servicesJson?: string;
}

export type PacketLogType = "sent" | "received" | "notification";

export interface StoredPacketLog {
  id?: number;
  logType: PacketLogType;
  timestamp: string;
  direction: "TX" | "RX";
  serviceUuid: string;
  characteristicUuid: string;
  payloadHex: string;
  notes?: string;
  deviceId?: string;
  createdAt: string;
}

export interface StoredSavedPacket {
  id?: number;
  name: string;
  hex: string;
  deviceId?: string;
  createdAt: string;
}

export interface StoredManeuver {
  id?: number;
  label: string;
  hex: string;
  createdAt: string;
}

export interface StoredMutationPrefs {
  id: "default";
  basePacketHex: string;
  lockHex: string;
  mode: MutationJob["mode"];
  targetByteIndex: number;
  rangeStart: number;
  rangeEnd: number;
  delayMs: number;
}

export function packetLogToEntry(log: StoredPacketLog): ProtocolLogEntry {
  return {
    id: String(log.id ?? log.createdAt),
    timestamp: log.timestamp,
    direction: log.direction,
    serviceUuid: log.serviceUuid,
    characteristicUuid: log.characteristicUuid,
    payloadHex: log.payloadHex,
    notes: log.notes,
  };
}

export function entryToStoredLog(
  entry: ProtocolLogEntry,
  logType: PacketLogType,
  deviceId?: string,
): StoredPacketLog {
  return {
    logType,
    timestamp: entry.timestamp,
    direction: entry.direction,
    serviceUuid: entry.serviceUuid,
    characteristicUuid: entry.characteristicUuid,
    payloadHex: entry.payloadHex,
    notes: entry.notes,
    deviceId,
    createdAt: new Date().toISOString(),
  };
}

export interface SessionImportData {
  devices?: StoredDevice[];
  notifications?: ProtocolLogEntry[];
  sentPackets?: ProtocolLogEntry[];
  receivedPackets?: ProtocolLogEntry[];
  mutationResults?: MutationResult[];
  services?: DetailedServiceInfo[];
}
