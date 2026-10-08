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
  APK_LATEST_DOWNLOAD_URL,
  GITHUB_RELEASES_PAGE_URL,
} from "@/config/site";

const WHY = [
  {
    title: "Pair like the official app",
    description:
      "Android hosts the phone-side GATT server so PIN auth and handshake work with real Tripper hardware.",
  },
  {
    title: "Maps turns on the pod",
    description:
      "Optional maps APK mirrors Google Maps notifications into Tripper turn packets — or send turns manually from Navigate.",
  },
  {
    title: "Open and free",
    description:
      "No account wall, no store fee. Every APK ships from GitHub Releases so you can verify build and source together.",
  },
] as const;

const INSTALL_STEPS = [
  {
    n: "01",
    title: "Download the APK",
    body: "Use Download APK above for the core build (quicker-pod-<version>.apk). It installs without the Play Protect “sensitive data” block.",
  },
  {
    n: "02",
    title: "Allow install",
    body: "Enable install from this source on Android, then open the file to install Quicker Pod.",
  },
  {
    n: "03",
    title: "Pair & navigate",
    body: "Connect your Tripper. Use Manual guidance, or install the optional -maps APK from the same Release for automatic Maps mirroring.",
  },
] as const;

const FAQ = [
  {
    question: "Why download an APK instead of using the website?",
    answer:
      "Full Tripper pairing needs the phone to act as a BLE GATT server. Browsers cannot do that. The Android APK can.",
  },
  {
    question: "Play Protect says the app can access sensitive data — what do I do?",
    answer:
      "Download the core APK from this page (not the -maps file). Core omits notification access so Play Protect allows browser installs. Pairing and manual nav work. The optional -maps APK adds Maps mirroring and may need adb install or Install anyway.",
  },
  {
    question: "Does it work with Google Maps?",
    answer:
      "Yes. Install the optional quicker-pod-<version>-maps.apk from GitHub Releases, enable notification access, connect your Tripper, then start Maps turn-by-turn. Or use Manual guidance on the core APK.",
  },
  {
    question: "Is the APK signed for Play Store?",
    answer:
      "Community builds are signed for sideloading from GitHub Releases. Enable install from unknown sources. You can always build from source.",
  },
  {
    question: "How do new APKs get published?",
    answer:
      "Maintainers run npm run deploy:app. That asks major/minor, builds the APK, uploads it to a GitHub Release, and refreshes the landing download link.",
  },
] as const;

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

function LandingHeader() {
  return (
    <header className="safe-top absolute inset-x-0 top-0 z-40 animate-landing-rise">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
        <a
          href="#top"
          className="flex items-center gap-2.5 font-display text-lg font-bold tracking-tight text-[#1c242c] sm:text-xl"
        >
          <img
            src={`${import.meta.env.BASE_URL}icon.svg`}
            alt=""
            width={36}
            height={36}
            className="h-9 w-9 rounded-xl shadow-sm ring-1 ring-[#0f766e]/25"
          />
          <span>
            Quicker<span className="text-[#0f766e]">-pod</span>
          </span>
        </a>
        <nav aria-label="Landing navigation" className="flex items-center gap-4 text-sm font-medium text-[#3d4a57]">
          <a href="#download" className="hidden transition-colors hover:text-[#0f766e] sm:inline">
            Download
          </a>
          <a href="#faq" className="hidden transition-colors hover:text-[#0f766e] sm:inline">
            FAQ
          </a>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-[#0f766e]"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}

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
          <p className="animate-landing-rise font-display text-5xl font-extrabold leading-[0.95] tracking-tight text-[#1c242c] sm:text-6xl lg:text-7xl">
            Quicker
            <span className="text-[#0f766e]">-pod</span>
          </p>
          <h1
            className="animate-landing-rise mt-5 max-w-lg font-display text-2xl font-semibold leading-snug tracking-tight text-[#24303a] sm:text-3xl"
            style={{ animationDelay: "120ms" }}
          >
            Navigation for your Tripper — open, sideloadable, free.
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
              alt="Quicker-pod navigation companion on a phone"
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
          Built for the ride
        </h2>
        <p className="mt-3 max-w-2xl text-[#5a6876]">
          Android for pairing and live guidance. GitHub for every release you can trust.
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
          Sideload from GitHub Releases — the same APK the Download button targets.
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
          {FAQ.map((item) => (
            <div key={item.question}>
              <dt className="font-display text-lg font-semibold text-[#1c242c]">{item.question}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-[#5a6876]">{item.answer}</dd>
            </div>
          ))}
        </dl>
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

function LandingFooter() {
  return (
    <footer className="border-t border-[#1c242c]/10 bg-[#e8eef2] px-5 py-10 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="flex items-center gap-2 font-display font-bold text-[#1c242c]">
            <img
              src={`${import.meta.env.BASE_URL}icon.svg`}
              alt=""
              width={28}
              height={28}
              className="h-7 w-7 rounded-lg"
            />
            <span>
              Quicker<span className="text-[#0f766e]">-pod</span>
            </span>
          </p>
          <p className="mt-1 text-sm text-[#5a6876]">Open navigation companion for Tripper Pod</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-5 text-sm text-[#5a6876]">
          <a href={GITHUB_RELEASES_PAGE_URL} className="hover:text-[#0f766e]">
            Releases
          </a>
          <a href="#download" className="hover:text-[#0f766e]">
            Download
          </a>
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="hover:text-[#0f766e]">
            GitHub
          </a>
        </nav>
      </div>
      <p className="mx-auto mt-8 max-w-6xl text-center text-xs text-[#7a8794]">
        © {new Date().getFullYear()} Quicker-pod contributors. Not affiliated with Royal Enfield.
      </p>
    </footer>
  );
}

export function LandingPage() {
  const apk = useLatestApkRelease();

  usePageMeta({
    title: `${SITE_NAME} — Free Tripper Pod Navigation APK`,
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
        <LandingHeader />
        <main>
          <HeroSection apk={apk} />
          <WhySection />
          <StepsSection />
          <FaqSection />
          <ClosingCta apk={apk} />
        </main>
        <LandingFooter />
      </div>
    </>
  );
}
