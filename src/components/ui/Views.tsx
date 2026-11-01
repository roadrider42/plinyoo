// src/components/ui/Views.tsx
// Zweck: "Ein Blick hinein" — drei Ansichten aus der Entwicklung im Telefonrahmen auf dunkler Bühne.
// Ein Karussell mit allen Ansichten: zuerst die Bilder der App (Lernfeld), dann Wissensnetz und Wege und Lücken als eigenständige Seiten in /public/ansichten.
// Entwurf 01.11.2026 (Heiko): alles im Karussell statt hinter einem Knopf; die echte App steht vorn.
// Die Ansichten selbst sind deutsch; Überschriften und Hinweise kommen aus den Übersetzungen.

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

const SCREEN_WIDTH = 390;
const SCREEN_HEIGHT = 844;

// Telefonrahmen: Bildschirm im Seitenverhältnis 390 × 844, Inhalt wird hineingesetzt
function Phone({ children, raised = false }: { children: React.ReactNode; raised?: boolean }) {
  return (
    <div
      className={`mx-auto w-full max-w-[300px] rounded-[2.6rem] bg-neutral-800 p-[9px] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] ring-1 ring-white/15 ${
        raised ? 'lg:-mt-8' : ''
      }`}
    >
      <div className="relative overflow-hidden rounded-[2.1rem] bg-white" style={{ aspectRatio: `${SCREEN_WIDTH} / ${SCREEN_HEIGHT}` }}>
        {children}
      </div>
    </div>
  );
}

// Eingebettete Seite, für 390 px Breite gebaut, auf die Breite des Rahmens heruntergerechnet
function ScaledFrame({ src, title }: { src: string; title: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.7);

  useEffect(() => {
    const el = box.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / SCREEN_WIDTH));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={box} className="absolute inset-0 overflow-hidden">
      <iframe
        src={src}
        title={title}
        loading="lazy"
        sandbox="allow-scripts"
        style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT, transform: `scale(${scale})`, transformOrigin: 'top left', border: 0 }}
      />
    </div>
  );
}

type Slide = { key: string; item: View; image?: { src: string; alt: string }; frameSrc?: string };

export default function Views() {
  const { t, i18n } = useTranslation();
  const hasOwnText = Boolean(i18n.getResource(i18n.resolvedLanguage || i18n.language, 'translation', 'views'));
  const raw = t('views.items', { returnObjects: true }) as unknown;
  const items = Array.isArray(raw) ? (raw as View[]) : [];
  const [index, setIndex] = useState(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  if (!hasOwnText || items.length === 0) return null;

  // Alle Ansichten in eine Reihe: Bilder eines Eintrags nacheinander, eingebettete Seiten je eine Folie
  const slides: Slide[] = items.flatMap((item) => [
    ...(item.images ?? []).map((image, i) => ({ key: `${item.id}-${i}`, item, image })),
    ...(item.src ? [{ key: item.id, item, frameSrc: item.src }] : []),
  ]);
  const current = slides[Math.min(index, slides.length - 1)];
  const go = (delta: number) => setIndex((index + delta + slides.length) % slides.length);
  // Wischen: waagerechte Bewegung ab 40 px, die klar länger ist als die senkrechte (Seite scrollt weiter)
  const onTouchStart = (e: React.TouchEvent) => { touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
  const onTouchEnd = (e: React.TouchEvent) => {
    const s = touchStart.current; touchStart.current = null;
    if (!s) return;
    const dx = e.changedTouches[0].clientX - s.x, dy = e.changedTouches[0].clientY - s.y;
    if (Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1);
  };
  const button = 'flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20';

  return (
    <section
      className="relative overflow-hidden py-20 text-white"
      style={{
        background:
          'radial-gradient(circle at 20% 10%, rgba(46,122,128,0.35), transparent 45%), radial-gradient(circle at 85% 90%, rgba(255,212,77,0.12), transparent 40%), #11131F',
      }}
    >
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <h2 className="text-center font-sans text-3xl font-semibold tracking-tight sm:text-4xl">{t('views.title')}</h2>
        <p className="mx-auto mt-3 mb-14 max-w-xl text-center text-white/70">{t('views.subtitle')}</p>

        <div className="flex flex-col" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} style={{ touchAction: 'pan-y' }}>
          <Phone>
            {current.image && (
              <img
                key={current.key}
                src={current.image.src}
                alt={current.image.alt}
                loading="lazy"
                width={SCREEN_WIDTH}
                height={SCREEN_HEIGHT}
                className="absolute inset-0 h-full w-full object-cover object-top"
              />
            )}
            {current.frameSrc && <ScaledFrame key={current.key} src={current.frameSrc} title={current.item.frameTitle || current.item.title} />}
          </Phone>
          <div className="mt-4 flex items-center justify-center gap-3">
            <button type="button" onClick={() => go(-1)} aria-label="←" className={button}>←</button>
            <span className="flex gap-1.5" aria-hidden="true">
              {slides.map((slide, i) => (
                <span key={slide.key} className={`h-1.5 rounded-full transition-all ${i === index ? 'w-5 bg-[#FFD44D]' : 'w-1.5 bg-white/30'}`} />
              ))}
            </span>
            <button type="button" onClick={() => go(1)} aria-label="→" className={button}>→</button>
          </div>
          <div className="mx-auto mt-6 min-h-[11rem] max-w-[340px] text-center" aria-live="polite">
            <span className="mb-2 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-[#FFD44D]">
              {current.item.tag}
            </span>
            <h3 className="font-sans text-lg font-semibold">{current.item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/70">{current.item.text}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
