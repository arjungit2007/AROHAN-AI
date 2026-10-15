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
        blue: {
          50: '#eff8f5',
          100: '#dcefe7',
          200: '#b9decf',
          300: '#8bc8b1',
          400: '#5aa98e',
          500: '#348b70',
          600: '#176f57',
          700: '#125842',
          800: '#104635',
          900: '#0c382d',
          950: '#06271f',
        },
        purple: {
          50: '#fff7ef',
          100: '#ffeddc',
          200: '#fed7b6',
          300: '#fbbb86',
          400: '#f49a58',
          500: '#e47b37',
          600: '#c76128',
          700: '#a04b21',
          800: '#7b3b1e',
          900: '#5f301b',
          950: '#35180d',
        },
        arohan: {
          bg: '#F4F7F4',
          lightBlue: '#EFF8F5',
          navy: '#162923',
          navyLight: '#273D35',
          navyMuted: '#56665F',
          blue: '#176F57',
          blueHover: '#125842',
          purple: '#C76128',
          purpleHover: '#A04B21',
          green: '#059669',
          greenLight: '#ECFDF5',
          amber: '#D97706',
          amberLight: '#FFFBEB',
          border: '#DCE5DF',
        },
      },
      borderRadius: {
        DEFAULT: '6px',
        sm: '4px',
        md: '6px',
        lg: '6px',
        xl: '8px',
        '2xl': '8px',
        '3xl': '8px',
      },
      fontFamily: {
        sans: ['Trebuchet MS', 'Aptos', 'Segoe UI', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
