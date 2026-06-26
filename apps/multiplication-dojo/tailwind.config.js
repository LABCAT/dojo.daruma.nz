/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    '../../packages/ui/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#0A0A0A',
        surface: '#141414',
        border: '#2A2A2A',
        primary: '#C9A84C',
        'primary-dim': '#8A6F2E',
        accent: '#8B1A1A',
        'accent-bright': '#E53535',
        text: '#F0EDE8',
        'text-muted': '#8A8580',
        success: '#2D6A2D',
        'success-bright': '#4CAF50',
      },
    },
  },
  plugins: [],
}
