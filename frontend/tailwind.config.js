/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1565C0',
        'primary-dark': '#0D47A1',
        'primary-light': '#2196F3',
        'badge-red': '#E53935',
        'success-green': '#00A651',
      },
      backgroundColor: {
        primary: '#1565C0',
      }
    },
  },
  plugins: [],
}
