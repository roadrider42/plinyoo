import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Die Bücher kommen aus /buecher.json. Die Datei erzeugt scripts/buchseiten.mjs beim Bau aus content/buecher/*.json,
// neuestes Buch zuerst. So veraltet auf der Startseite nichts von Hand ("demnächst" blieb früher stehen).
interface BuchKachel {
  nr: number | null;
  slug: string;
  titel: string;
  text: string;
  symbol: string;
  neu: boolean;
}

// Vollständige Klassennamen, damit Tailwind sie findet. Die Farbe wechselt mit der Nummer des Buchs.
const FARBEN = [
  { kreis: 'bg-teal-100', symbol: 'text-teal-600' },
  { kreis: 'bg-amber-100', symbol: 'text-amber-600' },
  { kreis: 'bg-sky-100', symbol: 'text-sky-600' },
  { kreis: 'bg-violet-100', symbol: 'text-violet-600' },
  { kreis: 'bg-rose-100', symbol: 'text-rose-600' },
];

const ANZAHL_AUF_STARTSEITE = 3;

export const Books = () => {
  const { t } = useTranslation();
  const isDev = import.meta.env.DEV;
  const [buecher, setBuecher] = useState<BuchKachel[]>([]);

  useEffect(() => {
    let aktiv = true;
    fetch(`${import.meta.env.BASE_URL}buecher.json`)
      .then((r) => (r.ok ? r.json() : { buecher: [] }))
      .then((d) => { if (aktiv) setBuecher(Array.isArray(d.buecher) ? d.buecher : []); })
      .catch(() => { if (aktiv) setBuecher([]); });
    return () => { aktiv = false; };
  }, []);

  const buchUrl = (slug: string) => (isDev ? `http://localhost:3001/buch/${slug}/` : `/buch/${slug}/`);
  const uebersichtUrl = isDev ? 'http://localhost:3001/buch/' : '/buch/';
  const sichtbar = buecher.slice(0, ANZAHL_AUF_STARTSEITE);

  return (
    <>
      {/* Bücher: eigene Reihe, das neueste zuerst */}
      <section className="bg-surface-2 border-y border-border/60 py-16 md:py-12">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold font-sans text-primary mb-3">
            {t('examples.books_title', 'Bücher zum Durchspielen')}
          </h2>
          <p className="text-text-muted mb-12 max-w-2xl mx-auto">
            {t('examples.books_intro', 'Aus jedem Buch wird ein Wissensgraph: Karten, Verbindungen und Fragen. Such dir eins aus.')}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {sichtbar.map((b) => {
              const farbe = FARBEN[((b.nr ?? 1) - 1 + FARBEN.length) % FARBEN.length];
              return (
                <a key={b.slug} href={buchUrl(b.slug)} className="relative flex flex-col p-6 rounded-lg border border-border bg-surface-1 shadow-ci-hairline hover:shadow-ci transition-shadow">
                  {b.neu && (
                    <span className="absolute top-3 right-3 rounded-full bg-amber-500 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
                      {t('examples.new_badge', 'Neu')}
                    </span>
                  )}
                  <div className={`h-12 w-12 mx-auto mb-4 ${farbe.kreis} rounded-full flex items-center justify-center`}>
                    <span className={`text-xl font-bold ${farbe.symbol}`}>{b.symbol}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-primary">{b.titel}</h3>
                  <p className="text-sm text-text-muted mb-2">{t('examples.book_subtitle', 'Buchvorstellung')}</p>
                  <p className="text-sm text-text-muted flex-grow">{b.text}</p>
                  <span className="mt-4 block text-center w-full bg-teal-600 text-white font-semibold py-2 rounded-lg hover:bg-teal-700 transition-colors">
                    {t('examples.book_button', 'Zur Buchseite')}
                  </span>
                </a>
              );
            })}
          </div>

          <p className="mt-10">
            <a href={uebersichtUrl} className="inline-block border border-primary text-primary font-semibold py-2 px-6 rounded-lg hover:bg-primary hover:text-white transition-colors">
              {buecher.length > 0
                ? t('examples.all_books_count', { count: buecher.length, defaultValue: 'Alle {{count}} Bücher ansehen' })
                : t('examples.all_books', 'Alle Bücher ansehen')}
            </a>
          </p>
        </div>
      </section>

    </>
  );
};

// Für Teams: SpoonUp und Kontakt
const Examples = () => {
  const { t } = useTranslation();
  return (
    <>
      <section className="py-16 md:py-12">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold font-sans text-primary mb-12">
            {t('examples.title')}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
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
    </>
  );
};

export default Examples;
