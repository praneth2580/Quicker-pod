import type { ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";
import { BottomNav } from "@/components/layout/BottomNav";
import { InstallIconButton, InstallPrompt } from "@/components/layout/InstallPrompt";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useConnectionStore } from "@/store/connectionStore";
import { useTheme } from "@/hooks/useTheme";

interface AppLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  /** Hide the page title row (hero pages supply their own). */
  hideTitle?: boolean;
  /** Connection gate / onboarding — no bottom tabs. */
  gate?: boolean;
  /** Compact chrome for immersive screens. */
  hideHeader?: boolean;
}

export function AppLayout({
  children,
  title,
  subtitle,
  hideTitle = false,
  gate = false,
  hideHeader = false,
}: AppLayoutProps) {
  useTheme();
  const { connected, device } = useConnectionStore();

  return (
    <div className="mobile-shell relative min-h-[100dvh] text-ink">
      <div className="app-atmosphere" aria-hidden />

      <div className="relative z-10">
        {!hideHeader && (
          <header className="safe-top sticky top-0 z-40 border-b border-line/40 bg-canvas/70 backdrop-blur-glass">
            <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-3 sm:py-4">
              <div className="flex min-w-0 items-center gap-2.5">
                <Logo size={36} className="shrink-0 rounded-[28%] shadow-sm ring-1 ring-accent/25" />
                <div className="min-w-0">
                  <p className="font-display text-lg font-extrabold tracking-tight sm:text-xl">
                    <span className="text-accent">Quicker</span>
                    <span className="text-ink"> Pod</span>
                  </p>
                  <p className="truncate text-[0.7rem] text-ink-faint sm:text-xs">
                    {subtitle ?? (gate ? "Link your Tripper to continue" : "Motorcycle navigation companion")}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <InstallIconButton />
                {!gate && (
                  <StatusBadge
                    label={connected ? device?.name ?? "Linked" : "Offline"}
                    active={connected}
                    variant={connected ? "success" : "neutral"}
                  />
                )}
              </div>
            </div>
            {!hideTitle && (
              <div className="px-4 pb-3">
                <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-[1.75rem]">
                  {title}
                </h1>
              </div>
            )}
          </header>
        )}

        <main
          className={`mx-auto max-w-lg px-4 pt-4 ${
            gate
              ? "pb-[calc(1.5rem+env(safe-area-inset-bottom))]"
              : "pb-[calc(7rem+env(safe-area-inset-bottom))] sm:pb-28"
          }`}
        >
          {children}
        </main>

        <InstallPrompt />
        {!gate && <BottomNav />}
      </div>
    </div>
  );
}
