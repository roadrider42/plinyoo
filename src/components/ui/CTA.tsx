// src/components/ui/CTA.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';

export default function CTA() {
  const { t } = useTranslation();

  return (
    <section className="mx-auto w-full max-w-xl px-5 pb-16 sm:px-8">
      <div className="flex flex-col gap-3.5 rounded-[20px] border border-border bg-surface-1 p-6 shadow-sm sm:p-7">
        <h2 className="font-sans text-xl font-semibold leading-snug tracking-tight text-main-text sm:text-2xl">
          {t('cta.title')}
        </h2>
        <p className="text-sm leading-relaxed text-text-muted sm:text-[0.95rem]">
          {t('cta.subtitle')}
        </p>
        <Link
          to="/mitmachen"
          className="mt-1 flex min-h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 text-[0.95rem] font-semibold text-white shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-main-background sm:w-auto sm:self-start"
        >
          {t('cta.button')}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
