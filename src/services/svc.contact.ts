// src/services/svc.contact.ts
import { ContactFormSchema } from '@/domain/dom.contact.zod';

// Ein Fehler endet nie als Erfolg (#483): jeder Fehlerzweig WIRFT. Frueher kam
// hier { ok:false } zurueck, react-query nahm das als Erfolg, und die Seite
// zeigte "Erfolgreich gesendet" fuer eine Nachricht, die nie ankam.
//
// Was der Besucher liest, sind feste Saetze aus den Sprachdateien
// (forms.validation.*), gewaehlt nach Statuscode und -- nur im Browser -- nach
// dem Grund der eigenen Formpruefung. Der Text der Randfunktion (`error`,
// `meldung`) wird nie angezeigt.
//
// #533: "zu viel Text" nur, wenn die Laenge belegt ist (zod-Code `too_big`
// der eigenen Pruefung; die Hoechstlaengen gleichen plinyoo-contact). Eine 400
// vom Server traegt keinen Grund -- sie bekommt den ursachenneutralen Satz.
export type KontaktFehlerArt = 'grenze' | 'zu_lang' | 'abgelehnt' | 'sonst';

// `sonst` ist der Rueckfall: 500, Netzfehler, jeder unerwartete Fehler -- nie
// 429 und nie 400 (Sprecher 70834fc61, spoonup claude/_533/fehlersatz-
// allgemein.md). Seit #533 steht auch er in den Sprachdateien, in du; die
// Sie-Fassung aus #483 ist weg.
export const KONTAKT_SCHLUESSEL: Record<KontaktFehlerArt, string> = {
  grenze: 'forms.validation.error_rate_limit',
  zu_lang: 'forms.validation.error_too_long',
  abgelehnt: 'forms.validation.error_rejected',
  sonst: 'forms.validation.error_send_failed',
};

export class KontaktFehler extends Error {
  readonly art: KontaktFehlerArt;
  constructor(art: KontaktFehlerArt) {
    super(`KontaktFehler: ${art}`);
    this.name = 'KontaktFehler';
    this.art = art;
  }
}

type Uebersetzer = (schluessel: string, optionen: { fallbackLng: string[] }) => string;

/**
 * Der Satz fuer den Besucher -- fuer jeden Fehler, auch einen unerwarteten.
 * Fehlt ein Satz in der Sprache des Besuchers, gilt en (Sprecher 5c683c95e),
 * nie ein Servertext. Ist auch en (noch) nicht geladen, kommt null zurueck --
 * der Schluessel selbst ist kein Satz.
 */
export function kontaktFehlerSatz(error: unknown, t: Uebersetzer): string | null {
  const art: KontaktFehlerArt = error instanceof KontaktFehler ? error.art : 'sonst';
  const schluessel = KONTAKT_SCHLUESSEL[art];
  const satz = t(schluessel, { fallbackLng: ['en'] });
  return satz && satz !== schluessel ? satz : null;
}

/** Belegt die eigene Formpruefung, dass ein Feld zu lang ist? */
export function istZuLang(issues: ReadonlyArray<{ code: string }>): boolean {
  return issues.some((i) => i.code === 'too_big');
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_FUNCTION_URL = supabaseUrl
  ? `${supabaseUrl.replace(/\/$/, '')}/functions/v1/plinyoo-contact`
  : 'https://ddbrdvwguyhnfvicheqn.supabase.co/functions/v1/plinyoo-contact';

export async function sendContactForm(formData: unknown): Promise<void> {
  const validation = ContactFormSchema.safeParse(formData);

  if (!validation.success) {
    // Die Angaben passen nicht. Ist eine Laenge der Grund, sagt der Satz das;
    // sonst derselbe Satz wie bei einer 400 der Randfunktion.
    console.error('Validation errors:', validation.error.flatten().fieldErrors);
    throw new KontaktFehler(istZuLang(validation.error.issues) ? 'zu_lang' : 'abgelehnt');
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
