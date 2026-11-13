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
import { useEffect, useRef } from 'react';
import { kontaktFehlerSatz } from '@/services/svc.contact';

export default function KontaktFehlerHinweis({ fehler }: { fehler: unknown }) {
  const ref = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (fehler) ref.current?.scrollIntoView({ block: 'nearest' });
  }, [fehler]);
  if (!fehler) return null;
  return (
    <p ref={ref} role="alert" className="text-sm text-red-700">
      {kontaktFehlerSatz(fehler)}
    </p>
  );
}
