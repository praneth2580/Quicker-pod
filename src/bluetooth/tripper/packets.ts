import {
  CMD_DEVICE_ID,
  CMD_HANDSHAKE,
  CMD_KEEPALIVE,
  CMD_NAVIGATE,
  COMPASS_SCREEN,
  HS_CLOSE,
  HS_SHOW_PIN,
  NAV_SUBCMD,
  ROAD_STREET,
  SCREEN_LOCKED,
  SCREEN_STOP,
} from "./constants";
import { appendTripperCrc, blankPayload } from "./crc";
import type { GoogleManeuverDef } from "./maneuvers";

export const PKT_PIN_SHOW = hexToPacket("21010000000000000000000000000000000050A7");
export const PKT_CLOSE = hexToPacket("2100000000000000000000000000000000004045");
export const PKT_PING_FW = hexToPacket("03000000000000000000000000000000000045D9");
export const PKT_PING_WP = hexToPacket("300000000000000000000000000000000000428B");
export const PKT_STOP_NAV = hexToPacket("10111C00000100FF00000000000000000000F782");
export const PKT_NAV_IDLE = hexToPacket("10113C0000044015000041000403000000001050");

function hexToPacket(hex: string): Uint8Array {
  const cleaned = hex.replace(/[^0-9a-fA-F]/g, "");
  const bytes = new Uint8Array(cleaned.length / 2);
  for (let i = 0; i < cleaned.length; i += 2) {
    bytes[i / 2] = parseInt(cleaned.slice(i, i + 2), 16);
  }
  return bytes;
}

export function bearingToDirection(bearingDeg: number): number {
  const sector = Math.floor(((bearingDeg + 22.5) % 360) / 45);
  const table = [0x10, 0x60, 0x30, 0x70, 0x40, 0x80, 0x20, 0x50];
  return table[sector % 8] ?? 0x10;
}

export function calcIntensity(distanceM: number, nightMode = false): number {
  let value: number;
  if (distanceM <= 10) value = 0x50;
  else if (distanceM <= 20) value = 0x40;
  else if (distanceM <= 45) value = 0x30;
  else if (distanceM <= 70) value = 0x20;
  else if (distanceM <= 95) value = 0x10;
  else value = 0x00;
  if (nightMode) value += 1;
  return value & 0xff;
}

export function encodeDistance(distanceM: number): [high: number, low: number, unit: number] {
  if (distanceM < 1000) {
    const value = Math.max(0, Math.min(distanceM, 0xffff));
    return [(value >> 8) & 0xff, value & 0xff, 1];
  }
  const value = Math.max(0, Math.min(Math.floor(distanceM / 100), 0xffff));
  return [(value >> 8) & 0xff, value & 0xff, 2];
}

export function buildHandshakePacket(showPin: boolean): Uint8Array {
  const payload = blankPayload();
  payload[0] = CMD_HANDSHAKE;
  payload[1] = showPin ? HS_SHOW_PIN : HS_CLOSE;
  return appendTripperCrc(payload);
}

export function buildPinPacket(code: string): Uint8Array {
  const digits = code.replace(/\D/g, "").slice(0, 6);
  if (digits.length !== 6) {
    throw new Error("PIN must be exactly 6 digits");
  }
  const payload = blankPayload();
  payload[0] = CMD_DEVICE_ID;
  for (let i = 0; i < 6; i += 1) {
    payload[1 + i] = digits.charCodeAt(i);
  }
  return appendTripperCrc(payload);
}

export function buildSetTimePacket(hour24: number, minute: number, is24h = true): Uint8Array {
  const payload = blankPayload();
  payload[0] = 0x50;
  payload[1] = hour24 & 0xff;
  payload[2] = minute & 0xff;
  payload[3] = is24h ? 0 : 1;
  return appendTripperCrc(payload);
}

export function buildSetTimeNowPacket(is24h = true): Uint8Array {
  const now = new Date();
  return buildSetTimePacket(now.getHours(), now.getMinutes(), is24h);
}

export function buildCompassPacket(direction: number, nightMode = false): Uint8Array {
  const payload = blankPayload();
  payload[0] = CMD_NAVIGATE;
  payload[1] = NAV_SUBCMD;
  payload[2] = COMPASS_SCREEN;
  payload[6] = nightMode ? 1 : 0;
  for (const idx of [7, 11, 12, 13]) payload[idx] = 0xff;
  payload[14] = direction & 0xff;
  return appendTripperCrc(payload);
}

