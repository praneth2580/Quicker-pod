export function formatUuid(uuid: string, short = true): string {
  if (!short) return uuid;
  if (uuid.length <= 8) return uuid;
  const compact = uuid.replace(/-/g, "").toUpperCase();
  if (compact.length === 4) return `0x${compact}`;
  return `${uuid.slice(0, 8)}…`;
}
