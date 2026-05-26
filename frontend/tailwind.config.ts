import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#f0f4f9",
        surface: "#ffffff",
        card: "#ffffff",
        ink: "#1f1f1f",
        muted: "#5f6368",
        line: "#e3e3e3",
        "line-strong": "#dadce0",
        accent: "#1a73e8",
        "accent-soft": "#4285f4",
        "accent-muted": "#e8f0fe",
        sage: "#137333",
        success: "#137333",
        danger: "#c5221f",
        studio: "#f8f9fa",
      },
      fontFamily: {
        sans: ["var(--font-google-sans)", "Roboto", "system-ui", "sans-serif"],
        display: ["var(--font-google-sans)", "Roboto", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(60, 64, 67, 0.08), 0 2px 6px rgba(60, 64, 67, 0.06)",
        card: "0 1px 3px rgba(60, 64, 67, 0.12), 0 4px 8px rgba(60, 64, 67, 0.08)",
        panel: "0 0 0 1px rgba(60, 64, 67, 0.08)",
      },
      borderRadius: {
        pill: "9999px",
      },
    },
  },
  plugins: [],
};

export default config;
