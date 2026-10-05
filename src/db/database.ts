import Dexie, { type Table } from "dexie";
import type {
  StoredDevice,
  StoredManeuver,
  StoredMutationPrefs,
  StoredPacketLog,
  StoredSavedPacket,
} from "./types";
import type { MutationJob, MutationResult } from "@/features/protocol-lab/types";
import type { FuzzResult, FuzzSession } from "@/features/fuzzer/types";

export class QuickerPodDatabase extends Dexie {
  devices!: Table<StoredDevice, string>;
  packetLogs!: Table<StoredPacketLog, number>;
  savedPackets!: Table<StoredSavedPacket, number>;
  maneuvers!: Table<StoredManeuver, number>;
  mutationJobs!: Table<MutationJob, string>;
  mutationResults!: Table<MutationResult, string>;
  mutationPrefs!: Table<StoredMutationPrefs, string>;
  fuzzSessions!: Table<FuzzSession, string>;
  fuzzResults!: Table<FuzzResult, string>;

  constructor() {
    super("QuickerPodDB");

    this.version(1).stores({
      devices: "id, name, lastConnectedAt",
      packetLogs: "++id, logType, deviceId, createdAt",
      savedPackets: "++id, deviceId, createdAt",
      maneuvers: "++id, createdAt",
      mutationJobs: "id, createdAt",
      mutationResults: "id, jobId, timestamp",
      mutationPrefs: "id",
    });

    // v2 adds the resumable fuzzer session store. Existing v1 tables are
    // redeclared unchanged so nothing is dropped during the upgrade.
    this.version(2).stores({
      devices: "id, name, lastConnectedAt",
      packetLogs: "++id, logType, deviceId, createdAt",
      savedPackets: "++id, deviceId, createdAt",
      maneuvers: "++id, createdAt",
      mutationJobs: "id, createdAt",
      mutationResults: "id, jobId, timestamp",
      mutationPrefs: "id",
      fuzzSessions: "id, status, createdAt, updatedAt",
      fuzzResults: "id, sessionId, sequence, reacted, confirmed",
    });
  }
}

export const db = new QuickerPodDatabase();
