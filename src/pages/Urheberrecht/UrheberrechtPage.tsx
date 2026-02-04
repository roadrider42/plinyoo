import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Urheberrecht() {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">{t('copyright.title')}</h1>
      <p className="mb-4">{t('copyright.stand')}</p>

      <h2 className="text-2xl font-semibold mb-4">{t('copyright.urheberrecht.title')}</h2>
      <p className="mb-6">{t('copyright.urheberrecht.text')}</p>

      <h2 className="text-2xl font-semibold mb-4">{t('copyright.bildquellen.title')}</h2>
      <p className="mb-6">{t('copyright.bildquellen.text')}</p>

      <h2 className="text-2xl font-semibold mb-4">{t('copyright.kontakt.title')}</h2>
      <p className="mb-8">{t('copyright.kontakt.text')}</p>

      <Link to="/" className="inline-block mt-8 px-6 py-2 text-sm font-semibold text-primary bg-transparent border-2 border-primary rounded-lg hover:bg-primary/10 transition-colors">
        {t('copyright.back_to_home')}
      </Link>
    </div>
  );
}
