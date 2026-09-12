// src/components/ui/Roles.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Compass, Users, Building2 } from 'lucide-react';

const ICONS = [Compass, Users, Building2];

export default function Roles() {
  const { t } = useTranslation();

  const roleKeys = ['learner', 'author', 'curator'] as const;

  const roles = roleKeys.map((key) => ({
    key,
    title: t(`roles.${key}.title`),
    description: t(`roles.${key}.description`),
  }));

  return (
    <section className="mx-auto w-full max-w-5xl px-5 pb-16 sm:px-8">
      <h2 className="mb-8 text-center font-sans text-2xl font-semibold tracking-tight text-main-text sm:text-3xl">
        {t('roles.title')}
      </h2>

      <div className="grid gap-4 sm:grid-cols-3">
        {roles.map(({ key, title, description }, index) => {
          const Icon = ICONS[index] ?? Compass;
          return (
            <div
              key={key}
              className="flex flex-col gap-3 rounded-[18px] border border-border bg-surface-1 p-5 shadow-sm"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-2">
                <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <h3 className="font-sans text-base font-semibold text-main-text">
                {title}
              </h3>
              <p className="text-sm leading-relaxed text-text-muted">{description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
