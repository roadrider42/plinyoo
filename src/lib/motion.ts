/**
 * lib/motion.ts
 * 
 * Zweck: Wiederverwendbare Framer Motion Variants für konsistente Animationen
 * Verantwortlichkeiten:
 * - Definiert Standard-Animationen für Landing Pages
 * - Respektiert prefers-reduced-motion für Accessibility
 * - Konsistente Timing und Easing-Funktionen
 * - Stagger-Animationen für Listen und Gruppen
 * 
 * Anti-Beispiele:
 * - Komplexe Animationslogik oder State-Management
 * - Component-spezifische Animationen (gehören in die Komponente)
 * - Performance-intensive Animationen ohne Optimierung
 */

import { Variants } from "framer-motion";

/**
 * Fade-in Animation von unten nach oben
 * Verwendet für Hero-Elemente und wichtige Content-Blöcke
 */
export const fadeUp: Variants = {
  hidden: { 
    opacity: 0, 
    y: 16,
    transition: { duration: 0.3 }
  },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] // easeOutQuart
    } 
  },
};

/**
 * Slide-in Animation von links
 * Verwendet für Elemente die von links erscheinen sollen
 */
export const flyLeft: Variants = {
  hidden: { 
    opacity: 0, 
    x: -24,
    transition: { duration: 0.3 }
  },
  show: { 
    opacity: 1, 
    x: 0, 
    transition: { 
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    } 
  },
};

/**
 * Slide-in Animation von rechts
 * Verwendet für Elemente die von rechts erscheinen sollen
 */
export const flyRight: Variants = {
  hidden: { 
    opacity: 0, 
    x: 24,
    transition: { duration: 0.3 }
  },
  show: { 
    opacity: 1, 
    x: 0, 
    transition: { 
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    } 
  },
};

/**
 * Stagger-Animation für Listen und Container
 * Animiert Kinder-Elemente nacheinander mit Verzögerung
 * 
 * @param delay - Verzögerung zwischen Kinder-Animationen in Sekunden
 * @returns Variants für Stagger-Container
 */
export const staggerList = (delay = 0.1): Variants => ({
  hidden: {
    transition: {
      staggerChildren: delay,
      staggerDirection: -1
    }
  },
  show: { 
    transition: { 
      staggerChildren: delay,
      delayChildren: 0.1
    } 
  },
});

/**
 * Sanfte Scale-Animation für Hover-Effekte
 * Verwendet für interaktive Elemente wie Cards oder Buttons
 */
export const scaleOnHover: Variants = {
  rest: { 
    scale: 1,
    transition: { duration: 0.2 }
  },
  hover: { 
    scale: 1.02,
    transition: { 
      duration: 0.2,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
};