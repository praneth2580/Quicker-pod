/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#111827",
          raised: "#1f2937",
          glass: "rgba(31, 41, 55, 0.7)",
        },
        accent: {
          DEFAULT: "#22d3ee",
          muted: "#0891b2",
          glow: "rgba(34, 211, 238, 0.3)",
        },
        danger: "#ef4444",
        success: "#22c55e",
        warning: "#f59e0b",
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
        sans: ["Figtree", "ui-sans-serif", "sans-serif"],
        display: ["Syne", "Figtree", "ui-sans-serif", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 20px rgba(34, 211, 238, 0.15)",
        card: "0 4px 24px rgba(0, 0, 0, 0.4)",
      },
      backdropBlur: {
        glass: "12px",
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
        "landing-rise": {
          from: { opacity: "0", transform: "translateY(18px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "landing-drift": {
          "0%, 100%": { transform: "translate3d(0, 0, 0) scale(1)" },
          "50%": { transform: "translate3d(2%, -1.5%, 0) scale(1.03)" },
        },
        "landing-float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "landing-rise": "landing-rise 0.8s cubic-bezier(0.22, 1, 0.36, 1) both",
        "landing-drift": "landing-drift 18s ease-in-out infinite",
        "landing-float": "landing-float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
