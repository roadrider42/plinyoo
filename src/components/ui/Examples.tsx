import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import spoonupLogo from '@/assets/images/spoonup-logo.svg';

const Examples = () => {
  const { t } = useTranslation();

  return (
    <section className="bg-surface-2 border-y border-border/60 py-16 md:py-12">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold font-sans text-primary mb-12">
          {t('examples.title')}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* SpoonUp Kachel */}
          <a href="http://spoonup.me" target="_blank" rel="noopener noreferrer" className="block p-6 rounded-lg border border-border bg-surface-1 shadow-ci-hairline hover:shadow-ci transition-shadow">
            <img src={spoonupLogo} alt="SpoonUp Logo" className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-primary mb-2">{t('examples.spoonup.title')}</h3>
            <p className="text-sm text-text-muted">{t('examples.spoonup.desc')}</p>
          </a>

          {/* Molly Kachel */}
          <div className="flex flex-col p-6 rounded-lg border border-border bg-surface-1 shadow-ci-hairline">
            <h3 className="text-lg font-semibold text-primary">{t('examples.molly.title')}</h3>
            <p className="text-sm text-text-muted mb-2">{t('examples.molly.subtitle')}</p>
            <p className="text-sm text-text-muted flex-grow">{t('examples.molly.desc')}</p>
            <button disabled className="mt-4 w-full bg-surface-2 text-text-faint font-semibold py-2 rounded-lg cursor-not-allowed border border-border">
              {t('examples.molly.button')}
            </button>
          </div>

          {/* James Kachel */}
          <div className="flex flex-col p-6 rounded-lg border border-border bg-surface-1 shadow-ci-hairline">
            <h3 className="text-lg font-semibold text-primary">{t('examples.james.title')}</h3>
            <p className="text-sm text-text-muted mb-2">{t('examples.james.subtitle')}</p>
            <p className="text-sm text-text-muted flex-grow">{t('examples.james.desc')}</p>
            <button disabled className="mt-4 w-full bg-surface-2 text-text-faint font-semibold py-2 rounded-lg cursor-not-allowed border border-border">
              {t('examples.james.button')}
            </button>
          </div>

          {/* Dein-Use-Case */}
                {/* Dein-Use-Case */}
          <div className="flex flex-col p-6 rounded-lg border border-border bg-surface-1 shadow-ci-hairline">
            <h3 className="text-lg font-semibold text-primary">{t('examples.your-use-case.title')}</h3>
            <p className="text-sm text-text-muted mb-2">{t('examples.your-use-case.subtitle')}</p>
            <p className="text-sm text-text-muted flex-grow">{t('examples.your-use-case.desc')}</p>
            <Link to="/kontakt" className="mt-4 w-full block text-center bg-primary text-white font-semibold py-2 rounded-lg hover:bg-primary/90 transition-colors">
              {t('examples.your-use-case.button')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Examples;
