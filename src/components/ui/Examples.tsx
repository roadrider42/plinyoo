import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Examples = () => {
  const { t } = useTranslation();
  const isDev = import.meta.env.DEV;
  const bookUrl = isDev ? 'http://localhost:3001/buch/dalrymple-anarchie/' : 'https://www.plinyoo.com/buch/dalrymple-anarchie/';
  const book2Url = isDev ? 'http://localhost:3001/buch/marshall-die-macht-der-geografie/' : 'https://www.plinyoo.com/buch/marshall-die-macht-der-geografie/';
  const book3Url = isDev ? 'http://localhost:3001/buch/lissabon-1941/' : 'https://www.plinyoo.com/buch/lissabon-1941/';
  const book4Url = isDev ? 'http://localhost:3001/buch/crowley-die-eroberer/' : 'https://www.plinyoo.com/buch/crowley-die-eroberer/';

  return (
    <section className="bg-surface-2 border-y border-border/60 py-16 md:py-12">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold font-sans text-primary mb-12">
          {t('examples.title')}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* SpoonUp Kachel */}
          <a href="https://spoonup.me" target="_blank" rel="noopener noreferrer" className="flex flex-col p-6 rounded-lg border border-border bg-surface-1 shadow-ci-hairline hover:shadow-ci transition-shadow">
            <div className="h-12 w-12 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold text-orange-600">🥄</span>
            </div>
            <h3 className="text-lg font-semibold text-primary">{t('examples.spoonup.title')}</h3>
            <p className="text-sm text-text-muted mb-2">{t('examples.spoonup.subtitle')}</p>
            <p className="text-sm text-text-muted flex-grow">{t('examples.spoonup.desc')}</p>
            <button className="mt-4 w-full bg-orange-600 text-white font-semibold py-2 rounded-lg hover:bg-orange-700 transition-colors">
              {t('examples.spoonup.button')}
            </button>
          </a>

          {/* Buch: Anarchie */}
          <a href={bookUrl} className="flex flex-col p-6 rounded-lg border border-border bg-surface-1 shadow-ci-hairline hover:shadow-ci transition-shadow">
            <div className="h-12 w-12 mx-auto mb-4 bg-teal-100 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold text-teal-600">📚</span>
            </div>
            <h3 className="text-lg font-semibold text-primary">{t('examples.book.title')}</h3>
            <p className="text-sm text-text-muted mb-2">{t('examples.book.subtitle')}</p>
            <p className="text-sm text-text-muted flex-grow">{t('examples.book.desc')}</p>
            <button className="mt-4 w-full bg-teal-600 text-white font-semibold py-2 rounded-lg hover:bg-teal-700 transition-colors">
              {t('examples.book.button')}
            </button>
          </a>

          {/* Buch: Die Macht der Geografie */}
          <a href={book2Url} className="flex flex-col p-6 rounded-lg border border-border bg-surface-1 shadow-ci-hairline hover:shadow-ci transition-shadow">
            <div className="h-12 w-12 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold text-amber-600">🗺️</span>
            </div>
            <h3 className="text-lg font-semibold text-primary">{t('examples.book2.title')}</h3>
            <p className="text-sm text-text-muted mb-2">{t('examples.book2.subtitle')}</p>
            <p className="text-sm text-text-muted flex-grow">{t('examples.book2.desc')}</p>
            <button className="mt-4 w-full bg-teal-600 text-white font-semibold py-2 rounded-lg hover:bg-teal-700 transition-colors">
              {t('examples.book2.button')}
            </button>
          </a>

          {/* Buch: Lissabon 1941 */}
          <a href={book3Url} className="flex flex-col p-6 rounded-lg border border-border bg-surface-1 shadow-ci-hairline hover:shadow-ci transition-shadow">
            <div className="h-12 w-12 mx-auto mb-4 bg-sky-100 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold text-sky-600">⚓</span>
            </div>
            <h3 className="text-lg font-semibold text-primary">{t('examples.book3.title')}</h3>
            <p className="text-sm text-text-muted mb-2">{t('examples.book3.subtitle')}</p>
            <p className="text-sm text-text-muted flex-grow">{t('examples.book3.desc')}</p>
            <button className="mt-4 w-full bg-teal-600 text-white font-semibold py-2 rounded-lg hover:bg-teal-700 transition-colors">
              {t('examples.book3.button')}
            </button>
          </a>

          {/* Buch: Die Eroberer (demnächst) */}
          <a href={book4Url} className="flex flex-col p-6 rounded-lg border border-border bg-surface-1 shadow-ci-hairline hover:shadow-ci transition-shadow">
            <div className="h-12 w-12 mx-auto mb-4 bg-violet-100 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold text-violet-600">🧭</span>
            </div>
            <h3 className="text-lg font-semibold text-primary">{t('examples.book4.title')}</h3>
            <p className="text-sm text-text-muted mb-2">{t('examples.book4.subtitle')}</p>
            <p className="text-sm text-text-muted flex-grow">{t('examples.book4.desc')}</p>
            <button className="mt-4 w-full bg-teal-600 text-white font-semibold py-2 rounded-lg hover:bg-teal-700 transition-colors">
              {t('examples.book4.button')}
            </button>
          </a>

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
