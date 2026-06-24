import { MAN_HIGHWAY } from "./constants";

export interface GoogleManeuverDef {
  name: string;
  byte5: number;
  byte6: number;
  displayName: string;
}

/** Google Navigation SDK maneuver → Tripper icon bytes (from TripperProtocol.GoogleManeuver). */
export const GOOGLE_MANEUVERS: GoogleManeuverDef[] = [
  { name: "DEPART", byte5: 0x00, byte6: 0x40, displayName: "Depart" },
  { name: "STRAIGHT", byte5: 0x00, byte6: 0x40, displayName: "Straight" },
  { name: "DESTINATION_LEFT", byte5: 0x10, byte6: 0x01, displayName: "Destination left" },
  { name: "DESTINATION_RIGHT", byte5: 0x20, byte6: 0x01, displayName: "Destination right" },
  { name: "TURN_LEFT", byte5: 0x10, byte6: 0x40, displayName: "Turn left" },
  { name: "TURN_RIGHT", byte5: 0x20, byte6: 0x40, displayName: "Turn right" },
  { name: "TURN_KEEP_LEFT", byte5: 0x10, byte6: 0x40, displayName: "Keep left" },
  { name: "TURN_KEEP_RIGHT", byte5: 0x20, byte6: 0x40, displayName: "Keep right" },
  { name: "TURN_SLIGHT_LEFT", byte5: 0x10, byte6: 0x40, displayName: "Slight left" },
  { name: "TURN_SLIGHT_RIGHT", byte5: 0x20, byte6: 0x40, displayName: "Slight right" },
  { name: "TURN_SHARP_LEFT", byte5: 0x30, byte6: 0x40, displayName: "Sharp left" },
  { name: "TURN_SHARP_RIGHT", byte5: 0x30, byte6: 0x40, displayName: "Sharp right" },
  { name: "TURN_U_TURN_CLOCKWISE", byte5: 0x50, byte6: 0x40, displayName: "U-turn CW" },
  { name: "TURN_U_TURN_COUNTERCLOCKWISE", byte5: 0x50, byte6: 0x40, displayName: "U-turn CCW" },
  { name: "FORK_LEFT", byte5: 0x10, byte6: 0x40, displayName: "Fork left" },
  { name: "FORK_RIGHT", byte5: 0x20, byte6: 0x40, displayName: "Fork right" },
  { name: "KEEP_LEFT", byte5: 0x10, byte6: 0x40, displayName: "Keep left" },
  { name: "KEEP_RIGHT", byte5: 0x20, byte6: 0x40, displayName: "Keep right" },
  { name: "MERGE_LEFT", byte5: 0x10, byte6: 0x40, displayName: "Merge left" },
  { name: "MERGE_RIGHT", byte5: 0x20, byte6: 0x40, displayName: "Merge right" },
  { name: "ON_RAMP_LEFT", byte5: MAN_HIGHWAY, byte6: 0x40, displayName: "On-ramp left" },
  { name: "ON_RAMP_RIGHT", byte5: MAN_HIGHWAY, byte6: 0x40, displayName: "On-ramp right" },
  { name: "OFF_RAMP_LEFT", byte5: MAN_HIGHWAY, byte6: 0x40, displayName: "Off-ramp left" },
  { name: "OFF_RAMP_RIGHT", byte5: MAN_HIGHWAY, byte6: 0x40, displayName: "Off-ramp right" },
  { name: "ROUNDABOUT_LEFT_CLOCKWISE", byte5: 0x40, byte6: 0x10, displayName: "Roundabout left" },
  { name: "ROUNDABOUT_RIGHT_CLOCKWISE", byte5: 0x40, byte6: 0x20, displayName: "Roundabout right" },
  { name: "ROUNDABOUT_STRAIGHT_CLOCKWISE", byte5: 0x40, byte6: 0x40, displayName: "Roundabout straight" },
  { name: "ROUNDABOUT_EXIT_CLOCKWISE", byte5: 0x40, byte6: MAN_HIGHWAY, displayName: "Roundabout exit" },
  { name: "ROUNDABOUT_U_TURN_CLOCKWISE", byte5: 0x40, byte6: 0x50, displayName: "Roundabout U-turn" },
  { name: "ROUNDABOUT_LEFT_COUNTERCLOCKWISE", byte5: 0x40, byte6: 0x10, displayName: "Roundabout left CCW" },
  { name: "ROUNDABOUT_RIGHT_COUNTERCLOCKWISE", byte5: 0x40, byte6: 0x20, displayName: "Roundabout right CCW" },
  { name: "ROUNDABOUT_EXIT_COUNTERCLOCKWISE", byte5: 0x40, byte6: MAN_HIGHWAY, displayName: "Roundabout exit CCW" },
];

const googleManeuverByName = new Map(GOOGLE_MANEUVERS.map((m) => [m.name, m]));

export function getGoogleManeuver(name: string): GoogleManeuverDef | undefined {
  return googleManeuverByName.get(name);
}

/**
 * Map Google Navigation SDK maneuver id to Tripper maneuver byte (NavManeuver.toByte).
 * Returns 0xFF for unknown maneuvers.
 */
export function navManeuverToByte(maneuverId: number, roundaboutExit = 0): number {
  switch (maneuverId) {
    case 0:
    case 1:
      return 0x00;
    case 2:
      return 0x10;
    case 3:
      return 0x20;
    case 4:
      return 0x30;
    case 5:
      return 0x40;
    case 6:
      return 0x50;
    case 7:
      return 0x60;
    case 8:
      return 0x21;
    case 9:
      return 0x22;
    case 10:
      return 0x1f;
    case 11:
      return 0x20;
    case 12:
      return 0x1d;
    case 13:
      return 0x1e;
    case 14:
      return 0x1b;
    case 15:
      return 0x17;
    case 16:
      return 0x16;
    case 17:
      return 0x15;
    case 18:
      return 0x14;
    case 19:
      return 0x3c;
    case 20:
      return 0x2d;
    case 21:
      return 0x2e;
    case 22:
      return 0x2b;
    case 23:
      return 0x31;
    case 24:
      return 0x30;
    case 25:
      return 0x2f;
    case 26:
      return 0x18;
    case 27:
      return 0x19;
    case 28:
      return 0x1a;
    case 29:
      return 0x3d;
    case 30:
      return 0x3e;
    case 31:
      return 0x3f;
    case 32:
      return 0x09;
    case 33:
      return 0x0a;
    case 34:
      return 0x08;
    case 35:
      return roundaboutExit > 0 ? 0x1c + roundaboutExit : 0xff;
    case 36:
      return 0x1b;
    case 37:
      return 0x1a;
    case 38:
      return 0x19;
    case 39:
      return 0x18;
    case 40:
      return 0x17;
    case 41:
      return 0x16;
    case 42:
      return 0x15;
    default:
      return 0xff;
  }
}
