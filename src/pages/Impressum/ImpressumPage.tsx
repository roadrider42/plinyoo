import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Impressum() {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">{t('imprint.title')}</h1>
      <p className="mb-4">{t('imprint.stand')}</p>
      <p className="mb-6">{t('imprint.disclaimer')}</p>

      <h2 className="text-2xl font-semibold mb-4">{t('imprint.angaben.title')}</h2>
      <p>{t('imprint.angaben.name')}</p>
      <p className="mb-6">{t('imprint.angaben.email')}</p>

      <h2 className="text-2xl font-semibold mb-4">{t('imprint.haftungInhalte.title')}</h2>
      <p className="mb-6">{t('imprint.haftungInhalte.text')}</p>

      <h2 className="text-2xl font-semibold mb-4">{t('imprint.haftungLinks.title')}</h2>
      <p className="mb-6">{t('imprint.haftungLinks.text')}</p>

      <h2 className="text-2xl font-semibold mb-4">{t('imprint.urheberrecht.title')}</h2>
      <p className="mb-8">{t('imprint.urheberrecht.text')}</p>

      <Link to="/" className="inline-block mt-8 px-6 py-2 text-sm font-semibold text-primary bg-transparent border-2 border-primary rounded-lg hover:bg-primary/10 transition-colors">
        {t('imprint.back_to_home')}
      </Link>
    </div>
  );
}
