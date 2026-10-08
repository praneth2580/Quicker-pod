import { create } from "zustand";
import { Capacitor } from "@capacitor/core";
import { App as CapApp } from "@capacitor/app";
import { ApkUpdater } from "apk-updater";
import {
  fetchLatestApkMeta,
  isRemoteNewer,
  parseVersionCode,
  type ApkLatestMeta,
} from "@/services/apkRelease";

export type ApkUpdatePhase =
  | "idle"
  | "checking"
  | "available"
  | "upToDate"
  | "downloading"
  | "installing"
  | "error";

interface ApkUpdateState {
  phase: ApkUpdatePhase;
  message: string | null;
  remote: ApkLatestMeta | null;
  installedVersion: string | null;
  installedVersionCode: number | null;
  progress: number;
  bannerDismissed: boolean;
  /** True when Android blocked install until unknown-sources is enabled. */
  needsInstallPermission: boolean;

  checkForUpdate: () => Promise<void>;
  startUpdate: () => Promise<void>;
  openInstallSettings: () => Promise<void>;
  dismissBanner: () => void;
  clearMessage: () => void;
}

let progressHandle: { remove: () => Promise<void> } | null = null;

async function detachProgress(): Promise<void> {
  if (progressHandle) {
    try {
      await progressHandle.remove();
    } catch {
      /* ignore */
    }
    progressHandle = null;
  }
}

export const useApkUpdateStore = create<ApkUpdateState>((set, get) => ({
  phase: "idle",
  message: null,
  remote: null,
  installedVersion: null,
  installedVersionCode: null,
  progress: 0,
  bannerDismissed: false,
  needsInstallPermission: false,

  clearMessage: () => set({ message: null, needsInstallPermission: false }),

  dismissBanner: () => set({ bannerDismissed: true }),

  openInstallSettings: async () => {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "android") return;
    try {
      await ApkUpdater.openInstallSettings();
      set({
        message: "Allow installs from Quicker Pod, then tap Update again.",
        needsInstallPermission: true,
      });
    } catch (err) {
      set({
        phase: "error",
        message: err instanceof Error ? err.message : String(err),
      });
    }
  },

  checkForUpdate: async () => {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "android") {
      set({
        phase: "idle",
        message: "In-app APK updates are available in the Android app.",
      });
      return;
    }

    set({
      phase: "checking",
      message: null,
      needsInstallPermission: false,
      progress: 0,
    });

    try {
      const info = await CapApp.getInfo();
      const installedVersion = info.version;
      const installedVersionCode = parseVersionCode(info.build);

      const remote = await fetchLatestApkMeta();
      const available = isRemoteNewer(remote, {
        version: installedVersion,
        versionCode: installedVersionCode,
      });

      set({
        remote,
        installedVersion,
        installedVersionCode,
        phase: available ? "available" : "upToDate",
        bannerDismissed: available ? get().bannerDismissed : true,
        message: available
          ? `Version ${remote.version} is ready to install.`
          : `You're on the latest version (${installedVersion}).`,
      });
    } catch (err) {
      set({
        phase: "error",
        message: err instanceof Error ? err.message : "Could not check for updates.",
      });
    }
  },

  startUpdate: async () => {
    const remote = get().remote;
    if (!remote?.downloadUrl) {
      set({ phase: "error", message: "No download URL for the latest release." });
      return;
    }
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "android") {
      set({ phase: "error", message: "Updates require the Android app." });
      return;
    }

    try {
      const { allowed } = await ApkUpdater.canInstallPackages();
      if (!allowed) {
        set({
          phase: "available",
          needsInstallPermission: true,
          message: "Allow Quicker Pod to install updates, then try again.",
        });
        return;
      }

      await detachProgress();
      progressHandle = await ApkUpdater.addListener("downloadProgress", (event) => {
        set({ progress: event.progress });
      });

      set({
        phase: "downloading",
        progress: 0,
        message: "Downloading update…",
        needsInstallPermission: false,
      });

      await ApkUpdater.downloadAndInstall({ url: remote.downloadUrl });
      set({
        phase: "installing",
        progress: 1,
        message: "Opening the system installer — confirm to finish updating.",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const needsPerm =
        message.includes("Install permission") || message.includes("INSTALL_PERMISSION");
      set({
        phase: needsPerm ? "available" : "error",
        needsInstallPermission: needsPerm,
        message: needsPerm
          ? "Allow Quicker Pod to install updates, then try again."
          : message,
        progress: 0,
      });
    } finally {
      await detachProgress();
    }
  },
}));
