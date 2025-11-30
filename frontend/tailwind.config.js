/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-main': '#121212',
        'bg-surface': '#1E1E2F',
        'border': '#2C2C3C',
        'text-primary': '#FFFFFF',
        'text-secondary': '#B0B0C3',
        'accent': '#7C5DFA',
        'success': '#28A745',
        'warning': '#FFC107',
        'error': '#DC3545',
      },
    },
  },
};