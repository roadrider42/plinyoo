// src/components/landing/CTA.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function CTA() {
  const { t } = useTranslation();

  return (
    <section className="bg-highlight text-primary py-16 md:py-12 px-6 text-center rounded-xl mx-auto max-w-4xl mt-16 md:mt-12">
      <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4">
        {t('cta.title')}
      </h2>
      <p className="text-lg md:text-xl mb-8">
        {t('cta.subtitle')}
      </p>
      <div className="flex justify-center">
        <Link to="/kontakt" className="bg-white text-primary font-bold py-3 px-8 rounded-lg hover:bg-gray-200 transition-colors">
          {t('cta.button')}
        </Link>
      </div>
    </section>
  );
}
