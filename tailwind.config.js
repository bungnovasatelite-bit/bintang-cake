/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bakery: {
          50: '#FDFBF7',
          100: '#FAF5EE',
          200: '#F3E8DA',
          300: '#E6D3BE',
          400: '#CBB296',
          500: '#A98767',
          600: '#7E5B3D',
          700: '#5C381E',
          800: '#4A2810',
          900: '#341A08',
          950: '#231105',
        },
        cream: {
          50: '#FFFEFA',
          100: '#FAF7F2',
          200: '#F5EFE6',
          300: '#EFE7DA',
        },
        caramel: {
          DEFAULT: '#D4A373',
          dark: '#B87D48',
          light: '#EAD1B6',
        },
        blush: {
          50: '#FFF5F3',
          100: '#FDECE8',
          200: '#FBD2C8',
          500: '#E76F51',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'Cambria', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(62, 35, 18, 0.06), 0 2px 6px -1px rgba(62, 35, 18, 0.04)',
        'float': '0 10px 30px -4px rgba(62, 35, 18, 0.12), 0 4px 12px -2px rgba(62, 35, 18, 0.08)',
        'nav': '0 -4px 24px -2px rgba(62, 35, 18, 0.08)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
}
