import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

i18n
  // Lädt Übersetzungen über http -> ermöglicht das Laden von Dateien aus dem public/locales Ordner
  .use(HttpApi)
  // Erkennt die Benutzersprache
  .use(LanguageDetector)
  // Übergibt die i18n Instanz an react-i18next
  .use(initReactI18next)
  // Konfiguriert i18next
  .init({
    supportedLngs: ['de', 'en', 'es', 'fr', 'pt', 'uk', 'pl'],
    fallbackLng: 'de',
    debug: false, // Immer deaktivieren für saubere Console
    detection: {
      order: ['queryString', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['cookie'],
    },
    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
    },
    react: {
      useSuspense: true,
    },
  });

export default i18n;
