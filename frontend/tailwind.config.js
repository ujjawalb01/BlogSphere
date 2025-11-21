/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        darkviolet: "#1a0533",
        primary: "#6C5CE7",
      }
    },
  },
  plugins: [],
}
