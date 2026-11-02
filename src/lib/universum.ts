// src/lib/universum.ts
// Zweck: Anordnung des Wissensuniversums (Sterne = Karten, Linien = Verweise).
// Dieselbe Rechnung wie in scripts/buchseiten.mjs (Federmodell nach Fruchterman-Reingold, deterministisch aus einer Kennung),
// damit Buchseite und Startseite dasselbe Bild für dieselben Daten zeichnen.

export const FELD = { W: 800, H: 420 } as const;

export type Punkt = { x: number; y: number };
export type Kante = [number, number];

export function seedRnd(kennung: string): () => number {
  let seed = [...kennung].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  return () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
}

export function anordnung(kennung: string, n: number, kanten: Kante[], W: number, H: number): Punkt[] {
  const rnd = seedRnd(kennung);
  const pos: Punkt[] = Array.from({ length: n }, (_, i) => {
    const w = (i / n) * Math.PI * 2;
    const r = 90 + rnd() * 90;
    return { x: W / 2 + Math.cos(w) * r, y: H / 2 + Math.sin(w) * r * 0.7 };
  });
  const k = Math.sqrt((W * H) / n) * 0.62;
  for (let it = 0; it < 500; it++) {
    const t = 70 * (1 - it / 500) + 0.5;
    const f = pos.map(() => ({ x: 0, y: 0 }));
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        let dx = pos[i].x - pos[j].x;
        let dy = pos[i].y - pos[j].y;
        const d = Math.max(Math.hypot(dx, dy), 1);
        const rep = (k * k) / d;
        dx /= d;
        dy /= d;
        f[i].x += dx * rep;
        f[i].y += dy * rep;
        f[j].x -= dx * rep;
        f[j].y -= dy * rep;
      }
    }
    for (const [a, b] of kanten) {
      let dx = pos[a].x - pos[b].x;
      let dy = pos[a].y - pos[b].y;
      const d = Math.max(Math.hypot(dx, dy), 1);
      const att = (d * d) / k;
      dx /= d;
      dy /= d;
      f[a].x -= dx * att;
      f[a].y -= dy * att;
      f[b].x += dx * att;
      f[b].y += dy * att;
    }
    for (let i = 0; i < n; i++) {
      f[i].x += (W / 2 - pos[i].x) * 0.35; // sanfte Schwerkraft zur Mitte
      f[i].y += (H / 2 - pos[i].y) * 0.5;
      const m = Math.max(Math.hypot(f[i].x, f[i].y), 1);
      pos[i].x += (f[i].x / m) * Math.min(m, t);
      pos[i].y += (f[i].y / m) * Math.min(m, t);
    }
  }
  // auf die Fläche einpassen
  const xs = pos.map((p) => p.x);
  const ys = pos.map((p) => p.y);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const mx = 70;
  const my = 60;
  return pos.map((p) => ({
    x: Math.round(mx + ((p.x - x0) / Math.max(x1 - x0, 1)) * (W - 2 * mx)),
    y: Math.round(my + ((p.y - y0) / Math.max(y1 - y0, 1)) * (H - 2 * my)),
  }));
}

// Wolke weiteren Wissens: schwache Punkte ohne Verbindung, nicht auf den Karten-Sternen
export function wolke(kennung: string, sterne: Punkt[], W: number, H: number, anzahl = 110) {
  const rnd = seedRnd(kennung + '-wolke');
  const punkte: { x: number; y: number; r: number; o: number }[] = [];
  while (punkte.length < anzahl) {
    const x = Math.round(rnd() * W);
    const y = Math.round(rnd() * H);
    if (sterne.some((p) => Math.hypot(p.x - x, p.y - y) < 34)) continue;
    punkte.push({ x, y, r: 0.9 + rnd() * 1.5, o: 0.25 + rnd() * 0.45 });
  }
  return punkte;
}
