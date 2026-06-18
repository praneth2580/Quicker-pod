import { Link, useLocation } from "react-router-dom";

const navItems = [
  { path: "/", label: "Home", icon: "⌂" },
  { path: "/scanner", label: "Scan", icon: "◎" },
  { path: "/explorer", label: "GATT", icon: "⬡" },
  { path: "/console", label: "Log", icon: "▤" },
  { path: "/transmit", label: "TX", icon: "↑" },
  { path: "/simulator", label: "Nav", icon: "↻" },
  { path: "/settings", label: "Set", icon: "⚙" },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-surface/95 backdrop-blur-glass safe-bottom"
    >
      <div className="mx-auto max-w-lg">
        <div className="flex snap-x snap-mandatory gap-0 overflow-x-auto overscroll-x-contain px-1 scrollbar-none">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex min-h-[4.25rem] min-w-[4.25rem] shrink-0 snap-center flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[0.65rem] font-medium uppercase tracking-wide transition-colors active:scale-95 sm:min-w-0 sm:flex-1 sm:text-xs ${
                  active
                    ? "text-accent"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl text-lg transition-colors ${
                    active ? "bg-accent/15 shadow-glow" : "bg-white/5"
                  }`}
                >
                  {item.icon}
                </span>
                <span className="max-w-[4rem] truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
