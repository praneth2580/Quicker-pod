import { useSettingsStore } from "@/store/settingsStore";
import { Button } from "@/components/ui/Button";
import { usePwaInstall } from "@/store/pwaInstallStore";

function DownloadIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden
    >
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}

function IosInstallSheet({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center">
      <div
        role="dialog"
        aria-labelledby="ios-install-title"
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-surface-raised p-5 shadow-card"
      >
        <h3 id="ios-install-title" className="text-lg font-semibold text-white">
          Install Quicker-pod
        </h3>
        <ol className="mt-4 space-y-3 text-sm text-gray-300">
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/20 text-xs font-bold text-accent">
              1
            </span>
            Tap the <strong className="text-white">Share</strong> button in Safari
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/20 text-xs font-bold text-accent">
              2
            </span>
            Select <strong className="text-white">Add to Home Screen</strong>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/20 text-xs font-bold text-accent">
              3
            </span>
            Tap <strong className="text-white">Add</strong> to install
          </li>
        </ol>
        <Button fullWidth className="mt-5" variant="secondary" onClick={onClose}>
          Got it
        </Button>
      </div>
    </div>
  );
}

export function InstallIconButton() {
  const { showInstallIcon, promptInstall } = usePwaInstall();

  if (!showInstallIcon) return null;

  return (
    <button
      type="button"
      aria-label="Install Quicker-pod app"
      title="Install app"
      onClick={() => void promptInstall()}
      className="touch-target flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/30 bg-accent/10 text-accent transition-colors hover:bg-accent/20 active:scale-95"
    >
      <DownloadIcon />
    </button>
  );
}

export function InstallPrompt() {
  const { showBanner, isIos, dismissBanner, promptInstall } = usePwaInstall();
  const iosHintOpen = useSettingsStore((s) => s.iosInstallHintOpen);
  const setIosInstallHintOpen = useSettingsStore((s) => s.setIosInstallHintOpen);

  if (!showBanner) {
    return iosHintOpen ? <IosInstallSheet onClose={() => setIosInstallHintOpen(false)} /> : null;
  }

  return (
    <>
      <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] left-0 right-0 z-40 px-4">
        <div className="mx-auto flex max-w-lg items-center gap-3 rounded-2xl border border-accent/30 bg-surface-raised/95 p-4 shadow-glow backdrop-blur-glass">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white">Install Quicker-pod</p>
            <p className="text-xs text-gray-400">
              {isIos
                ? "Add to your home screen for the full app experience"
                : "Add to home screen for standalone BLE testing"}
            </p>
          </div>
          <Button className="shrink-0 !min-h-11 !px-4" onClick={() => void promptInstall()}>
            Install
          </Button>
          <button
            type="button"
            aria-label="Dismiss install prompt"
            onClick={dismissBanner}
            className="shrink-0 rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white"
          >
            ✕
          </button>
        </div>
      </div>

      {iosHintOpen && <IosInstallSheet onClose={() => setIosInstallHintOpen(false)} />}
    </>
  );
}
