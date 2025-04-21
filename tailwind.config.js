/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    "bg-gray-600",
    "bg-yellow-600",
    "bg-blue-600",
    "bg-green-600",
    "bg-black",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
