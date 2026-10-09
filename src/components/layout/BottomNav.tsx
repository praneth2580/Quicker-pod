import { Link, useLocation } from "react-router-dom";

const navItems = [
  {
    path: "/dashboard",
    label: "Ride",
    match: ["/dashboard"],
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
        <path
          d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    path: "/navigate",
    label: "Navigate",
    match: ["/navigate"],
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
        <path
          d="M12 3v3M12 18v3M3 12h3M18 12h3M6.5 6.5l2 2M15.5 15.5l2 2M17.5 6.5l-2 2M8.5 15.5l-2 2"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        <circle cx="12" cy="12" r="3.25" stroke="currentColor" strokeWidth="1.75" />
      </svg>
    ),
  },
  {
    path: "/settings",
    label: "Settings",
    match: ["/settings", "/dev", "/protocol-lab", "/fuzzer", "/ble-debug", "/nav-lab", "/opcode-probe"],
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.75" />
        <path
          d="M12 3.5v2.2M12 18.3V20.5M4.8 7.2l1.7 1.2M17.5 15.6l1.7 1.2M3.5 12h2.2M18.3 12h2.2M4.8 16.8l1.7-1.2M17.5 8.4l1.7-1.2"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
] as const;

export function BottomNav() {
  const location = useLocation();

  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 z-50 safe-bottom"
    >
      <div className="mx-auto max-w-lg px-3 pb-2">
        <div className="flex items-stretch justify-around rounded-[1.75rem] border border-line/50 bg-canvas-raised/92 px-1 shadow-panel backdrop-blur-glass">
          {navItems.map((item) => {
            const active = item.match.some(
              (p) =>
                location.pathname === p || location.pathname.startsWith(`${p}/`),
            );
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex min-h-[4.1rem] flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[0.7rem] font-semibold tracking-wide transition-all duration-300 active:scale-95 ${
                  active ? "text-accent" : "text-ink-faint hover:text-ink-muted"
                }`}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-2xl transition-all duration-300 ${
                    active
                      ? "bg-accent-soft text-accent shadow-glow scale-105"
                      : "bg-transparent"
                  }`}
                >
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
                {active && (
                  <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-accent animate-nav-breathe" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
