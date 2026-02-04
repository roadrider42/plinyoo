// src/lib/supabase.ts
// Zweck: Lazy-initialized Supabase-Client für bessere Testbarkeit

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../domain/dom.supabase.types';

// Globale Variable für den Supabase-Client
let _client: SupabaseClient<Database> | null = null;

/**
 * Lazy-initialized Supabase Client
 * Wird erst beim ersten Aufruf erstellt, nicht beim Import
 */
export function supabase(): SupabaseClient<Database> {
  if (_client) return _client;

  // Unterstützung für beide Präfixe (REACT_APP_ und VITE_) für bessere Kompatibilität
  const SUPABASE_URL =
    import.meta.env.VITE_SUPABASE_URL || import.meta.env.REACT_APP_SUPABASE_URL;
  const SUPABASE_ANON_KEY =
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.REACT_APP_SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    const errorMsg =
      'Fehlende Umgebungsvariablen: ' +
      (!SUPABASE_URL
        ? 'VITE_SUPABASE_URL oder REACT_APP_SUPABASE_URL '
        : '') +
      (!SUPABASE_ANON_KEY
        ? 'VITE_SUPABASE_ANON_KEY oder REACT_APP_SUPABASE_ANON_KEY'
        : '');
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  try {
    _client = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storageKey: 'spoonup-auth',
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });

    if (import.meta.env.DEV) {
      console.log('✅ Supabase-Client erfolgreich initialisiert');
    }
  } catch (error) {
    console.error('❌ Fehler bei der Initialisierung des Supabase-Clients:', error);
    throw error;
  }

  return _client;
}

// --- DEBUG: verifyOtp payload logger (nur in Entwicklung) ---
if (import.meta.env.DEV) {
  try {
    const client = supabase();
    type VerifyOtpParams = Parameters<typeof client.auth.verifyOtp>;
    type VerifyOtpReturn = ReturnType<typeof client.auth.verifyOtp>;

    const __origVerify = client.auth.verifyOtp.bind(client.auth);

    // @ts-ignore - Wir patchen absichtlich
    client.auth.verifyOtp = async (
      ...args: VerifyOtpParams
    ): Promise<VerifyOtpReturn> => {
      const payload = args[0];
      const keys =
        payload && typeof payload === 'object' ? Object.keys(payload) : [];
      console.log(
        '[DEBUG verifyOtp] payload keys=',
        keys,
        'payload=',
        payload
      );

      const res = await __origVerify(...args);

      if (res?.error) {
        console.warn('[DEBUG verifyOtp] error:', {
          status: (res.error as any).status,
          code:
            (res.error as any).code ||
            (res.error as any).error_code,
          msg:
            res.error.message ||
            (res.error as any).error_description,
        });
      } else {
        console.info('[DEBUG verifyOtp] OK');
      }
      return res;
    };

    // Für Debugging im Browser verfügbar machen
    (window as any).__sb = client;
  } catch (error) {
    console.warn('verifyOtp debug patch failed:', error);
  }
}