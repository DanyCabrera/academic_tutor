import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#ebe9e4",
        surface: "#f6f5f2",
        card: "#f6f5f2",
        ink: "#3a3935",
        muted: "#7d7a73",
        line: "#ddd9d2",
        "line-strong": "#cfc9c0",
        accent: "#6d7b8a",
        "accent-soft": "#84919e",
        "accent-muted": "#e4e8ec",
        "accent-deep": "#56616d",
        sage: "#6d8578",
        success: "#6d8578",
        danger: "#b07070",
        studio: "#f0eeea",
        violet: {
          soft: "#e8e5eb",
          ink: "#857a92",
        },
      },
      fontFamily: {
        sans: ["var(--font-google-sans)", "Roboto", "system-ui", "sans-serif"],
        display: [
          "var(--font-google-sans)",
          "Roboto",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(58, 57, 53, 0.04), 0 2px 6px rgba(58, 57, 53, 0.03)",
        card: "0 2px 6px rgba(58, 57, 53, 0.06), 0 6px 16px rgba(58, 57, 53, 0.04)",
        panel: "0 0 0 1px rgba(58, 57, 53, 0.05)",
        composer:
          "0 -2px 16px rgba(58, 57, 53, 0.04), 0 0 0 1px rgba(207, 201, 192, 0.9)",
      },
      borderRadius: {
        pill: "9999px",
        chat: "1.25rem",
      },
      spacing: {
        "panel-header": "3.25rem",
        "chat-composer": "4.5rem",
      },
      maxWidth: {
        chat: "42rem",
      },
    },
  },
  plugins: [],
};

export default config;
