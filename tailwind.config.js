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
         */

        // Core brand (behalte primary als Anker, aber leicht "tooliger")
        primary: '#1C2A33',     // Graphite / Ink (statt sehr "fashion navy")
        accent: '#4A6FA5',      // Steel Blue (funktional, nicht neon)
        highlight: '#E3A72F',   // Signal Amber (sparsam, für Hinweise/CTA)

        // Neue Akzentpalette - Cognitive, aber lebendig
        'soft-teal': '#6FB3B8',    // Soft Teal (neu – Frische, ruhig)
        'mist-green': '#E6F0EF',   // Mist Green (neu – Section-Hintergründe)

        // Background / text (harmonisiert, neutraler)
        'main-background': '#F4F5F7', // Off-White UI
        'main-text': '#141A1F',       // Ink Black (bessere Lesbarkeit)

        /**
         * System Tokens (empfohlen in Components statt "primary" überall)
         * Du bekommst damit: bg/surface/border/muted + states.
         */
        surface: {
          1: '#FFFFFF', // Cards
          2: '#F8FAFC', // Sections
          3: '#EEF2F6', // Subtle panels
        },
        border: {
          DEFAULT: '#D7DEE6',
          strong: '#B9C4D0',
        },
        text: {
          DEFAULT: '#141A1F',
          muted: '#5B6672',
          faint: '#8B96A3',
          inverse: '#F4F5F7',
        },

        /**
         * Semantic states (leicht angepasst auf CI Palette)
         * (bleiben kompatibel zu deinen bestehenden success/error/warning/info)
         */
        success: '#16A34A',
        error: '#DC2626',
        warning: '#D97706',
        info: '#2563EB',

        /**
         * Focus & ring (für Accessibility + "Tool"-Feeling)
         */
        ring: {
          DEFAULT: '#4A6FA5',
          soft: 'rgba(74, 111, 165, 0.35)',
        },

        /**
         * Dark Mode Token Set
         * Ziel: "Studio/Console" – ruhig, nicht gaming-schwarz
         */
        dark: {
          bg: '#0F1419',        // tiefes Ink
          surface: '#161C22',   // Card
          surface2: '#1D2630',  // Panel
          text: '#E7EDF4',
          muted: '#B3C0CD',
          border: '#2B3744',
          accent: '#7FA6D9',    // helleres Steel Blue
          highlight: '#F0B73C', // Amber
        },

        /**
         * SpoonUp Legacy (lass ich drin – aber klar getrennt)
         */
        'spoonup-darkgray': '#4A4A4A',
        'spoonup-braun': '#E6D9B9',
      },

      /**
       * Typography: raus aus "Playfair" (fashion/editorial),
       * rein in "IBM Plex" (Werkzeug / Wissen / System).
       * Inter bleibt super als Default.
       */
      fontFamily: {
        sans: ['"IBM Plex Sans"', '"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        // serif optional, aber nicht als primäre CI-Schrift
        serif: ['"Source Serif 4"', 'serif'],
      },

      /**
       * Radii: etwas weniger "puffy"
       * (2xl bleibt, aber Default eher sachlich)
       */
      borderRadius: {
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.25rem',
      },

      /**
       * Shadows: weniger "SaaS-Glow", mehr "UI-echte Tiefe"
       */
      boxShadow: {
        // ersetzt spoonup-Look durch neutralere UI Schatten
        'ci': '0 1px 2px rgba(16, 24, 40, 0.06), 0 2px 6px rgba(16, 24, 40, 0.06)',
        'ci-lg': '0 6px 18px rgba(16, 24, 40, 0.12)',
        'ci-xl': '0 10px 30px rgba(16, 24, 40, 0.18)',

        // legacy bleibt, falls du es noch brauchst
        'spoonup': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'spoonup-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'spoonup-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },

      /**
       * Spacing / container / font sizes: übernehme ich weitgehend
       */
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
       * Motion: bleibt, aber ich ergänze "subtle" Varianten
       */
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in-fast': 'fadeIn 0.25s ease-out',
        'lift': 'lift 0.2s ease-out',
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
      },
    },
  },
  plugins: [],
}