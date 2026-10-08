import { useEffect, useState } from "react";
import {
  APK_LATEST_DOWNLOAD_URL,
  GITHUB_RELEASES_API_URL,
  GITHUB_RELEASES_PAGE_URL,
  apkAssetName,
  isQuickerPodApkAsset,
} from "@/config/site";

export type ApkReleaseStatus = "loading" | "ready" | "missing" | "error";

export interface ApkReleaseInfo {
  status: ApkReleaseStatus;
  downloadUrl: string | null;
  version: string | null;
  releasesPageUrl: string;
  errorMessage: string | null;
}

interface StaticApkLatest {
  version?: string | null;
  versionCode?: number | null;
  tag?: string | null;
  assetName?: string | null;
  downloadUrl?: string | null;
  releasesPageUrl?: string | null;
  publishedAt?: string | null;
}

interface GithubReleaseAsset {
  name: string;
  browser_download_url: string;
  content_type?: string;
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
    // Prefer the installable core asset over the optional -maps build.
    const exact = assets.find((asset) => asset.name === named);
    if (exact) return exact;
  }
  const core = assets.find(
    (asset) =>
      isQuickerPodApkAsset(asset.name) && !asset.name.toLowerCase().includes("-maps"),
  );
  if (core) return core;
  const versioned = assets.find((asset) => isQuickerPodApkAsset(asset.name));
  if (versioned) return versioned;
  return assets.find((asset) => asset.name.toLowerCase().endsWith(".apk"));
}

const INITIAL: ApkReleaseInfo = {
  status: "loading",
  downloadUrl: null,
  version: null,
  releasesPageUrl: GITHUB_RELEASES_PAGE_URL,
  errorMessage: null,
};

function fromStatic(data: StaticApkLatest): ApkReleaseInfo | null {
  if (!data.downloadUrl || !data.version) return null;
  return {
    status: "ready",
    downloadUrl: data.downloadUrl,
    version: data.tag || data.version,
    releasesPageUrl: data.releasesPageUrl || GITHUB_RELEASES_PAGE_URL,
    errorMessage: null,
  };
}

/**
 * Resolves the latest APK for the landing Download CTA.
 * Prefers baked `public/apk-latest.json` (updated by `npm run deploy:app`),
 * then falls back to the GitHub Releases API.
 */
export function useLatestApkRelease(): ApkReleaseInfo {
  const [info, setInfo] = useState<ApkReleaseInfo>(INITIAL);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function loadFromGithub(): Promise<ApkReleaseInfo> {
      const response = await fetch(GITHUB_RELEASES_API_URL, {
        headers: { Accept: "application/vnd.github+json" },
        signal: controller.signal,
      });

      if (response.status === 404) {
        return {
          status: "missing",
          downloadUrl: null,
          version: null,
          releasesPageUrl: GITHUB_RELEASES_PAGE_URL,
          errorMessage: "No GitHub release published yet. Run npm run deploy:app.",
        };
      }

      if (!response.ok) {
        throw new Error(`GitHub API ${response.status}`);
      }

      const release = (await response.json()) as GithubRelease;
      const apk = pickApkAsset(release.assets ?? [], release.tag_name);

      if (!apk) {
        return {
          status: "missing",
          downloadUrl: null,
          version: release.tag_name ?? null,
          releasesPageUrl: release.html_url || GITHUB_RELEASES_PAGE_URL,
          errorMessage: "Latest release has no APK asset yet.",
        };
      }

      return {
        status: "ready",
        downloadUrl: apk.browser_download_url || APK_LATEST_DOWNLOAD_URL,
        version: release.tag_name ?? null,
        releasesPageUrl: release.html_url || GITHUB_RELEASES_PAGE_URL,
        errorMessage: null,
      };
    }

    async function load() {
      try {
        const staticRes = await fetch(`${import.meta.env.BASE_URL}apk-latest.json`, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (staticRes.ok) {
          const staticData = (await staticRes.json()) as StaticApkLatest;
          const fromFile = fromStatic(staticData);
          if (fromFile) {
            if (!cancelled) setInfo(fromFile);
            return;
          }
        }

        const fromApi = await loadFromGithub();
        if (!cancelled) setInfo(fromApi);
      } catch (err) {
        if (cancelled || (err instanceof DOMException && err.name === "AbortError")) return;
        setInfo({
          status: "error",
          downloadUrl: APK_LATEST_DOWNLOAD_URL,
          version: null,
          releasesPageUrl: GITHUB_RELEASES_PAGE_URL,
          errorMessage: err instanceof Error ? err.message : "Failed to load release info.",
        });
      }
    }

    void load();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  return info;
}
