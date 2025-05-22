/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#0891b2",
        secondary: "#0e7490",
        background: "#f0f9ff",
        text: "#0f172a",
      },
    },
  },
  plugins: [],
}

