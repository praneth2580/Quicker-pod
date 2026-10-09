import type { PluginListenerHandle } from "@capacitor/core";

export interface NavListenerStatus {
  /** True when running on Android Capacitor. */
  supported: boolean;
  /** True when the NotificationListenerService is registered in this APK. */
  listenerAvailable: boolean;
  /** True when the user has granted notification listener access to this app. */
  enabled: boolean;
  /** True when the listener service is connected and receiving posts. */
  connected: boolean;
}

export interface MapsNavUpdateEvent {
  packageName: string;
  /** Raw notification title (often distance to next turn). */
  title: string;
  /** Raw notification text / description (often turn instruction). */
  text: string;
  /** Parsed turn phrase when recognized. */
  turnText: string | null;
  /** Distance to next maneuver in meters when parseable. */
  distanceM: number | null;
  /** Remaining trip ETA in seconds when parseable. */
  etaSeconds: number | null;
  /** Mapped Google-style maneuver name (TURN_LEFT, …) when recognized. */
  maneuverName: string | null;
  /** Street pulled from "onto …" in the instruction, when present. */
  streetName: string | null;
  /** True when Maps posted a rerouting / unknown-direction state. */
  rerouting: boolean;
  /** True when navigation notification was removed / dismissed. */
  stopped: boolean;
  timestamp: number;
}

export interface CallUpdateEvent {
  packageName: string;
  active: boolean;
  callerName: string | null;
  /** Notification body, often "Incoming call" or the number type. */
  text: string | null;
  timestamp: number;
}

export interface NavNotificationsPlugin {
  getStatus(): Promise<NavListenerStatus>;

  /**
   * Whether notification listener access is currently enabled for this package.
   * Reads Settings.Secure.ENABLED_NOTIFICATION_LISTENERS on Android.
   */
  isEnabled(): Promise<{ enabled: boolean; listenerAvailable: boolean }>;

  /** Open system Notification access settings so the user can enable this app. */
  openNotificationAccessSettings(): Promise<void>;

  /** Alias for {@link openNotificationAccessSettings}. */
  openSettings(): Promise<void>;

  /**
   * Open Android App info for this package so the user can enable
   * "Allow restricted settings" (needed on Android 13+ after sideload).
   */
  openAppInfo(): Promise<void>;

  /**
   * Ask the listener service to emit the current Maps navigation notification
   * if one is already posted (best-effort; may no-op).
   */
  requestCurrent(): Promise<{ found: boolean }>;

  addListener(
    eventName: "navUpdate",
    listenerFunc: (event: MapsNavUpdateEvent) => void,
  ): Promise<PluginListenerHandle>;

  addListener(
    eventName: "statusChange",
    listenerFunc: (event: NavListenerStatus) => void,
  ): Promise<PluginListenerHandle>;

  addListener(
    eventName: "callUpdate",
    listenerFunc: (event: CallUpdateEvent) => void,
  ): Promise<PluginListenerHandle>;

  removeAllListeners(): Promise<void>;
}

export type { PluginListenerHandle };
