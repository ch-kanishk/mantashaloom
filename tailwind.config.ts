import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#261c16',
          100: '#3a2a21',
          200: '#533a2c',
          300: '#6e4b37',
          400: '#8f6246',
          500: '#b07c58',
          600: '#c99770',
          700: '#d9b08c',
          800: '#e6c8ac',
          900: '#f0dcc8',
        },
        // Dark theme: ink is the light text colour, paper the page, sand a raised
        // surface and night the deepest band. Text over photos stays plain white.
        ink: '#f1ebe1',
        paper: '#141210',
        night: '#0c0b09',
        sand: '#1f1c18',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      borderColor: { DEFAULT: 'rgb(241 235 225 / 0.1)' },
      maxWidth: { container: '1360px' },
    },
  },
  plugins: [],
} satisfies Config;
