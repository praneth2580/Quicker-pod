interface StatusBadgeProps {
  label: string;
  active?: boolean;
  variant?: "success" | "danger" | "warning" | "neutral";
}

const variantStyles = {
  success: "bg-success/15 text-success border-success/30",
  danger: "bg-danger/15 text-danger border-danger/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  neutral: "bg-canvas-sunk/80 text-ink-muted border-line/70",
};

export function StatusBadge({ label, active, variant = "neutral" }: StatusBadgeProps) {
  const resolvedVariant = active
    ? variant === "neutral"
      ? "success"
      : variant
    : variant;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] ${variantStyles[resolvedVariant]}`}
    >
      <span
        className={`mr-2 h-1.5 w-1.5 rounded-full ${active ? "bg-current animate-pulse" : "bg-ink-faint"}`}
      />
      {label}
    </span>
  );
}
