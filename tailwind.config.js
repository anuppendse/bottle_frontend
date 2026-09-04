/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#101C34",
        "ink-soft": "#1B2A4A",
        paper: "#F4F5F2",
        surface: "#FFFFFF",
        line: "#E1E3DE",
        "line-strong": "#CBCEC8",
        accent: { DEFAULT: "#0E7C74", dark: "#0A5E58", tint: "#E4F1EF" },
        text: "#182233",
        muted: "#5C6572",
        faint: "#8A8F97",
        green: { DEFAULT: "#1E8E5A", tint: "#E6F5EC" },
        amber: { DEFAULT: "#A9720B", tint: "#FBF0DA" },
        red: { DEFAULT: "#B0362B", tint: "#FAE7E4" },
        grey: { DEFAULT: "#667080", tint: "#EDEEF0" },
      },
      fontFamily: {
        sans: ["IBM Plex Sans", "-apple-system", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
