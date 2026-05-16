import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0a0a0f",
          soft: "#11111a",
          card: "#161622",
          elevated: "#1d1d2c",
        },
        silver: {
          DEFAULT: "#c0c4cc",
          muted: "#8b8f9a",
          bright: "#e6e8ec",
        },
        purple: {
          50: "#f5f0ff",
          100: "#ebe0ff",
          200: "#d4baff",
          300: "#b18cff",
          400: "#9a6bff",
          500: "#7c3aed",
          600: "#6c28d9",
          700: "#5b21b6",
          800: "#4c1d95",
          900: "#2e1065",
        },
        accent: "#a855f7",
      },
      boxShadow: {
        glow: "0 0 24px rgba(168, 85, 247, 0.35)",
        "glow-soft": "0 0 12px rgba(168, 85, 247, 0.2)",
      },
      backgroundImage: {
        "purple-gradient":
          "linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #a855f7 100%)",
        "card-gradient":
          "linear-gradient(180deg, rgba(124,58,237,0.08) 0%, rgba(0,0,0,0) 60%)",
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
