import { create } from "zustand";
import {
  clearFuzzResults,
  deleteFuzzSession,
  listFuzzResults,
  listFuzzSessions,
  putFuzzResult,
  putFuzzSession,
  updateFuzzResult,
  updateFuzzSession,
} from "@/db/repository";
import { TRIPPER_CHAR_UUID, TRIPPER_SERVICE_UUID } from "@/bluetooth/tripper/constants";
import {
  DEFAULT_FUZZ_DELAY_MS,
  DEFAULT_FUZZ_TIMEOUT_MS,
  recommendedValues,
} from "./engine";
import type {
  FuzzResult,
  FuzzSession,
  FuzzSessionConfig,
  FuzzSessionStatus,
  ReactionInput,
} from "./types";

let counter = 0;

function makeId(prefix: string): string {
  counter += 1;
  return `${prefix}-${Date.now()}-${counter}`;
}

function defaultConfig(): FuzzSessionConfig {
  return {
    name: "",
    serviceUuid: TRIPPER_SERVICE_UUID,
    characteristicUuid: TRIPPER_CHAR_UUID,
    command: "nav",
    strategy: "field",
    basePacketHex: "",
    field: "maneuver",
    offset: null,
    encoding: null,
    values: recommendedValues("nav", "maneuver"),
    allowHeader: false,
    delayMs: DEFAULT_FUZZ_DELAY_MS,
    responseTimeoutMs: DEFAULT_FUZZ_TIMEOUT_MS,
    dryRun: true,
    pauseOnReaction: true,
  };
}

function countReactions(results: FuzzResult[]): { reactedCount: number; confirmedCount: number } {
  let reactedCount = 0;
  let confirmedCount = 0;
  for (const r of results) {
    if (r.reacted) reactedCount += 1;
    if (r.confirmed) confirmedCount += 1;
  }
  return { reactedCount, confirmedCount };
}

interface FuzzStoreState {
  hydrated: boolean;
  sessions: FuzzSession[];
  activeId: string | null;
  results: FuzzResult[];
  running: boolean;
  paused: boolean;

  hydrateFromDb: () => Promise<void>;
  newSessionConfig: () => FuzzSessionConfig;
  createSession: (config: FuzzSessionConfig) => Promise<FuzzSession>;
  selectSession: (id: string) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  updateActiveConfig: (patch: Partial<FuzzSessionConfig>) => Promise<void>;
  restartActive: (clearResults: boolean) => Promise<void>;
  clearActiveResults: () => Promise<void>;

  // Runner-facing mutations
  getActiveSession: () => FuzzSession | null;
  setRunning: (running: boolean) => void;
  setPaused: (paused: boolean) => void;
  setStatus: (status: FuzzSessionStatus, lastError?: string | null) => Promise<void>;
  advanceCursor: (cursor: number) => Promise<void>;
  appendResult: (result: FuzzResult) => Promise<void>;
  setReaction: (resultId: string, input: ReactionInput) => Promise<void>;
}

function replaceSession(sessions: FuzzSession[], next: FuzzSession): FuzzSession[] {
  return sessions.map((s) => (s.id === next.id ? next : s));
}

