/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        flora: {
          50:  '#fdf4f7',
          100: '#fce8f1',
          200: '#f9d0e3',
          300: '#f4a8c8',
          400: '#ec74a5',
          500: '#e04e85',
          600: '#cc2e67',
          700: '#b02054',
          800: '#921e47',
          900: '#7a1e3d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
