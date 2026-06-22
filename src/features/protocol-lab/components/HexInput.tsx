import type { InputHTMLAttributes } from "react";
import { isValidHex } from "@/utils";

interface HexInputProps extends Omit<InputHTMLAttributes<HTMLTextAreaElement>, "onChange"> {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
}

export function HexInput({ label, value, onChange, error, className = "", ...props }: HexInputProps) {
  const valid = value.trim() === "" || isValidHex(value);

  return (
    <label className="block">
      {label && <span className="mb-2 block text-sm text-gray-400">{label}</span>}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        rows={2}
        spellCheck={false}
        className={`w-full rounded-xl border bg-surface-raised px-4 py-3 font-mono text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 ${
          valid && !error
            ? "border-white/10 focus:border-accent focus:ring-accent"
            : "border-danger/50 focus:border-danger focus:ring-danger"
        } ${className}`}
        placeholder="AA BB CC DD"
        {...props}
      />
      {(error || (!valid && value.trim())) && (
        <p className="mt-1 text-xs text-danger">{error ?? "Invalid HEX — use pairs like 20 01 00 64"}</p>
      )}
    </label>
  );
}
