import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#080b12",
        panel: "#101725",
        "panel-soft": "#131c2e",
        stroke: "#1f2a3d",
        text: "#f3f7ff",
        muted: "#90a0bc",
        accent: "#3dd9b4",
        "accent-soft": "#1d7b67",
        danger: "#ff5d73",
        warning: "#f6ad55",
        info: "#67b3ff"
      },
      boxShadow: {
        panel: "0 16px 60px rgba(0, 0, 0, 0.28)"
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at top, rgba(61, 217, 180, 0.12), transparent 28%), linear-gradient(to right, rgba(144, 160, 188, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(144, 160, 188, 0.08) 1px, transparent 1px)"
      },
      backgroundSize: {
        "grid-size": "100% 100%, 42px 42px, 42px 42px"
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        display: ["var(--font-display)"]
      }
    }
  },
  plugins: []
};

export default config;

