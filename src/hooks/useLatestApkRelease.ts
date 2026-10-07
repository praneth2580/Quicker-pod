import { useEffect, useState } from "react";
import {
  APK_ASSET_NAME,
  APK_LATEST_DOWNLOAD_URL,
  GITHUB_RELEASES_API_URL,
  GITHUB_RELEASES_PAGE_URL,
} from "@/config/site";

export type ApkReleaseStatus = "loading" | "ready" | "missing" | "error";

export interface ApkReleaseInfo {
  status: ApkReleaseStatus;
  downloadUrl: string | null;
  version: string | null;
  releasesPageUrl: string;
  errorMessage: string | null;
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

function pickApkAsset(assets: GithubReleaseAsset[]): GithubReleaseAsset | undefined {
  const exact = assets.find((asset) => asset.name === APK_ASSET_NAME);
  if (exact) return exact;
  return assets.find((asset) => asset.name.toLowerCase().endsWith(".apk"));
}

const INITIAL: ApkReleaseInfo = {
  status: "loading",
  downloadUrl: null,
  version: null,
  releasesPageUrl: GITHUB_RELEASES_PAGE_URL,
  errorMessage: null,
};

/**
 * Resolves the latest GitHub Release APK for the landing Download CTA.
 * Prefers the stable asset name `quicker-pod.apk`, then any `.apk` asset.
 */
export function useLatestApkRelease(): ApkReleaseInfo {
  const [info, setInfo] = useState<ApkReleaseInfo>(INITIAL);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function load() {
      try {
        const response = await fetch(GITHUB_RELEASES_API_URL, {
          headers: { Accept: "application/vnd.github+json" },
          signal: controller.signal,
        });

        if (response.status === 404) {
          if (!cancelled) {
            setInfo({
              status: "missing",
              downloadUrl: null,
              version: null,
              releasesPageUrl: GITHUB_RELEASES_PAGE_URL,
              errorMessage: "No GitHub release published yet.",
            });
          }
          return;
        }

        if (!response.ok) {
          throw new Error(`GitHub API ${response.status}`);
        }

        const release = (await response.json()) as GithubRelease;
        const apk = pickApkAsset(release.assets ?? []);

        if (!cancelled) {
          if (!apk) {
            setInfo({
              status: "missing",
              downloadUrl: null,
              version: release.tag_name ?? null,
              releasesPageUrl: release.html_url || GITHUB_RELEASES_PAGE_URL,
              errorMessage: "Latest release has no APK asset yet.",
            });
            return;
          }

          setInfo({
            status: "ready",
            downloadUrl: apk.browser_download_url || APK_LATEST_DOWNLOAD_URL,
            version: release.tag_name ?? null,
            releasesPageUrl: release.html_url || GITHUB_RELEASES_PAGE_URL,
            errorMessage: null,
          });
        }
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
