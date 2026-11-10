// src/components/ui/HeroFaden.tsx
// Zweck: Ein Telefon im Hero, auf dem ein Faden über vier Bücher von Karte zu Karte wischt (#503, Entwurf V2, Baublatt B1–B8).
// Bewegung: alle 5 s die nächste Folie, nur ohne „reduzierte Bewegung“. Jede Berührung des Telefons und jeder Tipp auf eine
//   Schaltfläche hält den Lauf an; „Anhalten“/„Abspielen“ schaltet ihn (WCAG 2.2.2). Bei reduzierter Bewegung läuft nichts,
//   und die Schaltfläche fehlt.
// Wischen: mehr als 40 px waagerecht = nächste/vorige Folie; touch-action pan-y, damit die Seite senkrecht scrollbar bleibt.
// Texte (vom Sprecher freigegeben, #503): aus hero.faden in den Übersetzungen. Inhalt der Folien: fadenInhalt.ts.

import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Phone } from './Views';
import { FADEN_BUECHER, FADEN_FOLIEN, type FadenBuch } from './fadenInhalt';

const TAKT_MS = 5000;
const WISCH_PX = 40;

const coverSrc = (b: FadenBuch) => (b.coverSlug ? `/buch/${b.coverSlug}/cover-klein.jpg` : null);

function useReduzierteBewegung() {
  const abfrage = '(prefers-reduced-motion: reduce)';
  const [ruhe, setRuhe] = useState(() => typeof window !== 'undefined' && window.matchMedia?.(abfrage).matches);
  useEffect(() => {
    const mq = window.matchMedia?.(abfrage);
    if (!mq) return;
    const neu = () => setRuhe(mq.matches);
    mq.addEventListener('change', neu);
    return () => mq.removeEventListener('change', neu);
  }, []);
  return Boolean(ruhe);
}

function BuchKopf({ buch }: { buch: FadenBuch }) {
  const src = coverSrc(buch);
  return (
    <div className="flex min-h-[44px] items-center gap-2.5">
      {src ? (
        <img src={src} alt="" width={28} height={42} className="h-[42px] w-[28px] flex-none rounded-[3px] object-cover shadow-[0_1px_3px_rgba(0,0,0,0.2)]" />
      ) : (
        <span aria-hidden="true" className="flex h-[42px] w-[28px] flex-none items-center justify-center rounded-[3px] bg-surface-3 text-xs font-semibold text-text-muted shadow-[0_1px_3px_rgba(0,0,0,0.2)]">
          {buch.initialen}
        </span>
      )}
      <div>
        <span className="block text-xs font-medium text-text-muted">{buch.autor}</span>
        <span className="block text-[13px] font-semibold text-primary">{buch.titel}</span>
      </div>
    </div>
  );
}

