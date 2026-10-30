/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          base: '#090D14',
          card: '#111724',
          elevated: '#172032',
          hover: '#1E2A40',
        },
        border: {
          subtle: 'rgba(255, 255, 255, 0.07)',
          medium: 'rgba(255, 255, 255, 0.12)',
          active: 'rgba(56, 189, 248, 0.35)',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
