import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

let _client: SupabaseClient<Database> | null = null;

export function supabase(): SupabaseClient<Database> {
  if (_client) return _client;

  // Next.js zuerst, CRA als Fallback
  const SUPABASE_URL =
    import.meta.env.NEXT_PUBLIC_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_ANON_KEY =
    import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    const msg =
      'Fehlende Umgebungsvariablen: ' +
      (!SUPABASE_URL ? 'NEXT_PUBLIC_SUPABASE_URL/REACT_APP_SUPABASE_URL ' : '') +
      (!SUPABASE_ANON_KEY ? 'NEXT_PUBLIC_SUPABASE_ANON_KEY/REACT_APP_SUPABASE_ANON_KEY' : '');
    console.error(msg);
    throw new Error(msg);
  }

  _client = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      storageKey: 'spoonup-auth',
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  // Kleine Dev-Hilfen nur im Browser
  if (import.meta.env.MODE === 'development' && typeof window !== 'undefined') {
    _client.from('profiles').select('*').limit(1).then(({ error }) => {
      if (error) console.error('Fehler bei Testabfrage:', error);
      else console.log('Supabase-Client OK');
    });

    try {
      const client = _client;
      const __origVerify = (client.auth.verifyOtp as any).bind(client.auth);
      (client.auth as any).verifyOtp = async (payload: any) => {
        const keys = payload && typeof payload === 'object' ? Object.keys(payload) : [];
        console.log('[DEBUG verifyOtp] payload keys=', keys, 'payload=', payload);
        const res = await __origVerify(payload);
        if ((res as any)?.error) {
          const err: any = (res as any).error;
          console.warn('[DEBUG verifyOtp] error:', {
            status: err?.status, code: err?.code || err?.error_code, msg: err?.message || err?.error_description,
          });
        } else {
          console.info('[DEBUG verifyOtp] OK');
        }
        return res;
      };
      (window as any).__sb = client;
    } catch (e) {
      console.warn('verifyOtp debug patch failed:', e);
    }
  }

  return _client;
}
