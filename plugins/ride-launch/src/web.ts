import { WebPlugin } from "@capacitor/core";
import type { NfcAvailability, RideLaunchPlugin, WriteNfcResult } from "./definitions";

export class RideLaunchWeb extends WebPlugin implements RideLaunchPlugin {
  async getNfcStatus(): Promise<NfcAvailability> {
    return { supported: false, enabled: false };
  }

  async writeRideNfcTag(): Promise<WriteNfcResult> {
    throw this.unavailable("NFC tag writing is Android-only.");
  }

  async cancelNfcWrite(): Promise<void> {
    /* no-op on web */
  }
}
