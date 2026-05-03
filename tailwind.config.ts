import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#f0fdf4",
          100: "#dcfce7",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
        },
      },
      animation: {
        "ring-fill": "ring-fill 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "bar-fill": "bar-fill 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "fade-in": "fade-in 0.25s ease-out",
        "slide-up": "slide-up 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "slide-down": "slide-down 0.22s ease-in",
        "scale-in": "scale-in 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "skeleton": "skeleton 1.4s ease-in-out infinite",
      },
      keyframes: {
        "ring-fill": {
          from: { strokeDashoffset: "999" },
        },
        "bar-fill": {
          from: { width: "0%" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { transform: "translateY(20px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "slide-down": {
          from: { transform: "translateY(0)", opacity: "1" },
          to: { transform: "translateY(20px)", opacity: "0" },
        },
        "scale-in": {
          from: { transform: "scale(0.92)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
        "skeleton": {
          "0%, 100%": { opacity: "0.35" },
          "50%": { opacity: "0.7" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
