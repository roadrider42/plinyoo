// src/components/ui/SocialLinks.tsx
// Zweck: Links zu den Profilen von plinyoo bei Instagram und X (früher Twitter) mit Logo.
// Reine Links (kein Einbetten, kein Skript von Dritten): Daten gehen erst an den Anbieter, wenn jemand klickt.
// Logos: Instagram nach dem Feather-Icon (MIT-Lizenz), X nach Simple Icons (CC0). Es sind Markenzeichen der
// jeweiligen Anbieter; verwendet nur als Hinweis auf unser eigenes Profil.

import React from 'react';

export const SOCIAL = {
  handle: '@plinyoo_path',
  instagram: 'https://www.instagram.com/plinyoo_path/',
  x: 'https://x.com/plinyoo_path',
} as const;

type IconProps = { className?: string };

export function InstagramIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export function XIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
  );
}

type Props = {
  /** Mit sichtbarem Namen neben dem Logo (Kontaktseite) oder nur Logo mit Beschriftung für Screenreader (Fußzeile) */
  mitText?: boolean;
  className?: string;
  linkClassName?: string;
};

export default function SocialLinks({ mitText = false, className = '', linkClassName = '' }: Props) {
  const item = (href: string, name: string, icon: React.ReactNode) => (
    <a
      href={href}
      target="_blank"
      rel="noopener me"
      aria-label={`${name}: ${SOCIAL.handle}`}
      title={`${name}: ${SOCIAL.handle}`}
      className={`inline-flex items-center gap-2 transition-colors ${linkClassName}`}
    >
      {icon}
      {mitText ? <span>{`${name} ${SOCIAL.handle}`}</span> : null}
    </a>
  );
  return (
    <div className={`flex flex-wrap items-center gap-x-5 gap-y-2 ${className}`}>
      {item(SOCIAL.instagram, 'Instagram', <InstagramIcon />)}
      {item(SOCIAL.x, 'X (Twitter)', <XIcon />)}
    </div>
  );
}
