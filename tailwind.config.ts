import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        amber: {
          50: "#FFF8EB",
          100: "#FEEFC3",
          200: "#FAC775",
          300: "#F0B04E",
          400: "#D4922A",
          500: "#BA7517",
          600: "#9E6214",
          700: "#8A5610",
          800: "#6B430C",
          900: "#412402",
        },
        teal: {
          50: "#EDFBF5",
          100: "#D0F5E6",
          200: "#9FE1CB",
          300: "#6ECBAB",
          400: "#3DB88E",
          500: "#1D9E75",
          600: "#198A66",
          700: "#157A5A",
          800: "#0F5E44",
          900: "#04342C",
        },
        stone: {
          50: "#F5F5F4",
          100: "#ECEAE4",
          200: "#D3D1C7",
          300: "#B8B6AC",
          400: "#A09E96",
          500: "#888780",
          600: "#706F69",
          700: "#5C5B56",
          800: "#3E3E3B",
          900: "#2C2C2A",
        },
        surface: {
          light: "#F5F5F3",
          dark: "#242422",
        },
        background: {
          light: "#FAFAF8",
          dark: "#0F0F0E",
        },
        card: {
          light: "#FFFFFF",
          dark: "#1A1A19",
        },
      },
      fontFamily: {
        serif: [
          "Palatino Linotype",
          "Book Antiqua",
          "Georgia",
          "serif",
        ],
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      borderRadius: {
        node: "6px",
        card: "8px",
        modal: "12px",
      },
      spacing: {
        "4.5": "1.125rem",
        "13": "3.25rem",
        "15": "3.75rem",
        "18": "4.5rem",
        "88": "22rem",
        "92": "23rem",
        "100": "25rem",
        "120": "30rem",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "count-up": "countUp 1.5s ease-out forwards",
        "pulse-gentle": "pulseGentle 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        countUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGentle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
