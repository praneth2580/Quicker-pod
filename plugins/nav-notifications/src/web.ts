import { WebPlugin } from "@capacitor/core";
import type { NavListenerStatus, NavNotificationsPlugin } from "./definitions";

export class NavNotificationsWeb extends WebPlugin implements NavNotificationsPlugin {
  async getStatus(): Promise<NavListenerStatus> {
    return { supported: false, enabled: false, connected: false };
  }

  async openNotificationAccessSettings(): Promise<void> {
    throw this.unavailable("Maps notification mirroring is Android-only.");
  }

  async requestCurrent(): Promise<{ found: boolean }> {
    return { found: false };
  }
}
