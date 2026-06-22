import Dexie, { type Table } from "dexie";
import type {
  StoredDevice,
  StoredManeuver,
  StoredMutationPrefs,
  StoredPacketLog,
  StoredSavedPacket,
} from "./types";
import type { MutationJob, MutationResult } from "@/features/protocol-lab/types";

export class QuickerPodDatabase extends Dexie {
  devices!: Table<StoredDevice, string>;
  packetLogs!: Table<StoredPacketLog, number>;
  savedPackets!: Table<StoredSavedPacket, number>;
  maneuvers!: Table<StoredManeuver, number>;
  mutationJobs!: Table<MutationJob, string>;
  mutationResults!: Table<MutationResult, string>;
  mutationPrefs!: Table<StoredMutationPrefs, string>;

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
  }
}

export const db = new QuickerPodDatabase();
