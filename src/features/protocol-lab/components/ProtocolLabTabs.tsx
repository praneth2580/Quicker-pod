import type { ProtocolLabTab } from "../types";

const TABS: { id: ProtocolLabTab; label: string }[] = [
  { id: "explorer", label: "Explorer" },
  { id: "notifications", label: "Monitor" },
  { id: "sender", label: "Sender" },
  { id: "mutation", label: "Mutation" },
  { id: "export", label: "Export" },
];

interface ProtocolLabTabsProps {
  active: ProtocolLabTab;
  onChange: (tab: ProtocolLabTab) => void;
}

export function ProtocolLabTabs({ active, onChange }: ProtocolLabTabsProps) {
  return (
    <div className="scrollbar-none -mx-4 flex gap-1 overflow-x-auto px-4 pb-1">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
            active === tab.id
              ? "bg-accent text-surface shadow-glow"
              : "bg-surface-raised text-gray-400 hover:text-white"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
