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
        bg: {
          primary: '#0B0F14',
          secondary: '#121820',
        },
        surface: {
          DEFAULT: '#1A2332',
          hover: '#222C3D',
          active: '#283447',
        },
        border: {
          DEFAULT: '#2A3647',
          subtle: 'rgba(42, 54, 71, 0.5)',
          accent: '#2563EB',
        },
        accent: {
          primary: '#2563EB',
          secondary: '#1D4ED8',
          cyan: '#38BDF8',
        },
        semantic: {
          success: '#3B82F6',
          warning: '#C08200',
          error: '#AD0303',
        },
        state: {
          muted: '#84A1C0',
          disabled: '#A5B4C6',
        }
      },
      fontFamily: {
        heading: ['Alegreya Sans', 'sans-serif'],
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'neo': '0 8px 30px rgba(0, 0, 0, 0.5), 0 0 1px rgba(42, 54, 71, 0.6)',
        'accent': '0 0 20px rgba(37, 99, 235, 0.3)',
      }
    },
  },
  plugins: [],
};
