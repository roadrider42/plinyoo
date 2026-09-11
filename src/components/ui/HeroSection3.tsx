// src/components/ui/HeroSection3.tsx
// Hero 3 – Das Ergebnis: Kompetenz entwickeln

import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';

export default function HeroSection3() {
  const { t } = useTranslation();

  return (
    <section className="bg-gradient-to-b from-brand-sky to-background py-20 md:py-32">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <p className="mb-6 text-sm font-medium tracking-wide text-brand-primary uppercase">
          {t('hero3.eyebrow')}
        </p>
        <h2 className="mb-6 text-4xl md:text-5xl lg:text-6xl font-bold text-primary leading-tight">
          {t('hero3.title')}
        </h2>
        <p className="mb-8 text-lg md:text-xl text-text-muted max-w-2xl mx-auto leading-relaxed">
          {t('hero3.subtitle')}
        </p>
        <p className="mb-12 text-base md:text-lg text-text-muted max-w-2xl mx-auto leading-relaxed">
          {t('hero3.description')}
        </p>
        <a
          href="https://app.plinyoo.com/login?redirect=%2Fdashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
        >
          {t('hero3.cta')}
          <ArrowRight className="w-5 h-5" />
        </a>
      </div>
    </section>
  );
}
