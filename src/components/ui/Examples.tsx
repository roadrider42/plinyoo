import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import spoonupLogo from '@/assets/images/spoonup-logo.svg';

const Examples = () => {
  const { t } = useTranslation();

  return (
    <section className="bg-main-background py-16 md:py-12">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold font-headline text-primary mb-12">
          {t('examples.title')}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* SpoonUp Kachel */}
          <a href="http://spoonup.me" target="_blank" rel="noopener noreferrer" className="block p-6 rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-lg transition-shadow">
            <img src={spoonupLogo} alt="SpoonUp Logo" className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-primary mb-2">{t('examples.spoonup.title')}</h3>
            <p className="text-sm text-main-text">{t('examples.spoonup.desc')}</p>
          </a>

          {/* Molly Kachel */}
          <div className="flex flex-col p-6 rounded-xl border border-gray-200 shadow-sm bg-white">
            <h3 className="text-lg font-semibold text-primary">{t('examples.molly.title')}</h3>
            <p className="text-sm text-gray-500 mb-2">{t('examples.molly.subtitle')}</p>
            <p className="text-sm text-main-text flex-grow">{t('examples.molly.desc')}</p>
            <button disabled className="mt-4 w-full bg-gray-200 text-gray-400 font-semibold py-2 rounded-lg cursor-not-allowed">
              {t('examples.molly.button')}
            </button>
          </div>

          {/* James Kachel */}
          <div className="flex flex-col p-6 rounded-xl border border-gray-200 shadow-sm bg-white">
            <h3 className="text-lg font-semibold text-primary">{t('examples.james.title')}</h3>
            <p className="text-sm text-gray-500 mb-2">{t('examples.james.subtitle')}</p>
            <p className="text-sm text-main-text flex-grow">{t('examples.james.desc')}</p>
            <button disabled className="mt-4 w-full bg-gray-200 text-gray-400 font-semibold py-2 rounded-lg cursor-not-allowed">
              {t('examples.james.button')}
            </button>
          </div>

          {/* Dein-Use-Case */}
                {/* Dein-Use-Case */}
          <div className="flex flex-col p-6 rounded-xl border border-gray-200 shadow-sm bg-white">
            <h3 className="text-lg font-semibold text-primary">{t('examples.your-use-case.title')}</h3>
            <p className="text-sm text-gray-500 mb-2">{t('examples.your-use-case.subtitle')}</p>
            <p className="text-sm text-main-text flex-grow">{t('examples.your-use-case.desc')}</p>
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
