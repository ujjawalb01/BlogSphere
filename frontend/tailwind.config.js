/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        canvas: "var(--canvas)",
        surface: "var(--surface)",
        "surface-hover": "var(--surface-hover)",
        "surface-raised": "var(--surface-raised)",
        line: "var(--line)",
        "line-strong": "var(--line-strong)",
        ink: "var(--ink)",
        "ink-secondary": "var(--ink-secondary)",
        "ink-muted": "var(--ink-muted)",
        accent: "var(--accent)",
        "accent-ink": "var(--accent-ink)",
        "accent-hover": "var(--accent-hover)",
      },
      fontFamily: {
        serif: ["Newsreader", "Playfair Display", "Georgia", "serif"],
        sans: ["Plus Jakarta Sans", "Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["DM Mono", "monospace"],
      },
      borderRadius: {
        "editorial": "18px",
        "pill": "9999px",
      },
      boxShadow: {
        subtle: "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)",
        card: "0 4px 20px -2px rgba(0,0,0,0.12)",
        glow: "0 0 25px rgba(216,255,101,0.25)",
      },
    },
  },
  plugins: [],
};
