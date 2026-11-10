// src/components/ui/fadenInhalt.ts
// Zweck: Inhalt des Fadens im Telefon der Startseite (Hero, #503 V2) — Bücher und Folien, getrennt vom Bauteil.
// Vorläufig, bis der Faden aus #502 kommt: Jeder Schritt folgt einem related:-Eintrag im Vault (Entwurf claude/_503/entwurf.md, Abschn. 3).
// Der Faden über vier Bücher ist Zielbild, nicht der Stand der App; deshalb trägt das Telefon an jeder Folie den Hinweis „Zielbild“.
// Kartentitel und -texte wörtlich aus dem Vault 2-wiki/lernkarten (Belege: claude/_503/vorlage.md im Repo spoonup).

export type FadenBuch = {
  autor: string;
  titel: string;
  // Nur Bücher mit eigener Buchseite und Cover auf der Startseite (content/buecher/<slug>/cover.jpg, "draft": false).
  // scripts/buchseiten.mjs legt daraus /buch/<slug>/cover-klein.jpg an (480 px breit). Ohne slug: Initialen, kein Bild.
  coverSlug?: string;
  initialen: string;
};

export type FadenFolie =
  | { art: 'karte'; buch: string; titel: string; text: string }
  | { art: 'frage'; buch: string; frage: string; antworten: string[]; richtig: number };

export const FADEN_BUECHER: Record<string, FadenBuch> = {
  zit: { autor: 'Rainer Zitelmann', titel: 'Nullsummendenken', coverSlug: 'zitelmann-zero-sum-mindset', initialen: 'RZ' },
  cro: { autor: 'Roger Crowley', titel: 'Die Eroberer', coverSlug: 'crowley-die-eroberer', initialen: 'RC' },
  dal: { autor: 'William Dalrymple', titel: 'Anarchie', coverSlug: 'dalrymple-anarchie', initialen: 'WD' },
  ric: { autor: 'Konstantin Richter', titel: 'Dreihundert Männer', coverSlug: 'richter-dreihundert-maenner', initialen: 'KR' },
};

// Eine Frage steht immer direkt nach der Karte, zu der sie gehört.
export const FADEN_FOLIEN: FadenFolie[] = [
  {
    art: 'karte',
    buch: 'zit',
    titel: 'Handel ist kein Nullsummenspiel: Smith und Ricardo',
    text: 'Der schottische Ökonom und Philosoph Adam Smith (1723 bis 1790) erkannte, dass Spezialisierung und Arbeitsteilung die gesamte Produktion steigern, deshalb gewinnen beim Handel beide Seiten.',
  },
  {
    art: 'karte',
    buch: 'cro',
    titel: 'Das Monopol der Krone: Pfeffer und Gewürze',
    text: 'Die portugiesische Krone wollte von Beginn an den Pfeffer- und Gewürzhandel in Asien monopolisieren, um auch den Levantehandel zu unterbinden. Das königliche Monopol fiel offiziell erst 1570.',
  },
  {
    art: 'frage',
    buch: 'cro',
    frage: 'Was war das Ziel der portugiesischen Krone im Gewürzhandel?',
    antworten: ['Freier Handel für alle Kaufleute', 'Die Monopolisierung des Pfeffer- und Gewürzhandels in Asien'],
    richtig: 1,
  },
  {
    art: 'karte',
    buch: 'dal',
    titel: 'Das Handelsmonopol der East India Company von 1600',
    text: 'Die Charter sicherte ihr das alleinige Recht, mit Indien zu handeln: ein Monopol auf den gesamten Handel östlich des Kaps der Guten Hoffnung. Das Alleinrecht beruhte damit auf einem Rechtsakt der Krone.',
  },
  {
    art: 'karte',
    buch: 'zit',
    titel: 'Zwei Denkweisen über Wirtschaft, zwei Erwartungen an die Politik',
    text: 'Nullsummendenken betont die Verteilung eines Betrags an Vermögen, Einkommen, Gütern und Jobs, den es als fest wahrnimmt. Es motiviert den Ruf nach politischem Eingriff.',
  },
  {
    art: 'karte',
    buch: 'ric',
    titel: 'Bundesrepublik — Ordoliberalismus (Erhard, Eucken) als Nachkriegsordnung',
    text: 'Walter Euckens Ordoliberalismus wollte nicht den Wirtschaftsprozess lenken, sondern Ordnungsformen des Wettbewerbs setzen — ein starker Rechtsstaat gegen Monopole.',
  },
];
