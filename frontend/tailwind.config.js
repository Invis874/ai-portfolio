/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      transitionProperty: {
        'colors': 'background-color, border-color, color, fill, stroke',
      },
      transitionDuration: {
        '300': '300ms',
      },
      colors: {
        dark: {
          100: '#1a1a2e',
          200: '#16213e',
          300: '#0f3460',
          400: '#0a0f1c',
        }
      }
    },
  },
  plugins: [],
}