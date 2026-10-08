import { registerPlugin } from "@capacitor/core";
import type { RideLaunchPlugin } from "./definitions";

const RideLaunch = registerPlugin<RideLaunchPlugin>("RideLaunch", {
  web: () => import("./web").then((m) => new m.RideLaunchWeb()),
});

export * from "./definitions";
export { RideLaunch };
