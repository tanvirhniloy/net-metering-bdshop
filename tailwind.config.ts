import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#0B2A5B",
        brand: { DEFAULT: "#1D5FE0", 2: "#0EA5E9", dark: "#1546C0" },
        accent: "#FFB020",
        tint: "#EEF5FF",
        ink: "#172B3A",
        muted: "#5A6A7E",
        line: "#E2E8F0",
        ok: { DEFAULT: "#15803D", bg: "#ECFDF3" },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      keyframes: {
        fade: { from: { opacity: "0", transform: "translateY(2px)" }, to: { opacity: "1", transform: "none" } },
      },
      animation: { fade: "fade 180ms ease-out" },
    },
  },
  plugins: [],
};
export default config;
