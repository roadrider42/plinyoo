/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        /**
         * Cognitive Infrastructure (CI)
         * Leitidee: "Arbeitsoberfläche für Denken" – klar, neutral, präzise
         * + etwas frischer (Teal/Mist), ohne verspielt zu sein.
         */

        // Core brand
        primary: '#1C2A33',     // Graphite / Ink
        accent: '#4A6FA5',      // Steel Blue
        highlight: '#E3A72F',   // Signal Amber (sparsam!)

        // Neue Akzentpalette - Cognitive, aber lebendig
        'soft-teal': '#6FB3B8',    // Soft Teal (neu – Frische, ruhig)
        'mist-green': '#E6F0EF',   // Mist Green (neu – Section-Hintergründe)

        // Neue Akzentpalette - Cognitive, aber lebendig
        'soft-teal': '#6FB3B8',    // Soft Teal (neu – Frische, ruhig)
        'mist-green': '#E6F0EF',   // Mist Green (neu – Section-Hintergründe)

        // Background / text (harmonisiert, neutraler)
        'main-background': '#F4F5F7', // Off-White UI
        'main-text': '#141A1F',       // Ink Black (bessere Lesbarkeit)

        /**
         * System Tokens (nutze diese in Components!)
         * surfaces für Section-Rhythmus, border/text für Konsistenz
         */
        surface: {
          1: '#FFFFFF', // Cards
          2: '#F8FAFC', // Neutral section
          3: '#EEF2F6', // Subtle panel
          // NEW: getönte Section für Rhythmus (statt überall gleich grau)
          tint: '#E6F0EF', // = mist-green, aber semantisch benannt
        },
        border: {
          DEFAULT: '#D7DEE6',
          strong: '#B9C4D0',
          // NEW: hairline für extrem subtile Trennlinien / grids
          hairline: 'rgba(28, 42, 51, 0.08)',
        },
        text: {
          DEFAULT: '#141A1F',
          muted: '#5B6672',
          faint: '#8B96A3',
          inverse: '#F4F5F7',
        },

        /**
         * Action tokens (NEW): klare Buttons/Links ohne hartes “brand überall”
         */
        action: {
          primary: '#1C2A33',
          primaryHover: '#16222A',
          subtle: '#F8FAFC',
          subtleHover: '#EEF2F6',
        },

        /**
         * Semantic states
         */
        success: '#16A34A',
        error: '#DC2626',
        warning: '#D97706',
        info: '#2563EB',

        /**
         * Focus & ring
         */
        ring: {
          DEFAULT: '#4A6FA5',
          soft: 'rgba(74, 111, 165, 0.35)',
          // NEW: Teal ring für “frisch” auf Inputs/Accordions
          teal: 'rgba(111, 179, 184, 0.35)',
        },

        /**
         * Dark Mode
         */
        dark: {
          bg: '#0F1419',
          surface: '#161C22',
          surface2: '#1D2630',
          text: '#E7EDF4',
          muted: '#B3C0CD',
          border: '#2B3744',
          accent: '#7FA6D9',
          highlight: '#F0B73C',
          // NEW: dark tint + teal for parity
          tint: '#12212A',
          teal: '#6FB3B8',
        },

        // SpoonUp Legacy (getrennt behalten)
        'spoonup-darkgray': '#4A4A4A',
        'spoonup-braun': '#E6D9B9',
      },

      /**
       * Typography
       * Wichtig: serif NICHT auf sans mappen – sonst sind Utility-Klassen sinnlos.
       * Besser: serif als echte Serif-Option (selten nutzen), Default bleibt sans.
       */
      fontFamily: {
        sans: ['"IBM Plex Sans"', '"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        // serif zeigt jetzt auch auf IBM Plex Sans für Konsistenz
        serif: ['"IBM Plex Sans"', '"Inter"', 'system-ui', 'sans-serif'],
      },

      /**
       * Radii: etwas weniger “puffy”
       */
      borderRadius: {
        md: '0.625rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.25rem',
      },

      /**
       * Shadows: modern & ruhig, weniger Glow
       * NEW: hairline-shadow für Cards ohne “SaaS-Schwebe”
       */
      boxShadow: {
        'ci-hairline': '0 1px 0 rgba(16, 24, 40, 0.06)',
        'ci': '0 1px 2px rgba(16, 24, 40, 0.06), 0 2px 6px rgba(16, 24, 40, 0.06)',
        'ci-lg': '0 6px 18px rgba(16, 24, 40, 0.12)',
        'ci-xl': '0 10px 30px rgba(16, 24, 40, 0.18)',

        // legacy bleibt
        'spoonup': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'spoonup-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'spoonup-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
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
        'container': '1200px',
      },
      fontSize: {
        'xxs': ['0.6875rem', { lineHeight: '1rem' }],
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
          '2xl': '1200px',
        },
      },

      /**
       * Motion: subtil, orientierend
       * NEW: "float" nur für sehr leichte Card-Hovers
       */
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-in-fast': 'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'lift': 'lift 0.2s ease-out',
        'float': 'float 0.22s ease-out',
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
        lift: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-2px)' },
        },
        float: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-1px)' },
        },
      },
    },
  },
  plugins: [],
}