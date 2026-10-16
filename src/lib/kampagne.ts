// src/lib/kampagne.ts
// Zweck: Herkunft eines Besuchs (Buchseite, Kanal) lesen und für die Sitzung merken, damit die
// Zugangsanfrage sagen kann, woher sie kommt. Die Website nutzt einen Hash-Router: Parameter stehen
// entweder VOR dem '#' (z. B. von der Buchseite) oder dahinter (interne Links) — beide werden gelesen.
// Es wird nichts an Dritte gesendet; gespeichert wird nur im sessionStorage des Browsers.

export interface Kampagne {
  buch?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

const KEYS = ['buch', 'utm_source', 'utm_medium', 'utm_campaign'] as const;
const STORAGE_KEY = 'plinyoo.kampagne';

// Nur harmlose Zeichen und begrenzte Länge: Der Wert landet in einer E-Mail.
const clean = (v: string | null): string | undefined => {
  if (!v) return undefined;
  const s = v.trim().slice(0, 80);
  return /^[\w.\-+ :/]+$/.test(s) ? s : undefined;
};

function fromSearch(search: string): Kampagne {
  const p = new URLSearchParams(search.startsWith('?') ? search : `?${search}`);
  const out: Kampagne = {};
  for (const k of KEYS) {
    const v = clean(p.get(k));
    if (v) out[k] = v;
  }
  return out;
}

export function readKampagne(): Kampagne {
  if (typeof window === 'undefined') return {};
  const hashQuery = window.location.hash.includes('?') ? window.location.hash.split('?')[1] : '';
  return { ...fromSearch(window.location.search), ...fromSearch(hashQuery) };
}

/** Beim ersten Besuch merken; ein späterer Besuch ohne Parameter überschreibt nichts. */
export function rememberKampagne(): void {
  try {
    const now = readKampagne();
    if (Object.keys(now).length === 0) return;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(now));
  } catch {
    /* Speicher gesperrt — dann gibt es eben keine Herkunft */
  }
}

export function getKampagne(): Kampagne {
  const now = readKampagne();
  if (Object.keys(now).length > 0) return now;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Kampagne) : {};
  } catch {
    return {};
  }
}

/** Kopfzeilen für die Nachricht an den Posteingang. Leer, wenn nichts bekannt ist. */
export function kampagneZeilen(k: Kampagne): string[] {
  const zeilen: string[] = [];
  if (k.buch) zeilen.push(`Buch: ${k.buch}`);
  const quelle = [k.utm_source, k.utm_medium, k.utm_campaign].filter(Boolean).join(' / ');
  if (quelle) zeilen.push(`Quelle: ${quelle}`);
  return zeilen;
}
