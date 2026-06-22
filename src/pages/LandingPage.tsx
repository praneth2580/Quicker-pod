import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { usePageMeta } from "@/hooks/usePageMeta";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import {
  GITHUB_URL,
  SITE_DESCRIPTION,
  SEO_KEYWORDS,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
} from "@/config/site";

const FEATURES = [
  {
    icon: "◎",
    title: "One-tap BLE connect",
    description: "Scan, filter, and pair with your Tripper Pod directly from Chrome on your phone — no dongles or desktop tools.",
  },
  {
    icon: "⚗",
    title: "Protocol Lab",
    description: "Explore GATT services, monitor live traffic, send HEX packets, run byte mutations, and export full sessions.",
  },
  {
    icon: "📡",
    title: "Live packet monitor",
    description: "Watch every notification and response in real time with timestamps, UUIDs, and copyable HEX payloads.",
  },
  {
    icon: "📲",
    title: "Installable PWA",
    description: "Add to your home screen for a standalone app experience optimized for on-bike testing with Android Chrome.",
  },
  {
    icon: "🔓",
    title: "No account, no fees",
    description: "Open the link and connect. No sign-up walls, subscriptions, or app-store downloads required.",
  },
  {
    icon: "🛡",
    title: "Privacy-first",
    description: "Your BLE data stays on your device. Packet logs and exports are stored locally — nothing sent to our servers.",
  },
] as const;

const COMPARISON = [
  { label: "Cost", official: "Paid / bundled", quicker: "Free forever" },
  { label: "Account required", official: "Often yes", quicker: "Never" },
  { label: "Open source", official: "No", quicker: "Yes — MIT" },
  { label: "Protocol debugging", official: "No", quicker: "Full BLE workbench" },
  { label: "Works in browser", official: "App store only", quicker: "PWA — install optional" },
  { label: "Community-driven", official: "Vendor-controlled", quicker: "GitHub contributions welcome" },
] as const;

const STEPS = [
  {
    step: "1",
    title: "Open in Chrome",
    description: "Visit Quicker-pod on Android Chrome or desktop Chromium over HTTPS. No install required to start.",
  },
  {
    step: "2",
    title: "Connect your Pod",
    description: "Tap Connect, scan for BLE devices, and pair with your Royal Enfield Tripper Pod in seconds.",
  },
  {
    step: "3",
    title: "Explore & diagnose",
    description: "Use the Dashboard and Protocol Lab to monitor traffic, send packets, and understand the Tripper protocol.",
  },
] as const;

