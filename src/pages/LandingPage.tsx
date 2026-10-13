import { Link } from "react-router-dom";
import { Logo } from "@/components/brand/Logo";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useLatestApkRelease } from "@/hooks/useLatestApkRelease";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import {
  GITHUB_URL,
  SITE_DESCRIPTION,
  SEO_KEYWORDS,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
  SITE_OG_IMAGE,
  SITE_PATHS,
  APK_LATEST_DOWNLOAD_URL,
} from "@/config/site";
import { COMPARISON_ROWS, FAQ, INSTALL_STEPS, WHY } from "@/site/content";
import { SiteFooter, SiteHeader } from "@/site/SiteChrome";

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      publisher: { "@type": "Organization", name: "Quicker-pod Contributors", url: GITHUB_URL },
    },
    {
      "@type": "SoftwareApplication",
      name: SITE_NAME,
      applicationCategory: "NavigationApplication",
      operatingSystem: "Android",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description: SITE_DESCRIPTION,
      url: SITE_URL,
      downloadUrl: APK_LATEST_DOWNLOAD_URL,
      installUrl: APK_LATEST_DOWNLOAD_URL,
      screenshot: [SITE_OG_IMAGE, `${SITE_URL}screenshots/mobile-narrow.png`],
      image: SITE_OG_IMAGE,
      author: { "@type": "Organization", name: "Quicker-pod Contributors", url: GITHUB_URL },
      isAccessibleForFree: true,
      keywords: SEO_KEYWORDS,
    },
    {
      "@type": "HowTo",
      name: "Install Quicker-pod on Android",
      description: "Sideload the Tripper Pod companion APK and pair your motorcycle display.",
      totalTime: "PT5M",
      step: INSTALL_STEPS.map((step, index) => ({
        "@type": "HowToStep",
        position: index + 1,
        name: step.title,
        text: step.body,
      })),
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQ.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    },
  ],
};

function DownloadCta({
  status,
  downloadUrl,
  version,
  releasesPageUrl,
  errorMessage,
}: {
  status: string;
  downloadUrl: string | null;
  version: string | null;
  releasesPageUrl: string;
  errorMessage: string | null;
}) {
  const href = downloadUrl ?? releasesPageUrl;
  const disabled = status === "loading";
  const label =
    status === "loading"
      ? "Checking latest release…"
      : status === "ready"
        ? `Download APK${version ? ` (${version})` : ""}`
        : status === "missing"
          ? "Releases — APK coming soon"
          : "Download APK (try direct link)";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <a
        id="download"
        href={disabled ? undefined : href}
        aria-disabled={disabled}
        onClick={(e) => {
          if (disabled) e.preventDefault();
        }}
        className={`group relative inline-flex min-h-12 overflow-hidden items-center justify-center rounded-xl px-7 text-sm font-semibold transition-transform ${
          disabled
            ? "cursor-wait bg-[#1c242c]/45 text-white"
            : "bg-[#1c242c] text-[#f3f7f9] hover:bg-[#0f766e] active:scale-[0.98]"
        }`}
      >
        {!disabled && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-landing-sheen"
          />
        )}
        <span className="relative">{label}</span>
      </a>
      <a
        href={GITHUB_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#1c242c]/15 bg-white/50 px-7 text-sm font-semibold text-[#1c242c] backdrop-blur-sm transition-colors hover:border-[#0f766e]/40 hover:text-[#0f766e]"
      >
        View source
      </a>
      {(status === "missing" || status === "error") && (
        <p className="text-sm text-[#5a6876] sm:max-w-xs">
          {errorMessage ?? "No APK on the latest release yet."}{" "}
          <a href={releasesPageUrl} className="underline underline-offset-2 hover:text-[#0f766e]">
            View releases
          </a>
        </p>
      )}
    </div>
  );
}

