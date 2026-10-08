/**
 * Tripper navigation write path + keepalive.
 *
 * Mirrors Super Tripper: last nav packet is cached and re-sent every
 * KEEPALIVE_INTERVAL_MS while keepalive is enabled. Pairing handshake is
 * untouched — this only runs after the link is ready for app traffic.
 *
 * Android Maps notification mirroring calls {@link applyExternalNavUpdate}
 * via `src/navigation/mapsNavBridge.ts`.
 *
 * Import this module directly (not via the tripper barrel) to avoid a cycle
 * with BluetoothManager.
 */

import { bluetoothManager } from "@/bluetooth/BluetoothManager";
import {
  KEEPALIVE_INTERVAL_MS,
  MAN_FORWARD,
  MAN_LEFT,
  MAN_RIGHT_SOFT,
  ROAD_STREET,
  SCREEN_TBT,
  TRIPPER_CHAR_UUID,
  TRIPPER_SERVICE_UUID,
} from "./constants";
import {
  buildCallIconKeepalive,
  buildKeepalive,
  buildNavFromManeuver,
  buildNavManeuverPacket,
  buildNavPacket,
  PKT_NAV_IDLE,
  PKT_STOP_NAV,
} from "./packets";
import { getGoogleManeuver, type GoogleManeuverDef } from "./maneuvers";

export interface NavGuidanceOptions {
  screen?: number;
  distMeters: number;
  maneuver?: number;
  heading?: number;
  speedFlags?: number;
  roadType?: number;
  etaMinutes?: number;
}

/** Shape for future Maps / notification-listener → Tripper bridging. */
export interface ExternalNavUpdate {
  maneuverName?: string;
  maneuverByte?: number;
  nextManeuverByte?: number;
  distanceM: number;
  etaSeconds?: number;
  totalDistanceM?: number;
  screen?: number;
  nightMode?: boolean;
  /** When true, stop nav / show STOP screen. */
  stopped?: boolean;
  /** When true, show idle (no active guidance). */
  idle?: boolean;
}

export type NavSessionListener = (state: NavSessionSnapshot) => void;

export interface NavSessionSnapshot {
  keepaliveEnabled: boolean;
  callIconActive: boolean;
  locked: boolean;
  lastLabel: string;
  lastPacketHex: string;
  sending: boolean;
  lastError: string | null;
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

class TripperNavSession {
  private lastPacket: Uint8Array = PKT_NAV_IDLE;
  private lastLabel = "NAV IDLE";
  private keepaliveEnabled = false;
  private callIconActive = false;
  private locked = false;
  private sending = false;
  private lastError: string | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private listeners = new Set<NavSessionListener>();
  private disconnectBound = false;

  private ensureDisconnectHook(): void {
    if (this.disconnectBound) return;
    this.disconnectBound = true;
    bluetoothManager.on((event) => {
      if (event.type === "disconnected") {
        this.setKeepaliveEnabled(false);
        this.callIconActive = false;
        this.lastError = null;
        this.emit();
      }
    });
  }

  subscribe(listener: NavSessionListener): () => void {
    this.ensureDisconnectHook();
    this.listeners.add(listener);
    listener(this.snapshot());
    return () => this.listeners.delete(listener);
  }

  snapshot(): NavSessionSnapshot {
    return {
      keepaliveEnabled: this.keepaliveEnabled,
      callIconActive: this.callIconActive,
      locked: this.locked,
      lastLabel: this.lastLabel,
      lastPacketHex: toHex(this.lastPacket),
      sending: this.sending,
      lastError: this.lastError,
    };
  }

  private emit(): void {
    const snap = this.snapshot();
    this.listeners.forEach((l) => l(snap));
  }

  getLastPacket(): Uint8Array {
    return this.lastPacket;
  }

  setLocked(locked: boolean): void {
    this.locked = locked;
    this.emit();
  }

  setCallIconActive(active: boolean): void {
    this.callIconActive = active;
    this.emit();
  }

  setKeepaliveEnabled(enabled: boolean): void {
    this.ensureDisconnectHook();
    this.keepaliveEnabled = enabled;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (enabled) {
      this.timer = setInterval(() => {
        void this.tickKeepalive();
      }, KEEPALIVE_INTERVAL_MS);
    }
    this.emit();
  }

  private async tickKeepalive(): Promise<void> {
    if (!this.keepaliveEnabled || !bluetoothManager.isConnected()) return;
    try {
      if (this.callIconActive) {
        await this.writeRaw(buildCallIconKeepalive(), "KEEPALIVE [CALL ICON]", false);
      } else {
        await this.writeRaw(this.lastPacket, `KEEPALIVE [${this.lastLabel}]`, false);
      }
    } catch (error) {
      this.lastError = error instanceof Error ? error.message : String(error);
      this.emit();
    }
  }

