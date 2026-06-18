import { useEffect } from "react";
import { usePwaInstallStore } from "@/store/pwaInstallStore";

export type { BeforeInstallPromptEvent } from "@/store/pwaInstallStore";

export function usePwaInstallInit() {
  useEffect(() => usePwaInstallStore.getState().init(), []);
}

export { usePwaInstall } from "@/store/pwaInstallStore";
