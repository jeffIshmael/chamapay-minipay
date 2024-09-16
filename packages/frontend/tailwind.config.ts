// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class', // Use class-based dark mode
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        downy: {
          50: '#f1fcfa',
          100: '#d1f6f1',
          200: '#a3ece4',
          300: '#66d9d0',
          400: '#3fc2bb',
          500: '#26a6a2',
          600: '#1c8584',
          700: '#1a6b6b',
          800: '#195556',
          900: '#194848',
          950: '#09272a',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('tailwindcss-animate'),
  ],
};

export default config;
