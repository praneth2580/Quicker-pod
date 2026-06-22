import { Link, useLocation } from "react-router-dom";

const navItems = [
  { path: "/", label: "Home", icon: "⌂" },
  { path: "/connect", label: "Connect", icon: "◎" },
  { path: "/protocol-lab", label: "Lab", icon: "⚗" },
  { path: "/settings", label: "Settings", icon: "⚙" },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-surface/95 backdrop-blur-glass safe-bottom"
    >
      <div className="mx-auto max-w-lg">
        <div className="flex items-stretch justify-around px-2">
          {navItems.map((item) => {
            const active =
              item.path === "/protocol-lab"
                ? location.pathname === "/protocol-lab"
                : location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex min-h-[4.25rem] flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-xs font-medium transition-colors active:scale-95 ${
                  active ? "text-accent" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl text-lg transition-colors ${
                    active ? "bg-accent/15 shadow-glow" : "bg-white/5"
                  }`}
                >
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
