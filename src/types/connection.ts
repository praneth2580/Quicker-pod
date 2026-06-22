export interface KnownDevice {
  id: string;
  name: string;
  firstPaired: number;
  lastConnected: number;
  pinPaired?: boolean;
}

export type PairingPhase = "idle" | "awaiting_pin" | "submitting_pin";
