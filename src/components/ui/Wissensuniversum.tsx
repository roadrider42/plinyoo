// src/components/ui/Wissensuniversum.tsx
// Zweck: Wissensuniversum zum Ausprobieren auf der Startseite — Sterne sind Karten, Linien sind Verweise.
// Der Besucher zeichnet seinen eigenen Weg von Stern zu Stern und spielt die Karten durch; ohne Konto, ohne Anmeldung.
// Drei Themen: Stadthitze (Texte aus den Übersetzungen, journey.cards), East India Company und Grenzen (Daten der Buchseiten,
// content/buecher/*.json — nur Deutsch). Dieselbe Idee wie auf der Buchseite (scripts/buchseiten.mjs).
// Texte kommen aus den Übersetzungen (journey.*). Sprachen ohne Karten zeigen den Abschnitt nicht.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import dalrymple from '../../../content/buecher/dalrymple-anarchie.json';
import marshall from '../../../content/buecher/marshall-die-macht-der-geografie.json';
import { ereignis } from '@/lib/messung';
import { anordnung, FELD, wolke, type Kante } from '@/lib/universum';

type Option = { text: string; ok: boolean; fb: string };
type Frage = { frage: string; optionen: Option[]; beleg: string; belegDe?: string };
type Quelle = { titel: string; url: string; herausgeber: string; abgerufen: string };
type Karte = { slug: string; name: string; titel: string; text: string; quelle?: Quelle; fragen: Frage[] };
type Thema = { id: string; label: string; karten: Karte[]; kanten: Kante[]; buchUrl?: string; buchAutor?: string; buchTitel?: string };
type Antwort = { gewaehlt: number; ok: boolean };

type StadthitzeKarte = {
  title: string;
  body: string;
  question: string;
  beleg: string;
  options: { text: string; correct: boolean; why: string }[];
};

// Verweise zwischen den sieben Stadthitze-Karten (Reihenfolge wie in journey.cards):
// 0 Oberfläche/Luft · 1 DLR-Analyse · 2 Stadt-Land · 3 Fünf Mechanismen · 4 Kaltluft · 5 Zielkonflikt · 6 Blaugrün
const STADTHITZE_KANTEN: Kante[] = [
  [0, 1],
  [0, 3],
  [1, 2],
  [2, 3],
  [3, 4],
  [3, 6],
  [4, 5],
  [5, 6],
];

function gemischt<T>(items: T[]): T[] {
  return items
    .map((item) => [Math.random(), item] as const)
    .sort((a, b) => a[0] - b[0])
    .map(([, item]) => item);
}

type BuchDaten = {
    slug: string;
    autor: string;
    titel: string;
    knoten: { slug: string; titel: string }[];
    kanten: [number, number, string][];
    kartenvoll: {
      slug: string;
      kurz: string;
      titel: string;
      karte: string;
      quelle: Quelle;
      fragen: Frage[];
    }[];
};

// Ein Thema aus den Daten einer Buchseite (content/buecher/<slug>.json); nur Deutsch
function buchThema(daten: unknown, label: string): Thema {
  const d = daten as BuchDaten;
  return {
    id: d.slug,
    label,
    buchUrl: `/buch/${d.slug}/`,
    buchAutor: d.autor,
    buchTitel: d.titel,
    kanten: d.kanten.map(([a, b]) => [a, b] as Kante),
    karten: d.kartenvoll.map((k, i) => ({
      slug: k.slug,
      name: d.knoten[i]?.titel ?? k.kurz,
      titel: k.titel,
      text: k.karte,
      quelle: k.quelle,
      fragen: k.fragen,
    })),
  };
}