export function buildNavPacket(options: {
  screen: number;
  distMeters: number;
  maneuver: number;
  heading?: number;
  speedFlags?: number;
  roadType?: number;
  etaMinutes?: number;
}): Uint8Array {
  const payload = blankPayload();
  payload[0] = CMD_NAVIGATE;
  payload[1] = NAV_SUBCMD;
  payload[2] = options.screen & 0xff;
  payload[3] = (options.distMeters >> 8) & 0xff;
  payload[4] = options.distMeters & 0xff;
  payload[5] = options.maneuver & 0xff;
  payload[6] = (options.heading ?? 0x40) & 0xff;
  payload[7] = (options.speedFlags ?? 0x40) & 0xff;
  payload[8] = payload[3];
  payload[9] = payload[4];
  payload[10] = (options.roadType ?? ROAD_STREET) & 0xff;
  payload[11] = 0;
  payload[12] = (options.etaMinutes ?? 0) & 0xff;
  payload[13] = 1;
  return appendTripperCrc(payload);
}

export function buildNavFromManeuver(
  gm: GoogleManeuverDef,
  distMeters: number,
  screen = 0x14,
  roadType = ROAD_STREET,
  etaMinutes = 0,
): Uint8Array {
  return buildNavPacket({
    screen,
    distMeters,
    maneuver: gm.byte5,
    heading: gm.byte6,
    roadType,
    etaMinutes,
  });
}

export function buildNavManeuverPacket(options: {
  screen: number;
  maneuverDetail: number;
  distanceM: number;
  etaSeconds?: number;
  totalDistanceM?: number;
  nightMode?: boolean;
  etaAsArrival?: boolean;
  use12hClock?: boolean;
}): Uint8Array {
  const payload = blankPayload();
  payload[0] = CMD_NAVIGATE;
  payload[1] = NAV_SUBCMD;
  payload[2] = options.screen & 0xff;

  const [dHi, dLo, unit] = encodeDistance(options.distanceM);
  payload[3] = dHi;
  payload[4] = dLo;
  payload[5] = unit;
  payload[6] = calcIntensity(options.distanceM, options.nightMode);
  payload[7] = options.maneuverDetail & 0xff;
  payload[8] = 0xff;
  payload[9] = 0xff;
  payload[10] = ROAD_STREET;

  const etaSeconds = options.etaSeconds ?? 0;
  const totalDistanceM = options.totalDistanceM ?? 0;

  if (etaSeconds > 0) {
    if (options.etaAsArrival) {
      const arrival = new Date(Date.now() + etaSeconds * 1000);
      if (options.use12hClock) {
        let hour = arrival.getHours() % 12 || 12;
        hour += arrival.getHours() >= 12 ? 0x80 : 0x40;
        payload[11] = hour & 0xff;
      } else {
        payload[11] = Math.min(arrival.getHours(), 23) & 0xff;
      }
      payload[12] = Math.min(arrival.getMinutes(), 59) & 0xff;
    } else {
      payload[11] = Math.min(Math.floor(etaSeconds / 60), 23) & 0xff;
      payload[12] = Math.min(etaSeconds % 60, 59) & 0xff;
    }
    payload[13] = 0;
  } else if (totalDistanceM > 0) {
    const [tHi, tLo, tUnit] = encodeDistance(totalDistanceM);
    payload[11] = tHi;
    payload[12] = tLo;
    payload[13] = tUnit;
  } else {
    payload[11] = 0xff;
    payload[12] = 0xff;
    payload[13] = 0xff;
  }

  return appendTripperCrc(payload);
}

export function buildLoadingScreen(nightMode = false): Uint8Array {
  const payload = blankPayload();
  payload[0] = CMD_NAVIGATE;
  payload[1] = NAV_SUBCMD;
  payload[2] = SCREEN_STOP;
  if (nightMode) payload[6] = 1;
  return appendTripperCrc(payload);
}

export function buildLockedScreen(): Uint8Array {
  const payload = blankPayload();
  payload[0] = CMD_NAVIGATE;
  payload[1] = NAV_SUBCMD;
  payload[2] = SCREEN_LOCKED;
  payload[3] = 0xff;
  payload[4] = 0xff;
  return appendTripperCrc(payload);
}

export function buildKeepalive(subcmd = 0): Uint8Array {
  const payload = blankPayload();
  payload[0] = CMD_KEEPALIVE;
  payload[1] = subcmd & 0xff;
  return appendTripperCrc(payload);
}

export function buildCallIconKeepalive(): Uint8Array {
  return buildKeepalive(5);
}
