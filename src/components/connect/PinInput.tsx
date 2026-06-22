import { useCallback, useRef } from "react";

interface PinInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string | null;
}

export function PinInput({ value, onChange, disabled, error }: PinInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: 6 }, (_, index) => value[index] ?? "");

  const focusIndex = useCallback((index: number) => {
    const input = inputsRef.current[index];
    input?.focus();
    input?.select();
  }, []);

  const updateDigit = (index: number, digit: string) => {
    const cleaned = digit.replace(/\D/g, "").slice(-1);
    const next = digits.slice();
    next[index] = cleaned;
    onChange(next.join("").slice(0, 6));
    if (cleaned && index < 5) focusIndex(index + 1);
  };

  const handleKeyDown = (index: number, key: string) => {
    if (key === "Backspace" && !digits[index] && index > 0) {
      focusIndex(index - 1);
    }
  };

  const handlePaste = (text: string) => {
    const normalized = text.replace(/\D/g, "").slice(0, 6);
    onChange(normalized);
    focusIndex(Math.min(normalized.length, 5));
  };

  return (
    <div>
      <div className="flex justify-center gap-2">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputsRef.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            disabled={disabled}
            aria-label={`PIN digit ${index + 1}`}
            className={`h-12 w-10 rounded-xl border bg-black/30 text-center text-lg font-semibold text-white outline-none transition-colors ${
              error ? "border-danger" : "border-white/10 focus:border-accent"
            }`}
            onChange={(event) => updateDigit(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event.key)}
            onPaste={(event) => {
              event.preventDefault();
              handlePaste(event.clipboardData.getData("text"));
            }}
          />
        ))}
      </div>
      {error && <p className="mt-3 text-center text-sm text-danger">{error}</p>}
    </div>
  );
}
