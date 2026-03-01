/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brandRed: '#b91c1c',
        brandGold: '#d4af37',
      }
    },
  },
  plugins: [],
}