export const useFuzzStore = create<FuzzStoreState>()((set, get) => ({
  hydrated: false,
  sessions: [],
  activeId: null,
  results: [],
  running: false,
  paused: false,

  hydrateFromDb: async () => {
    if (get().hydrated) return;
    const sessions = await listFuzzSessions();
    // A session marked "running" can only be stale (the loop lives in memory);
    // normalize it to "paused" so the user explicitly resumes it.
    const normalized: FuzzSession[] = [];
    for (const session of sessions) {
      if (session.status === "running") {
        const fixed = { ...session, status: "paused" as const };
        await updateFuzzSession(session.id, { status: "paused" });
        normalized.push(fixed);
      } else {
        normalized.push(session);
      }
    }
    const activeId = normalized[0]?.id ?? null;
    const results = activeId ? await listFuzzResults(activeId) : [];
    set({
      hydrated: true,
      sessions: normalized,
      activeId,
      results,
      running: false,
      paused: activeId ? normalized[0].status === "paused" : false,
    });
  },

  newSessionConfig: () => defaultConfig(),

  createSession: async (config) => {
    const now = new Date().toISOString();
    const name = config.name.trim() || `Session ${get().sessions.length + 1}`;
    const session: FuzzSession = {
      ...config,
      name,
      id: makeId("fsession"),
      status: "draft",
      cursor: 0,
      total: config.values.length,
      reactedCount: 0,
      confirmedCount: 0,
      lastError: null,
      createdAt: now,
      updatedAt: now,
    };
    await putFuzzSession(session);
    set((s) => ({
      sessions: [session, ...s.sessions],
      activeId: session.id,
      results: [],
      running: false,
      paused: false,
    }));
    return session;
  },

  selectSession: async (id) => {
    if (get().running) return;
    const session = get().sessions.find((s) => s.id === id);
    if (!session) return;
    const results = await listFuzzResults(id);
    set({ activeId: id, results, running: false, paused: session.status === "paused" });
  },

  deleteSession: async (id) => {
    if (get().running && get().activeId === id) return;
    await deleteFuzzSession(id);
    set((s) => {
      const sessions = s.sessions.filter((x) => x.id !== id);
      const wasActive = s.activeId === id;
      return {
        sessions,
        activeId: wasActive ? (sessions[0]?.id ?? null) : s.activeId,
        results: wasActive ? [] : s.results,
        paused: wasActive ? false : s.paused,
      };
    });
    if (get().activeId) await get().selectSession(get().activeId!);
  },

  updateActiveConfig: async (patch) => {
    const active = get().getActiveSession();
    if (!active || get().running) return;
    const next: FuzzSession = {
      ...active,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    if (patch.values) {
      next.total = patch.values.length;
      // A config change invalidates prior progress.
      next.cursor = 0;
    }
    await putFuzzSession(next);
    set((s) => ({ sessions: replaceSession(s.sessions, next) }));
  },

  restartActive: async (clearResultsToo) => {
    const active = get().getActiveSession();
    if (!active || get().running) return;
    const next: FuzzSession = {
      ...active,
      status: "draft",
      cursor: 0,
      lastError: null,
      updatedAt: new Date().toISOString(),
      ...(clearResultsToo ? { reactedCount: 0, confirmedCount: 0 } : {}),
    };
    await putFuzzSession(next);
    if (clearResultsToo) await clearFuzzResults(active.id);
    set((s) => ({
      sessions: replaceSession(s.sessions, next),
      results: clearResultsToo ? [] : s.results,
      paused: false,
    }));
  },

  clearActiveResults: async () => {
    const active = get().getActiveSession();
    if (!active || get().running) return;
    await clearFuzzResults(active.id);
    const next: FuzzSession = {
      ...active,
      reactedCount: 0,
      confirmedCount: 0,
      updatedAt: new Date().toISOString(),
    };
    await putFuzzSession(next);
    set((s) => ({ sessions: replaceSession(s.sessions, next), results: [] }));
  },

  getActiveSession: () => {
    const { sessions, activeId } = get();
    return sessions.find((s) => s.id === activeId) ?? null;
  },

  setRunning: (running) => set({ running }),
  setPaused: (paused) => set({ paused }),

  setStatus: async (status, lastError = null) => {
    const active = get().getActiveSession();
    if (!active) return;
    const next: FuzzSession = { ...active, status, lastError, updatedAt: new Date().toISOString() };
    await updateFuzzSession(active.id, { status, lastError });
    set((s) => ({ sessions: replaceSession(s.sessions, next) }));
  },

  advanceCursor: async (cursor) => {
    const active = get().getActiveSession();
    if (!active) return;
    const next: FuzzSession = { ...active, cursor, updatedAt: new Date().toISOString() };
    await updateFuzzSession(active.id, { cursor });
    set((s) => ({ sessions: replaceSession(s.sessions, next) }));
  },

  appendResult: async (result) => {
    await putFuzzResult(result);
    const results = [...get().results, result];
    const counts = countReactions(results);
    const active = get().getActiveSession();
    set({ results });
    if (active) {
      const next: FuzzSession = { ...active, ...counts, updatedAt: new Date().toISOString() };
      await updateFuzzSession(active.id, counts);
      set((s) => ({ sessions: replaceSession(s.sessions, next) }));
    }
  },

  setReaction: async (resultId, input) => {
    const existing = get().results.find((r) => r.id === resultId);
    if (!existing) return;
    const updated: FuzzResult = { ...existing, ...input };
    await updateFuzzResult(resultId, input);
    const results = get().results.map((r) => (r.id === resultId ? updated : r));
    const counts = countReactions(results);
    set({ results });
    const active = get().getActiveSession();
    if (active) {
      const next: FuzzSession = { ...active, ...counts, updatedAt: new Date().toISOString() };
      await updateFuzzSession(active.id, counts);
      set((s) => ({ sessions: replaceSession(s.sessions, next) }));
    }
  },
}));
