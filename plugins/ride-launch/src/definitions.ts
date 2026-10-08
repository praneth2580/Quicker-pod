export interface NfcAvailability {
  supported: boolean;
  enabled: boolean;
}

export interface WriteNfcResult {
  written: boolean;
  uri: string;
}

export interface RideLaunchPlugin {
  /** Whether the device has NFC hardware and whether it is enabled. */
  getNfcStatus(): Promise<NfcAvailability>;

  /**
   * Prompt the user to hold an NFC tag; writes an NDEF URI that opens the app
   * for ride reconnect (`quickerpod://ride`).
   */
  writeRideNfcTag(): Promise<WriteNfcResult>;

  /** Cancel an in-progress writeRideNfcTag wait. */
  cancelNfcWrite(): Promise<void>;
}
