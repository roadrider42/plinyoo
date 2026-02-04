/**
 * components/ui/button.tsx
 * 
 * Zweck: Wiederverwendbare Button-Primitive mit SpoonUp-Design
 * Verantwortlichkeiten:
 * - Typsichere Button-Varianten (default, secondary, outline, ghost, link)
 * - Größen-Varianten (sm, default, lg, icon)
 * - Loading-States mit Spinner
 * - Accessibility (focus-visible, disabled states)
 * 
 * Anti-Beispiele:
 * - Geschäftslogik oder API-Aufrufe
 * - Komplexe State-Management
 * - Routing-Entscheidungen
 */

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from "../../lib/ui/cn";

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-xl font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-spoonup-braun text-white hover:bg-spoonup-gelb hover:text-spoonup-braun',
        secondary: 'bg-white text-spoonup-braun border-2 border-spoonup-braun hover:bg-spoonup-offwhite',
        outline: 'border border-spoonup-lightgray bg-white hover:bg-spoonup-offwhite',
        ghost: 'hover:bg-spoonup-offwhite',
        link: 'text-spoonup-braun underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-12 px-6 py-3',
        sm: 'h-9 px-4 rounded-lg',
        lg: 'h-14 px-8 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean; // Wird für Slot-Komponenten verwendet, aber aktuell nicht implementiert
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, asChild, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Loading...
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
