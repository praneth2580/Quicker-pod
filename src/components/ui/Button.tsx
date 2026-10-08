import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
  fullWidth?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-accent-ink font-semibold hover:brightness-110 active:scale-[0.98] shadow-lift",
  secondary:
    "bg-canvas-raised border border-line text-ink hover:border-accent/50 hover:bg-accent-soft/40",
  danger: "bg-danger/10 border border-danger/35 text-danger hover:bg-danger/15",
  ghost: "bg-transparent text-ink-muted hover:bg-canvas-sunk/70 hover:text-ink",
};

export function Button({
  variant = "primary",
  children,
  fullWidth,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`touch-target min-h-12 rounded-2xl px-5 py-3 text-sm font-medium transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100 ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