export default function Wissensuniversum() {
  const { t, i18n } = useTranslation();
  const hasOwnText = Boolean(i18n.getResource(i18n.resolvedLanguage || i18n.language, 'translation', 'journey'));
  const raw = t('journey.cards', { returnObjects: true }) as unknown;
  const hitzeKarten = Array.isArray(raw) ? (raw as StadthitzeKarte[]) : [];
  const sprache = (i18n.resolvedLanguage || i18n.language || 'de').slice(0, 2);
  const note = String(t('journey.note', { defaultValue: '' }));

  const themen = useMemo<Thema[]>(() => {
    const hitze: Thema = {
      id: 'stadthitze',
      label: String(t('journey.topicHeat')),
      kanten: STADTHITZE_KANTEN,
      karten: hitzeKarten.map((c, i) => ({
        slug: `stadthitze-${i + 1}`,
        name: c.title,
        titel: c.title,
        text: c.body,
        fragen: [
          {
            frage: c.question,
            // Reihenfolge der Antworten einmal mischen, damit die richtige nicht immer an derselben Stelle steht
            optionen: gemischt(c.options.map((o) => ({ text: o.text, ok: o.correct, fb: o.why }))),
            beleg: c.beleg,
          },
        ],
      })),
    };
    // Die Karten zur East India Company sind deutsch; Sprachen außer Deutsch zeigen nur die Stadthitze
    return sprache === 'de'
      ? [hitze, buchThema(dalrymple, String(t('journey.topicEic'))), buchThema(marshall, String(t('journey.topicBorders')))]
      : [hitze];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hitzeKarten.length, sprache]);

  const [aktiv, setAktiv] = useState(0);

  if (!hasOwnText || hitzeKarten.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-5xl px-5 py-16 sm:px-8" aria-label={String(t('journey.aria'))}>
      <h2 className="text-center font-sans text-2xl font-semibold tracking-tight text-main-text sm:text-3xl">
        {t('journey.title')}
      </h2>
      <p className="mx-auto mt-3 max-w-2xl text-center text-text-muted">{t('journey.subtitle')}</p>
      {note && <p className="mx-auto mt-1 max-w-2xl text-center text-sm text-text-muted">{note}</p>}

      {themen.length > 1 && (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2" role="tablist" aria-label={String(t('journey.topics'))}>
          {themen.map((th, i) => (
            <button
              key={th.id}
              type="button"
              role="tab"
              aria-selected={i === aktiv}
              onClick={() => setAktiv(i)}
              className={`rounded-full border px-5 py-2 text-sm font-semibold transition-colors ${
                i === aktiv
                  ? 'border-primary bg-primary text-white'
                  : 'border-border bg-white text-primary hover:bg-surface-2'
              }`}
            >
              {th.label}
            </button>
          ))}
        </div>
      )}

      <div className="mt-8">
        {/* Beide Themen bleiben eingehängt, damit der Fortschritt beim Wechseln erhalten bleibt */}
        {themen.map((th, i) => (
          <div key={th.id} hidden={i !== aktiv}>
            <Universum thema={th} sichtbar={i === aktiv} />
          </div>
        ))}
      </div>
    </section>
  );
}

