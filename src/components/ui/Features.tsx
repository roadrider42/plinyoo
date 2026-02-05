import React from 'react';

import { useTranslation } from 'react-i18next';

const Features = () => {
  const { t } = useTranslation();
  const features = t('features.items', { returnObjects: true }) as { title: string, desc: string, category: string }[];

  return (
    <section className="bg-section-alternate py-16 md:py-12">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 text-center">
<<<<<<< /Users/heikomiertzsch/2. Areas/plinyoo/src/components/ui/Features.tsx
<<<<<<< /Users/heikomiertzsch/2. Areas/plinyoo/src/components/ui/Features.tsx
        <h2 className="text-3xl font-sans font-semibold text-text mb-6">
=======
        <h2 className="text-3xl font-bold font-headline text-primary mb-6">
>>>>>>> /Users/heikomiertzsch/.windsurf/worktrees/plinyoo/plinyoo-a7eb93d5/src/components/ui/Features.tsx
=======
        <h2 className="text-3xl font-bold font-headline text-primary mb-6">
>>>>>>> /Users/heikomiertzsch/.windsurf/worktrees/plinyoo/plinyoo-a7eb93d5/src/components/ui/Features.tsx
          {t('features.title')}
        </h2>
        <p className="text-main-text max-w-2xl mx-auto mb-12">
          {t('features.subtitle')}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
          {features.map((feature, index) => (
            <div key={index} className="p-6 rounded-lg border border-border shadow-none bg-white hover:shadow-ci hover:-translate-y-[-2px] transition-all duration-200">
              {/* Micro-Headline pro Card */}
              <div className="text-xs font-medium tracking-wide text-soft-teal mb-3 uppercase">
                {feature.category}
              </div>
              
              {/* Icon placeholder - vereinheitlicht */}
              <div className="text-soft-teal mb-3">
                <div className="w-5 h-5 border-2 border-current rounded"></div>
              </div>
              
              <h3 className="text-lg font-semibold text-primary mb-2">{feature.title}</h3>
              <p className="text-sm text-main-text">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
