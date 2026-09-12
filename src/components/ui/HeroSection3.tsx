// src/components/ui/HeroSection3.tsx
// Hero 3 – Das Ergebnis: Plinyoo entdecken
// Mit Header (Logo, Sprachumschalter, Login) wie der Original-Hero

import React from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function HeroSection3() {
  const { t } = useTranslation();

  return (
    <div className="bg-main-background text-main-text">
      {/* Header — wie app.plinyoo.com */}
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-4 sm:px-8">
        <Link to="/" aria-label={String(t('hero3.title'))} className="text-xl font-bold font-sans text-primary">
          plinyoo
        </Link>
        <div className="flex items-center gap-2.5">
          <LanguageSwitcher />
          <a
            href="https://app.plinyoo.com/login?redirect=%2Fdashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-11 items-center rounded-full border border-border bg-surface-1 px-4 text-sm font-medium text-primary transition-colors hover:bg-surface-2"
          >
            Login
          </a>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-surface-2 to-main-background py-20 md:py-32">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="mb-6 text-sm font-medium tracking-wide text-primary uppercase">
            {t('hero3.eyebrow')}
          </p>
          <h2 className="mb-6 text-4xl md:text-5xl lg:text-6xl font-bold text-primary leading-tight">
            {t('hero3.title')}
          </h2>
          <p className="mb-8 text-lg md:text-xl text-main-text max-w-2xl mx-auto leading-relaxed">
            {t('hero3.subtitle')}
          </p>
          <p className="mb-12 text-base md:text-lg text-text-muted max-w-2xl mx-auto leading-relaxed">
            {t('hero3.description')}
          </p>
          <Link
            to="/mitmachen"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
          >
            {t('hero3.cta')}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
