export interface CanInstallResult {
  /** Whether the OS allows this app to install packages (Android 8+ unknown sources). */
  allowed: boolean;
}

export interface DownloadAndInstallOptions {
  /** HTTPS URL of the APK (GitHub Release asset). */
  url: string;
}

export interface DownloadAndInstallResult {
  /** True when the system package installer was launched. */
  started: boolean;
}

export interface DownloadProgressEvent {
  /** 0–1 download progress. */
  progress: number;
  /** Bytes written so far. */
  bytesWritten: number;
  /** Total bytes when Content-Length is known, else 0. */
  totalBytes: number;
}

export interface ApkUpdaterPlugin {
  /** Whether installing APKs from this app is currently allowed. */
  canInstallPackages(): Promise<CanInstallResult>;

  /** Open system settings so the user can allow installs from Quicker Pod. */
  openInstallSettings(): Promise<void>;

  /**
   * Download an APK to app cache and open the system installer.
   * Emits `downloadProgress` while downloading.
   */
  downloadAndInstall(options: DownloadAndInstallOptions): Promise<DownloadAndInstallResult>;

  /** Cancel an in-progress download (best-effort). */
  cancelDownload(): Promise<void>;

  addListener(
    eventName: "downloadProgress",
    listenerFunc: (event: DownloadProgressEvent) => void,
  ): Promise<import("@capacitor/core").PluginListenerHandle>;
}
