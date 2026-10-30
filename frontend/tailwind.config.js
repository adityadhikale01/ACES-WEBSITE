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
        navy: {
          950: '#030712',
          900: '#050b14',
          850: '#07101e',
          800: '#0b162c',
          700: '#112244',
          600: '#1d3557',
        },
        electric: {
          cyan: '#38bdf8',
          blue: '#2563eb',
          indigo: '#6366f1',
          accent: '#60a5fa',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 25px -5px rgba(56, 189, 248, 0.25)',
        'glow-indigo': '0 0 25px -5px rgba(99, 102, 241, 0.3)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