function Universum({ thema, sichtbar }: { thema: Thema; sichtbar: boolean }) {
  const { t } = useTranslation();
  const scroller = useRef<HTMLDivElement>(null);
  const zentriert = useRef(false);
  // Auf dem Handy ist das Feld breiter als der Bildschirm: einmal auf die Mitte scrollen, sobald es sichtbar ist
  useEffect(() => {
    const el = scroller.current;
    if (sichtbar && el && !zentriert.current && el.clientWidth > 0) {
      el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
      zentriert.current = true;
    }
  }, [sichtbar]);
  const { W, H } = FELD;
  const karten = thema.karten;
  const n = karten.length;

  const pos = useMemo(() => anordnung(thema.id, n, thema.kanten, W, H), [thema.id, n, thema.kanten, W, H]);
  const punkte = useMemo(() => wolke(thema.id, pos, W, H), [thema.id, pos, W, H]);
  const nachbarn = useMemo(() => {
    const nb: number[][] = karten.map(() => []);
    thema.kanten.forEach(([a, b]) => {
      nb[a].push(b);
      nb[b].push(a);
    });
    return nb;
  }, [karten, thema.kanten]);

  const [weg, setWeg] = useState<number[]>([]);
  const [hinweis, setHinweis] = useState<string | null>(null);
  const [gemeldet, setGemeldet] = useState(false);
  const [antworten, setAntworten] = useState<Record<string, Antwort>>({});
  const [offen, setOffen] = useState<number[]>([0]);

  const cur = weg.length ? weg[weg.length - 1] : -1;
  const gekonnt = (i: number, a: Record<string, Antwort> = antworten) =>
    karten[i].fragen.every((_, j) => a[`${i}-${j}`]?.ok);
  const anzahlGekonnt = karten.filter((_, i) => gekonnt(i)).length;

  const waehle = (i: number) => {
    const pos0 = weg.indexOf(i);
    let neu: number[];
    if (cur < 0) neu = [i];
    else if (pos0 > -1) neu = weg.slice(0, pos0 + 1);
    else if (nachbarn[cur].includes(i)) neu = [...weg, i];
    else {
      setHinweis(String(t('journey.noLink', { from: karten[cur].name, to: karten[i].name })));
      return;
    }
    setHinweis(null);
    setWeg(neu);
    setOffen((o) => (o.includes(i) ? o : [...o, i]));
    if (!gemeldet) {
      setGemeldet(true);
      ereignis('Wissensuniversum erkundet');
    }
  };

  const antworte = (i: number, j: number, gewaehlt: number) => {
    const frage = karten[i].fragen[j];
    const ok = frage.optionen[gewaehlt].ok;
    const vorher = gekonnt(i);
    const neu = { ...antworten, [`${i}-${j}`]: { gewaehlt, ok } };
    setAntworten(neu);
    ereignis('Frage beantwortet', { karte: karten[i].slug, frage: String(j + 1), richtig: ok ? 'ja' : 'nein' });
    if (!vorher && gekonnt(i, neu)) ereignis('Karte gekonnt', { karte: karten[i].slug });
  };

  const nochmal = (i: number, j: number) => {
    const neu = { ...antworten };
    delete neu[`${i}-${j}`];
    setAntworten(neu);
  };

  const wegText = () => {
    if (hinweis) return hinweis;
    if (cur < 0) return String(t('journey.hint'));
    const weiter = nachbarn[cur].filter((i) => !weg.includes(i)).map((i) => karten[i].name);
    // kein "?." wenn ein Kartenname selbst mit einem Fragezeichen endet
    const satz = (s: string) => (/[.?!]$/.test(s) ? `${s} ` : `${s}. `);
    return (
      satz(`${t('journey.path')} ${weg.map((i) => karten[i].name).join(' → ')}`) +
      (weiter.length
        ? satz(`${t('journey.continues')} ${weiter.join(', ')}`) + String(t('journey.tapGlow'))
        : String(t('journey.end')))
    );
  };

  // Karten des Weges stehen zuerst
  const reihenfolge = [...weg, ...karten.map((_, i) => i).filter((i) => !weg.includes(i))];

  return (
    <div>
      <div className="wu">
        <div className="wu-scroll" ref={scroller}>
          <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label={String(t('journey.fieldAria', { n }))}>
            <g className="wu-wolke">
              {punkte.map((p, k) => (
                <circle key={k} cx={p.x} cy={p.y} r={p.r.toFixed(1)} opacity={p.o.toFixed(2)} />
              ))}
            </g>
            <g>
              {thema.kanten.map(([a, b], k) => {
                const ia = weg.indexOf(a);
                const ib = weg.indexOf(b);
                const imWeg = ia > -1 && ib > -1 && Math.abs(ia - ib) === 1;
                return (
                  <line
                    key={k}
                    className={`wu-e${imWeg ? ' weg' : ''}`}
                    x1={pos[a].x}
                    y1={pos[a].y}
                    x2={pos[b].x}
                    y2={pos[b].y}
                  />
                );
              })}
            </g>
            <g>
              {karten.map((k, i) => {
                const rechts = pos[i].x > W - 190;
                const links = pos[i].x < 190;
                const klassen = [
                  'wu-n',
                  weg.includes(i) ? 'besucht' : '',
                  cur > -1 && nachbarn[cur].includes(i) && !weg.includes(i) ? 'nachbar' : '',
                  gekonnt(i) ? 'gekonnt' : '',
                ]
                  .filter(Boolean)
                  .join(' ');
                return (
                  <g
                    key={k.slug}
                    className={klassen}
                    tabIndex={0}
                    role="button"
                    aria-label={`${t('journey.card')}: ${k.name}`}
                    transform={`translate(${pos[i].x} ${pos[i].y})`}
                    onClick={() => waehle(i)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        waehle(i);
                      }
                    }}
                  >
                    <circle className="hit" r={24} />
                    <circle className="k" r={8} />
                    <text y={26} x={rechts ? 14 : links ? -14 : 0} textAnchor={rechts ? 'end' : links ? 'start' : 'middle'}>
                      {k.name}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
        <p className="wu-weg" aria-live="polite">
          {wegText()}
        </p>
        <p className="wu-tools">
          {weg.length > 0 && (
            <button
              type="button"
              className="wu-reset"
              onClick={() => {
                setWeg([]);
                setHinweis(null);
              }}
            >
              {t('journey.reset')}
            </button>
          )}
        </p>
      </div>

      <h3 className="mt-12 font-sans text-xl font-semibold text-main-text sm:text-2xl">{t('journey.cardsTitle')}</h3>
      <p className="mt-2 max-w-2xl text-text-muted">{t('journey.cardsLead')}</p>
      <p className="mt-4 font-semibold text-primary" aria-live="polite">
        {anzahlGekonnt === n
          ? t('journey.countAll', { total: n })
          : t('journey.count', { n: anzahlGekonnt, total: n })}
      </p>

      <div className="mt-3 grid gap-3">
        {reihenfolge.map((i) => {
          const k = karten[i];
          const istOffen = offen.includes(i);
          const ok = gekonnt(i);
          const richtige = k.fragen.filter((_, j) => antworten[`${i}-${j}`]?.ok).length;
          const beantwortet = k.fragen.filter((_, j) => antworten[`${i}-${j}`]).length;
          return (
            <article
              key={k.slug}
              className={`rounded-xl border bg-white px-5 ${weg.includes(i) ? 'border-l-4 border-l-[#E3A72F]' : ''} ${
                ok ? 'border-[#2F7D4F]' : 'border-border'
              }`}
            >
              <button
                type="button"
                className="flex w-full items-center gap-3 py-4 text-left font-semibold text-primary"
                aria-expanded={istOffen}
                onClick={() => setOffen((o) => (o.includes(i) ? o.filter((x) => x !== i) : [...o, i]))}
              >
                <span aria-hidden="true" className={`text-lg ${ok ? 'text-[#E3A72F]' : 'text-[#6FB3B8]'}`}>
                  ✦
                </span>
                <span className="flex-1">{k.name}</span>
                <span className={`whitespace-nowrap text-sm font-normal ${ok ? 'font-semibold text-[#2F7D4F]' : 'text-text-muted'}`}>
                  {ok
                    ? t('journey.mastered')
                    : beantwortet
                      ? t('journey.partRight', { r: richtige, n: k.fragen.length })
                      : t('journey.questionCount', { n: k.fragen.length })}
                </span>
              </button>

              {istOffen && (
                <div className="pb-4">
                  <div className="rounded-lg border border-border border-l-4 border-l-[#6FB3B8] bg-surface-1 px-4 py-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-[#3E8A90]">{t('journey.card')}</p>
                    <h4 className="mb-2 mt-1 font-sans text-lg font-bold text-primary">{k.titel}</h4>
                    <p className="text-main-text">{k.text}</p>
                  </div>

                  {k.fragen.map((f, j) => {
                    const a = antworten[`${i}-${j}`];
                    const richtig = f.optionen.find((o) => o.ok);
                    return (
                      <div key={j} className="mt-5">
                        <p className="text-xs font-bold uppercase tracking-wide text-[#3E8A90]">
                          {t('journey.questionOf', { j: j + 1, n: k.fragen.length })}
                        </p>
                        <p className="mb-3 mt-1 font-semibold text-main-text">{f.frage}</p>
                        <div className="grid gap-2" role="group" aria-label={f.frage}>
                          {f.optionen.map((o, oi) => {
                            const gewaehlt = a?.gewaehlt === oi;
                            const zustand = !a
                              ? 'border-border bg-white hover:bg-surface-2'
                              : o.ok
                                ? 'border-[#2F7D4F] bg-[#E8F4EC]'
                                : gewaehlt
                                  ? 'border-[#B3402F] bg-[#FBEAE7]'
                                  : 'border-border bg-white opacity-70';
                            return (
                              <button
                                key={oi}
                                type="button"
                                disabled={Boolean(a)}
                                onClick={() => antworte(i, j, oi)}
                                className={`w-full rounded-lg border px-4 py-3 text-left text-main-text transition-colors disabled:cursor-default ${zustand}`}
                              >
                                {o.text}
                              </button>
                            );
                          })}
                        </div>
                        {a && (
                          <div aria-live="polite">
                            <p className="mt-3 text-main-text">
                              {a.ok ? '' : `${t('journey.wrong')} `}
                              {f.optionen[a.gewaehlt].fb}
                            </p>
                            <div className="mt-3">
                              {richtig && (
                                <p className="text-main-text">
                                  <strong>{t('journey.right')}</strong> {richtig.text}
                                </p>
                              )}
                              <p className="mt-2 border-l-2 border-[#6FB3B8] pl-3 text-sm text-text-muted">
                                <span className="font-semibold text-main-text">{t('journey.evidence')}</span> „{f.beleg}“
                                {f.belegDe && (
                                  <>
                                    <br />
                                    <span className="text-[13px]">
                                      ({t('journey.ownTranslation')}: „{f.belegDe}“)
                                    </span>
                                  </>
                                )}
                              </p>
                            </div>
                            {!a.ok && (
                              <button
                                type="button"
                                onClick={() => nochmal(i, j)}
                                className="mt-3 text-primary underline underline-offset-2"
                              >
                                {t('journey.retry')}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {k.quelle && (
                    <p className="mt-4 text-sm text-text-muted">
                      {t('journey.source')} {k.quelle.titel} — {k.quelle.herausgeber}, {t('journey.retrieved')} {k.quelle.abgerufen}.{' '}
                      <a className="underline" href={k.quelle.url} rel="noopener noreferrer" target="_blank">
                        {t('journey.toSource')}
                      </a>
                    </p>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>

      {thema.buchUrl && (
        <p className="mt-6 text-text-muted">
          {t('journey.bookNote', { autor: thema.buchAutor, titel: thema.buchTitel })}{' '}
          <a className="font-semibold text-primary underline underline-offset-2" href={thema.buchUrl}>
            {t('journey.bookLink')}
          </a>
        </p>
      )}
    </div>
  );
}
