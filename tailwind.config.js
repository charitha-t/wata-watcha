// Tailwind CSS v3 configuration — Wata Watcha design system tokens
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0D1B2A',
        surface: '#112233',
        border: '#1E3A5F',
        primary: '#0077B6',
        accent: '#00B4D8',
        danger: '#EF233C',
        success: '#06D6A0',
        warning: '#FFB703',
        muted: '#8BA3BC',
      },
      fontFamily: {
        serif: ['"DM Serif Display"', 'serif'],
        sans: ['"DM Sans"', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out both',
        'slide-up': 'slideUp 0.4s ease-out both',
        'slide-down': 'slideDown 0.3s ease-out both',
        'pulse-slow': 'pulseSlow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
