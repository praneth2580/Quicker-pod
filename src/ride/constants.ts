/** Custom scheme used by widget + NFC + deep links. */
export const RIDE_DEEP_LINK = "quickerpod://ride";

/** How long to keep retrying reconnect after a ride launch (ms). */
export const RIDE_RECONNECT_WINDOW_MS = 45_000;

/** Delay between reconnect attempts while waiting for Tripper to advertise. */
export const RIDE_RECONNECT_RETRY_MS = 3_000;
