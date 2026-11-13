// src/components/ui/KontaktFehlerHinweis.tsx
// #483: Der Fehlersatz eines Kontaktformulars steht IM Formular, direkt ueber
// der Absendeschaltflaeche -- nicht als Toast. Die Formularseiten raeumen beim
// Verlassen alle Toasts weg, und weil `dismiss` aus useToast je Render neu
// entsteht, lief dieses Aufraeumen bei jedem Render: ein Toast war dort nie
// zu sehen. Der Satz bleibt stehen, bis erneut gesendet wird.
//
// Er schiebt die Schaltflaeche nach unten; stand sie am unteren Rand, laege
// der Satz halb unter dem Bildrand (gemessen bei 390 x 844 auf /zugang).
// Deshalb rollt er sich beim Erscheinen ins Bild.
//
// #533: Der Satz kommt aus der Sprachdatei der Seite (forms.validation.*),
// Rueckfall en. Das http-Backend laedt nur die Sprache der Seite und de; en
// wird deshalb nachgeladen, sobald ein Fehler da ist. Bis dahin -- und nur,
// wenn der Sprache der Satz fehlt -- steht nichts da, nie der Schluessel.
import { useEffect, useReducer, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { kontaktFehlerSatz } from '@/services/svc.contact';

export default function KontaktFehlerHinweis({ fehler }: { fehler: unknown }) {
  const { t, i18n } = useTranslation();
  const [, neuZeichnen] = useReducer((n: number) => n + 1, 0);
  const ref = useRef<HTMLParagraphElement>(null);
  const satz = fehler ? kontaktFehlerSatz(fehler, t) : null;
  useEffect(() => {
    if (fehler && !i18n.hasResourceBundle('en', 'translation')) {
      i18n.loadLanguages('en').then(neuZeichnen, () => {});
    }
  }, [fehler, i18n]);
  useEffect(() => {
    if (satz) ref.current?.scrollIntoView({ block: 'nearest' });
  }, [satz]);
  if (!satz) return null;
  return (
    <p ref={ref} role="alert" className="text-sm text-red-700">
      {satz}
    </p>
  );
}
