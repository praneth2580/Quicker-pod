import { db } from "./database";
import type {
  PacketLogType,
  StoredDevice,
  StoredManeuver,
  StoredMutationPrefs,
  StoredPacketLog,
  StoredSavedPacket,
  SessionImportData,
} from "./types";
import type { MutationJob, MutationResult, ProtocolLogEntry } from "@/features/protocol-lab/types";

const LOG_LIMIT = 2000;

export async function upsertDevice(
  device: { id: string; name: string; rssi?: number },
  servicesJson?: string,
): Promise<StoredDevice> {
  const existing = await db.devices.get(device.id);
  const record: StoredDevice = {
    id: device.id,
    name: device.name,
    rssi: device.rssi ?? existing?.rssi,
    lastConnectedAt: new Date().toISOString(),
    connectionCount: (existing?.connectionCount ?? 0) + 1,
    notes: existing?.notes,
    servicesJson: servicesJson ?? existing?.servicesJson,
  };
  await db.devices.put(record);
  return record;
}

export async function listDevices(): Promise<StoredDevice[]> {
  return db.devices.orderBy("lastConnectedAt").reverse().toArray();
}

export async function removeDevice(id: string): Promise<void> {
  await db.devices.delete(id);
}

export async function getDevice(id: string): Promise<StoredDevice | undefined> {
  return db.devices.get(id);
}

