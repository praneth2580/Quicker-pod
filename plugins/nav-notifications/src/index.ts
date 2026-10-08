import { registerPlugin } from "@capacitor/core";
import type { NavNotificationsPlugin } from "./definitions";

const NavNotifications = registerPlugin<NavNotificationsPlugin>("NavNotifications", {
  web: () => import("./web").then((m) => new m.NavNotificationsWeb()),
});

export * from "./definitions";
export { NavNotifications };
