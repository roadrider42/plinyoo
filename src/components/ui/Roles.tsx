// src/components/ui/Roles.tsx
// Drei Anreden an den Besucher: Lernende, Kuratoren, Wegbereiter (Entscheidung Heiko 16.10.2026).
// Die dritte Tür trägt als Überschrift das Selbstbild des Besuchers ("Du führst ein Team?");
// der Rollenname "Wegbereiter:in" erscheint als Beschriftung darunter.
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Compass, PenLine, Users } from 'lucide-react';

const DOORS = [
  { key: 'learner', Icon: Compass },
  { key: 'curator', Icon: PenLine },
  { key: 'wegbereiter', Icon: Users },
] as const;

export default function Roles() {
  const { t } = useTranslation();

  return (
    <section className="mx-auto w-full max-w-5xl px-5 py-16 sm:px-8">
      {/* Keine sichtbare Überschrift (Heiko 16.10.2026): Die Karten sprechen für sich.
          Die Überschrift bleibt für Screenreader und die Seitenstruktur erhalten. */}
      <h2 className="sr-only">{t('roles.srTitle')}</h2>

      <div className="grid gap-4 md:grid-cols-3">
        {DOORS.map(({ key, Icon }) => (
          <div
            key={key}
            className="flex flex-col gap-3 rounded-[18px] border border-border bg-surface-1 p-6 shadow-sm"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-2">
              <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            <h3 className="font-sans text-lg font-semibold text-main-text">{t(`roles.${key}.title`)}</h3>
            <p className="text-xs font-medium uppercase tracking-wide text-soft-teal">
              {t('roles.roleLabel')}: {t(`roles.${key}.role`)}
            </p>
            <p className="flex-1 text-sm leading-relaxed text-text-muted">{t(`roles.${key}.description`)}</p>
            <Link
              to={`/zugang?rolle=${key}`}
              className="mt-2 inline-block text-sm font-semibold text-primary underline-offset-4 hover:underline"
            >
              {t('roles.cta')} &rarr;
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
