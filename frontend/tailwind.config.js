/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#030712',
          900: '#0B1120',
          850: '#0F172A',
          800: '#1E293B',
          700: '#334155',
        },
        electric: {
          blue: '#2563EB',
          indigo: '#4F46E5',
          cyan: '#06B6D4',
        },
      },
    },
  },
  plugins: [],
}
