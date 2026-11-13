// src/services/svc.contact.ts
import { ContactFormSchema } from '@/domain/dom.contact.zod';

// Ein Fehler endet nie als Erfolg (#483): jeder Fehlerzweig WIRFT. Frueher kam
// hier { ok:false } zurueck, react-query nahm das als Erfolg, und die Seite
// zeigte "Erfolgreich gesendet" fuer eine Nachricht, die nie ankam.
//
// Was der Besucher liest, sind drei feste Saetze (Sprecher 41314483). Der Text
// der Randfunktion (`error`, `meldung`) wird nie angezeigt.
export type KontaktFehlerArt = 'grenze' | 'abgelehnt' | 'sonst';

const SATZ: Record<KontaktFehlerArt, string> = {
  grenze: 'Gerade kommen sehr viele Anfragen an, Ihre Nachricht ist noch nicht bei uns. Bitte versuchen Sie es spätestens in einer Stunde noch einmal.',
  abgelehnt: 'Ihre Angaben konnten nicht angenommen werden. Bitte prüfen Sie Name, E-Mail-Adresse und Nachricht, kürzen Sie besonders lange Texte und senden Sie das Formular noch einmal.',
  sonst: 'Das Senden hat nicht geklappt. Bitte versuchen Sie es in ein paar Minuten noch einmal.',
};

export class KontaktFehler extends Error {
  readonly art: KontaktFehlerArt;
  constructor(art: KontaktFehlerArt) {
    super(SATZ[art]);
    this.name = 'KontaktFehler';
    this.art = art;
  }
}

/** Der Satz fuer den Besucher -- fuer jeden Fehler, auch einen unerwarteten. */
export function kontaktFehlerSatz(error: unknown): string {
  return error instanceof KontaktFehler ? SATZ[error.art] : SATZ.sonst;
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_FUNCTION_URL = supabaseUrl
  ? `${supabaseUrl.replace(/\/$/, '')}/functions/v1/plinyoo-contact`
  : 'https://ddbrdvwguyhnfvicheqn.supabase.co/functions/v1/plinyoo-contact';

export async function sendContactForm(formData: unknown): Promise<void> {
  const validation = ContactFormSchema.safeParse(formData);

  if (!validation.success) {
    // Dieselbe Lage wie eine 400 der Randfunktion: die Angaben passen nicht.
    console.error('Validation errors:', validation.error.flatten().fieldErrors);
    throw new KontaktFehler('abgelehnt');
  }

  let response: Response;
  try {
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    response = await fetch(SUPABASE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      body: JSON.stringify(validation.data),
    });
  } catch (error) {
    console.error('Network or other error:', error);
    throw new KontaktFehler('sonst');
  }

  if (!response.ok) {
    console.error('Failed to send form: status', response.status);
    if (response.status === 429) throw new KontaktFehler('grenze');
    if (response.status === 400) throw new KontaktFehler('abgelehnt');
    throw new KontaktFehler('sonst');
  }
}
