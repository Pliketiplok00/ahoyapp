/**
 * Tailwind CSS Configuration
 *
 * Customized for Ahoy app with brand colors and design tokens.
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Brand colors
        coral: '#E85D3B',
        'warm-yellow': '#F5B800',
        'sage-green': '#8CB369',
        'steel-blue': '#7B9AAF',

        // Status colors
        'status-active': '#4CAF50',
        'status-upcoming': '#FF9800',
        'status-completed': '#607D8B',
        'status-cancelled': '#EF4444',

        // Neutral colors
        'text-primary': '#1A1A1A',
        'text-secondary': '#4A4A4A',
        'text-muted': '#7A7A7A',
        surface: '#F5F5F5',
        border: '#E5E5E5',
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
