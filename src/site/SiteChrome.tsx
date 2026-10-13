import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/brand/Logo";
import {
  GITHUB_RELEASES_PAGE_URL,
  GITHUB_URL,
  SITE_PATHS,
} from "@/config/site";

export function SiteHeader() {
  return (
    <header className="safe-top absolute inset-x-0 top-0 z-40 animate-landing-rise">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
        <Link
          to={SITE_PATHS.home}
          className="flex items-center gap-2.5 font-display text-lg font-bold tracking-tight text-[#1c242c] sm:text-xl"
        >
          <Logo size={36} className="rounded-[28%] shadow-sm ring-1 ring-[#0f766e]/25" />
          <span>
            Quicker<span className="text-[#0f766e]">-pod</span>
          </span>
        </Link>
        <nav aria-label="Site navigation" className="flex items-center gap-3 text-sm font-medium text-[#3d4a57] sm:gap-4">
          <Link to={`${SITE_PATHS.home}#download`} className="hidden transition-colors hover:text-[#0f766e] sm:inline">
            Download
          </Link>
          <Link to={SITE_PATHS.vsSuperTripper} className="hidden transition-colors hover:text-[#0f766e] md:inline">
            vs SuperTripper
          </Link>
          <Link to={SITE_PATHS.install} className="hidden transition-colors hover:text-[#0f766e] sm:inline">
            Install
          </Link>
          <Link to={SITE_PATHS.faq} className="hidden transition-colors hover:text-[#0f766e] sm:inline">
            FAQ
          </Link>
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

export function SiteFooter() {
  return (
    <footer className="border-t border-[#1c242c]/10 bg-[#e8eef2] px-5 py-10 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="flex items-center gap-2 font-display font-bold text-[#1c242c]">
            <Logo size={28} className="rounded-[28%]" />
            <span>
              Quicker<span className="text-[#0f766e]">-pod</span>
            </span>
          </p>
          <p className="mt-1 text-sm text-[#5a6876]">
            Open navigation companion for Royal Enfield Tripper Pod
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-5 text-sm text-[#5a6876]">
          <Link to={`${SITE_PATHS.home}#download`} className="hover:text-[#0f766e]">
            Download
          </Link>
          <Link to={SITE_PATHS.vsSuperTripper} className="hover:text-[#0f766e]">
            vs SuperTripper
          </Link>
          <Link to={SITE_PATHS.install} className="hover:text-[#0f766e]">
            Install
          </Link>
          <Link to={SITE_PATHS.faq} className="hover:text-[#0f766e]">
            FAQ
          </Link>
          <a href={GITHUB_RELEASES_PAGE_URL} className="hover:text-[#0f766e]">
            Releases
          </a>
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="hover:text-[#0f766e]">
            GitHub
          </a>
        </nav>
      </div>
      <p className="mx-auto mt-8 max-w-6xl text-center text-xs text-[#7a8794]">
        © {new Date().getFullYear()} Quicker-pod contributors. Not affiliated with Royal Enfield or
        SuperTripper.
      </p>
    </footer>
  );
}

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-[#eef3f6] font-sans text-[#1c242c]">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description: string;
}) {
  return (
    <section className="relative overflow-hidden border-b border-[#1c242c]/10">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(160deg,#d7e4ec_0%,#eef3f6_42%,#c9d8e2_78%,#a8bdc9_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_10%,rgba(15,118,110,0.18),transparent_50%)]" />
      </div>
      <div className="relative mx-auto max-w-3xl px-5 pb-14 pt-28 sm:px-8 sm:pb-16 sm:pt-32">
        {eyebrow ? (
          <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-[#0f766e]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-[#1c242c] sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-[#4a5866] sm:text-lg">{description}</p>
      </div>
    </section>
  );
}
