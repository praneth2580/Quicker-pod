import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  mono?: boolean;
}

export function Input({ label, mono, className = "", ...props }: InputProps) {
  return (
    <label className="block">
      {label && <span className="mb-2 block text-sm text-ink-muted">{label}</span>}
      <input
        className={`w-full rounded-2xl border border-line/80 bg-canvas-raised px-4 py-3 text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent ${mono ? "font-mono" : ""} ${className}`}
        {...props}
      />
    </label>
  );
}
