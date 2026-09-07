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
        brand: {
          50: '#f0fdf9',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        sidebar: {
          light: '#fbfcfc',
          dark: '#0f172a',
          active: '#eaf7f4',
          activeDark: '#134e4a',
        },
        canvas: {
          light: '#f4f7f6',
          dark: '#0b1120',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.02), 0 4px 14px rgba(0, 0, 0, 0.025)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.04), 0 12px 28px rgba(0, 0, 0, 0.03)',
        'soft': '0 2px 8px rgba(13, 148, 136, 0.08)',
        'glow': '0 0 20px rgba(20, 184, 166, 0.25)',
      },
      borderRadius: {
        'xl': '0.85rem',
        '2xl': '1.15rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
