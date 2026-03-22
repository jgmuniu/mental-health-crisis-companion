/** @type {import('tailwindcss').Config} */
export default {
  // ✅ This file was missing entirely — Tailwind cannot work without it
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}