export default function HeroFaden() {
  const { t } = useTranslation();
  const ruhe = useReduzierteBewegung();
  const [index, setIndex] = useState(0);
  const [lauf, setLauf] = useState(true);
  const start = useRef<number | null>(null);

  const folien = FADEN_FOLIEN;
  const laeuft = lauf && !ruhe;
  const buecher = Array.from(new Set(folien.map((f) => f.buch)));
  const kartenGesamt = folien.filter((f) => f.art === 'karte').length;

  useEffect(() => {
    if (!laeuft) return;
    const uhr = window.setInterval(() => setIndex((i) => (i + 1) % folien.length), TAKT_MS);
    return () => window.clearInterval(uhr);
  }, [laeuft, folien.length]);

  const zeigen = (n: number) => setIndex(((n % folien.length) + folien.length) % folien.length);
  const anhalten = () => setLauf(false);
  const aktivesBuch = folien[index].buch;

  const naechsteKarte = (i: number) => {
    for (let j = i + 1; j < folien.length; j++) {
      const f = folien[j];
      if (f.art === 'karte') return f;
    }
    return null;
  };

  const knopf =
    'min-h-[44px] min-w-[44px] whitespace-nowrap rounded-full border px-3 text-sm sm:px-4 font-medium transition-colors focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-accent';

  return (
    <div className="lg:grid lg:grid-cols-[44px_auto] lg:items-start lg:gap-x-3" data-ziel="hero-faden">
      {/* Bücherleiste: unter 1024 px waagerecht über dem Telefon, ab 1024 px senkrecht links daneben (B3, B4) */}
      <div
        role="group"
        aria-label={String(t('hero.faden.booksLabel'))}
        className="mb-2.5 flex justify-center gap-2 lg:col-start-1 lg:row-start-1 lg:mb-0 lg:flex-col lg:justify-start lg:pt-10"
      >
        {buecher.map((k) => {
          const b = FADEN_BUECHER[k];
          const src = coverSrc(b);
          const an = k === aktivesBuch;
          return (
            <button
              key={k}
              type="button"
              aria-label={b.titel}
              aria-current={an ? 'true' : undefined}
              data-buch={k}
              onClick={() => {
                anhalten();
                zeigen(folien.findIndex((f) => f.buch === k));
              }}
              className={`h-14 w-11 flex-none rounded-md border-2 p-0 transition-opacity motion-reduce:transition-none focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-accent ${
                an ? 'border-accent opacity-100' : 'border-transparent opacity-[.45]'
              }`}
            >
              {src ? (
                <img src={src} alt="" className="h-full w-full rounded object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center rounded bg-surface-3 text-xs font-semibold text-text-muted">{b.initialen}</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="lg:col-start-2 lg:row-start-1">
        <Phone
          light
          size="mx-auto w-full max-w-[300px] lg:mx-0 lg:max-w-none lg:w-[clamp(270px,calc((100svh_-_180px)_*_.4621_+_18px),300px)]"
          screenClassName="bg-main-background"
          screenProps={{
            onPointerDown: (e) => {
              start.current = e.clientX;
              anhalten();
            },
            onPointerUp: (e) => {
              if (start.current === null) return;
              const d = e.clientX - start.current;
              start.current = null;
              if (Math.abs(d) > WISCH_PX) zeigen(index + (d < 0 ? 1 : -1));
            },
            onPointerCancel: () => {
              start.current = null;
            },
          }}
        >
          <span className="absolute left-1/2 top-3.5 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-highlight px-2.5 py-[3px] text-xs font-medium text-primary">
            {t('hero.faden.target')}
          </span>
          <div
            data-ziel="hero-faden-strom"
            className="absolute inset-0 flex transition-transform duration-[450ms] ease-[cubic-bezier(.25,.46,.45,.94)] motion-reduce:transition-none"
            style={{ transform: `translateX(${-100 * index}%)`, touchAction: 'pan-y' }}
          >
            {folien.map((f, i) => {
              const buch = FADEN_BUECHER[f.buch];
              const n = naechsteKarte(i);
              const kartenBisHier = folien.slice(0, i + 1).filter((x) => x.art === 'karte').length;
              return (
                <div
                  key={i}
                  aria-hidden={i !== index}
                  data-folie={i}
                  className="flex h-full flex-none basis-full flex-col gap-1.5 px-3 pb-3 pt-10"
                >
                  <BuchKopf buch={buch} />
                  {f.art === 'karte' ? (
                    <div data-ziel="hero-faden-karte" className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden rounded-[14px] border border-border bg-surface-1 p-3">
                      <h3 className="m-0 text-base font-semibold leading-[1.3] text-primary">{f.titel}</h3>
                      <p className="m-0 text-[13px] leading-normal text-main-text">{f.text}</p>
                      {n && (
                        <div className="mt-auto flex flex-col gap-0.5 rounded-[10px] bg-surface-tint px-2.5 py-1.5 text-xs text-text-muted">
                          {t('hero.faden.refersTo', { book: FADEN_BUECHER[n.buch].titel })}
                          <strong className="text-[13px] text-primary">{n.titel}</strong>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div data-ziel="hero-faden-karte" className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden rounded-[14px] border border-border bg-surface-1 p-3">
                      <h3 className="m-0 text-base font-semibold leading-[1.3] text-primary">{f.frage}</h3>
                      {f.antworten.map((a, k) => (
                        <div
                          key={a}
                          className={`min-h-[44px] rounded-[10px] border p-2.5 text-[13px] ${
                            k === f.richtig ? 'border-[#2f855a] bg-[#f0fff4]' : 'border-border'
                          }`}
                        >
                          {a}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="text-center text-xs text-text-muted">
                    {f.art === 'karte'
                      ? t('hero.faden.cardOf', { n: kartenBisHier, m: kartenGesamt })
                      : t('hero.faden.questionOf')}
                  </div>
                </div>
              );
            })}
          </div>
        </Phone>
      </div>

      {/* Bedienzeile (B8): genau eine gefüllte Schaltfläche */}
      <div className="mt-2.5 flex justify-center gap-2 lg:col-span-2 lg:col-start-1 lg:row-start-2">
        <button
          type="button"
          aria-label={String(t('hero.faden.prev'))}
          data-ziel="hero-faden-zurueck"
          onClick={() => {
            anhalten();
            zeigen(index - 1);
          }}
          className={`${knopf} border-border bg-surface-1 text-primary hover:bg-surface-2`}
        >
          ←
        </button>
        {!ruhe && (
          <button
            type="button"
            data-ziel="hero-faden-lauf"
            onClick={() => setLauf((l) => !l)}
            className={`${knopf} border-border bg-surface-1 text-primary hover:bg-surface-2`}
          >
            {lauf ? t('hero.faden.pause') : t('hero.faden.play')}
          </button>
        )}
        <button
          type="button"
          data-ziel="hero-faden-weiter"
          onClick={() => {
            anhalten();
            zeigen(index + 1);
          }}
          className={`${knopf} border-primary bg-primary text-white hover:bg-primary/90`}
        >
          {t('hero.faden.next')}
        </button>
      </div>
    </div>
  );
}
