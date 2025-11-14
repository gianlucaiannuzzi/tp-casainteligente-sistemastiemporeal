/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/renderer/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      keyframes: {
        blink: {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.5 },
        },
        refresh: {
          '0%': { transform: 'scale(0.97)', opacity: '0.5' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        }
      },
      animation: {
        blink: "blink 0.4s ease-in-out 2",
        refresh: 'refresh 0.25s ease-out'
      }
    }
  },
  plugins: []
}