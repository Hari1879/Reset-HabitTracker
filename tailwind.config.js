/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0A0E17',
          900: '#0F1420',
          800: '#161C2C',
          700: '#1F2738',
          600: '#2A3448',
        },
        mist: {
          100: '#F4F6FA',
          200: '#E7EBF3',
          300: '#D2D9E6',
        },
        teal: {
          400: '#4FD6C4',
          500: '#2FBFAE',
          600: '#22A190',
        },
        aqua: {
          400: '#5FCBEE',
          500: '#3AB2DC',
        },
        lavender: {
          400: '#B4A6F2',
          500: '#9C89EA',
        },
        coral: {
          400: '#FF9E85',
          500: '#FF8266',
        },
        gold: {
          400: '#F3CD82',
          500: '#E8B85B',
        },
      },
      borderRadius: {
        card: '28px',
        pill: '999px',
      },
      fontFamily: {
        display: ['System'],
        body: ['System'],
      },
    },
  },
  plugins: [],
};
