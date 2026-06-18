import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
  fullWidth?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-surface font-semibold hover:bg-cyan-300 active:scale-[0.98] shadow-glow",
  secondary:
    "bg-surface-raised border border-white/10 text-white hover:border-accent/50",
  danger: "bg-danger/20 border border-danger/40 text-danger hover:bg-danger/30",
  ghost: "bg-transparent text-gray-300 hover:bg-white/5",
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
      className={`min-h-12 rounded-xl px-5 py-3 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-40 ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
