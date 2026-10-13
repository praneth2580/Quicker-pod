import { Link } from "react-router-dom";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useLatestApkRelease } from "@/hooks/useLatestApkRelease";
import {
  GITHUB_URL,
  SEO_KEYWORDS,
  SITE_NAME,
  SITE_OG_IMAGE,
  SITE_PATHS,
  SITE_URL,
} from "@/config/site";
import { COMPARISON_ROWS } from "@/site/content";
import { PageHero, SiteShell } from "@/site/SiteChrome";

const PAGE_DESCRIPTION =
  "Compare Quicker-pod with SuperTripper / Super TripperPod for Royal Enfield Tripper Pod: free open-source APK, Google Maps turn mirroring, and BLE pairing without an account wall.";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: `${SITE_NAME} vs SuperTripper — Tripper Pod Alternative`,
  description: PAGE_DESCRIPTION,
  url: `${SITE_URL}vs-supertripper`,
  about: [
    { "@type": "SoftwareApplication", name: SITE_NAME },
    { "@type": "SoftwareApplication", name: "SuperTripper" },
    { "@type": "Product", name: "Royal Enfield Tripper Pod" },
  ],
  isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
};

export function VsSuperTripperPage() {
  const apk = useLatestApkRelease();
  const downloadHref = apk.downloadUrl ?? apk.releasesPageUrl;

  usePageMeta({
    title: `${SITE_NAME} vs SuperTripper — Free Tripper Pod Alternative`,
    description: PAGE_DESCRIPTION,
    path: "vs-supertripper",
    keywords: SEO_KEYWORDS,
    image: SITE_OG_IMAGE,
    imageAlt: "Quicker-pod as a SuperTripper alternative for Tripper Pod",
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <SiteShell>
        <PageHero
          eyebrow="Comparison"
          title="Quicker-pod vs SuperTripper"
          description="Looking for a SuperTripper or Super TripperPod alternative for your Royal Enfield Tripper Pod? Quicker-pod is a free, open-source Android companion with Google Maps turn mirroring."
        />

        <section className="px-5 py-16 sm:px-8">
          <div className="mx-auto max-w-4xl">
            <p className="text-sm leading-relaxed text-[#5a6876] sm:text-base">
              SuperTripper (package <code className="text-[#0f766e]">com.supertripper.app</code>) is a
              popular third-party bridge for Tripper Pod. Quicker-pod targets the same{" "}
              <strong className="font-semibold text-[#1c242c]">RE_DISP</strong> hardware path with an
              inspectable codebase and sideloadable APKs from GitHub — useful if you want Maps turns on
              the pod without a closed-source app.
            </p>

            <div className="mt-10 overflow-x-auto rounded-2xl border border-[#1c242c]/10 bg-white/70">
              <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
                <caption className="sr-only">
                  Feature comparison between Quicker-pod and SuperTripper for Tripper Pod
                </caption>
                <thead>
                  <tr className="border-b border-[#1c242c]/10 bg-[#f3f7f9]">
                    <th scope="col" className="px-4 py-3 font-display font-semibold text-[#1c242c]">
                      Feature
                    </th>
                    <th scope="col" className="px-4 py-3 font-display font-semibold text-[#0f766e]">
                      Quicker-pod
                    </th>
                    <th scope="col" className="px-4 py-3 font-display font-semibold text-[#1c242c]">
                      SuperTripper
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row) => (
                    <tr key={row.label} className="border-b border-[#1c242c]/8 last:border-0">
                      <th scope="row" className="px-4 py-3 font-medium text-[#1c242c]">
                        {row.label}
                      </th>
                      <td className="px-4 py-3 text-[#3d4a57]">{row.quicker}</td>
                      <td className="px-4 py-3 text-[#5a6876]">{row.superTripper}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-12 space-y-4 text-sm leading-relaxed text-[#5a6876] sm:text-base">
              <h2 className="font-display text-2xl font-bold tracking-tight text-[#1c242c]">
                Why riders search for a SuperTripper alternative
              </h2>
              <p>
                Many Royal Enfield Tripper Pod owners want Google Maps turn-by-turn on the handlebar
                display without relying on a single closed app. Quicker-pod ships as a free Tripper Pod
                navigation APK you can verify against source — BLE pairing, PIN handshake, and Maps
                notification mirroring included.
              </p>
              <p>
                Quicker-pod is <strong className="font-semibold text-[#1c242c]">not affiliated</strong>{" "}
                with Royal Enfield or SuperTripper. Feature availability on either app can change;
                always test pairing on your own hardware.
              </p>
            </div>

            <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href={downloadHref}
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#1c242c] px-7 text-sm font-semibold text-[#f3f7f9] transition-colors hover:bg-[#0f766e]"
              >
                Download Quicker-pod APK
              </a>
              <Link
                to={SITE_PATHS.install}
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#1c242c]/15 bg-white/50 px-7 text-sm font-semibold text-[#1c242c] transition-colors hover:border-[#0f766e]/40 hover:text-[#0f766e]"
              >
                Install guide
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
