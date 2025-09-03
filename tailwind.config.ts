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
          500: '#ef8b5f', 
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
