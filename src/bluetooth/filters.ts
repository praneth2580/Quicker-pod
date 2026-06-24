/** Royal Enfield BLE device name prefix (Tripper Pod and related devices). */
export const ROYAL_ENFIELD_NAME_PREFIX = "RE_";

/**
 * Device scan filters for the first-time connection flow.
 * Add `{ services: ['SERVICE_UUID'] }` when the Tripper Pod service UUID is known.
 */
export const ROYAL_ENFIELD_DEVICE_FILTERS: BluetoothLEScanFilter[] = [
  { namePrefix: ROYAL_ENFIELD_NAME_PREFIX },
  { namePrefix: "RE_DISP" },
];

/** Optional GATT services to request access during pairing. */
export const ROYAL_ENFIELD_OPTIONAL_SERVICES: BluetoothServiceUUID[] = [
  "01ff0100-ba5e-f4ee-5ca1-eb1e5e4b1ce0",
];
