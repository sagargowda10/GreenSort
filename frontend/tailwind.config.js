/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'recycle-green': '#16A34A',
        'ocean-teal': '#0EA5A4',
        'warning-amber': '#F59E0B',
        'charcoal': '#0F172A',
        'off-white': '#F7FBF8',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}