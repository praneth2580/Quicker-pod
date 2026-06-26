/** Royal Enfield Tripper BLE protocol constants. Canonical spec: tripper-protocol/re-engineered-protocol/ */

export const TRIPPER_DEVICE_NAME = "RE_DISP";
export const TRIPPER_SERVICE_UUID = "01ff0100-ba5e-f4ee-5ca1-eb1e5e4b1ce0";
export const TRIPPER_CHAR_UUID = "01ff0101-ba5e-f4ee-5ca1-eb1e5e4b1ce0";
export const TRIPPER_CCCD_UUID = "00002902-0000-1000-8000-00805f9b34fb";

export const PACKET_SIZE = 20;
export const PAYLOAD_CRC_LEN = 18;

export const CMD_NAVIGATE = 0x10;
export const CMD_NACK = 0x02;
export const CMD_PING_FW = 0x03;
export const CMD_RESERVED_0B = 0x0b;
export const CMD_DEVICE_ID = 0x20;
export const CMD_HANDSHAKE = 0x21;
export const CMD_PING_WP = 0x30;
export const CMD_KEEPALIVE = 0x40;
export const CMD_SET_TIME = 0x50;

export const NAV_SUBCMD = 0x11;
export const COMPASS_SCREEN = 0x41;

export const HS_SHOW_PIN = 0x01;
export const HS_CLOSE = 0x00;

export const SCREEN_TBT = 0x14;
export const SCREEN_ARRIVE = 0x15;
export const SCREEN_STOP = 0x1c;
export const SCREEN_HIGHWAY = 0x32;
export const SCREEN_IDLE = 0x3c;
export const SCREEN_RECALC = 0x3d;
export const SCREEN_LOCKED = 0x42;
export const SCREEN_LAST = 0x01;

export const MAN_STRAIGHT = 0x00;
export const MAN_LEFT = 0x10;
export const MAN_RIGHT_SOFT = 0x20;
export const MAN_RIGHT_HARD = 0x30;
export const MAN_FORWARD = 0x40;
export const MAN_UTURN = 0x50;
export const MAN_HIGHWAY = 0x60;

export const ROAD_HIGHWAY = 0x31;
export const ROAD_STREET = 0x41;
export const ROAD_AVENUE = 0x42;

export const DIR_N = 0x10;
export const DIR_NE = 0x60;
export const DIR_E = 0x30;
export const DIR_SE = 0x70;
export const DIR_S = 0x40;
export const DIR_SW = 0x80;
export const DIR_W = 0x20;
export const DIR_NW = 0x50;

export const KEEPALIVE_START_GUIDANCE = 0x01;
/** Call-icon keepalive during phone calls (`buildCallIconKeepalive`). */
export const KEEPALIVE_CALL_ICON = 0x05;
/** @deprecated Use KEEPALIVE_CALL_ICON */
export const KEEPALIVE_STOP_GUIDANCE = KEEPALIVE_CALL_ICON;

/** Delays from Super Tripper TripperBleManager (milliseconds). */
export const DELAY_POST_CONNECT_MS = 1000;
export const DELAY_POST_NOTIFICATIONS_MS = 500;
export const DELAY_PRE_HANDSHAKE_MS = 200;
export const DELAY_SHOW_PIN_UI_MS = 300;
export const DELAY_CLOSE_TO_TIME_MS = 200;
export const DELAY_TIME_TO_PING_MS = 150;
export const DELAY_PING_TO_READY_MS = 300;
export const DELAY_POST_PIN_TO_PING_MS = 200;
export const DELAY_POST_PIN_WP_GAP_MS = 100;
export const DELAY_INTER_WRITE_MS = 80;
