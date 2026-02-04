/**
 * components/ui/input.tsx
 * 
 * Zweck: Basis Input-Primitive mit SpoonUp-Design
 * Verantwortlichkeiten:
 * - Typsichere Input-Eigenschaften
 * - Konsistente Styling mit SpoonUp-Farben
 * - Focus-States und Accessibility
 * - File-Input Support
 * 
 * Anti-Beispiele:
 * - Komplexe Validierungslogik
 * - Form-State-Management
 * - Icon-Integration (nutze InputField dafür)
 */

import * as React from 'react';
import { cn } from "../../lib/ui/cn";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-12 w-full rounded-xl border border-spoonup-lightgray bg-white px-4 py-3 text-base ring-offset-white transition-colors',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'placeholder:text-spoonup-darkgray/50',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spoonup-braun focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
