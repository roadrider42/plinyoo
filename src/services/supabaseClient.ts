import { createClient } from '@supabase/supabase-js';
import { config } from '@/lib/config';

// This service initializes and exports the Supabase client.
// It should only be active in live mode for operations that require it.

let supabase: any = null;

if (!config.isDemoMode) {
  supabase = createClient(config.supabase.url, config.supabase.anonKey);
} else {
  console.log("Supabase client is not initialized in demo mode.");
}

export const supabaseClient = supabase;
