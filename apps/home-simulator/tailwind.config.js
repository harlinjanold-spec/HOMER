/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#060911',
          900: '#0b0f19',
          850: '#0f1624',
          800: '#151f32',
          700: '#1e2c45',
          600: '#2b3d5c',
        },
        medical: {
          cyan: '#06b6d4',
          sky: '#0ea5e9',
          cobalt: '#3b82f6',
          indigo: '#6366f1',
          emerald: '#10b981',
          teal: '#14b8a6',
          amber: '#f59e0b',
          rose: '#f43f5e',
          crimson: '#ef4444',
        },
        ward: {
          navy: '#0b132b',
          slate: '#1c2541',
          teal: '#3a86c8',
          cyan: '#48cae4',
          alert: '#ef476f',
          warn: '#ffd166',
          success: '#06d6a0',
          bg: '#f8fafc',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -3px rgba(6, 182, 212, 0.35)',
        'glow-emerald': '0 0 20px -3px rgba(16, 185, 129, 0.35)',
        'glow-rose': '0 0 20px -3px rgba(244, 63, 94, 0.35)',
      },
    },
  },
  plugins: [],
};
