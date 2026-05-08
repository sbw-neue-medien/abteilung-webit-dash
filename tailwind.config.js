/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        brand: {
          400:    '#9acf41',
          500:    'var(--c-brand)',
          600:    'var(--c-brand)',
          700:    'var(--c-brand-700)',
          subtle: 'var(--c-brand-subtle)',
        },
        // Semantic tokens — change automatically in dark mode via CSS vars
        bg:     'var(--c-bg)',
        surface:'var(--c-surface)',
        lift:   'var(--c-lift)',
        line:   'var(--c-line)',
        groove: 'var(--c-groove)',
        hi:     'var(--c-hi)',
        mid:    'var(--c-mid)',
        lo:     'var(--c-lo)',
      },
    },
  },
  plugins: [],
}
