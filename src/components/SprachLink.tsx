// src/components/SprachLink.tsx — #609 Schritt 3: interne Links in der Sprache der Seite.
//
// Jeder Link der App ist in der deutschen Form geschrieben (to="/zugang/?rolle=x"). Auf /en/… führt er nach
// /en/zugang/?rolle=x, auf deutschen Seiten bleibt er. Impressum und Datenschutz gibt es nur deutsch
// (src/routes/seiten.ts, nurDeutsch): Links dorthin bleiben in jeder Sprache /impressum/ und /datenschutz/.
// Maßgeblich ist die Sprache, in der i18next gerade zeichnet — auf einer Sprachseite die des Pfads
// (src/routes/routen.tsx), auf Impressum und Datenschutz die des Besuchers. So führt "Zur Startseite" vom
// Datenschutz eines englischen Besuchers nach /en/.
import React, { forwardRef } from 'react';
import { Link, NavLink, type LinkProps, type NavLinkProps } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { sprachPfad } from '@/routes/seiten';
import { RUECKFALL_SPRACHE, SPRACHEN } from '@/lib/sprachen';

/** Funktion, die ein Ziel in die Sprache der Seite setzt. */
export function useSprachPfad(): (ziel: string) => string {
  const { i18n } = useTranslation();
  const roh = (i18n.resolvedLanguage || i18n.language || RUECKFALL_SPRACHE).slice(0, 2);
  const sprache = (SPRACHEN as readonly string[]).includes(roh) ? roh : RUECKFALL_SPRACHE;
  return (ziel) => sprachPfad(sprache, ziel);
}

export const SprachLink = forwardRef<HTMLAnchorElement, LinkProps>(function SprachLink({ to, ...rest }, ref) {
  const pfad = useSprachPfad();
  return <Link ref={ref} to={typeof to === 'string' ? pfad(to) : to} {...rest} />;
});

export const SprachNavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(function SprachNavLink({ to, ...rest }, ref) {
  const pfad = useSprachPfad();
  return <NavLink ref={ref} to={typeof to === 'string' ? pfad(to) : to} {...rest} />;
});
