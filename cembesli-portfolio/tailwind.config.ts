// Tailwind CSS configuration with custom design tokens for the bento portfolio
// Defines theme colors, font families, grid rows, and animations used across components
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#f5f5f7',
          dark: '#0b0f1a'
        },
        card: {
          DEFAULT: '#ffffff',
          dark: '#111827'
        },
        border: {
          DEFAULT: '#e5e7eb',
          dark: '#1f2937'
        },
        primary: {
          DEFAULT: '#6366f1',
          foreground: '#ffffff'
        },
        accent: {
          DEFAULT: '#34d399',
          foreground: '#0b0f1a'
        }
      },
      fontFamily: {
        display: ['var(--font-syne)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-dm-mono)', 'ui-monospace', 'monospace']
      },
      borderRadius: {
        card: '24px'
      },
      gridTemplateRows: {
        bento: 'repeat(auto-fill, 180px)'
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%, 100%': { transform: 'translateY(-4px)' }
        }
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease-out both',
        blink: 'blink 1s steps(1) infinite',
        float: 'float 3s ease-in-out infinite'
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
        lift: '0 4px 8px rgba(0,0,0,0.06), 0 16px 32px rgba(0,0,0,0.10)'
      }
    }
  },
  plugins: []
};

export default config;
