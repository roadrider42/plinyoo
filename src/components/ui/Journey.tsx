// src/components/ui/Journey.tsx
// Zweck: Beispielweg zum Ausprobieren — sieben echte Lernkarten, jede mit Frage und Beleg.
// Texte kommen aus den Übersetzungen (journey.*). Sprachen ohne diesen Block zeigen den Abschnitt nicht.

import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

type Option = { text: string; correct: boolean; why: string };
type JourneyCard = { title: string; body: string; question: string; beleg: string; options: Option[] };

function shuffled<T>(items: T[]): T[] {
  return items
    .map((item) => [Math.random(), item] as const)
    .sort((a, b) => a[0] - b[0])
    .map(([, item]) => item);
}

export default function Journey() {
  const { t, i18n } = useTranslation();
  // Nur zeigen, wenn die aktuelle Sprache den Block selbst hat — sonst käme deutscher Text über den Rückfall auf eine fremde Seite
  const hasOwnText = Boolean(i18n.getResource(i18n.resolvedLanguage || i18n.language, 'translation', 'journey'));
  const raw = t('journey.cards', { returnObjects: true }) as unknown;
  const cards = Array.isArray(raw) ? (raw as JourneyCard[]) : [];

  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);

  const card = cards[step];
  // Reihenfolge der Antworten je Karte einmal mischen, damit die richtige nicht immer an derselben Stelle steht
  // Abhängig vom Schritt, nicht vom Kartenobjekt: das wird bei jedem Rendern neu erzeugt und würde die Antworten ständig neu mischen
  const options = useMemo(
    () => (card ? shuffled(card.options.map((option, index) => ({ ...option, index }))) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [step, cards.length],
  );

  if (!hasOwnText || cards.length === 0) return null;

  const done = step >= cards.length;

  const choose = (index: number, correct: boolean) => {
    if (solved || picked.includes(index)) return;
    setPicked([...picked, index]);
    if (correct) setSolved(true);
  };

  const next = () => {
    setStep(step + 1);
    setPicked([]);
    setSolved(false);
  };

  const restart = () => {
    setStep(0);
    setPicked([]);
    setSolved(false);
  };

  return (
    <section className="mx-auto w-full max-w-3xl px-5 py-16 sm:px-8" aria-label={String(t('journey.aria'))}>
      <h2 className="text-center font-sans text-2xl font-semibold tracking-tight text-main-text sm:text-3xl">
        {t('journey.title')}
      </h2>
      <p className="mx-auto mt-3 mb-8 max-w-xl text-center text-text-muted">{t('journey.subtitle')}</p>

      {/* Weg: ein Punkt je Karte, gelesene Karten leuchten */}
      <ol className="mb-6 flex items-center justify-between" aria-hidden="true">
        {cards.map((_, i) => (
          <li key={i} className="flex flex-1 items-center last:flex-none">
            <span
              className={`h-3 w-3 shrink-0 rounded-full ${
                i < step ? 'bg-primary' : i === step && !done ? 'bg-primary/60 ring-4 ring-primary/20' : 'bg-border'
              }`}
            />
            {i < cards.length - 1 && <span className={`h-px flex-1 ${i < step ? 'bg-primary' : 'bg-border'}`} />}
          </li>
        ))}
      </ol>

      <div className="rounded-xl border border-border bg-white p-6 shadow-sm sm:p-8">
        {done ? (
          <div className="text-center">
            <h3 className="mb-3 font-sans text-xl font-bold text-primary">{t('journey.doneTitle')}</h3>
            <p className="mb-6 text-main-text">{t('journey.doneText')}</p>
            <button
              type="button"
              onClick={restart}
              className="rounded-xl border border-border bg-surface-1 px-5 py-2.5 text-sm font-semibold text-primary hover:bg-surface-2"
            >
              {t('journey.restart')}
            </button>
          </div>
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between text-xs font-medium uppercase tracking-wide">
              <span className="text-primary">
                {t('journey.step', { current: step + 1, total: cards.length })}
              </span>
              <span className="text-text-muted">{t('journey.label')}</span>
            </div>
            <h3 className="mb-2 font-sans text-xl font-bold text-primary">{card.title}</h3>
            <p className="mb-5 text-main-text">{card.body}</p>
            <p className="mb-3 font-semibold text-main-text">{card.question}</p>

            <div className="space-y-2" aria-live="polite">
              {options.map((option) => {
                const isPicked = picked.includes(option.index);
                const state = !isPicked
                  ? 'border-border bg-surface-1 hover:bg-surface-2'
                  : option.correct
                    ? 'border-primary bg-surface-2'
                    : 'border-border bg-surface-1 opacity-70';
                return (
                  <div key={option.index}>
                    <button
                      type="button"
                      disabled={solved || isPicked}
                      onClick={() => choose(option.index, option.correct)}
                      className={`w-full rounded-lg border px-4 py-3 text-left text-sm text-main-text transition-colors ${state}`}
                    >
                      {isPicked && option.correct && <span aria-hidden="true" className="mr-2 font-bold text-primary">✓</span>}
                      {option.text}
                    </button>
                    {isPicked && <p className="mt-1 px-1 text-sm text-text-muted">{option.why}</p>}
                  </div>
                );
              })}
            </div>

            {solved && (
              <div className="mt-5">
                <p className="rounded-lg bg-surface-2 px-4 py-3 text-sm italic text-main-text">
                  {t('journey.evidence')} {card.beleg}
                </p>
                <button
                  type="button"
                  onClick={next}
                  className="mt-4 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary/90"
                >
                  {t('journey.next')}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
