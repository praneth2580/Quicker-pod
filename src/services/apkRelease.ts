import {
  APK_LATEST_DOWNLOAD_URL,
  GITHUB_RELEASES_API_URL,
  GITHUB_RELEASES_PAGE_URL,
  SITE_URL,
  apkAssetName,
  isQuickerPodApkAsset,
} from "@/config/site";

export interface ApkLatestMeta {
  version: string;
  versionCode: number | null;
  downloadUrl: string;
  releasesPageUrl: string;
  assetName: string | null;
}

interface StaticApkLatest {
  version?: string | null;
  versionCode?: number | null;
  tag?: string | null;
  assetName?: string | null;
  downloadUrl?: string | null;
  releasesPageUrl?: string | null;
}

interface GithubReleaseAsset {
  name: string;
  browser_download_url: string;
}

interface GithubRelease {
  tag_name: string;
  html_url: string;
  assets: GithubReleaseAsset[];
}

function pickApkAsset(
  assets: GithubReleaseAsset[],
  tagName?: string | null,
): GithubReleaseAsset | undefined {
  if (tagName) {
    const named = apkAssetName(tagName);
    const exact = assets.find((asset) => asset.name === named);
    if (exact) return exact;
  }
  const versioned = assets.find((asset) => isQuickerPodApkAsset(asset.name));
  if (versioned) return versioned;
  return assets.find((asset) => asset.name.toLowerCase().endsWith(".apk"));
}

function fromStatic(data: StaticApkLatest): ApkLatestMeta | null {
  if (!data.downloadUrl || !data.version) return null;
  const versionCode =
    typeof data.versionCode === "number" && Number.isFinite(data.versionCode)
      ? data.versionCode
      : null;
  return {
    version: (data.tag || data.version).replace(/^v/, ""),
    versionCode,
    downloadUrl: data.downloadUrl,
    releasesPageUrl: data.releasesPageUrl || GITHUB_RELEASES_PAGE_URL,
    assetName: data.assetName ?? null,
  };
}

async function loadFromGithub(signal?: AbortSignal): Promise<ApkLatestMeta> {
  const response = await fetch(GITHUB_RELEASES_API_URL, {
    headers: { Accept: "application/vnd.github+json" },
    signal,
  });

  if (response.status === 404) {
    throw new Error("No GitHub release published yet.");
  }
  if (!response.ok) {
    throw new Error(`GitHub API ${response.status}`);
  }

  const release = (await response.json()) as GithubRelease;
  const apk = pickApkAsset(release.assets ?? [], release.tag_name);
  if (!apk) {
    throw new Error("Latest release has no APK asset yet.");
  }

  return {
    version: release.tag_name.replace(/^v/, ""),
    versionCode: null,
    downloadUrl: apk.browser_download_url || APK_LATEST_DOWNLOAD_URL,
    releasesPageUrl: release.html_url || GITHUB_RELEASES_PAGE_URL,
    assetName: apk.name,
  };
}

/**
 * Remote release metadata for in-app updates.
 * Prefers live GitHub Pages `apk-latest.json` (not the APK-bundled copy),
 * then falls back to the GitHub Releases API.
 */
export async function fetchLatestApkMeta(signal?: AbortSignal): Promise<ApkLatestMeta> {
  const remoteUrl = new URL("apk-latest.json", SITE_URL).href;
  try {
    const res = await fetch(remoteUrl, { signal, cache: "no-store" });
    if (res.ok) {
      const data = (await res.json()) as StaticApkLatest;
      const meta = fromStatic(data);
      if (meta) return meta;
    }
  } catch {
    /* fall through to GitHub API */
  }

  return loadFromGithub(signal);
}

/** Parse Capacitor App.getInfo().build (versionCode) safely. */
export function parseVersionCode(build: string | number | null | undefined): number | null {
  if (typeof build === "number" && Number.isFinite(build)) return Math.trunc(build);
  if (typeof build === "string" && /^\d+$/.test(build.trim())) return Number(build.trim());
  return null;
}

/**
 * True when remote is newer than installed.
 * Prefer versionCode; fall back to semver-ish string compare when codes are missing.
 */
export function isRemoteNewer(
  remote: { version: string; versionCode: number | null },
  installed: { version: string; versionCode: number | null },
): boolean {
  if (remote.versionCode != null && installed.versionCode != null) {
    return remote.versionCode > installed.versionCode;
  }
  return compareSemver(remote.version, installed.version) > 0;
}

function compareSemver(a: string, b: string): number {
  const pa = a.replace(/^v/, "").split(".").map((n) => Number.parseInt(n, 10) || 0);
  const pb = b.replace(/^v/, "").split(".").map((n) => Number.parseInt(n, 10) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i += 1) {
    const da = pa[i] ?? 0;
    const db = pb[i] ?? 0;
    if (da !== db) return da < db ? -1 : 1;
  }
  return 0;
}
