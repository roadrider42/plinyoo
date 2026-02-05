// src/components/landing/Hero.tsx
import React from 'react';
import { Link } from 'react-router-dom';

import { useTranslation } from 'react-i18next';

export default function Hero() {
  const { t } = useTranslation();

  return (
    <section className="bg-white text-main-text py-20 md:py-28">
      <div className="max-w-4xl mx-auto px-6 md:px-12 text-left">
        <p className="text-sm font-medium tracking-wide text-soft-teal mb-4">
          {t('hero.eyebrow')}
        </p>

        <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary mb-6">
          {t('hero.title')}
        </h1>

        <p className="text-lg md:text-xl text-main-text/80 mb-8 max-w-2xl">
          {t('hero.subtitle')}
        </p>

        <div className="flex flex-col sm:flex-row items-start justify-start gap-4">
          <Link 
            to="/mitmachen"
            className="px-6 py-3 text-base font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors w-full sm:w-auto shadow-sm"
          >
            {t('hero.cta_primary')}
          </Link>
          <Link 
            to="/investieren"
            className="px-6 py-3 text-base font-semibold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors w-full sm:w-auto"
          >
            {t('hero.cta_secondary')}
          </Link>
        </div>
      </div>
    </section>
  );
}
