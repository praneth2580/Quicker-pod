export interface BluetoothDeviceInfo {
  id: string;
  name: string;
  rssi?: number;
}

export interface BluetoothServiceInfo {
  uuid: string;
  name?: string;
  characteristics: BluetoothCharacteristicInfo[];
}

export interface BluetoothCharacteristicInfo {
  uuid: string;
  name?: string;
  properties: CharacteristicProperties;
}

export interface CharacteristicProperties {
  read: boolean;
  write: boolean;
  writeWithoutResponse: boolean;
  notify: boolean;
  indicate: boolean;
}

export type BluetoothEventType =
  | "device-found"
  | "connected"
  | "disconnected"
  | "packet-sent"
  | "packet-received"
  | "error"
  | "notification";

export interface BluetoothEvent {
  type: BluetoothEventType;
  payload?: unknown;
}

export type BluetoothEventListener = (event: BluetoothEvent) => void;
