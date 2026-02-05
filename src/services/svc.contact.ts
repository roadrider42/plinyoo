// src/services/svc.contact.ts
import { ContactFormSchema } from '@/domain/dom.contact.zod';

// A simple Result type for error handling
type Result<T> = { ok: true; data: T } | { ok: false; error: { code: string; message: string } };

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_FUNCTION_URL = supabaseUrl
  ? `${supabaseUrl.replace(/\/$/, '')}/functions/v1/plinyoo-contact`
  : 'https://ddbrdvwguyhnfvicheqn.supabase.co/functions/v1/plinyoo-contact';

export async function sendContactForm(formData: unknown): Promise<Result<void>> {
  const validation = ContactFormSchema.safeParse(formData);

  if (!validation.success) {
    console.error('Validation errors:', validation.error.flatten().fieldErrors);
    return { 
      ok: false, 
      error: { 
        code: 'VALIDATION_ERROR',
        message: 'Bitte überprüfen Sie Ihre Eingaben.'
      } 
    };
  }

  try {
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const response = await fetch(SUPABASE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      body: JSON.stringify(validation.data),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error('Failed to send form:', errorBody);
      return { ok: false, error: { code: 'SUBMISSION_FAILED', message: errorBody.error || 'Fehler beim Senden des Formulars.' } };
    }

    return { ok: true, data: undefined };

  } catch (error) {
    console.error('Network or other error:', error);
    return { ok: false, error: { code: 'NETWORK_ERROR', message: 'Netzwerkfehler. Bitte versuchen Sie es später erneut.' } };
  }
}
