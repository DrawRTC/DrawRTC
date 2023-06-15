/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: false,
  theme: {
    extend: {},
  },
  plugins: [require('daisyui'), require('tailwind-scrollbar')({ nocompatible: true }),
  ],
}

