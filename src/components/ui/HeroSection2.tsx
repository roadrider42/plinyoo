// src/components/ui/HeroSection2.tsx
// Hero 2 – Der Kern: Erfahrung verstehen
// Mit Header (Logo, DE/EN, Login) wie der Original-Hero

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function HeroSection2() {
  const { t, i18n } = useTranslation();

  return (
    <div className="bg-main-background text-main-text">
      {/* Header — wie app.plinyoo.com */}
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-4 sm:px-8">
        <Link to="/" aria-label={String(t('hero2.title'))} className="text-xl font-bold font-sans text-primary">
          plinyoo
        </Link>
        <div className="flex items-center gap-2.5">
          {/* Sprachumschalter DE/EN */}
          <div className="flex h-9 items-center overflow-hidden rounded-full border border-border bg-surface-1" role="group" aria-label="Sprache wählen">
            <button
              type="button"
              onClick={() => i18n.changeLanguage('de')}
              aria-pressed={i18n.language === 'de'}
              className={
                i18n.language === 'de'
                  ? 'h-full px-3 text-xs font-semibold text-white bg-primary'
                  : 'h-full px-3 text-xs font-medium text-text-muted hover:text-main-text'
              }
            >
              DE
            </button>
            <button
              type="button"
              onClick={() => i18n.changeLanguage('en')}
              aria-pressed={i18n.language === 'en'}
              className={
                i18n.language === 'en'
                  ? 'h-full px-3 text-xs font-semibold text-white bg-primary'
                  : 'h-full px-3 text-xs font-medium text-text-muted hover:text-main-text'
              }
            >
              EN
            </button>
          </div>
          {/* Login */}
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
      <section className="bg-gradient-to-b from-main-background to-surface-2 py-20 md:py-32">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="mb-6 text-sm font-medium tracking-wide text-primary uppercase">
            {t('hero2.eyebrow')}
          </p>
          <h2 className="mb-6 text-4xl md:text-5xl lg:text-6xl font-bold text-primary leading-tight">
            {t('hero2.title')}
          </h2>
          <p className="mb-8 text-lg md:text-xl text-main-text max-w-2xl mx-auto leading-relaxed">
            {t('hero2.subtitle')}
          </p>
          <p className="mb-12 text-base md:text-lg text-text-muted max-w-2xl mx-auto leading-relaxed">
            {t('hero2.description')}
          </p>
          <Link
            to="/mitmachen"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
          >
            {t('hero2.cta')}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
