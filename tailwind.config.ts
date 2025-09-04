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
          50: '#fff7ed',   // orange très clair
          100: '#ffedd5',  // orange clair
          200: '#fed7aa',  // orange pâle
          300: '#fdba74',  // orange doux
          400: '#fb923c',  // orange moyen
          500: '#f97316',  // orange principal ⭐
          600: '#ea580c',  // orange foncé
          700: '#c2410c',  // orange très foncé
          800: '#9a3412',  // orange brun
          900: '#7c2d12',  // orange très brun
        },
        // 🌿 Couleurs secondaires - Vert plus doux
        secondary: {
          50: '#f6fbf6',
          100: '#eaf6ea',
          200: '#d6edd6',
          300: '#b3ddb3',
          400: '#8bc78b',
          500: '#6bb36b', 
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
          500: '#f0b429', 
          600: '#d89614',
          700: '#b4740e',
          800: '#925912',
          900: '#784713',
        },
      },
      fontFamily: {
        'display': ['Poppins', 'sans-serif'],    
        'sans': ['Inter', 'sans-serif'],         
      },
    },
  },
  plugins: [],
}
