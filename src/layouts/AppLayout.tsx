import type { ReactNode } from "react";
import { BottomNav } from "@/components/layout/BottomNav";
import { InstallIconButton, InstallPrompt } from "@/components/layout/InstallPrompt";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useConnectionStore } from "@/store/connectionStore";

interface AppLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AppLayout({ children, title, subtitle }: AppLayoutProps) {
  const { connected, device } = useConnectionStore();

  return (
    <div className="mobile-shell min-h-[100dvh] bg-surface text-white">
      <header className="safe-top sticky top-0 z-40 border-b border-white/10 bg-surface/90 backdrop-blur-glass">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-3 sm:py-4">
          <div className="min-w-0">
            <h1 className="text-lg font-bold tracking-tight sm:text-xl">
              <span className="text-accent">Quicker</span>-pod
            </h1>
            <p className="truncate text-[0.7rem] text-gray-500 sm:text-xs">
              {subtitle ?? "BLE Protocol Explorer"}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <InstallIconButton />
            <StatusBadge
              label={connected ? device?.name ?? "Connected" : "Offline"}
              active={connected}
              variant={connected ? "success" : "neutral"}
            />
          </div>
        </div>
        <div className="px-4 pb-3">
          <h2 className="text-xl font-semibold sm:text-2xl">{title}</h2>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-4 sm:pb-28">
        {children}
      </main>

      <InstallPrompt />
      <BottomNav />
    </div>
  );
}
