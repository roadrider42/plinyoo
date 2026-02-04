import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Datenschutz() {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">{t('privacy.title')}</h1>
      <p className="mb-4">{t('privacy.stand')}</p>
      <p className="mb-6">{t('privacy.intro')}</p>

      <h2 className="text-2xl font-semibold mb-4">{t('privacy.serverLogfiles.title')}</h2>
      <p className="mb-6">{t('privacy.serverLogfiles.text')}</p>

      <h2 className="text-2xl font-semibold mb-4">{t('privacy.cookiesTracking.title')}</h2>
      <p className="mb-6">{t('privacy.cookiesTracking.text')}</p>

      <h2 className="text-2xl font-semibold mb-4">{t('privacy.embeddedContent.title')}</h2>
      <p className="mb-6">{t('privacy.embeddedContent.text')}</p>

      <h2 className="text-2xl font-semibold mb-4">{t('privacy.contact.title')}</h2>
      <p className="mb-8">{t('privacy.contact.text')}</p>

      <Link to="/" className="inline-block mt-8 px-6 py-2 text-sm font-semibold text-primary bg-transparent border-2 border-primary rounded-lg hover:bg-primary/10 transition-colors">
        {t('privacy.back_to_home')}
      </Link>
    </div>
  );
}
