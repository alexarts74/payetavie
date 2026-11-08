/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Override violet scale → nouvelle palette nature/warm
        violet: {
          50:  '#EEF7F1',  // vert très clair → icon backgrounds
          100: '#F5E9AF',  // jaune pâle → texte sur fond vert foncé
          200: '#EBA7CB',  // rose → accent sur fond foncé
          300: '#C4D9CB',
          400: '#5E8A71',  // vert moyen → états désactivés
          500: '#2D6244',
          600: '#235037',  // vert foncé → PRIMARY
          700: '#1A3D2A',
          900: '#0F2419',
        },
        surface: '#F5E9AF',  // jaune pâle (fond de page) — 60%
        card:    '#FFFFFF',
        nav:     '#1A2F21',  // vert très foncé pour tab bar
        muted:   '#5A6B61',  // gris-vert pour texte secondaire
        // Tokens 60/30/10
        accent:         '#EBA7CB',  // rose — 10%
        'accent-light': '#FDEEF6',  // rose-50 pour fonds
      },
      fontFamily: {
        heading: ['Caprasimo_400Regular'],
        body:    ['Jost_300Light'],
        medium:  ['Jost_500Medium'],
      },
    },
  },
  plugins: [],
}
