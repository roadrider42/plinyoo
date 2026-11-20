import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';
import { RUECKFALL_SPRACHE, SPRACHEN } from './sprachen';

i18n
  // Lädt Übersetzungen über http -> ermöglicht das Laden von Dateien aus dem public/locales Ordner
  .use(HttpApi)
  // Erkennt die Benutzersprache
  .use(LanguageDetector)
  // Übergibt die i18n Instanz an react-i18next
  .use(initReactI18next)
  // Konfiguriert i18next
  .init({
    supportedLngs: [...SPRACHEN],
    fallbackLng: RUECKFALL_SPRACHE,
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

/**
 * Die Sprache, die i18next für diesen Besucher wählt — schon bevor die Übersetzung geladen ist.
 * i18next setzt i18n.language erst nach einem Takt (initAsync); der Ladehinweis in main.tsx
 * braucht die Sprache aber sofort. Deshalb fragt die Funktion dieselbe Erkennung
 * (LanguageDetector, Reihenfolge oben) und dieselbe Auflösung gegen supportedLngs/fallbackLng,
 * die i18next selbst benutzt — keine zweite Erkennung (spoonup#548).
 */
export function erkannteSprache(): string | undefined {
  if (i18n.language) return i18n.language;
  const { languageDetector, languageUtils } = i18n.services ?? {};
  const erkannt = languageDetector?.detect?.();
  if (!erkannt || !languageUtils) return undefined;
  return languageUtils.getBestMatchFromCodes(Array.isArray(erkannt) ? erkannt : [erkannt]);
}

export default i18n;
