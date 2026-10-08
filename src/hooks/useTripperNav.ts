import { useEffect, useState } from "react";
import {
  tripperNavSession,
  type NavSessionSnapshot,
} from "@/bluetooth/tripper/navSession";

const idleSnapshot: NavSessionSnapshot = {
  keepaliveEnabled: false,
  callIconActive: false,
  locked: false,
  lastLabel: "NAV IDLE",
  lastPacketHex: "",
  sending: false,
  lastError: null,
};

export function useTripperNav() {
  const [state, setState] = useState<NavSessionSnapshot>(idleSnapshot);

  useEffect(() => tripperNavSession.subscribe(setState), []);

  return {
    ...state,
    session: tripperNavSession,
    setKeepaliveEnabled: (enabled: boolean) =>
      tripperNavSession.setKeepaliveEnabled(enabled),
    sendNavIdle: () => tripperNavSession.sendNavIdle(),
    sendStopNav: () => tripperNavSession.sendStopNav(),
    sendGuidance: tripperNavSession.sendGuidance.bind(tripperNavSession),
    sendGoogleManeuver: tripperNavSession.sendGoogleManeuver.bind(tripperNavSession),
    sendPresetTurn: tripperNavSession.sendPresetTurn.bind(tripperNavSession),
    applyExternalNavUpdate:
      tripperNavSession.applyExternalNavUpdate.bind(tripperNavSession),
    setCallIconActive: (active: boolean) =>
      tripperNavSession.setCallIconActive(active),
  };
}
