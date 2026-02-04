/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.html"
  ],
  darkMode: 'class', // Enable dark mode via .dark class
  theme: {
    extend: {
      colors: {
        // plinyoo Brand Colors
        primary: '#1B2B34',       // Deep Tech Blue
        accent: '#5AD4CF',        // Soft Cyan / Digital Mint
        highlight: '#F7C948',     // Warm Yellow
        'main-background': '#F7F8FA',    // Light Grey, renamed to avoid conflict
        'main-text': '#1B2B34',           // Text color matching primary

        // SpoonUp Legacy Colors
        'spoonup-darkgray': '#4A4A4A',
        'spoonup-braun': '#E6D9B9',

        // Semantische Farben für Feedback
        'success': '#10B981',      // Grün für Erfolgsmeldungen
        'error': '#EF4444',        // Rot für Fehlermeldungen
        'warning': '#F59E0B',      // Gelb für Warnungen
        'info': '#3B82F6',         // Blau für Informationen
        // Dark Mode Support
        'dark': {
          'bg': '#1a1a1a',
          'surface': '#2d2d2d',
          'text': '#e5e5e5'
        }
      },
      fontFamily: {
        'sans': ['"Inter"', 'system-ui', 'sans-serif'],
        'serif': ['"Playfair Display"', 'serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'spoonup': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'spoonup-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'spoonup-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      },
      spacing: {
        '18': '4.5rem',
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
        'container': '1200px', // SpoonUp max container width
      },
      fontSize: {
        'xxs': ['0.6875rem', { lineHeight: '1rem' }], // 11px
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '1.5rem',
          lg: '2rem',
          xl: '3rem',
          '2xl': '4rem',
        },
        screens: {
          sm: '100%',
          md: '100%',
          lg: '1024px',
          xl: '1280px',
          '2xl': '1200px', // SpoonUp max width
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
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
      },
    },
  },
  plugins: [],
}
