import { WebPlugin } from "@capacitor/core";
import type { NavListenerStatus, NavNotificationsPlugin } from "./definitions";

export class NavNotificationsWeb extends WebPlugin implements NavNotificationsPlugin {
  async getStatus(): Promise<NavListenerStatus> {
    return { supported: false, listenerAvailable: false, enabled: false, connected: false };
  }

  async isEnabled(): Promise<{ enabled: boolean; listenerAvailable: boolean }> {
    return { enabled: false, listenerAvailable: false };
  }

  async openNotificationAccessSettings(): Promise<void> {
    throw this.unavailable("Maps notification mirroring is Android-only.");
  }

  async openSettings(): Promise<void> {
    return this.openNotificationAccessSettings();
  }

  async requestCurrent(): Promise<{ found: boolean }> {
    return { found: false };
  }
}
