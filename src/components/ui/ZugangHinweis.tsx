// src/components/ui/ZugangHinweis.tsx
// #503: Die Zeile „Wir melden uns persönlich bei dir." steht in Sichtweite jeder Schaltfläche, die auf /zugang führt
// (Urteil des Sprechers 11.11.2026, Bedingung für den Wortlaut „Ich will dabei sein").
// Nur in Sprachen mit eigenem Text unter cta.hinweis: Für en gibt es keinen geurteilten Satz, und der Rückfall
// fallbackLng 'de' würde dort einen deutschen Satz unter eine englische Schaltfläche stellen. Dann steht nichts.
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function ZugangHinweis({ className = '' }: { className?: string }) {
  const { i18n } = useTranslation();
  const text = i18n.getResource(i18n.resolvedLanguage || i18n.language, 'translation', 'cta.hinweis');
  if (typeof text !== 'string' || text === '') return null;
  return (
    <p data-ziel="zugang-hinweis" className={`text-sm leading-snug text-text-muted ${className}`}>
      {text}
    </p>
  );
}
