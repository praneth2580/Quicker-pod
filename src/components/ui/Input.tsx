import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  mono?: boolean;
}

export function Input({ label, mono, className = "", ...props }: InputProps) {
  return (
    <label className="block">
      {label && <span className="mb-2 block text-sm text-gray-400">{label}</span>}
      <input
        className={`w-full rounded-xl border border-white/10 bg-surface-raised px-4 py-3 text-white placeholder:text-gray-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent ${mono ? "font-mono" : ""} ${className}`}
        {...props}
      />
    </label>
  );
}
