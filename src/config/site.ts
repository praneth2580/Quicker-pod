export const SITE_URL = "https://praneth2580.github.io/Quicker-pod/";
export const SITE_NAME = "Quicker-pod";
export const SITE_TAGLINE = "Open navigation companion for Royal Enfield Tripper Pod";
export const SITE_DESCRIPTION =
  "Quicker-pod is a free, open-source Android companion for the Royal Enfield Tripper Pod. Sideload the APK for full BLE pairing, Google Maps turn mirroring, and live navigation on your pod — no account, no store fees.";
export const SITE_OG_IMAGE = `${SITE_URL}screenshots/mobile-wide.png`;
export const GITHUB_OWNER = "praneth2580";
export const GITHUB_REPO = "Quicker-pod";
export const GITHUB_URL = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}`;
/** APK filename for a given semver (e.g. quicker-pod-1.2.0.apk). */
export function apkAssetName(version: string): string {
  const v = version.replace(/^v/, "").match(/^\d+\.\d+\.\d+/)?.[0] ?? version.replace(/^v/, "");
  return `quicker-pod-${v}.apk`;
}

/** Match versioned release assets; also accepts legacy quicker-pod.apk. */
export function isQuickerPodApkAsset(name: string): boolean {
  const lower = name.toLowerCase();
  return lower === "quicker-pod.apk" || /^quicker-pod-\d+\.\d+\.\d+.*\.apk$/.test(lower);
}

/** Releases page — exact APK names are versioned, so use apk-latest.json / API for downloads. */
export const APK_LATEST_DOWNLOAD_URL = `${GITHUB_URL}/releases/latest`;
export const GITHUB_RELEASES_API_URL = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`;
export const GITHUB_RELEASES_PAGE_URL = `${GITHUB_URL}/releases/latest`;

export const SEO_KEYWORDS = [
  "Royal Enfield Tripper Pod",
  "Tripper Pod app alternative",
  "free Tripper Pod APK",
  "Tripper Pod navigation app",
  "Google Maps Tripper Pod",
  "Tripper Pod Bluetooth",
  "RE_DISP BLE companion",
  "motorcycle HUD Android",
  "open source Tripper companion",
  "Royal Enfield navigation pod",
  "Android Tripper pairing",
  "Maps turn-by-turn Tripper",
].join(", ");
