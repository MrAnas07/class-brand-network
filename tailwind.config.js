/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ffc8dd',
        secondary: '#ffafcc',
        brand: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        }
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(135deg, #ffc8dd 0%, #ffafcc 100%)',
        'glass-gradient': 'linear-gradient(145deg, rgba(255, 200, 221, 0.15) 0%, rgba(255, 175, 204, 0.15) 100%)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(255, 175, 204, 0.2)',
        'glass-hover': '0 8px 32px 0 rgba(255, 175, 204, 0.3)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
    },
  },
  plugins: [],
}