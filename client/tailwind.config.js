/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          500: '#0284c7',
          600: '#0369a1',
          700: '#075985',
        },
        healthcare: {
          teal: '#0d9488',
          blue: '#0284c7',
          emerald: '#10b981',
          rose: '#f43f5e',
          indigo: '#4f46e5',
        }
      }
    },
  },
  plugins: [],
}