const FAQ = [
  {
    question: "Is Quicker-pod really free?",
    answer:
      "Yes. Quicker-pod is 100% free and open source. There are no subscriptions, in-app purchases, or hidden fees. It runs in your browser and can be installed as a PWA at no cost.",
  },
  {
    question: "How is this different from the official Tripper Pod app?",
    answer:
      "The official app focuses on navigation for everyday riders. Quicker-pod is built for protocol exploration and BLE diagnostics — a community tool to reverse-engineer the Tripper Pod and eventually offer a fully open navigation alternative. It is easier to access (just a link), requires no account, and gives you full visibility into Bluetooth traffic.",
  },
  {
    question: "What browsers are supported?",
    answer:
      "The app UI works in all modern browsers. Real Bluetooth connection requires Chrome on Android or desktop (Web Bluetooth). Firefox and Safari do not support Web Bluetooth yet. Install as a PWA on Android Chrome or iOS Safari 16.4+.",
  },
  {
    question: "Is it safe to send packets to my Tripper Pod?",
    answer:
      "Quicker-pod never sends packets automatically. Every transmission requires your explicit action. Mutation tools are rate-limited and stop on disconnect or error. Use at your own discretion when experimenting with hardware.",
  },
  {
    question: "Does it work offline?",
    answer:
      "Once installed as a PWA, the app shell works offline. BLE scanning and connection still require an active Bluetooth link to your Tripper Pod.",
  },
  {
    question: "Can I contribute or report protocol findings?",
    answer:
      "Absolutely. Quicker-pod is community-driven. Open an issue or pull request on GitHub with packet captures, UUID mappings, or feature ideas.",
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
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "SoftwareApplication",
      name: SITE_NAME,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Web, Android, iOS",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description: SITE_DESCRIPTION,
      url: SITE_URL,
      downloadUrl: SITE_URL,
      screenshot: `${SITE_URL}screenshots/mobile-narrow.png`,
      featureList: FEATURES.map((f) => f.title).join(", "),
      author: { "@type": "Organization", name: "Quicker-pod Contributors", url: GITHUB_URL },
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
    <header className="safe-top sticky top-0 z-40 border-b border-white/10 bg-surface/90 backdrop-blur-glass">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link to="/" className="min-w-0">
          <p className="text-lg font-bold tracking-tight sm:text-xl">
            <span className="text-accent">Quicker</span>-pod
          </p>
          <p className="truncate text-[0.65rem] text-gray-500 sm:text-xs">{SITE_TAGLINE}</p>
        </Link>
        <nav aria-label="Landing navigation" className="flex items-center gap-2 sm:gap-3">
          <a
            href="#features"
            className="hidden rounded-lg px-3 py-2 text-sm text-gray-400 transition-colors hover:text-white sm:inline-block"
          >
            Features
          </a>
          <a
            href="#faq"
            className="hidden rounded-lg px-3 py-2 text-sm text-gray-400 transition-colors hover:text-white sm:inline-block"
          >
            FAQ
          </a>
          <Link to="/dashboard">
            <Button className="!min-h-10 !px-4 !py-2 text-sm">Open app</Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}

function HeroSection({ onInstall }: { onInstall: () => void }) {
  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-14">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(34,211,238,0.12)_0%,_transparent_55%)]"
      />
      <div className="relative mx-auto max-w-5xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
          <span aria-hidden>✦</span>
          Free &amp; open-source alternative
        </div>

        <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
          A simpler, <span className="text-accent">free</span> way to work with your Tripper Pod
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-relaxed text-gray-300 sm:text-lg">
          Skip the app-store hassle and paid lock-ins. Quicker-pod connects to your Royal Enfield
          Tripper Pod over Bluetooth, right in your browser — with a full protocol lab for riders,
          tinkerers, and developers.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link to="/connect" className="sm:w-auto">
            <Button fullWidth className="sm:!w-auto sm:px-8">
              Connect your Pod
            </Button>
          </Link>
          <Link to="/dashboard" className="sm:w-auto">
            <Button fullWidth variant="secondary" className="sm:!w-auto sm:px-8">
              Go to dashboard
            </Button>
          </Link>
          <button
            type="button"
            onClick={onInstall}
            className="text-sm text-gray-400 underline-offset-4 transition-colors hover:text-accent hover:underline"
          >
            Install as app →
          </button>
        </div>

        <ul className="mt-10 flex flex-wrap gap-2" aria-label="Highlights">
          {["100% free", "No account", "Open source", "Privacy-first", "PWA installable"].map(
            (tag) => (
              <li
                key={tag}
                className="rounded-full border border-white/10 bg-surface-raised px-3 py-1 text-xs text-gray-300"
              >
                {tag}
              </li>
            ),
          )}
        </ul>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="border-t border-white/10 px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl font-bold sm:text-3xl">Everything you need to explore your Pod</h2>
        <p className="mt-3 max-w-2xl text-gray-400">
          Built for real hardware testing — not just a pretty UI. From first connection to packet
          export, Quicker-pod keeps BLE work approachable.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-white/10 bg-surface-raised/80 p-5 shadow-card transition-colors hover:border-accent/20"
            >
              <span
                aria-hidden
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-lg"
              >
                {feature.icon}
              </span>
              <h3 className="mt-4 font-semibold text-white">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-400">{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ComparisonSection() {
  return (
    <section className="border-t border-white/10 px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl font-bold sm:text-3xl">Why riders choose Quicker-pod</h2>
        <p className="mt-3 max-w-2xl text-gray-400">
          Official Tripper apps work for navigation. Quicker-pod is the free, transparent alternative
          when you want control, diagnostics, and a path to community-built navigation.
        </p>

        <div className="mt-8 overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-surface-raised">
                <th scope="col" className="px-4 py-3 font-medium text-gray-400">
                  Feature
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-gray-400">
                  Typical official app
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-accent">
                  Quicker-pod
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row) => (
                <tr key={row.label} className="border-b border-white/5 last:border-0">
                  <th scope="row" className="px-4 py-3 font-medium text-white">
                    {row.label}
                  </th>
                  <td className="px-4 py-3 text-gray-400">{row.official}</td>
                  <td className="px-4 py-3 font-medium text-success">{row.quicker}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function StepsSection() {
  return (
    <section className="border-t border-white/10 px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl font-bold sm:text-3xl">Get started in three steps</h2>
        <ol className="mt-10 grid gap-6 sm:grid-cols-3">
          {STEPS.map((item) => (
            <li
              key={item.step}
              className="rounded-2xl border border-white/10 bg-surface-raised/60 p-5"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20 text-sm font-bold text-accent">
                {item.step}
              </span>
              <h3 className="mt-4 font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-400">{item.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function FaqSection() {
  return (
    <section id="faq" className="border-t border-white/10 px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-2xl font-bold sm:text-3xl">Frequently asked questions</h2>
        <p className="mt-3 text-gray-400">
          Common questions about using Quicker-pod as a free Tripper Pod companion.
        </p>

        <dl className="mt-10 space-y-4">
          {FAQ.map((item) => (
            <div
              key={item.question}
              className="rounded-2xl border border-white/10 bg-surface-raised/60 p-5"
            >
              <dt className="font-semibold text-white">{item.question}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-gray-400">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function CtaSection({ onInstall }: { onInstall: () => void }) {
  return (
    <section className="border-t border-white/10 px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-3xl rounded-3xl border border-accent/30 bg-accent/5 p-8 text-center shadow-glow sm:p-12">
        <h2 className="text-2xl font-bold sm:text-3xl">Ready to try the free alternative?</h2>
        <p className="mx-auto mt-3 max-w-xl text-gray-300">
          Open Quicker-pod in Chrome, connect your Tripper Pod, and start exploring — no download
          queue, no sign-up form.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/connect">
            <Button className="sm:px-8">Start now — it&apos;s free</Button>
          </Link>
          <Button variant="secondary" className="sm:px-8" onClick={onInstall}>
            Install on home screen
          </Button>
        </div>
      </div>
    </section>
  );
}

function LandingFooter() {
  return (
    <footer className="border-t border-white/10 px-4 py-10 sm:px-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold">
            <span className="text-accent">Quicker</span>-pod
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Open-source BLE explorer for Royal Enfield Tripper Pod
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-4 text-sm text-gray-400">
          <Link to="/dashboard" className="hover:text-white">
            Dashboard
          </Link>
          <Link to="/protocol-lab" className="hover:text-white">
            Protocol Lab
          </Link>
          <Link to="/settings" className="hover:text-white">
            Settings
          </Link>
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white">
            GitHub
          </a>
        </nav>
      </div>
      <p className="mx-auto mt-8 max-w-5xl text-center text-xs text-gray-600">
        © {new Date().getFullYear()} Quicker-pod contributors. Not affiliated with Royal Enfield.
      </p>
    </footer>
  );
}

export function LandingPage() {
  const { promptInstall } = usePwaInstall();

  usePageMeta({
    title: `${SITE_NAME} — Free Open-Source Tripper Pod App Alternative`,
    description: SITE_DESCRIPTION,
    path: "",
    keywords: SEO_KEYWORDS,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="min-h-[100dvh] bg-surface text-white">
        <LandingHeader />
        <main>
          <HeroSection onInstall={() => void promptInstall()} />
          <FeaturesSection />
          <ComparisonSection />
          <StepsSection />
          <FaqSection />
          <CtaSection onInstall={() => void promptInstall()} />
        </main>
        <LandingFooter />
      </div>
    </>
  );
}
