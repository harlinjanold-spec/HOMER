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
        command: {
          bg: '#060911',
          surface: '#0b0f19',
          card: '#0f1624',
          border: '#1e2c45',
          hover: '#151f32',
          cyan: '#06b6d4',
          teal: '#0ea5e9',
          mint: '#10b981',
          warn: '#f59e0b',
          alert: '#ef4444',
          purple: '#8b5cf6',
          textMuted: '#94a3b8',
          textBright: '#f8fafc',
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
