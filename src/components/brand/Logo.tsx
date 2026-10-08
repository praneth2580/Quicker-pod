import { useId } from "react";

type LogoProps = {
  size?: number;
  className?: string;
  /** Decorative by default; set title for standalone use. */
  title?: string;
};

/** Inline brand mark — geometric Q with turn-right navigation arrow. */
export function Logo({ size = 36, className = "", title }: LogoProps) {
  const uid = useId().replace(/:/g, "");
  const tileId = `qp-tile-${uid}`;
  const markId = `qp-mark-${uid}`;
  const glowId = `qp-glow-${uid}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={className}
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <linearGradient id={tileId} x1="48" y1="24" x2="464" y2="488" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0A1512" />
          <stop offset="1" stopColor="#12261F" />
        </linearGradient>
        <linearGradient id={markId} x1="110" y1="90" x2="420" y2="420" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5EEAD4" />
          <stop offset="0.55" stopColor="#14B8A6" />
          <stop offset="1" stopColor="#0F766E" />
        </linearGradient>
        <radialGradient
          id={glowId}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(280 200) rotate(90) scale(190 170)"
        >
          <stop stopColor="#14B8A6" stopOpacity="0.28" />
          <stop offset="1" stopColor="#14B8A6" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="512" height="512" rx="120" fill={`url(#${tileId})`} />
      <circle cx="280" cy="200" r="170" fill={`url(#${glowId})`} />
      <path
        fill={`url(#${markId})`}
        d="M248 112c-79.5 0-144 64.5-144 144s64.5 144 144 144c27.6 0 53.3-7.8 75.1-21.2l-31.4-31.4A102.5 102.5 0 0 1 248 358c-56.3 0-102-45.7-102-102s45.7-102 102-102 102 45.7 102 102c0 16.3-3.8 31.7-10.6 45.3l34.1 34.1C389.2 309.5 400 280.1 400 256c0-79.5-64.5-144-144-144z"
      />
      <path
        fill={`url(#${markId})`}
        d="M286 250c0-11 9-20 20-20h18c11 0 20 9 20 20v70h46c12.2 0 18.4 14.7 9.9 23.5l-66 68c-5.5 5.6-14.5 5.6-20 0l-66-68C239.6 334.7 245.8 320 258 320h48V250z"
      />
    </svg>
  );
}

type WordmarkProps = {
  className?: string;
  markSize?: number;
  /** Landing uses "Quicker-pod"; app chrome uses "Quicker Pod". */
  variant?: "hyphen" | "space";
};

export function BrandWordmark({ className = "", markSize = 36, variant = "hyphen" }: WordmarkProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Logo size={markSize} className="shrink-0 rounded-[28%] shadow-sm" />
      <span className="font-display font-bold tracking-tight">
        Quicker
        {variant === "hyphen" ? (
          <span className="text-[#0f766e]">-pod</span>
        ) : (
          <span className="text-ink"> Pod</span>
        )}
      </span>
    </span>
  );
}
