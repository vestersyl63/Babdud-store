/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#F2B418',
          dark: '#C99708',
          soft: '#FFF6DC',
        },
        ink: '#0B0B0C',
        silver: '#C9CDD4',
      },
      fontFamily: {
        sans: ['ManropeVariable', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'sans-serif'],
        display: ['SpaceGroteskVariable', 'ManropeVariable', 'ui-sans-serif', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgb(10 10 10 / 0.05), 0 10px 28px -14px rgb(10 10 10 / 0.14)',
        lift: '0 2px 6px rgb(10 10 10 / 0.08), 0 16px 40px -16px rgb(10 10 10 / 0.22)',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pop: {
          '0%': { transform: 'scale(.85)' },
          '60%': { transform: 'scale(1.08)' },
          '100%': { transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
      animation: {
        'fade-up': 'fadeUp .45s ease both',
        pop: 'pop .25s ease both',
        shimmer: 'shimmer 1.4s linear infinite',
      },
    },
  },
  plugins: [],
};
