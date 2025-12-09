/** @type {import('tailwindcss').Config} */
module.exports = {
  // IMPORTANT: List all files that contain Tailwind classes here
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./assets/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}