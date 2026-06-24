import type { ProtocolLabTab } from "../types";

export const PROTOCOL_LAB_TABS: ProtocolLabTab[] = [
  "explorer",
  "notifications",
  "sender",
  "mutation",
  "export",
];

export function isProtocolLabTab(value: string): value is ProtocolLabTab {
  return PROTOCOL_LAB_TABS.includes(value as ProtocolLabTab);
}

/** Legacy route paths → Protocol Lab tab */
export const LEGACY_ROUTE_TABS: Record<string, ProtocolLabTab> = {
  explorer: "explorer",
  console: "notifications",
  transmit: "sender",
  simulator: "explorer",
};
