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
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-surface/95 backdrop-blur-glass safe-bottom">
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-1">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex min-h-16 min-w-[3rem] flex-1 flex-col items-center justify-center gap-0.5 text-xs transition-colors ${active ? "text-accent" : "text-gray-500 hover:text-gray-300"}`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
