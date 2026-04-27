/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:     '#f3f8e8',
          100:    '#e4f1c4',
          400:    '#9acf41',
          500:    '#8cbf35',
          600:    '#8cbf35',
          700:    '#70992a',
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
