import type { DetailedServiceInfo } from "../types";

export const MOCK_DETAILED_SERVICES: DetailedServiceInfo[] = [
  {
    uuid: "00001800-0000-1000-8000-00805f9b34fb",
    name: "Generic Access",
    characteristics: [
      {
        uuid: "00002a00-0000-1000-8000-00805f9b34fb",
        name: "Device Name",
        properties: {
          read: true,
          write: false,
          writeWithoutResponse: false,
          notify: false,
          indicate: false,
        },
        descriptors: [{ uuid: "00002902-0000-1000-8000-00805f9b34fb" }],
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
        properties: {
          read: true,
          write: true,
          writeWithoutResponse: true,
          notify: true,
          indicate: false,
        },
        descriptors: [{ uuid: "00002902-0000-1000-8000-00805f9b34fb" }],
        lastReadValue: "AA BB CC DD",
      },
      {
        uuid: "0000fff2-0000-1000-8000-00805f9b34fb",
        name: "Navigation Data",
        properties: {
          read: false,
          write: true,
          writeWithoutResponse: true,
          notify: true,
          indicate: false,
        },
        descriptors: [],
      },
      {
        uuid: "0000fff3-0000-1000-8000-00805f9b34fb",
        name: "Status",
        properties: {
          read: true,
          write: false,
          writeWithoutResponse: false,
          notify: true,
          indicate: true,
        },
        descriptors: [{ uuid: "00002902-0000-1000-8000-00805f9b34fb" }],
      },
    ],
  },
];

export const EXAMPLE_BASE_PACKET = "20 01 00 64";
