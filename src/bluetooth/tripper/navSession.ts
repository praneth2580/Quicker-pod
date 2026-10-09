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
  SCREEN_STOP,
  SCREEN_TBT,
  TRIPPER_CHAR_UUID,
  TRIPPER_SERVICE_UUID,
} from "./constants";
import {
  buildCallIconKeepalive,
  buildCompassPacket,
  buildKeepalive,
  buildNavFromManeuver,
  buildNavManeuverPacket,
  buildNavPacket,
  PKT_NAV_IDLE,
  PKT_STOP_NAV,
} from "./packets";
import {
  detailByteForManeuverName,
  getGoogleManeuver,
  type GoogleManeuverDef,
} from "./maneuvers";

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
  /** Maps is recalculating. Byte 2 becomes the stop screen; the last icon is kept. */
  rerouting?: boolean;
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
  private nightMode = false;
  /** Last detailed icon. Distance-only updates reuse it instead of drawing straight. */
  private lastDetailByte: number | null = null;
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
    const changed = this.callIconActive !== active;
    this.callIconActive = active;
    this.emit();
    if (!changed || !bluetoothManager.isConnected()) return;
    const write = active
      ? this.writeRaw(buildCallIconKeepalive(), "CALL ICON", false)
      : this.writeRaw(this.lastPacket, this.lastLabel, false);
    void write.catch(() => undefined);
  }

  setNightMode(enabled: boolean): void {
    this.nightMode = enabled;
  }

  /** Compass rose. Updates the keepalive cache so the heading stays on screen. */
  async sendCompass(direction: number): Promise<void> {
    const packet = buildCompassPacket(direction, this.nightMode);
    await this.sendNavPacket(packet, "COMPASS");
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
    nextManeuver?: number;
    distanceM: number;
    etaSeconds?: number;
    totalDistanceM?: number;
    nightMode?: boolean;
    label?: string;
  }): Promise<void> {
    const nightMode = options.nightMode ?? this.nightMode;
    const packet = buildNavManeuverPacket({
      screen: options.screen,
      maneuverDetail: options.maneuverDetail,
      nextManeuver: options.nextManeuver,
      distanceM: options.distanceM,
      etaSeconds: options.etaSeconds,
      totalDistanceM: options.totalDistanceM,
      nightMode,
    });
    await this.sendNavPacket(packet, options.label ?? "NAV MANEUVER");
  }

  /** Live guidance: detailed icon, encoded distance, hours/minutes ETA. */
  async sendDetailedManeuver(options: {
    maneuverName: string;
    distanceM: number;
    etaSeconds?: number;
    nightMode?: boolean;
  }): Promise<void> {
    const detail = detailByteForManeuverName(options.maneuverName);
    if (detail == null) {
      throw new Error(`Unknown maneuver: ${options.maneuverName}`);
    }
    this.lastDetailByte = detail;
    const gm = getGoogleManeuver(options.maneuverName);
    await this.sendManeuverDetail({
      maneuverDetail: detail,
      distanceM: options.distanceM,
      etaSeconds: options.etaSeconds,
      nightMode: options.nightMode,
      label: `NAV ${gm?.displayName ?? options.maneuverName}`,
    });
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
    if (update.nightMode != null) this.nightMode = update.nightMode;

    if (update.idle) {
      this.lastDetailByte = null;
      await this.sendNavIdle();
      return;
    }
    if (update.stopped) {
      this.lastDetailByte = null;
      await this.sendStopNav();
      return;
    }
    if (update.rerouting) {
      await this.sendManeuverDetail({
        screen: SCREEN_STOP,
        maneuverDetail: this.lastDetailByte ?? 0xff,
        distanceM: update.distanceM,
        etaSeconds: update.etaSeconds,
        label: "NAV REROUTE",
      });
      return;
    }

    const named = update.maneuverName
      ? detailByteForManeuverName(update.maneuverName)
      : null;
    const explicit =
      update.maneuverByte != null && update.maneuverByte !== 0x00
        ? update.maneuverByte
        : null;
    const detail = named ?? explicit ?? this.lastDetailByte;

    // No icon yet, and Maps did not name one: leave the pod on the last frame.
    if (detail == null) return;

    if (named != null || explicit != null) this.lastDetailByte = detail;
    const gm = update.maneuverName ? getGoogleManeuver(update.maneuverName) : undefined;
    await this.sendManeuverDetail({
      maneuverDetail: detail,
      nextManeuver: update.nextManeuverByte,
      distanceM: update.distanceM,
      etaSeconds: update.etaSeconds,
      totalDistanceM: update.totalDistanceM,
      label: gm ? `NAV ${gm.displayName}` : "NAV MANEUVER",
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
