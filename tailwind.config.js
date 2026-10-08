/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: "rgb(var(--color-canvas) / <alpha-value>)",
          raised: "rgb(var(--color-canvas-raised) / <alpha-value>)",
          sunk: "rgb(var(--color-canvas-sunk) / <alpha-value>)",
        },
        ink: {
          DEFAULT: "rgb(var(--color-ink) / <alpha-value>)",
          muted: "rgb(var(--color-ink-muted) / <alpha-value>)",
          faint: "rgb(var(--color-ink-faint) / <alpha-value>)",
        },
        line: "rgb(var(--color-line) / <alpha-value>)",
        accent: {
          DEFAULT: "rgb(var(--color-accent) / <alpha-value>)",
          soft: "rgb(var(--color-accent-soft) / <alpha-value>)",
          ink: "rgb(var(--color-accent-ink) / <alpha-value>)",
        },
        danger: "rgb(var(--color-danger) / <alpha-value>)",
        success: "rgb(var(--color-success) / <alpha-value>)",
        warning: "rgb(var(--color-warning) / <alpha-value>)",
        // Legacy aliases used by protocol-lab / fuzzer (map to new tokens)
        surface: {
          DEFAULT: "rgb(var(--color-canvas) / <alpha-value>)",
          raised: "rgb(var(--color-canvas-raised) / <alpha-value>)",
          glass: "rgb(var(--color-canvas-raised) / 0.82)",
        },
      },
      fontFamily: {
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
        sans: ["Figtree", "ui-sans-serif", "sans-serif"],
        display: ["Syne", "Figtree", "ui-sans-serif", "sans-serif"],
      },
      boxShadow: {
        panel: "0 18px 40px rgb(var(--color-shadow) / 0.12)",
        lift: "0 8px 24px rgb(var(--color-shadow) / 0.1)",
        card: "0 8px 24px rgb(var(--color-shadow) / 0.1)",
        glow: "0 0 24px rgb(var(--color-accent) / 0.18)",
      },
      backdropBlur: {
        glass: "14px",
      },
      spacing: {
        "safe-bottom": "env(safe-area-inset-bottom, 0px)",
        "safe-top": "env(safe-area-inset-top, 0px)",
      },
      minHeight: {
        touch: "3rem",
      },
      minWidth: {
        touch: "3rem",
      },
      keyframes: {
        "nav-rise": {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "nav-breathe": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.55" },
          "50%": { transform: "scale(1.04)", opacity: "0.85" },
        },
        "nav-pulse-ring": {
          "0%": { transform: "scale(0.92)", opacity: "0.45" },
          "70%": { transform: "scale(1.12)", opacity: "0" },
          "100%": { transform: "scale(1.12)", opacity: "0" },
        },
        "landing-rise": {
          from: { opacity: "0", transform: "translateY(18px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "landing-drift": {
          "0%, 100%": { transform: "translate3d(0, 0, 0) scale(1)" },
          "50%": { transform: "translate3d(2%, -1.5%, 0) scale(1.03)" },
        },
        "landing-drift-alt": {
          "0%, 100%": { transform: "translate3d(0, 0, 0) scale(1.02)" },
          "50%": { transform: "translate3d(-3%, 2%, 0) scale(1)" },
        },
        "landing-float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "landing-hatch": {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "60px 60px" },
        },
        "landing-sheen": {
          "0%": { transform: "translateX(-120%) skewX(-12deg)", opacity: "0" },
          "35%": { opacity: "0.35" },
          "100%": { transform: "translateX(220%) skewX(-12deg)", opacity: "0" },
        },
      },
      animation: {
        "nav-rise": "nav-rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        "nav-breathe": "nav-breathe 5.5s ease-in-out infinite",
        "nav-pulse-ring": "nav-pulse-ring 2.4s ease-out infinite",
        "landing-rise": "landing-rise 0.8s cubic-bezier(0.22, 1, 0.36, 1) both",
        "landing-drift": "landing-drift 18s ease-in-out infinite",
        "landing-drift-alt": "landing-drift-alt 22s ease-in-out infinite",
        "landing-float": "landing-float 6s ease-in-out infinite",
        "landing-hatch": "landing-hatch 28s linear infinite",
        "landing-sheen": "landing-sheen 7s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
