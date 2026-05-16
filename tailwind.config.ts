import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Arcade neon palette: deep night base + neon pink/cyan/violet/lime accents
        bg: {
          DEFAULT: "#05030d",
          soft: "#0a0719",
          card: "#0f0a24",
          elevated: "#160e34",
        },
        silver: {
          DEFAULT: "#cfd3dc",
          muted: "#7c8295",
          bright: "#f1f3f8",
        },
        // primary brand: neon violet/magenta
        neon: {
          pink: "#ff2d8e",
          magenta: "#ff3df0",
          violet: "#a855f7",
          purple: "#7c3aed",
          cyan: "#22d3ee",
          blue: "#5b8cff",
          lime: "#a3ff12",
          yellow: "#fde047",
          orange: "#ff7849",
        },
        // keep purple alias for backwards compatibility
        purple: {
          50: "#faf5ff",
          100: "#f3e8ff",
          200: "#e9d5ff",
          300: "#d8b4fe",
          400: "#c084fc",
          500: "#a855f7",
          600: "#9333ea",
          700: "#7e22ce",
          800: "#6b21a8",
          900: "#581c87",
        },
        accent: "#ff3df0",
      },
      boxShadow: {
        glow: "0 0 24px rgba(255, 61, 240, 0.45), 0 0 48px rgba(168, 85, 247, 0.25)",
        "glow-soft": "0 0 14px rgba(168, 85, 247, 0.30)",
        "glow-cyan": "0 0 24px rgba(34, 211, 238, 0.45)",
        "glow-pink": "0 0 24px rgba(255, 45, 142, 0.55)",
        "neon-violet": "0 0 8px #a855f7, 0 0 24px #a855f7",
        "neon-cyan": "0 0 8px #22d3ee, 0 0 24px #22d3ee",
        "neon-pink": "0 0 8px #ff2d8e, 0 0 24px #ff2d8e",
        arcade: "inset 0 0 0 1px rgba(168, 85, 247, 0.5), 0 0 24px rgba(168, 85, 247, 0.25)",
      },
      backgroundImage: {
        "neon-gradient":
          "linear-gradient(135deg, #ff2d8e 0%, #a855f7 50%, #22d3ee 100%)",
        "violet-pink":
          "linear-gradient(135deg, #7c3aed 0%, #ff2d8e 100%)",
        "violet-cyan":
          "linear-gradient(135deg, #7c3aed 0%, #22d3ee 100%)",
        "card-gradient":
          "linear-gradient(180deg, rgba(168, 85, 247, 0.10) 0%, rgba(255, 45, 142, 0.04) 50%, transparent 100%)",
        "grid-arcade":
          "linear-gradient(rgba(168, 85, 247, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(168, 85, 247, 0.08) 1px, transparent 1px)",
        "scanlines":
          "repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 3px)",
      },
      backgroundSize: {
        "grid-arcade": "40px 40px",
      },
      fontFamily: {
        sans: [
          "Rajdhani",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        display: [
          "Press Start 2P",
          "Orbitron",
          "system-ui",
          "sans-serif",
        ],
        arcade: ["Orbitron", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
        arabic: [
          "Tajawal",
          "Cairo",
          "Rajdhani",
          "system-ui",
          "sans-serif",
        ],
      },
      animation: {
        "pulse-neon": "pulse-neon 2.4s ease-in-out infinite",
        "flicker": "flicker 3s linear infinite",
        "glow-spin": "glow-spin 8s linear infinite",
        "marquee": "marquee 30s linear infinite",
      },
      keyframes: {
        "pulse-neon": {
          "0%, 100%": {
            textShadow:
              "0 0 4px #ff2d8e, 0 0 12px #a855f7, 0 0 24px #a855f7",
          },
          "50%": {
            textShadow:
              "0 0 8px #ff2d8e, 0 0 24px #ff3df0, 0 0 48px #a855f7",
          },
        },
        flicker: {
          "0%, 18%, 22%, 25%, 53%, 57%, 100%": { opacity: "1" },
          "20%, 24%, 55%": { opacity: "0.6" },
        },
        "glow-spin": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
