import { WebPlugin } from "@capacitor/core";
import type {
  ReconnectOptions,
  StartPairingOptions,
  SubmitPinOptions,
  TripperBleDevice,
  TripperBlePlugin,
  WritePacketOptions,
} from "./definitions";

const NATIVE_ONLY =
  "TripperBle is native-only. Web Bluetooth cannot host a GATT server (required for Tripper AUTH). Use the Android Capacitor build.";

export class TripperBleWeb extends WebPlugin implements TripperBlePlugin {
  async isAvailable(): Promise<{ available: boolean }> {
    return { available: false };
  }

  async startPairing(_options?: StartPairingOptions): Promise<TripperBleDevice> {
    throw this.unavailable(NATIVE_ONLY);
  }

  async reconnect(_options: ReconnectOptions): Promise<TripperBleDevice> {
    throw this.unavailable(NATIVE_ONLY);
  }

  async submitPin(_options: SubmitPinOptions): Promise<{ submitted: boolean }> {
    throw this.unavailable(NATIVE_ONLY);
  }

  async writePacket(_options: WritePacketOptions): Promise<void> {
    throw this.unavailable(NATIVE_ONLY);
  }

  async disconnect(): Promise<void> {
    // no-op on web
  }
}
