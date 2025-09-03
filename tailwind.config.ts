/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // 🌸 Couleurs principales - Corail très doux
        primary: {
          50: '#fef9f7',
          100: '#fef2ed',
          200: '#fce1d3',
          300: '#f9c8af',
          400: '#f5a881',
          500: '#ef8b5f', // Couleur principale
          600: '#e06d42',
          700: '#c55a35',
          800: '#a04a2f',
          900: '#823e2a',
        },
        // 🌿 Couleurs secondaires - Vert plus doux
        secondary: {
          50: '#f6fbf6',
          100: '#eaf6ea',
          200: '#d6edd6',
          300: '#b3ddb3',
          400: '#8bc78b',
          500: '#6bb36b', // Vert principal
          600: '#5a9a5a',
          700: '#4a7d4a',
          800: '#3f633f',
          900: '#355235',
        },
        // 🍯 Couleurs d'accent - Miel délicat
        accent: {
          50: '#fffef6',
          100: '#fffaeb',
          200: '#fff3d1',
          300: '#ffe7a8',
          400: '#ffd473',
          500: '#f0b429', // Miel principal
          600: '#d89614',
          700: '#b4740e',
          800: '#925912',
          900: '#784713',
        },
        // 🤍 Neutres chaleureux
        neutral: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
        },
        // 🎨 Couleurs sémantiques
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },
      fontFamily: {
        'display': ['Poppins', 'sans-serif'],    // Pour les titres - moderne et friendly
        'body': ['Inter', 'sans-serif'],         // Pour le texte - lisible  
        'sans': ['Inter', 'sans-serif'],         // Default
      },
      borderRadius: {
        'xs': '0.25rem',
        'sm': '0.5rem',
        'md': '0.75rem',
        'lg': '1rem',
        'xl': '1.5rem',
        '2xl': '2rem',
      },
      boxShadow: {
        'soft': '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'gentle': '0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.08)',
        'warm': '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 0.6s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 20%, 53%, 80%, 100%': { transform: 'translate3d(0,0,0)' },
          '40%, 43%': { transform: 'translate3d(0,-8px,0)' },
          '70%': { transform: 'translate3d(0,-4px,0)' },
          '90%': { transform: 'translate3d(0,-2px,0)' },
        },
      },
    },
  },
  plugins: [],
}
