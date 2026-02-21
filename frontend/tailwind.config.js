/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#00F5D4",
        secondary: "#FF4D8D",
      },
    },
  },
  plugins: [],
}