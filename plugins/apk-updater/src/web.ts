import { WebPlugin } from "@capacitor/core";
import type {
  ApkUpdaterPlugin,
  CanInstallResult,
  DownloadAndInstallOptions,
  DownloadAndInstallResult,
} from "./definitions";

export class ApkUpdaterWeb extends WebPlugin implements ApkUpdaterPlugin {
  async canInstallPackages(): Promise<CanInstallResult> {
    return { allowed: false };
  }

  async openInstallSettings(): Promise<void> {
    throw this.unavailable("APK install settings are Android-only.");
  }

  async downloadAndInstall(_options: DownloadAndInstallOptions): Promise<DownloadAndInstallResult> {
    throw this.unavailable("In-app APK updates are Android-only.");
  }

  async cancelDownload(): Promise<void> {
    /* no-op on web */
  }
}
