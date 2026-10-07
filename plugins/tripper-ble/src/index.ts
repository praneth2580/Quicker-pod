import { registerPlugin } from "@capacitor/core";
import type { TripperBlePlugin } from "./definitions";

const TripperBle = registerPlugin<TripperBlePlugin>("TripperBle", {
  web: () => import("./web").then((m) => new m.TripperBleWeb()),
});

export * from "./definitions";
export { TripperBle };
