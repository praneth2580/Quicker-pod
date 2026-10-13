import { Link } from "react-router-dom";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useLatestApkRelease } from "@/hooks/useLatestApkRelease";
import {
  GITHUB_URL,
  SEO_KEYWORDS,
  SITE_OG_IMAGE,
  SITE_PATHS,
  SITE_URL,
} from "@/config/site";
import { INSTALL_STEPS } from "@/site/content";
import { PageHero, SiteShell } from "@/site/SiteChrome";

const PAGE_DESCRIPTION =
  "Install Quicker-pod on Android: download the free Tripper Pod APK, sideload past Play Protect, enable notification access, and mirror Google Maps turns to your Royal Enfield Tripper Pod.";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "Install Quicker-pod on Android for Tripper Pod",
  description: PAGE_DESCRIPTION,
  url: `${SITE_URL}install`,
  totalTime: "PT5M",
  step: INSTALL_STEPS.map((step, index) => ({
    "@type": "HowToStep",
    position: index + 1,
    name: step.title,
    text: step.body,
  })),
};

export function InstallPage() {
  const apk = useLatestApkRelease();
  const downloadHref = apk.downloadUrl ?? apk.releasesPageUrl;

  usePageMeta({
    title: `Install Quicker-pod — Tripper Pod APK Setup`,
    description: PAGE_DESCRIPTION,
    path: "install",
    keywords: SEO_KEYWORDS,
    image: SITE_OG_IMAGE,
    imageAlt: "Install Quicker-pod Tripper Pod companion APK",
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <SiteShell>
        <PageHero
          eyebrow="Setup"
          title="Install Quicker-pod on Android"
          description="Sideload the free Royal Enfield Tripper Pod companion APK, allow Maps notification access, and ride with turns on the pod."
        />

        <section className="px-5 py-16 sm:px-8">
          <div className="mx-auto max-w-3xl">
            <ol className="space-y-10">
              {INSTALL_STEPS.map((step) => (
                <li key={step.n} className="border-b border-[#1c242c]/10 pb-10 last:border-0 last:pb-0">
                  <p className="font-display text-sm font-bold tracking-[0.2em] text-[#0f766e]">
                    {step.n}
                  </p>
                  <h2 className="mt-3 font-display text-2xl font-semibold text-[#1c242c]">
                    {step.title}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-[#5a6876] sm:text-base">{step.body}</p>
                </li>
              ))}
            </ol>

            <div className="mt-12 rounded-2xl border border-[#1c242c]/10 bg-white/70 p-6 sm:p-8">
              <h2 className="font-display text-xl font-semibold text-[#1c242c]">
                Play Protect / restricted settings
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#5a6876] sm:text-base">
                Quicker-pod reads Google Maps notifications to drive the Tripper Pod. Android may warn
                about sensitive access. Use{" "}
                <code className="text-[#0f766e]">adb install quicker-pod-&lt;version&gt;.apk</code> or
                tap Install anyway, then App info → Allow restricted settings → enable Notification
                access.
              </p>
            </div>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <a
                href={downloadHref}
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#1c242c] px-7 text-sm font-semibold text-[#f3f7f9] transition-colors hover:bg-[#0f766e]"
              >
                {apk.status === "ready"
                  ? `Download APK${apk.version ? ` (${apk.version})` : ""}`
                  : "Open latest release"}
              </a>
              <Link
                to={SITE_PATHS.faq}
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#1c242c]/15 bg-white/50 px-7 text-sm font-semibold text-[#1c242c] transition-colors hover:border-[#0f766e]/40 hover:text-[#0f766e]"
              >
                Read FAQ
              </Link>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#1c242c]/15 bg-white/50 px-7 text-sm font-semibold text-[#1c242c] transition-colors hover:border-[#0f766e]/40 hover:text-[#0f766e]"
              >
                View source
              </a>
            </div>
          </div>
        </section>
      </SiteShell>
    </>
  );
}
