import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { App as CapApp } from "@capacitor/app";
import { useApkUpdateStore } from "@/store/apkUpdateStore";

/** Check for APK updates on launch and when returning to the foreground. */
export function useApkUpdateInit() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "android") {
      return;
    }

    void useApkUpdateStore.getState().checkForUpdate();

    const sub = CapApp.addListener("appStateChange", ({ isActive }) => {
      if (!isActive) return;
      const phase = useApkUpdateStore.getState().phase;
      if (phase === "downloading" || phase === "installing" || phase === "checking") return;
      void useApkUpdateStore.getState().checkForUpdate();
    });

    return () => {
      void sub.then((handle) => handle.remove());
    };
  }, []);
}