export async function addPacketLog(
  logType: PacketLogType,
  entry: Omit<ProtocolLogEntry, "id">,
  deviceId?: string,
): Promise<ProtocolLogEntry> {
  const stored: StoredPacketLog = {
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
  const id = await db.packetLogs.add(stored);
  return { ...entry, id: String(id) };
}

export async function loadPacketLogs(): Promise<{
  sentPackets: ProtocolLogEntry[];
  receivedPackets: ProtocolLogEntry[];
  notifications: ProtocolLogEntry[];
}> {
  const logs = await db.packetLogs.orderBy("createdAt").reverse().limit(LOG_LIMIT).toArray();
  const sentPackets: ProtocolLogEntry[] = [];
  const receivedPackets: ProtocolLogEntry[] = [];
  const notifications: ProtocolLogEntry[] = [];

  for (const log of logs.reverse()) {
    const entry = {
      id: String(log.id),
      timestamp: log.timestamp,
      direction: log.direction,
      serviceUuid: log.serviceUuid,
      characteristicUuid: log.characteristicUuid,
      payloadHex: log.payloadHex,
      notes: log.notes,
    };
    if (log.logType === "sent") sentPackets.push(entry);
    else if (log.logType === "received") receivedPackets.push(entry);
    else notifications.push(entry);
  }

  return { sentPackets, receivedPackets, notifications };
}

export async function clearPacketLogs(logType?: PacketLogType): Promise<void> {
  if (logType) {
    await db.packetLogs.where("logType").equals(logType).delete();
  } else {
    await db.packetLogs.clear();
  }
}

export async function importPacketLogs(data: SessionImportData): Promise<void> {
  const rows: StoredPacketLog[] = [];
  const now = new Date().toISOString();

  for (const entry of data.notifications ?? []) {
    rows.push({
      logType: "notification",
      timestamp: entry.timestamp,
      direction: entry.direction,
      serviceUuid: entry.serviceUuid,
      characteristicUuid: entry.characteristicUuid,
      payloadHex: entry.payloadHex,
      notes: entry.notes,
      createdAt: now,
    });
  }
  for (const entry of data.sentPackets ?? []) {
    rows.push({
      logType: "sent",
      timestamp: entry.timestamp,
      direction: entry.direction,
      serviceUuid: entry.serviceUuid,
      characteristicUuid: entry.characteristicUuid,
      payloadHex: entry.payloadHex,
      notes: entry.notes,
      createdAt: now,
    });
  }
  for (const entry of data.receivedPackets ?? []) {
    rows.push({
      logType: "received",
      timestamp: entry.timestamp,
      direction: entry.direction,
      serviceUuid: entry.serviceUuid,
      characteristicUuid: entry.characteristicUuid,
      payloadHex: entry.payloadHex,
      notes: entry.notes,
      createdAt: now,
    });
  }

  if (rows.length) await db.packetLogs.bulkAdd(rows);
}

export async function listSavedPackets(): Promise<StoredSavedPacket[]> {
  return db.savedPackets.orderBy("createdAt").reverse().toArray();
}

export async function addSavedPacket(name: string, hex: string, deviceId?: string): Promise<StoredSavedPacket> {
  const record: StoredSavedPacket = {
    name,
    hex,
    deviceId,
    createdAt: new Date().toISOString(),
  };
  const id = await db.savedPackets.add(record);
  return { ...record, id };
}

export async function removeSavedPacket(id: number): Promise<void> {
  await db.savedPackets.delete(id);
}

export async function listManeuvers(): Promise<StoredManeuver[]> {
  return db.maneuvers.orderBy("createdAt").toArray();
}

export async function addManeuver(label: string, hex: string): Promise<StoredManeuver> {
  const record: StoredManeuver = { label, hex, createdAt: new Date().toISOString() };
  const id = await db.maneuvers.add(record);
  return { ...record, id };
}

export async function removeManeuver(id: number): Promise<void> {
  await db.maneuvers.delete(id);
}

export async function addMutationJob(job: MutationJob): Promise<void> {
  await db.mutationJobs.put(job);
}

export async function addMutationResult(result: MutationResult): Promise<void> {
  await db.mutationResults.put(result);
}

export async function listMutationResults(): Promise<MutationResult[]> {
  return db.mutationResults.orderBy("timestamp").toArray();
}

export async function listMutationJobs(): Promise<MutationJob[]> {
  return db.mutationJobs.orderBy("createdAt").toArray();
}

export async function clearMutationResults(): Promise<void> {
  await db.mutationResults.clear();
}

export async function getMutationPrefs(): Promise<StoredMutationPrefs | undefined> {
  return db.mutationPrefs.get("default");
}

export async function saveMutationPrefs(
  prefs: Omit<StoredMutationPrefs, "id">,
): Promise<void> {
  await db.mutationPrefs.put({ id: "default", ...prefs });
}

export async function migrateFromLocalStorage(): Promise<void> {
  const migrated = localStorage.getItem("quicker-pod-db-migrated");
  if (migrated) return;

  try {
    const logsRaw = localStorage.getItem("quicker-pod-protocol-logs");
    if (logsRaw) {
      const parsed = JSON.parse(logsRaw) as {
        state?: {
          sentPackets?: ProtocolLogEntry[];
          receivedPackets?: ProtocolLogEntry[];
          notifications?: ProtocolLogEntry[];
        };
      };
      await importPacketLogs({
        sentPackets: parsed.state?.sentPackets,
        receivedPackets: parsed.state?.receivedPackets,
        notifications: parsed.state?.notifications,
      });
    }

    const mutationRaw = localStorage.getItem("quicker-pod-mutation-store");
    if (mutationRaw) {
      const parsed = JSON.parse(mutationRaw) as {
        state?: {
          jobs?: MutationJob[];
          results?: MutationResult[];
          basePacketHex?: string;
          lockHex?: string;
          mode?: StoredMutationPrefs["mode"];
          delayMs?: number;
        };
      };
      if (parsed.state?.jobs?.length) await db.mutationJobs.bulkPut(parsed.state.jobs);
      if (parsed.state?.results?.length) await db.mutationResults.bulkPut(parsed.state.results);
      if (parsed.state?.basePacketHex !== undefined) {
        await saveMutationPrefs({
          basePacketHex: parsed.state.basePacketHex,
          lockHex: parsed.state.lockHex ?? "",
          mode: parsed.state.mode ?? "single-byte",
          targetByteIndex: 2,
          rangeStart: 0,
          rangeEnd: 3,
          delayMs: parsed.state.delayMs ?? 1000,
        });
      }
    }
  } catch {
    // ignore corrupt legacy data
  }

  localStorage.setItem("quicker-pod-db-migrated", "true");
}

export async function getDbStats() {
  const [devices, packetLogs, savedPackets, maneuvers, mutationResults] = await Promise.all([
    db.devices.count(),
    db.packetLogs.count(),
    db.savedPackets.count(),
    db.maneuvers.count(),
    db.mutationResults.count(),
  ]);
  return { devices, packetLogs, savedPackets, maneuvers, mutationResults };
}
