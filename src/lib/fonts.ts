import localFont from 'next/font/local'

/** Bodoni Moda — a fashion-editorial Didone, self-hosted (SIL OFL). */
export const displayFont = localFont({
  src: [
    { path: '../fonts/bodoni-moda-normal.woff2', style: 'normal', weight: '400 900' },
    { path: '../fonts/bodoni-moda-italic.woff2', style: 'italic', weight: '400 900' },
  ],
  variable: '--font-display',
  display: 'swap',
  fallback: ['Didot', 'Georgia', 'serif'],
})

/** Jost — a geometric sans in the Futura tradition, self-hosted (SIL OFL). */
export const textFont = localFont({
  src: '../fonts/jost.woff2',
  weight: '100 900',
  variable: '--font-text',
  display: 'swap',
  fallback: ['Futura', 'Avenir Next', 'Helvetica Neue', 'Arial', 'sans-serif'],
})
