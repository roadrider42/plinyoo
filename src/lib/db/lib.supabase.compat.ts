/**
 * lib.supabase.compat.ts
 * 
 * Kompatibilitäts-Layer: Re-exportiert den zentralen Supabase-Client
 * und warnt bei direkter Nutzung.
 * 
 * Ziele:
 * - Alte direkte Aufrufe identifizieren
 * - Protokoll behalten
 * - Graduelles Ersetzen ermöglichen
 * 
 * NICHT verwenden für neue Implementierungen!
 * Siehe docs/PROFILE-DECISIONS.md für die empfohlene Vorgehensweise.
 */
import { createClient } from '@supabase/supabase-js';

// Get environment variables with proper TypeScript types and better error messages
function getEnvVar(key: 'REACT_APP_SUPABASE_URL' | 'REACT_APP_SUPABASE_ANON_KEY'): string {
  // Check if we're in a non-browser environment
  if (typeof window === 'undefined' && import.meta.env.MODE !== 'development') {
    warn('useSupabase', 'Running in a non-browser environment. Make sure to use the server-side Supabase client.');
  }
  // Fall back to process.env for Node.js environments (if available)
  if (typeof process !== 'undefined') {
    const processValue = (process as any).env?.[key] as string | undefined;
    if (processValue) return processValue;
  }
  
  // Provide a helpful error message
  const envHint = key.startsWith('REACT_APP_') 
    ? `Make sure to prefix it with REACT_APP_ in your .env file and restart the development server.`
    : 'Make sure it is properly defined in your environment variables.';
    
  throw new Error(
    `❌ Missing required environment variable: ${key}\n` +
    `${envHint}\n` +
    `Current environment: ${import.meta.env.MODE || 'development'}`
  );
};

// Get Supabase configuration with error handling
try {
  var supabaseUrl = getEnvVar('REACT_APP_SUPABASE_URL');
  var supabaseAnonKey = getEnvVar('REACT_APP_SUPABASE_ANON_KEY');
} catch (error: unknown) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  console.error('❌ Failed to initialize Supabase client:', errorMessage);
  console.log('\n💡 Tip: Create a .env file in the project root with:');
  console.log(`REACT_APP_SUPABASE_URL=your_supabase_url`);
  console.log(`REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key\n`);
  
  // Provide mock values in development to prevent app from crashing
  if (import.meta.env.MODE === 'development') {
    console.warn('⚠️  Using mock Supabase URL and key for development');
    supabaseUrl = 'https://mock-supabase-url.supabase.co';
    supabaseAnonKey = 'mock-supabase-anon-key';
  } else {
    throw error; // Re-throw in production
  }
}

// Create the actual Supabase client
const createSupabaseClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
};

// Track warned methods to avoid console spam
const warnedMethods = new Set<string>();

function warn(method: string, detail: string = ''): void {
  const key = `${method}:${detail}`;
  
  // In Dev klar warnen; in Prod nur einmal pro Methode
  const isDevelopment = (import.meta as any).env?.NODE_ENV === 'development' || import.meta.env.MODE === 'development';
  if (isDevelopment || !warnedMethods.has(key)) {
    console.warn(
      `[DEPRECATED] Direct supabase.${method} used${detail ? `: ${detail}` : ''}.\n` +
      'Use repository pattern (repo.*) instead. See docs/PROFILE-DECISIONS.md'
    );
    warnedMethods.add(key);
  }
}

// Create the actual Supabase client
const supabaseClient = createSupabaseClient();

// Create a proxy to intercept all method calls
const compat = new Proxy(supabaseClient, {
  get(target, prop) {
    const value = Reflect.get(target, prop);
    
    // Special handling for storage
    if (prop === 'storage') {
      const storage = target.storage;
      return new Proxy(storage, {
        get(storageTarget, storageProp) {
          const storageValue = Reflect.get(storageTarget, storageProp);
          if (storageProp === 'from') {
            return (bucket: string) => {
              warn('storage.from', bucket);
              return storageValue.call(storageTarget, bucket);
            };
          }
          return storageValue;
        }
      });
    }
    
    // Handle methods like from(), rpc()
    if (prop === 'from' || prop === 'rpc') {
      return (tableOrFn: string) => {
        warn(prop.toString(), tableOrFn);
        return value.call(target, tableOrFn);
      };
    }
    
    // For other properties/methods, just pass through with a warning
    if (typeof value === 'function') {
      return (...args: unknown[]) => {
        warn(prop.toString());
        return value.apply(target, args);
      };
    }
    
    return value;
  }
});

// Export both named and default exports for compatibility
export const supabase = compat;
export { compat as default };

// Add _raw access for emergency cases
export const _raw = supabaseClient;
