// src/components/landing/CTA.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function CTA() {
  const { t } = useTranslation();

  return (
    <section className="bg-highlight text-primary py-16 md:py-12 px-6 text-center rounded-xl mx-auto max-w-4xl mt-16 md:mt-12">
<<<<<<< /Users/heikomiertzsch/2. Areas/plinyoo/src/components/ui/CTA.tsx
<<<<<<< /Users/heikomiertzsch/2. Areas/plinyoo/src/components/ui/CTA.tsx
      <h2 className="text-3xl md:text-4xl font-sans font-semibold mb-4">
=======
      {/* Sachlichere Headline */}
      <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4">
>>>>>>> /Users/heikomiertzsch/.windsurf/worktrees/plinyoo/plinyoo-a7eb93d5/src/components/ui/CTA.tsx
=======
      {/* Sachlichere Headline */}
      <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4">
>>>>>>> /Users/heikomiertzsch/.windsurf/worktrees/plinyoo/plinyoo-a7eb93d5/src/components/ui/CTA.tsx
        {t('cta.title')}
      </h2>
      <p className="text-lg md:text-xl mb-8">
        {t('cta.subtitle')}
      </p>
      
      {/* Button nicht "weiß auf gelb" - ruhiger */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link to="/kontakt" className="bg-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-primary/90 transition-colors">
          {t('cta.button')}
        </Link>
        <Link to="/mitmachen" className="text-primary font-medium py-3 px-8 rounded-lg hover:bg-primary/10 transition-colors">
          {t('cta.secondary_action')}
        </Link>
      </div>
    </section>
  );
}
