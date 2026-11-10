// src/components/ui/Hero.tsx
// Plinyoo Hero mit Sprachumschalter und, in Sprachen mit eigenem Text, einem Telefon, das über einen Faden aus vier Büchern wischt.
// Angepasst für plinyoo.com (mit eigenem Header wie app.plinyoo.com).
// #503 (Entwurf V2, Baublatt B1–B11): ab 1024 px zwei Spalten (Text links, Telefon rechts), darunter untereinander.
//   Das frühere Karussell unter dem Hero (Beispielkarten bzw. Kennwerte) fällt weg (Heikos Entscheidung 2 = a).
// Gegenbild-Zeile und Faden erscheinen nur, wenn die gewählte Sprache eigene Texte unter hero.faden hat (wie Views.tsx);
//   sonst bleibt der Hero einspaltig wie bisher, ohne deutsche Beschriftungen in einer fremden Sprache.

import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import HeroFaden from './HeroFaden';

export default function Hero() {
  const { t, i18n } = useTranslation();
  const mitFaden = Boolean(i18n.getResource(i18n.resolvedLanguage || i18n.language, 'translation', 'hero.faden'));

  return (
    <div className="bg-main-background text-main-text">
      {/* Header — wie app.plinyoo.com; Logo-Verweis mindestens 44 px hoch (B11) */}
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-4 sm:px-8">
        <Link to="/" aria-label={String(t('hero.title'))} className="flex h-11 items-center text-xl font-bold font-sans text-primary">
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

      <div
        className={
          mitFaden
            ? 'mx-auto grid w-full max-w-5xl gap-8 px-5 pb-16 pt-8 sm:px-8 lg:grid-cols-[1fr_360px] lg:items-center lg:pb-8 lg:pt-6'
            : 'mx-auto w-full max-w-5xl px-5 pb-16 pt-8 sm:px-8 sm:pt-14'
        }
      >
        <section className={`flex flex-col gap-5 ${mitFaden ? '' : 'lg:items-center lg:text-center'}`}>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-surface-1 py-1.5 pl-3 pr-3.5 text-xs font-medium text-text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
            {t('hero.eyebrow')}
          </span>

          <h1 className="max-w-3xl font-sans text-[2.375rem] font-bold leading-[1.04] tracking-[-0.032em] text-balance sm:text-5xl lg:text-6xl text-primary">
            {t('hero.title')}
          </h1>

          {mitFaden && (
            <p className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1.5 text-[17px] leading-[1.4]">
              <s className="text-text-muted decoration-2">{t('hero.faden.contrastFrom')}</s>
              {/* Pfeil bleibt beim Umbruch bei der Methode, nicht am Ende der durchgestrichenen Zeile */}
              <span className="flex items-baseline gap-2.5">
                <span className="font-bold text-accent" aria-hidden="true">→</span>
                <span className="font-semibold text-primary">{t('hero.faden.contrastTo')}</span>
              </span>
            </p>
          )}

          <p className="max-w-xl text-[0.95rem] leading-relaxed text-main-text sm:text-lg">
            {t('hero.subtitle')}
          </p>

          <Link
            to="/zugang"
            className={`mt-1 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-[0.95rem] font-semibold text-white shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md sm:w-auto sm:self-start ${
              mitFaden ? '' : 'lg:self-center'
            }`}
          >
            {t('hero.cta')}
          </Link>
        </section>

        {mitFaden && <HeroFaden />}
      </div>
    </div>
  );
}
