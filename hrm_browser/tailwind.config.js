const monochrome = {
  50: '#fafafa',
  100: '#f5f5f5',
  200: '#e5e5e5',
  300: '#d4d4d4',
  400: '#a3a3a3',
  500: '#737373',
  600: '#525252',
  700: '#404040',
  800: '#262626',
  900: '#171717',
  950: '#0a0a0a',
};

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      inherit: 'inherit',
      black: '#000',
      white: '#fff',
      slate: monochrome,
      blue: monochrome,
      cyan: monochrome,
      sky: monochrome,
      violet: monochrome,
      indigo: monochrome,
      amber: monochrome,
      emerald: monochrome,
      green: monochrome,
      orange: monochrome,
      red: monochrome,
      rose: monochrome,
      teal: monochrome,
      yellow: monochrome,
    },
    extend: {
      colors: {
        primary: monochrome,
      },
    },
  },
  plugins: [],
};
