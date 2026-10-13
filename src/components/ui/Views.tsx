// src/components/ui/Views.tsx
// Zweck: "Ein Blick hinein" — drei Ansichten aus der Entwicklung (Lernfeld, Wissensnetz, Wege und Lücken).
// Lernfeld: Bilder zum Durchblättern. Wissensnetz und Autorenwerkzeug: eigenständige Seiten in /public/ansichten, hier eingebettet.
// Nur Sprachen mit eigenem views-Block zeigen den Abschnitt (die Ansichten sind deutsch).

import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

type View = {
  id: string;
  tag: string;
  title: string;
  text: string;
  images?: { src: string; alt: string }[];
  src?: string;
  frameTitle?: string;
};

// Eingebettete Seiten sind für 390 px Breite gebaut. Der Rahmen rechnet sie auf die verfügbare Breite herunter,
// statt sie in einer schmalen Spalte umbrechen zu lassen.
const FRAME_WIDTH = 390;
const FRAME_HEIGHT = 720;

function ScaledFrame({ src, title }: { src: string; title: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = box.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(([entry]) => setScale(Math.min(1, entry.contentRect.width / FRAME_WIDTH)));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={box} className="w-full overflow-hidden rounded-lg border border-border bg-white" style={{ height: FRAME_HEIGHT * scale }}>
      <iframe
        src={src}
        title={title}
        loading="lazy"
        sandbox="allow-scripts"
        style={{ width: FRAME_WIDTH, height: FRAME_HEIGHT, transform: `scale(${scale})`, transformOrigin: 'top left', border: 0 }}
      />
    </div>
  );
}

export default function Views() {
  const { t, i18n } = useTranslation();
  const hasOwnText = Boolean(i18n.getResource(i18n.resolvedLanguage || i18n.language, 'translation', 'views'));
  const raw = t('views.items', { returnObjects: true }) as unknown;
  const items = Array.isArray(raw) ? (raw as View[]) : [];
  if (!hasOwnText || items.length === 0) return null;

  return (
    <section className="bg-surface-2 border-y border-border/60 py-16">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <h2 className="text-center font-sans text-2xl font-semibold tracking-tight text-main-text sm:text-3xl">
          {t('views.title')}
        </h2>
        <p className="mx-auto mt-3 mb-10 max-w-xl text-center text-text-muted">{t('views.subtitle')}</p>

        <div className="grid gap-8 lg:grid-cols-3">
          {items.map((item) => (
            <article key={item.id} className="flex flex-col rounded-xl border border-border bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-2 px-1">
                <h3 className="font-sans text-base font-bold text-primary">{item.title}</h3>
                <span className="shrink-0 rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium text-primary">
                  {item.tag}
                </span>
              </div>

              {item.images && (
                <div
                  className="flex snap-x snap-mandatory gap-3 overflow-x-auto rounded-lg"
                  tabIndex={0}
                  role="group"
                  aria-label={item.title}
                >
                  {item.images.map((image) => (
                    <img
                      key={image.src}
                      src={image.src}
                      alt={image.alt}
                      loading="lazy"
                      width={390}
                      height={844}
                      className="w-full shrink-0 snap-center rounded-lg border border-border object-contain"
                    />
                  ))}
                </div>
              )}

              {item.src && <ScaledFrame src={item.src} title={item.frameTitle || item.title} />}

              <p className="mt-4 px-1 text-sm leading-relaxed text-text-muted">{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
