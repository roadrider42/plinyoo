// src/components/landing/Hero.tsx
import React from 'react';
import { Link } from 'react-router-dom';

import { useTranslation } from 'react-i18next';

export default function Hero() {
  const { t } = useTranslation();

  return (
    <section className="bg-main-background text-main-text min-h-[90vh] flex flex-col items-center justify-center px-6 md:px-12 pt-20">
      <div className="max-w-4xl text-center">
        <h1 className="text-4xl md:text-5xl font-bold font-serif text-primary mb-6">
          {t('hero.title')}
        </h1>

        <p className="text-lg md:text-xl mb-6">
          {t('hero.subtitle')}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            to="/mitmachen"
            className="px-8 py-3 text-lg font-semibold text-white bg-primary rounded-xl hover:bg-primary/90 transition-colors w-full sm:w-auto"
          >
            {t('hero.cta_primary')}
          </Link>
          <Link 
            to="/investieren"
            className="px-8 py-3 text-lg font-semibold text-primary bg-transparent border-2 border-primary rounded-xl hover:bg-primary/10 transition-colors w-full sm:w-auto"
          >
            {t('hero.cta_secondary')}
          </Link>
        </div>
      </div>
    </section>
  );
}
