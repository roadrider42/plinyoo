// src/lib/messung.ts
// Zweck: Ereignisse an Plausible melden (ohne Personenbezug: nur Namen und Kennungen, nie Freitext).
// Plausible lädt über das Skript in index.html; ohne Skript (z. B. lokal geblockt) passiert nichts.

type PlausibleFn = (name: string, optionen?: { props: Record<string, string> }) => void;

export function ereignis(name: string, props?: Record<string, string>): void {
  const p = (window as unknown as { plausible?: PlausibleFn }).plausible;
  if (typeof p === 'function') p(name, props ? { props } : undefined);
}
