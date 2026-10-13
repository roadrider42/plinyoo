// src/components/ui/Story.tsx
// Zweck: Der Gedanke hinter plinyoo in drei Sätzen — Wissen, das bleibt · Der Kern · Das Ergebnis.
// Texte: die bisherigen Hero-Varianten (hero1–3), in allen Sprachen vorhanden.

import React from 'react';
import { useTranslation } from 'react-i18next';

const KEYS = ['hero1', 'hero2', 'hero3'] as const;

export default function Story() {
  const { t } = useTranslation();

  return (
    <section className="mx-auto w-full max-w-6xl px-5 pb-6 pt-4 sm:px-8">
      <div className="grid gap-4 md:grid-cols-3">
        {KEYS.map((key, index) => (
          <div key={key} className="relative rounded-2xl border border-border bg-surface-1 p-6 shadow-sm">
            <span className="mb-4 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
              {index + 1}
            </span>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-text-muted">{t(`${key}.eyebrow`)}</p>
            <h2 className="mb-2 font-sans text-xl font-bold leading-snug text-primary">{t(`${key}.title`)}</h2>
            <p className="text-sm leading-relaxed text-text-muted">{t(`${key}.subtitle`)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
