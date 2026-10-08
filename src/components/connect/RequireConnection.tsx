import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useConnectionStore } from "@/store/connectionStore";

/**
 * Blocks product screens until Tripper is actively connected.
 * Connect (/connect) remains reachable so pairing / reconnect can finish.
 */
export function RequireConnection({ children }: { children: ReactNode }) {
  const connected = useConnectionStore((s) => s.connected);
  const location = useLocation();

  if (!connected) {
    return <Navigate to="/connect" replace state={{ from: location.pathname }} />;
  }

  return children;
}
