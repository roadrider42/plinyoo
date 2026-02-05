// src/components/landing/Hero.tsx
import React from 'react';
import { Link } from 'react-router-dom';

import { useTranslation } from 'react-i18next';

export default function Hero() {
  const { t } = useTranslation();

  return (
    <section className="bg-main-background text-main-text min-h-[90vh] flex flex-col items-center justify-center px-6 md:px-12 pt-20">
      <div className="max-w-4xl text-center">
<<<<<<< /Users/heikomiertzsch/2. Areas/plinyoo/src/components/ui/Hero.tsx
<<<<<<< /Users/heikomiertzsch/2. Areas/plinyoo/src/components/ui/Hero.tsx
        <h1 className="font-sans font-semibold tracking-tight text-4xl md:text-5xl text-text mb-6">
=======
        {/* Eyebrow - professioneller & moderner */}
        <p className="text-sm font-medium tracking-wide text-soft-teal mb-4">
=======
        {/* Eyebrow - professioneller & moderner */}
        <p className="text-sm font-medium tracking-wide text-soft-teal mb-4 font-sans">
>>>>>>> /Users/heikomiertzsch/.windsurf/worktrees/plinyoo/plinyoo-a7eb93d5/src/components/ui/Hero.tsx
          {t('hero.eyebrow')}
        </p>

        {/* Headline - nüchterner, weniger Claiming */}
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary mb-6">
<<<<<<< /Users/heikomiertzsch/2. Areas/plinyoo/src/components/ui/Hero.tsx
>>>>>>> /Users/heikomiertzsch/.windsurf/worktrees/plinyoo/plinyoo-a7eb93d5/src/components/ui/Hero.tsx
=======
>>>>>>> /Users/heikomiertzsch/.windsurf/worktrees/plinyoo/plinyoo-a7eb93d5/src/components/ui/Hero.tsx
          {t('hero.title')}
        </h1>

        <p className="text-lg md:text-xl mb-6">
          {t('hero.subtitle')}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            to="/mitmachen"
            className="bg-primary text-text-inverse px-5 py-3 rounded-lg shadow-ci hover:shadow-ci-lg transition w-full sm:w-auto"
          >
            {t('hero.cta_primary')}
          </Link>
          <Link 
            to="/investieren"
            className="bg-surface-1 border border-border text-text px-5 py-3 rounded-lg hover:border-border-strong transition w-full sm:w-auto"
          >
            {t('hero.cta_secondary')}
          </Link>
        </div>

        {/* Visuelle Erdung - feine Linie unter Buttons */}
        <div className="mt-16 h-px bg-border w-24 mx-auto"></div>
      </div>
    </section>
  );
}
