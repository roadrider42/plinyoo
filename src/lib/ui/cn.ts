/**
 * lib/ui/cn.ts
 * 
 * Zweck: Utility für dynamische Tailwind-Klassen-Kombinationen
 * Verantwortlichkeiten:
 * - Kombiniert conditional classes mit clsx
 * - Deduplication und Konfliktauflösung mit tailwind-merge
 * - Typsichere Klassen-Manipulation für UI-Komponenten
 * 
 * Anti-Beispiele:
 * - Geschäftslogik oder State-Management
 * - Direkte Style-Manipulation
 * - Komplexe CSS-Berechnungen
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Kombiniert Tailwind-Klassen mit Conditional Logic und Deduplication
 * 
 * @param inputs - Array von Klassen-Strings, Objekten oder Conditional Values
 * @returns Optimierter Klassen-String ohne Duplikate und Konflikte
 * 
 * @example
 * cn('px-2 py-1', condition && 'bg-blue-500', { 'text-white': active })
 * // => "px-2 py-1 bg-blue-500 text-white"
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
