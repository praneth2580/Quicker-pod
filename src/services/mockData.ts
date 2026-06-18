import type { BluetoothDeviceInfo, BluetoothServiceInfo, SimulatedManeuver } from "@/types";

export const MOCK_DEVICES: BluetoothDeviceInfo[] = [
  { id: "aa:bb:cc:dd:ee:01", name: "Tripper Pod #1", rssi: -52 },
  { id: "aa:bb:cc:dd:ee:02", name: "Tripper Pod #2", rssi: -68 },
  { id: "aa:bb:cc:dd:ee:03", name: "RE-Navigator", rssi: -74 },
  { id: "aa:bb:cc:dd:ee:04", name: "Unknown BLE Device", rssi: -81 },
];

export const MOCK_SERVICES: BluetoothServiceInfo[] = [
  {
    uuid: "00001800-0000-1000-8000-00805f9b34fb",
    name: "Generic Access",
    characteristics: [
      {
        uuid: "00002a00-0000-1000-8000-00805f9b34fb",
        name: "Device Name",
        properties: { read: true, write: false, writeWithoutResponse: false, notify: false, indicate: false },
      },
      {
        uuid: "00002a01-0000-1000-8000-00805f9b34fb",
        name: "Appearance",
        properties: { read: true, write: false, writeWithoutResponse: false, notify: false, indicate: false },
      },
    ],
  },
  {
    uuid: "0000fff0-0000-1000-8000-00805f9b34fb",
    name: "Tripper Protocol",
    characteristics: [
      {
        uuid: "0000fff1-0000-1000-8000-00805f9b34fb",
        name: "Command Channel",
        properties: { read: true, write: true, writeWithoutResponse: true, notify: true, indicate: false },
      },
      {
        uuid: "0000fff2-0000-1000-8000-00805f9b34fb",
        name: "Navigation Data",
        properties: { read: false, write: true, writeWithoutResponse: true, notify: true, indicate: false },
      },
      {
        uuid: "0000fff3-0000-1000-8000-00805f9b34fb",
        name: "Status",
        properties: { read: true, write: false, writeWithoutResponse: false, notify: true, indicate: true },
      },
    ],
  },
  {
    uuid: "0000180f-0000-1000-8000-00805f9b34fb",
    name: "Battery Service",
    characteristics: [
      {
        uuid: "00002a19-0000-1000-8000-00805f9b34fb",
        name: "Battery Level",
        properties: { read: true, write: false, writeWithoutResponse: false, notify: true, indicate: false },
      },
    ],
  },
];

export const NAVIGATION_MANEUVERS: SimulatedManeuver[] = [
  { maneuver: "left", label: "Left Turn", hex: "01 FF 20" },
  { maneuver: "right", label: "Right Turn", hex: "01 FF 21" },
  { maneuver: "u-turn", label: "U-Turn", hex: "01 FF 22" },
  { maneuver: "straight", label: "Straight", hex: "01 FF 00" },
  { maneuver: "arrival", label: "Arrival", hex: "01 FF FF" },
];

export const EXAMPLE_PACKETS = [
  { name: "Init Handshake", hex: "AA BB CC DD" },
  { name: "Keep Alive", hex: "01 00 00" },
  { name: "Request Status", hex: "02 01" },
];
