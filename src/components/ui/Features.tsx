import React from 'react';

import { useTranslation } from 'react-i18next';

const Features = () => {
  const { t } = useTranslation();
  const featuresRaw = t('features.items', { returnObjects: true }) as unknown;
  const features = Array.isArray(featuresRaw)
    ? (featuresRaw as { title: string; desc: string; category: string }[])
    : [];

  return (
    <section className="bg-surface-tint py-16 md:py-12">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold font-headline text-primary mb-6">
          {t('features.title')}
        </h2>
        <p className="text-text-muted max-w-2xl mx-auto mb-12">
          {t('features.subtitle')}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
          {features.map((feature, index) => (
            <div key={index} className="p-6 rounded-lg border border-border shadow-ci-hairline bg-surface-1 hover:shadow-ci hover:-translate-y-[-2px] transition-all duration-200">
              {/* Micro-Headline pro Card */}
              <div className="text-xs font-medium tracking-wide text-soft-teal mb-3 uppercase">
                {feature.category}
              </div>

              <div className="flex items-center gap-3 mb-3">
                {/* Icon placeholder - vereinheitlicht */}
                <div className="text-soft-teal shrink-0">
                  <div className="w-5 h-5 border-2 border-current rounded"></div>
                </div>

                <h3 className="text-lg font-semibold text-primary">{feature.title}</h3>
              </div>

              <p className="text-sm text-text-muted">
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
