import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export function Card({ children, className = "", title, subtitle }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-line/70 bg-canvas-raised/85 p-5 shadow-lift backdrop-blur-glass ${className}`}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="font-display text-lg font-semibold tracking-tight text-ink">{title}</h3>
          )}
          {subtitle && <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
