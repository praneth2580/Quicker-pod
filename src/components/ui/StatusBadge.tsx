interface StatusBadgeProps {
  label: string;
  active?: boolean;
  variant?: "success" | "danger" | "warning" | "neutral";
}

const variantStyles = {
  success: "bg-success/20 text-success border-success/30",
  danger: "bg-danger/20 text-danger border-danger/30",
  warning: "bg-warning/20 text-warning border-warning/30",
  neutral: "bg-white/5 text-gray-300 border-white/10",
};

export function StatusBadge({ label, active, variant = "neutral" }: StatusBadgeProps) {
  const resolvedVariant = active
    ? variant === "neutral"
      ? "success"
      : variant
    : variant;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wider ${variantStyles[resolvedVariant]}`}
    >
      <span
        className={`mr-2 h-2 w-2 rounded-full ${active ? "bg-current animate-pulse" : "bg-gray-500"}`}
      />
      {label}
    </span>
  );
}
