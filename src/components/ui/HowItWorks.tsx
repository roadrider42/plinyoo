// src/components/ui/HowItWorks.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';

interface Step {
  title: string;
  description: string;
}

export default function HowItWorks() {
  const { t } = useTranslation();

  const steps = t('howItWorks.steps', { returnObjects: true });
  const stepList: Step[] = Array.isArray(steps) ? (steps as Step[]) : [];

  if (stepList.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-5xl px-5 py-16 sm:px-8">
      <h2 className="mb-8 text-center font-sans text-2xl font-semibold tracking-tight text-main-text sm:text-3xl">
        {t('howItWorks.title')}
      </h2>

      <div className="grid gap-4 sm:grid-cols-3">
        {stepList.map((step, index) => (
          <div
            key={step.title}
            className="flex flex-col gap-2.5 rounded-[18px] border border-border bg-surface-1 p-5 shadow-sm"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
              {index + 1}
            </span>
            <h3 className="font-sans text-base font-semibold text-main-text">
              {step.title}
            </h3>
            <p className="text-sm leading-relaxed text-text-muted">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
