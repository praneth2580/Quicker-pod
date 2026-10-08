import type { ReactNode } from "react";
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
}

export function AppLayout({ children, title, subtitle, hideTitle = false }: AppLayoutProps) {
  useTheme();
  const { connected, device } = useConnectionStore();

  return (
    <div className="mobile-shell relative min-h-[100dvh] text-ink">
      <div className="app-atmosphere" aria-hidden />

      <div className="relative z-10">
        <header className="safe-top sticky top-0 z-40 border-b border-line/50 bg-canvas/75 backdrop-blur-glass">
          <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-3 sm:py-4">
            <div className="min-w-0">
              <p className="font-display text-lg font-extrabold tracking-tight sm:text-xl">
                <span className="text-accent">Quicker</span>
                <span className="text-ink"> Pod</span>
              </p>
              <p className="truncate text-[0.7rem] text-ink-faint sm:text-xs">
                {subtitle ?? "Motorcycle navigation companion"}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <InstallIconButton />
              <StatusBadge
                label={connected ? device?.name ?? "Linked" : "Offline"}
                active={connected}
                variant={connected ? "success" : "neutral"}
              />
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

        <main className="mx-auto max-w-lg px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-4 sm:pb-28">
          {children}
        </main>

        <InstallPrompt />
        <BottomNav />
      </div>
    </div>
  );
}
