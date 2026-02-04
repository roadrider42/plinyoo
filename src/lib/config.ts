/**
 * config.ts
 * 
 * ✅ Zweck:
 * Zentrale Konfigurationsdatei für alle Umgebungsvariablen.
 * Stellt sicher, dass alle Umgebungsvariablen an einer Stelle definiert sind
 * und typsicher verwendet werden können.
 * 
 * 👉 Verwendung:
 * import { config } from '@/lib/config';
 * const supabaseUrl = config.supabase.url;
 */

// Typsichere Konfiguration
// Betriebsmodus
const VITE_APP_ENV = import.meta.env.VITE_APP_ENV || 'production';

// Supabase
const VITE_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const VITE_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Demo Modus basierend auf der APP_ENV Variable
const isDemoMode = VITE_APP_ENV === 'demo';

// Validierung der Umgebungsvariablen
if (!VITE_SUPABASE_URL) {
  throw new Error('VITE_SUPABASE_URL is not defined');
}
if (!VITE_SUPABASE_ANON_KEY) {
  throw new Error('VITE_SUPABASE_ANON_KEY is not defined');
}

// Typsicheres Konfigurationsobjekt
export const config = {
  env: VITE_APP_ENV,
  isDemoMode,
  supabase: {
    url: VITE_SUPABASE_URL,
    anonKey: VITE_SUPABASE_ANON_KEY,
  },
};