  private async writeRaw(
    packet: Uint8Array,
    label: string,
    updateLastNav: boolean,
  ): Promise<void> {
    this.ensureDisconnectHook();
    if (!bluetoothManager.isConnected()) {
      throw new Error("Not connected to Tripper");
    }
    this.sending = true;
    this.lastError = null;
    this.emit();
    try {
      await bluetoothManager.writeCharacteristic(
        TRIPPER_SERVICE_UUID,
        TRIPPER_CHAR_UUID,
        packet,
      );
      if (updateLastNav) {
        this.lastPacket = packet;
        this.lastLabel = label;
        bluetoothManager.setLastNavPacket(packet);
      }
    } catch (error) {
      this.lastError = error instanceof Error ? error.message : String(error);
      throw error;
    } finally {
      this.sending = false;
      this.emit();
    }
  }

  /** Write a nav/control packet; updates last-nav cache used by keepalive. */
  async sendNavPacket(packet: Uint8Array, label: string): Promise<void> {
    if (this.locked) {
      throw new Error("Nav locked — unlock before sending guidance");
    }
    await this.writeRaw(packet, label, true);
  }

  async sendNavIdle(): Promise<void> {
    await this.sendNavPacket(PKT_NAV_IDLE, "NAV IDLE");
  }

  async sendStopNav(): Promise<void> {
    await this.sendNavPacket(PKT_STOP_NAV, "STOP NAV");
  }

  async sendGuidance(options: NavGuidanceOptions): Promise<void> {
    const packet = buildNavPacket({
      screen: options.screen ?? SCREEN_TBT,
      distMeters: options.distMeters,
      maneuver: options.maneuver ?? MAN_FORWARD,
      heading: options.heading,
      speedFlags: options.speedFlags,
      roadType: options.roadType ?? ROAD_STREET,
      etaMinutes: options.etaMinutes,
    });
    await this.sendNavPacket(packet, "NAV GUIDANCE");
  }

  async sendGoogleManeuver(
    maneuverName: string,
    distMeters: number,
    etaMinutes = 0,
  ): Promise<void> {
    const gm = getGoogleManeuver(maneuverName);
    if (!gm) {
      throw new Error(`Unknown maneuver: ${maneuverName}`);
    }
    const packet = buildNavFromManeuver(gm, distMeters, SCREEN_TBT, ROAD_STREET, etaMinutes);
    await this.sendNavPacket(packet, `NAV ${gm.displayName}`);
  }

  async sendManeuverDetail(options: {
    screen?: number;
    maneuverDetail: number;
    distanceM: number;
    etaSeconds?: number;
    totalDistanceM?: number;
    nightMode?: boolean;
  }): Promise<void> {
    const packet = buildNavManeuverPacket({
      screen: options.screen ?? SCREEN_TBT,
      maneuverDetail: options.maneuverDetail,
      distanceM: options.distanceM,
      etaSeconds: options.etaSeconds,
      totalDistanceM: options.totalDistanceM,
      nightMode: options.nightMode,
    });
    await this.sendNavPacket(packet, "NAV MANEUVER");
  }

  /** Send CMD_KEEPALIVE control frame (not the nav re-tx timer). */
  async sendNavControl(subcmd: number): Promise<void> {
    await this.writeRaw(buildKeepalive(subcmd), `NAV CONTROL 0x${subcmd.toString(16)}`, false);
  }

  /**
   * Hook for Android notification / Maps mirroring (and manual external feeds).
   * Translates a high-level update into Tripper nav writes without touching pairing.
   */
  async applyExternalNavUpdate(update: ExternalNavUpdate): Promise<void> {
    if (update.idle) {
      await this.sendNavIdle();
      return;
    }
    if (update.stopped) {
      await this.sendStopNav();
      return;
    }
    if (update.maneuverName) {
      await this.sendGoogleManeuver(
        update.maneuverName,
        update.distanceM,
        update.etaSeconds != null ? Math.floor(update.etaSeconds / 60) : 0,
      );
      return;
    }
    if (update.nextManeuverByte != null || update.maneuverByte != null) {
      await this.sendManeuverDetail({
        screen: update.screen,
        maneuverDetail: update.nextManeuverByte ?? update.maneuverByte ?? 0xff,
        distanceM: update.distanceM,
        etaSeconds: update.etaSeconds,
        totalDistanceM: update.totalDistanceM,
        nightMode: update.nightMode,
      });
      return;
    }
    await this.sendGuidance({
      screen: update.screen,
      distMeters: update.distanceM,
      maneuver: update.maneuverByte ?? MAN_FORWARD,
      etaMinutes: update.etaSeconds != null ? Math.floor(update.etaSeconds / 60) : 0,
    });
  }

  /** Convenience presets for manual testing. */
  async sendPresetTurn(side: "left" | "right" | "straight", distMeters: number): Promise<void> {
    const maneuver =
      side === "left" ? MAN_LEFT : side === "right" ? MAN_RIGHT_SOFT : MAN_FORWARD;
    await this.sendGuidance({ distMeters, maneuver });
  }
}

export const tripperNavSession = new TripperNavSession();

/** Re-export maneuver list helper for UI. */
export type { GoogleManeuverDef };
