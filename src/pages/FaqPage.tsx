import { Link } from "react-router-dom";
import { usePageMeta } from "@/hooks/usePageMeta";
import {
  SEO_KEYWORDS,
  SITE_NAME,
  SITE_OG_IMAGE,
  SITE_PATHS,
  SITE_URL,
} from "@/config/site";
import { FAQ } from "@/site/content";
import { PageHero, SiteShell } from "@/site/SiteChrome";

const PAGE_DESCRIPTION =
  "FAQ for Quicker-pod: free Tripper Pod APK, SuperTripper alternative, Google Maps mirroring, Play Protect, and Royal Enfield Tripper Pod BLE pairing.";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  name: `${SITE_NAME} FAQ — Tripper Pod & SuperTripper Alternative`,
  description: PAGE_DESCRIPTION,
  url: `${SITE_URL}faq`,
  mainEntity: FAQ.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
};

export function FaqPage() {
  usePageMeta({
    title: `FAQ — Tripper Pod APK & SuperTripper Alternative`,
    description: PAGE_DESCRIPTION,
    path: "faq",
    keywords: SEO_KEYWORDS,
    image: SITE_OG_IMAGE,
    imageAlt: "Quicker-pod FAQ for Tripper Pod riders",
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <SiteShell>
        <PageHero
          eyebrow="Help"
          title="Quicker-pod FAQ"
          description="Answers for Royal Enfield Tripper Pod riders comparing Quicker-pod to SuperTripper, installing the APK, and mirroring Google Maps turns."
        />

        <section className="px-5 py-16 sm:px-8">
          <div className="mx-auto max-w-3xl">
            <dl className="space-y-8">
              {FAQ.map((item) => (
                <div key={item.question} className="border-b border-[#1c242c]/10 pb-8 last:border-0">
                  <dt className="font-display text-lg font-semibold text-[#1c242c] sm:text-xl">
                    {item.question}
                  </dt>
                  <dd className="mt-3 text-sm leading-relaxed text-[#5a6876] sm:text-base">
                    {item.answer}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-12 flex flex-col gap-3 sm:flex-row">
              <Link
                to={`${SITE_PATHS.home}#download`}
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#1c242c] px-7 text-sm font-semibold text-[#f3f7f9] transition-colors hover:bg-[#0f766e]"
              >
                Download APK
              </Link>
              <Link
                to={SITE_PATHS.vsSuperTripper}
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#1c242c]/15 bg-white/50 px-7 text-sm font-semibold text-[#1c242c] transition-colors hover:border-[#0f766e]/40 hover:text-[#0f766e]"
              >
                vs SuperTripper
              </Link>
              <Link
                to={SITE_PATHS.install}
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#1c242c]/15 bg-white/50 px-7 text-sm font-semibold text-[#1c242c] transition-colors hover:border-[#0f766e]/40 hover:text-[#0f766e]"
              >
                Install guide
              </Link>
            </div>
          </div>
        </section>
      </SiteShell>
    </>
  );
}
