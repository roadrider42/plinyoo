import React from 'react';

import { useTranslation } from 'react-i18next';

const Features = () => {
  const { t } = useTranslation();
  const features = t('features.items', { returnObjects: true }) as { title: string, desc: string }[];

  return (
    <section className="bg-main-background py-16 md:py-12">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold font-serif text-primary mb-6">
          {t('features.title')}
        </h2>
        <p className="text-main-text max-w-2xl mx-auto mb-12">
          {t('features.subtitle')}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
          {features.map((feature, index) => (
            <div key={index} className="p-6 rounded-xl border border-gray-200 shadow-sm bg-white">
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
