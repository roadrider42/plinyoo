// src/components/ui/Features.tsx
// Zweck: "Dein Weg, Karte für Karte" — Karte, Wahl, Wiederholung in drei Schritten, je mit kleiner Skizze.
// Texte aus den Übersetzungen (features.*). Die Skizzen sind reine Illustration ohne Text und ohne Zahlen.

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { BookOpen, Signpost, Repeat, ChevronRight } from 'lucide-react';
import { fadeUp, staggerList } from '../../lib/motion';

type Step = { title: string; desc: string; category: string };

const ICONS = [BookOpen, Signpost, Repeat];

// Skizze 1: eine Karte mit Überschrift, Text und einem Verweis
function SketchCard() {
  return (
    <div className="mx-auto w-40 rounded-xl border border-border bg-white p-3 shadow-sm" aria-hidden="true">
      <div className="mb-2.5 h-2.5 w-2/3 rounded-full bg-primary/80" />
      <div className="mb-1.5 h-1.5 w-full rounded-full bg-border" />
      <div className="mb-1.5 h-1.5 w-11/12 rounded-full bg-border" />
      <div className="mb-3 h-1.5 w-3/5 rounded-full bg-border" />
      <div className="flex items-center gap-1.5">
        <span className="h-4 w-14 rounded-full bg-soft-teal/20" />
        <ChevronRight className="h-3.5 w-3.5 text-soft-teal" />
      </div>
    </div>
  );
}

// Skizze 2: das Ende einer Karte, darunter drei Kacheln nebeneinander, eine davon gewählt
function SketchChoice() {
  return (
    <div className="mx-auto w-44" aria-hidden="true">
      <div className="mb-1.5 h-1.5 w-full rounded-full bg-border" />
      <div className="mb-3 h-1.5 w-3/5 rounded-full bg-border" />
      <div className="grid grid-cols-3 gap-1.5">
        {[false, true, false].map((chosen, i) => (
          <div
            key={i}
            className={`flex h-12 flex-col justify-end rounded-lg border p-1.5 ${
              chosen ? 'border-soft-teal bg-soft-teal/10 ring-2 ring-soft-teal/25' : 'border-border bg-white'
            }`}
          >
            <span className={`h-1.5 w-full rounded-full ${chosen ? 'bg-soft-teal' : 'bg-border'}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

// Skizze 3: eine Zeitachse, auf der das Wackelnde früher wiederkommt als das Sitzende
function SketchReturn() {
  return (
    <div className="mx-auto w-44" aria-hidden="true">
      <div className="relative h-14">
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" />
        {[0, 25, 50, 75, 100].map((left) => (
          <span key={left} className="absolute top-1/2 h-2 w-px -translate-y-1/2 bg-border" style={{ left: `${left}%` }} />
        ))}
        <span className="absolute top-[18%] h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-[#FFD44D] ring-4 ring-[#FFD44D]/25" style={{ left: '25%' }} />
        <span className="absolute top-[58%] h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-soft-teal ring-4 ring-soft-teal/20" style={{ left: '85%' }} />
      </div>
    </div>
  );
}

const SKETCHES = [SketchCard, SketchChoice, SketchReturn];

const Features = () => {
  const { t } = useTranslation();
  const raw = t('features.items', { returnObjects: true }) as unknown;
  const steps = Array.isArray(raw) ? (raw as Step[]) : [];

  return (
    <section
      className="px-5 py-20 sm:px-8"
      style={{ background: 'linear-gradient(180deg, rgba(46,122,128,0.08) 0%, rgba(46,122,128,0.02) 100%)' }}
    >
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-4 text-center font-sans text-3xl font-bold tracking-tight text-primary sm:text-4xl">
          {t('features.title')}
        </h2>
        <p className="mx-auto mb-14 max-w-2xl text-center text-text-muted">{t('features.subtitle')}</p>

        <motion.ol
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerList(0.12)}
          className="grid gap-6 md:grid-cols-3 md:gap-0"
        >
          {steps.map((step, index) => {
            const Icon = ICONS[index] ?? BookOpen;
            const Sketch = SKETCHES[index] ?? SketchCard;
            return (
              <motion.li key={step.title} variants={fadeUp} className="relative md:px-3">
                <div className="flex h-full flex-col rounded-2xl border border-border bg-surface-1 p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                  <div className="mb-5 flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-soft-teal/15 text-soft-teal">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="font-sans text-4xl font-bold leading-none text-border">{step.category}</span>
                  </div>
                  <h3 className="mb-2 font-sans text-xl font-semibold text-primary">{step.title}</h3>
                  <p className="mb-6 text-sm leading-relaxed text-text-muted">{step.desc}</p>
                  <div className="mt-auto flex h-36 items-center justify-center rounded-xl bg-surface-2 px-4">
                    <Sketch />
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <span
                    className="absolute right-[-14px] top-1/2 z-10 hidden h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white text-soft-teal shadow-sm md:flex"
                    aria-hidden="true"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </span>
                )}
              </motion.li>
            );
          })}
        </motion.ol>
      </div>
    </section>
  );
};

export default Features;