function HeroSection({
  apk,
}: {
  apk: ReturnType<typeof useLatestApkRelease>;
}) {
  return (
    <section className="relative min-h-[100dvh] overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(160deg,#d7e4ec_0%,#eef3f6_42%,#c9d8e2_78%,#a8bdc9_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_10%,rgba(15,118,110,0.18),transparent_50%)]" />
        <div className="landing-mesh absolute -left-[20%] top-[10%] h-[70vmin] w-[70vmin] animate-landing-drift rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.22),transparent_70%)] blur-2xl" />
        <div className="absolute -right-[15%] bottom-[5%] h-[55vmin] w-[55vmin] animate-landing-drift-alt rounded-full bg-[radial-gradient(circle,rgba(15,118,110,0.2),transparent_70%)] blur-2xl" />
        <div
          className="absolute inset-0 opacity-[0.28] animate-landing-hatch"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg stroke='%231c242c' stroke-opacity='0.07' stroke-width='1'%3E%3Cpath d='M0 30h60M30 0v60'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
      </div>

      <div className="relative mx-auto grid min-h-[100dvh] max-w-6xl items-end gap-10 px-5 pb-10 pt-28 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pb-16 lg:pt-24">
        <div className="max-w-xl">
          <div className="animate-landing-rise mb-6">
            <Logo
              size={88}
              className="rounded-[28%] shadow-[0_16px_40px_-18px_rgba(15,118,110,0.55)] ring-1 ring-[#0f766e]/30"
              title="Quicker-pod"
            />
          </div>
          <p className="animate-landing-rise font-display text-5xl font-extrabold leading-[0.95] tracking-tight text-[#1c242c] sm:text-6xl lg:text-7xl">
            Quicker
            <span className="text-[#0f766e]">-pod</span>
          </p>
          <h1
            className="animate-landing-rise mt-5 max-w-lg font-display text-2xl font-semibold leading-snug tracking-tight text-[#24303a] sm:text-3xl"
            style={{ animationDelay: "120ms" }}
          >
            Free Tripper Pod navigation — open SuperTripper alternative.
          </h1>
          <p
            className="animate-landing-rise mt-4 max-w-md text-base leading-relaxed text-[#4a5866] sm:text-lg"
            style={{ animationDelay: "220ms" }}
          >
            {SITE_TAGLINE}. Download the Android APK for BLE pairing and Maps turn mirroring on the
            pod.
          </p>
          <div className="animate-landing-rise mt-8" style={{ animationDelay: "320ms" }}>
            <DownloadCta {...apk} />
          </div>
        </div>

        <div
          className="animate-landing-rise relative mx-auto w-full max-w-sm lg:max-w-none"
          style={{ animationDelay: "200ms" }}
        >
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#0f766e]/25 animate-nav-pulse-ring" />
          <div className="animate-landing-float relative">
            <img
              src={`${import.meta.env.BASE_URL}screenshots/mobile-narrow.png`}
              alt="Quicker-pod navigation companion for Royal Enfield Tripper Pod on Android"
              width={390}
              height={844}
              className="mx-auto max-h-[min(62vh,640px)] w-auto rounded-[1.75rem] border border-[#1c242c]/10 object-cover object-top shadow-[0_28px_60px_-28px_rgba(28,36,44,0.55)]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function WhySection() {
  const ref = useScrollReveal<HTMLElement>();
  return (
    <section
      ref={ref}
      className="landing-reveal border-t border-[#1c242c]/10 bg-[#f3f7f9] px-5 py-20 sm:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <h2 className="font-display text-3xl font-bold tracking-tight text-[#1c242c] sm:text-4xl">
          Built for the Royal Enfield Tripper Pod
        </h2>
        <p className="mt-3 max-w-2xl text-[#5a6876]">
          Android for pairing and live Google Maps guidance. GitHub for every release you can trust.
        </p>
        <ul className="landing-reveal-stagger mt-12 grid gap-10 sm:grid-cols-3">
          {WHY.map((item) => (
            <li key={item.title}>
              <h3 className="font-display text-xl font-semibold text-[#1c242c]">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#5a6876]">{item.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ComparisonTeaser() {
  const ref = useScrollReveal<HTMLElement>();
  const preview = COMPARISON_ROWS.slice(0, 4);
  return (
    <section
      ref={ref}
      className="landing-reveal border-t border-[#1c242c]/10 bg-[#eef3f6] px-5 py-20 sm:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <h2 className="font-display text-3xl font-bold tracking-tight text-[#1c242c] sm:text-4xl">
          A free SuperTripper alternative
        </h2>
        <p className="mt-3 max-w-2xl text-[#5a6876]">
          Open-source companion for the same Tripper Pod hardware path — Maps turns on the pod without
          a closed-source app.
        </p>
        <div className="mt-10 overflow-x-auto rounded-2xl border border-[#1c242c]/10 bg-white/70">
          <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
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
              {preview.map((row) => (
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
        <Link
          to={SITE_PATHS.vsSuperTripper}
          className="mt-8 inline-flex text-sm font-semibold text-[#0f766e] underline-offset-4 hover:underline"
        >
          Full Quicker-pod vs SuperTripper comparison →
        </Link>
      </div>
    </section>
  );
}

function StepsSection() {
  const ref = useScrollReveal<HTMLElement>();
  return (
    <section
      ref={ref}
      className="landing-reveal border-t border-[#1c242c]/10 bg-[#e8eef2] px-5 py-20 sm:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <h2 className="font-display text-3xl font-bold tracking-tight text-[#1c242c] sm:text-4xl">
          Install in three moves
        </h2>
        <p className="mt-3 max-w-xl text-[#5a6876]">
          Sideload from GitHub Releases — the same APK the Download button targets.{" "}
          <Link to={SITE_PATHS.install} className="font-medium text-[#0f766e] underline-offset-2 hover:underline">
            Full install guide
          </Link>
        </p>
        <ol className="landing-reveal-stagger mt-12 grid gap-8 sm:grid-cols-3">
          {INSTALL_STEPS.map((step) => (
            <li key={step.n}>
              <p className="font-display text-sm font-bold tracking-[0.2em] text-[#0f766e]">{step.n}</p>
              <h3 className="mt-3 font-display text-xl font-semibold text-[#1c242c]">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#5a6876]">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function FaqSection() {
  const ref = useScrollReveal<HTMLElement>();
  const preview = FAQ.slice(0, 5);
  return (
    <section
      id="faq"
      ref={ref}
      className="landing-reveal border-t border-[#1c242c]/10 bg-[#f3f7f9] px-5 py-20 sm:px-8"
    >
      <div className="mx-auto max-w-3xl">
        <h2 className="font-display text-3xl font-bold tracking-tight text-[#1c242c] sm:text-4xl">
          Questions
        </h2>
        <dl className="mt-10 space-y-8">
          {preview.map((item) => (
            <div key={item.question}>
              <dt className="font-display text-lg font-semibold text-[#1c242c]">{item.question}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-[#5a6876]">{item.answer}</dd>
            </div>
          ))}
        </dl>
        <Link
          to={SITE_PATHS.faq}
          className="mt-8 inline-flex text-sm font-semibold text-[#0f766e] underline-offset-4 hover:underline"
        >
          See all FAQ answers →
        </Link>
      </div>
    </section>
  );
}

function ClosingCta({ apk }: { apk: ReturnType<typeof useLatestApkRelease> }) {
  const ref = useScrollReveal<HTMLElement>();
  const href = apk.downloadUrl ?? apk.releasesPageUrl;
  return (
    <section
      ref={ref}
      className="landing-reveal relative overflow-hidden border-t border-[#1c242c]/10 px-5 py-24 sm:px-8"
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(135deg,#1c242c_0%,#24353a_55%,#0f766e_120%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 top-0 h-48 w-48 animate-landing-drift rounded-full bg-[radial-gradient(circle,rgba(243,247,249,0.12),transparent_70%)]"
      />
      <div className="relative mx-auto max-w-3xl text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight text-[#f3f7f9] sm:text-4xl">
          Get the APK. Pair your Pod. Ride.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[#b7c4ce]">
          Latest builds live on GitHub Releases as{" "}
          <code className="text-[#e8f5f3]">quicker-pod-&lt;version&gt;.apk</code>.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href={href}
            className="group relative inline-flex min-h-12 overflow-hidden items-center justify-center rounded-xl bg-[#f3f7f9] px-8 text-sm font-semibold text-[#1c242c] transition-colors hover:bg-white"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-[#0f766e]/20 to-transparent animate-landing-sheen"
            />
            <span className="relative">
              {apk.status === "ready" ? "Download APK" : "Open latest release"}
            </span>
          </a>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/25 px-8 text-sm font-semibold text-[#f3f7f9] transition-colors hover:border-white/50"
          >
            View source
          </a>
        </div>
      </div>
    </section>
  );
}

export function LandingPage() {
  const apk = useLatestApkRelease();

  usePageMeta({
    title: `${SITE_NAME} — Free Tripper Pod APK & SuperTripper Alternative`,
    description: SITE_DESCRIPTION,
    path: "",
    keywords: SEO_KEYWORDS,
    image: SITE_OG_IMAGE,
    imageAlt: "Quicker-pod navigation companion on Android",
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div id="top" className="min-h-[100dvh] bg-[#eef3f6] font-sans text-[#1c242c]">
        <SiteHeader />
        <main>
          <HeroSection apk={apk} />
          <WhySection />
          <ComparisonTeaser />
          <StepsSection />
          <FaqSection />
          <ClosingCta apk={apk} />
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
