import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Reihenfolge der Abschnitte; Texte stehen in public/locales/<sprache>/translation.json unter "privacy".
// Sprachen außer Deutsch haben nur Titel und Hinweis; der Rest fällt auf die deutsche (maßgebliche) Fassung zurück.
const SECTIONS = [
  'hosting',
  'analytics',
  'cookiesTracking',
  'fonts',
  'forms',
  'affiliate',
  'social',
  'embeddedContent',
  'rights',
  'contact',
] as const;

export default function Datenschutz() {
  const { t } = useTranslation();
  const note = String(t('privacy.note', { defaultValue: '' }));

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">{t('privacy.title')}</h1>
      <p className="mb-4">{t('privacy.stand')}</p>
      {note && <p className="mb-4 rounded-lg bg-surface-2 px-4 py-3 text-sm">{note}</p>}
      <p className="mb-6">{t('privacy.intro')}</p>

      {SECTIONS.map((key) => (
        <section key={key}>
          <h2 className="text-2xl font-semibold mb-4">{t(`privacy.${key}.title`)}</h2>
          <p className="mb-6">{t(`privacy.${key}.text`)}</p>
        </section>
      ))}

      <Link to="/" className="inline-block mt-8 px-6 py-2 text-sm font-semibold text-primary bg-transparent border-2 border-primary rounded-lg hover:bg-primary/10 transition-colors">
        {t('privacy.back_to_home')}
      </Link>
    </div>
  );
}
