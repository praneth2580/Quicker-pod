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
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 20px rgba(34, 211, 238, 0.15)",
        card: "0 4px 24px rgba(0, 0, 0, 0.4)",
      },
      backdropBlur: {
        glass: "12px",
      },
    },
  },
  plugins: [],
};
