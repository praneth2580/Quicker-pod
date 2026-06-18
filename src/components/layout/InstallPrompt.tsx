import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in navigator && (navigator as Navigator & { standalone?: boolean }).standalone);

    if (standalone) setInstalled(true);

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed || dismissed || !deferred) return null;

  const handleInstall = async () => {
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === "accepted") setDeferred(null);
  };

  return (
    <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] left-0 right-0 z-40 px-4">
      <div className="mx-auto flex max-w-lg items-center gap-3 rounded-2xl border border-accent/30 bg-surface-raised/95 p-4 shadow-glow backdrop-blur-glass">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">Install OpenTripper</p>
          <p className="text-xs text-gray-400">Add to home screen for standalone BLE testing</p>
        </div>
        <Button className="shrink-0 !min-h-11 !px-4" onClick={() => void handleInstall()}>
          Install
        </Button>
        <button
          type="button"
          aria-label="Dismiss install prompt"
          onClick={() => setDismissed(true)}
          className="shrink-0 rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
