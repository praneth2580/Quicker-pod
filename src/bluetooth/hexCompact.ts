/** Continuous lowercase hex (no spaces) for native plugin payloads. */
export function bytesToHexCompact(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
