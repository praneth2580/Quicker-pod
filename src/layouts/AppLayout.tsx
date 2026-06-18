import type { ReactNode } from "react";
import { BottomNav } from "@/components/layout/BottomNav";
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
    <div className="min-h-screen bg-surface text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-surface/90 backdrop-blur-glass">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              <span className="text-accent">Open</span>Tripper
            </h1>
            <p className="text-xs text-gray-500">{subtitle ?? "BLE Protocol Explorer"}</p>
          </div>
          <StatusBadge
            label={connected ? device?.name ?? "Connected" : "Offline"}
            active={connected}
            variant={connected ? "success" : "neutral"}
          />
        </div>
        <div className="px-4 pb-3">
          <h2 className="text-2xl font-semibold">{title}</h2>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 pb-28 pt-4">{children}</main>
      <BottomNav />
    </div>
  );
}
