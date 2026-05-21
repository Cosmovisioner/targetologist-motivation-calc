/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ivory: '#F7F7F6',
        graphite: '#1A1A1A',
        muted: '#6B6B6B',
        accent: '#2563EB',
        lime: '#BFFF00',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        display: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        brutal: '4px 4px 0 #1A1A1A',
        'brutal-sm': '2px 2px 0 #1A1A1A',
      },
    },
  },
  plugins: [],
}
