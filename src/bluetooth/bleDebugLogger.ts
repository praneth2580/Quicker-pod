import { bytesToHex } from "@/utils/hex";

export type BleLogLevel = "info" | "warn" | "error" | "tx" | "rx" | "hs";

export type HandshakeStage =
  | "idle"
  | "connecting"
  | "connected"
  | "services_discovered"
  | "notifications_enabled"
  | "show_pin"
  | "set_time"
  | "ping_fw"
  | "ping_wp"
  | "ready"
  | "disconnected";

export interface BleDebugEvent {
  id: string;
  timestamp: string;
  epochMs: number;
  level: BleLogLevel;
  tag: string;
  message: string;
  data?: Record<string, unknown>;
}

const LOG_STORAGE_KEY = "tripper-debug-log";
const MAX_EVENTS = 5000;
const MAX_LOG_LINES = 10000;

let events: BleDebugEvent[] = [];
let handshakeStage: HandshakeStage = "idle";
let lastDisconnectReason: string | null = null;
let listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((fn) => fn());
}

function formatLogLine(event: BleDebugEvent): string {
  const dataStr = event.data ? ` ${JSON.stringify(event.data)}` : "";
  return `${event.timestamp} [${event.tag}] ${event.message}${dataStr}`;
}

export function formatBleEventLine(event: BleDebugEvent): string {
  return formatLogLine(event);
}

function persistLogLine(line: string): void {
  try {
    const existing = localStorage.getItem(LOG_STORAGE_KEY) ?? "";
    const lines = existing ? existing.split("\n") : [];
    lines.push(line);
    if (lines.length > MAX_LOG_LINES) {
      lines.splice(0, lines.length - MAX_LOG_LINES);
    }
    localStorage.setItem(LOG_STORAGE_KEY, lines.join("\n"));
  } catch {
    // localStorage may be full or unavailable
  }
}

function pushEvent(
  level: BleLogLevel,
  tag: string,
  message: string,
  data?: Record<string, unknown>,
): BleDebugEvent {
  const now = new Date();
  const event: BleDebugEvent = {
    id: `${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: now.toISOString(),
    epochMs: now.getTime(),
    level,
    tag,
    message,
    data,
  };

  events.push(event);
  if (events.length > MAX_EVENTS) {
    events = events.slice(-MAX_EVENTS);
  }

  const line = formatLogLine(event);
  persistLogLine(line);

  const consoleFn =
    level === "error" ? console.error : level === "warn" ? console.warn : console.log;
  if (data) {
    consoleFn(`[${tag}]`, message, data);
  } else {
    consoleFn(`[${tag}]`, message);
  }

  notify();
  return event;
}

export function hex(bytes: Uint8Array): string {
  return [...bytes].map((x) => x.toString(16).padStart(2, "0")).join(" ");
}

export const bleDebugLogger = {
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getEvents(): BleDebugEvent[] {
    return [...events];
  },

  getHandshakeStage(): HandshakeStage {
    return handshakeStage;
  },

  getLastDisconnectReason(): string | null {
    return lastDisconnectReason;
  },

  setHandshakeStage(stage: HandshakeStage): void {
    handshakeStage = stage;
    const hsMessages: Partial<Record<HandshakeStage, string>> = {
      connected: "CONNECTED",
      services_discovered: "SERVICES_DISCOVERED",
      notifications_enabled: "NOTIFICATIONS_ENABLED",
      show_pin: "SHOW_PIN",
      set_time: "SET_TIME",
      ping_fw: "PING_FW",
      ping_wp: "PING_WP",
      ready: "READY",
    };
    const msg = hsMessages[stage];
    if (msg) pushEvent("hs", "HS", msg);
    notify();
  },

  log(message: string, data?: Record<string, unknown>): void {
    pushEvent("info", "BLE", message, data);
  },

  warn(message: string, data?: Record<string, unknown>): void {
    pushEvent("warn", "BLE", message, data);
  },

  error(message: string, error?: unknown, data?: Record<string, unknown>): void {
    const merged: Record<string, unknown> = { ...data };
    if (error instanceof Error) {
      merged.error = error.message;
      merged.name = error.name;
    } else if (error !== undefined) {
      merged.error = String(error);
    }
    pushEvent("error", "BLE ERROR", message, merged);
  },

  logTx(packet: Uint8Array, label?: string): void {
    const hexStr = hex(packet);
    pushEvent("tx", "TX", label ?? hexStr, { hex: hexStr, bytes: bytesToHex(packet) });
  },

  logRx(packet: Uint8Array, label?: string): void {
    const hexStr = hex(packet);
    pushEvent("rx", "RX", label ?? hexStr, { hex: hexStr, bytes: bytesToHex(packet) });
  },

  logDisconnect(reason: string, event?: Event): void {
    lastDisconnectReason = reason;
    bleDebugLogger.setHandshakeStage("disconnected");
    pushEvent("error", "BLE", "DISCONNECTED", {
      reason,
      eventType: event?.type,
    });
  },

  logGattConnected(connected: boolean): void {
    pushEvent("info", "BLE", "connected:", { connected });
  },

  clear(): void {
    events = [];
    handshakeStage = "idle";
    lastDisconnectReason = null;
    try {
      localStorage.removeItem(LOG_STORAGE_KEY);
    } catch {
      // ignore
    }
    notify();
  },

  getPersistedLogText(): string {
    try {
      return localStorage.getItem(LOG_STORAGE_KEY) ?? "";
    } catch {
      return events.map(formatLogLine).join("\n");
    }
  },

  getLogText(): string {
    return events.map(formatLogLine).join("\n");
  },

  async copyLogToClipboard(): Promise<boolean> {
    const text = bleDebugLogger.getLogText();
    if (!text) return false;
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(textarea);
      return ok;
    }
  },

  exportSession(): { timestamp: string; events: BleDebugEvent[]; handshakeStage: HandshakeStage; lastDisconnectReason: string | null } {
    return {
      timestamp: new Date().toISOString(),
      events: [...events],
      handshakeStage,
      lastDisconnectReason,
    };
  },

  downloadLogFile(filename = "tripper-debug.log"): void {
    const text = bleDebugLogger.getPersistedLogText();
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },

  downloadSessionJson(filename = "tripper-session.json"): void {
    const json = JSON.stringify(bleDebugLogger.exportSession(), null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },
};

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withBleErrorLogging<T>(
  label: string,
  fn: () => Promise<T>,
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    bleDebugLogger.error(label, error);
    throw error;
  }
}
