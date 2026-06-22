import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  CharacteristicRef,
  DetailedServiceInfo,
  MutationJob,
  MutationMode,
  MutationResult,
  ProtocolLabTab,
} from "../types";

interface ProtocolLabState {
  activeTab: ProtocolLabTab;
  detailedServices: DetailedServiceInfo[];
  expandedServices: Record<string, boolean>;
  expandedCharacteristics: Record<string, boolean>;
  selectedWritable: CharacteristicRef | null;
  subscribedKeys: string[];
  notificationsPaused: boolean;
  errors: string[];
  lastSentHex: string | null;
  lastResponseHex: string | null;
  lastSendError: string | null;

  setActiveTab: (tab: ProtocolLabTab) => void;
  setDetailedServices: (services: DetailedServiceInfo[]) => void;
  toggleService: (uuid: string) => void;
  toggleCharacteristic: (key: string) => void;
  setSelectedWritable: (ref: CharacteristicRef | null) => void;
  addSubscribed: (key: string) => void;
  setNotificationsPaused: (paused: boolean) => void;
  addError: (message: string) => void;
  clearErrors: () => void;
  setLastSend: (sent: string | null, response: string | null, error: string | null) => void;
}

export const useProtocolLabStore = create<ProtocolLabState>()((set) => ({
  activeTab: "explorer",
  detailedServices: [],
  expandedServices: {},
  expandedCharacteristics: {},
  selectedWritable: null,
  subscribedKeys: [],
  notificationsPaused: false,
  errors: [],
  lastSentHex: null,
  lastResponseHex: null,
  lastSendError: null,

  setActiveTab: (tab) => set({ activeTab: tab }),
  setDetailedServices: (services) => set({ detailedServices: services }),
  toggleService: (uuid) =>
    set((s) => ({
      expandedServices: { ...s.expandedServices, [uuid]: !s.expandedServices[uuid] },
    })),
  toggleCharacteristic: (key) =>
    set((s) => ({
      expandedCharacteristics: {
        ...s.expandedCharacteristics,
        [key]: !s.expandedCharacteristics[key],
      },
    })),
  setSelectedWritable: (ref) => set({ selectedWritable: ref }),
  addSubscribed: (key) =>
    set((s) => ({
      subscribedKeys: s.subscribedKeys.includes(key) ? s.subscribedKeys : [...s.subscribedKeys, key],
    })),
  setNotificationsPaused: (paused) => set({ notificationsPaused: paused }),
  addError: (message) =>
    set((s) => ({ errors: [...s.errors.slice(-49), `[${new Date().toLocaleTimeString()}] ${message}`] })),
  clearErrors: () => set({ errors: [] }),
  setLastSend: (sent, response, error) =>
    set({ lastSentHex: sent, lastResponseHex: response, lastSendError: error }),
}));

interface MutationState {
  jobs: MutationJob[];
  results: MutationResult[];
  running: boolean;
  currentJobId: string | null;
  basePacketHex: string;
  lockHex: string;
  mode: MutationMode;
  targetByteIndex: number;
  rangeStart: number;
  rangeEnd: number;
  delayMs: number;

  setBasePacketHex: (hex: string) => void;
  setLockHex: (hex: string) => void;
  setMode: (mode: MutationMode) => void;
  setTargetByteIndex: (index: number) => void;
  setRange: (start: number, end: number) => void;
  setDelayMs: (ms: number) => void;
  addResult: (result: MutationResult) => void;
  clearResults: () => void;
  setRunning: (running: boolean, jobId?: string | null) => void;
  addJob: (job: MutationJob) => void;
}

let mutationCounter = 0;

export const useMutationStore = create<MutationState>()(
  persist(
    (set) => ({
      jobs: [],
      results: [],
      running: false,
      currentJobId: null,
      basePacketHex: "20 01 00 64",
      lockHex: "20 01",
      mode: "single-byte",
      targetByteIndex: 2,
      rangeStart: 0,
      rangeEnd: 3,
      delayMs: 1000,

      setBasePacketHex: (hex) => set({ basePacketHex: hex }),
      setLockHex: (hex) => set({ lockHex: hex }),
      setMode: (mode) => set({ mode }),
      setTargetByteIndex: (index) => set({ targetByteIndex: index }),
      setRange: (start, end) => set({ rangeStart: start, rangeEnd: end }),
      setDelayMs: (ms) => set({ delayMs: Math.max(500, ms) }),
      addResult: (result) => set((s) => ({ results: [...s.results, result] })),
      clearResults: () => set({ results: [] }),
      setRunning: (running, jobId = null) => set({ running, currentJobId: jobId }),
      addJob: (job) => set((s) => ({ jobs: [...s.jobs, job] })),
    }),
    {
      name: "quicker-pod-mutation-store",
      partialize: (s) => ({
        jobs: s.jobs,
        results: s.results,
        basePacketHex: s.basePacketHex,
        lockHex: s.lockHex,
        mode: s.mode,
        delayMs: s.delayMs,
      }),
    },
  ),
);

export function createMutationJob(
  partial: Pick<MutationJob, "basePacketHex" | "lockHex" | "mode" | "targetByteIndex" | "rangeStart" | "rangeEnd" | "delayMs">,
): MutationJob {
  mutationCounter += 1;
  return {
    id: `job-${Date.now()}-${mutationCounter}`,
    ...partial,
    status: "idle",
    createdAt: new Date().toISOString(),
  };
}

export function createMutationResult(
  partial: Omit<MutationResult, "id" | "timestamp">,
): MutationResult {
  mutationCounter += 1;
  return {
    id: `mres-${Date.now()}-${mutationCounter}`,
    timestamp: new Date().toLocaleTimeString("en-GB", { hour12: false }),
    ...partial,
  };
}
