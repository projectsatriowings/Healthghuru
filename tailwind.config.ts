import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2E7D32",
          light: "#4CAF50",
          dark: "#1B5E20",
        },
        secondary: "#66BB6A",
        accent: {
          DEFAULT: "#f06d2f",
          light: "#ffd6c1",
        },
        surface: {
          DEFAULT: "#F5FAF5",
          alt: "#EBF5EB",
        },
        dark: {
          DEFAULT: "#1A2E1A",
          80: "rgba(26,46,26,0.8)",
        },
        text: {
          primary: "#1A2E1A",
          secondary: "#4A6741",
          muted: "#78909C",
        },
        border: {
          DEFAULT: "rgba(46,125,50,0.15)",
          strong: "rgba(46,125,50,0.30)",
        },
        chart: {
          nutrition: "var(--chart-nutrition)",
          sleep: "var(--chart-sleep)",
          fitness: "var(--chart-fitness)",
          mood: "var(--chart-mood)",
          water: "var(--chart-water)",
        },
        status: {
          good: "var(--status-good)",
          warning: "var(--status-warning)",
          danger: "var(--status-danger)",
        },
      },
      spacing: {
        sidebar: "var(--sidebar-width)",
        "sidebar-collapsed": "var(--sidebar-collapsed)",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        heading: ["var(--font-heading)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #2E7D32 0%, #66BB6A 100%)",
        "gradient-hero": "linear-gradient(135deg, #1B5E20 0%, #2E7D32 60%, #388E3C 100%)",
        "gradient-dark": "linear-gradient(180deg, #1A2E1A 0%, #0D1F0D 100%)",
        "gradient-surface": "linear-gradient(180deg, #F5FAF5 0%, #EBF5EB 100%)",
        "gradient-accent": "linear-gradient(135deg, #f06d2f 0%, #ff8a57 100%)",
      },
      boxShadow: {
        "card": "0 4px 24px rgba(46,125,50,0.08)",
        "card-hover": "0 12px 40px rgba(46,125,50,0.18)",
        "btn-primary": "0 4px 0 #1B5E20",
        "btn-accent": "0 4px 0 #b24920",
      },
      borderRadius: {
        "card": "14px",
        "btn": "9999px",
      },
      screens: {
        "3xl": "1920px",
        "4xl": "2560px",
      },
    },
  },
  plugins: [],
};
export default config;
