// src/components/ui/Hero.tsx
// Neue Plinyoo Hero mit Carousel und Kennwerten
// Angepasst für plinyoo.com (mit eigenem Header wie app.plinyoo.com)

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Hero() {
  const { t } = useTranslation();
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  // Plinyoo Kennwerte
  const values = [
    {
      icon: '🎓',
      title: 'Akademisch',
      description: 'Respekt vor Wissen'
    },
    {
      icon: '🌍',
      title: 'Offen',
      description: 'Keine Barrieren'
    },
    {
      icon: '🚀',
      title: 'Motivierend',
      description: 'Fortschritt feiern'
    },
    {
      icon: '💡',
      title: 'Neugierig',
      description: 'Lernen als Abenteuer'
    }
  ];

  return (
    <div className="bg-main-background text-main-text">
      {/* Header — wie app.plinyoo.com */}
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-4 sm:px-8">
        <Link to="/" aria-label={String(t('hero.title'))} className="text-xl font-bold font-sans text-primary">
          plinyoo
        </Link>
        <a
          href="https://app.plinyoo.com/login?redirect=%2Fdashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-11 items-center rounded-full border border-border bg-white px-4 text-sm font-medium text-primary transition-colors hover:bg-surface-2"
        >
          Login
        </a>
      </div>

      {/* Hero Section */}
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-5 pt-8 sm:px-8 sm:pt-14 lg:items-center lg:text-center">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-surface-1 py-1.5 pl-3 pr-3.5 text-xs font-medium text-text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
          {t('hero.eyebrow')}
        </span>

        <h1 className="max-w-3xl font-headline text-[2.375rem] font-bold leading-[1.04] tracking-[-0.032em] text-balance sm:text-5xl lg:text-6xl text-primary">
          {t('hero.title')}
        </h1>

        <p className="max-w-xl text-[0.95rem] leading-relaxed text-main-text sm:text-lg">
          {t('hero.subtitle')}
        </p>

        <a
          href="https://app.plinyoo.com/login?redirect=%2Fdashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-[0.95rem] font-semibold text-white shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md sm:w-auto sm:self-start lg:self-center"
        >
          {t('hero.cta')}
        </a>
      </section>

      {/* Carousel mit Kennwerten */}
      <section className="mx-auto w-full max-w-md px-5 pt-12 pb-16 sm:px-8" aria-label="Plinyoo Kennwerte">
        <div className="mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            {/* Carousel Navigation */}
            <button
              onClick={() => setActiveCardIndex((activeCardIndex - 1 + values.length) % values.length)}
              className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
              aria-label="Vorherige Karte"
            >
              ←
            </button>

            {/* Aktive Karte */}
            <div className="w-full max-w-sm bg-white rounded-xl shadow-sm border border-border p-8 text-center">
              <div className="text-5xl mb-4">{values[activeCardIndex].icon}</div>
              <h3 className="text-2xl font-bold text-primary mb-2">
                {values[activeCardIndex].title}
              </h3>
              <p className="text-main-text">
                {values[activeCardIndex].description}
              </p>
            </div>

            {/* Carousel Navigation */}
            <button
              onClick={() => setActiveCardIndex((activeCardIndex + 1) % values.length)}
              className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
              aria-label="Nächste Karte"
            >
              →
            </button>
          </div>

          {/* Carousel Dots */}
          <div className="flex justify-center gap-2">
            {values.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveCardIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === activeCardIndex
                    ? 'bg-primary w-8'
                    : 'bg-border w-2 hover:bg-primary/50'
                }`}
                aria-label={`Gehe zu Karte ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
