// src/routes/routen.tsx — #609 (spoonup): die Routenliste OHNE Router-Erzeugung.
//
// Getrennt von src/routes/AppRoutes.tsx, weil createBrowserRouter (wie vorher createHashRouter) schon beim
// Import window/document anfasst. Der Browser-Einstieg baut den Router daraus (AppRoutes.tsx), das Vorrendern
// (src/entry-server.tsx) benutzt dieselbe Liste mit createStaticHandler. Eine Liste, zwei Router.
//
// Die Pfade stehen hier ohne Schrägstrich am Ende; React Router erkennt /zugang und /zugang/ als dieselbe Route.
// Maßgeblich (canonical, Sitemap, Links) ist die Form mit Schrägstrich aus src/routes/seiten.ts.
import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation, type RouteObject } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ScrollToTop from '@/components/ScrollToTop';
import { rememberKampagne } from '@/lib/kampagne';
import AppLayout from '@/components/layout/AppLayout';

import HomePage from '@/pages/Home/HomePage';
import MitmachenPage from '@/pages/Mitmachen/MitmachenPage';
import InvestierenPage from '@/pages/Investieren/InvestierenPage';
import ImpressumPage from '@/pages/Impressum/ImpressumPage';
import DatenschutzPage from '@/pages/Datenschutz/DatenschutzPage';
import UrheberrechtPage from '@/pages/Urheberrecht/UrheberrechtPage';
import KontaktPage from '@/pages/Contact/ContactPage';
import ZugangPage from '@/pages/Zugang/ZugangPage';
import { fassungen, spracheDesPfads, zerlege } from './seiten';
import { SPRACHEN } from '@/lib/sprachen';

// Layout: Startseite ohne Header (Hero hat eigenen), andere Seiten mit Header
const RootLayout = () => {
  const location = useLocation();
  const { i18n } = useTranslation();
  // #609 Schritt 3: Startseite auch unter /en/, /es/ …
  const isHome = zerlege(location.pathname, SPRACHEN).rest === "/";

  // Die Sprache steht im Pfad (/en/zugang/). Beim Wechsel der Seite (Sprachumschalter, Link) folgt i18next dem Pfad.
  // Impressum und Datenschutz legen keine Sprache fest: dort bleibt die des Besuchers. Die erste Zeichnung hat
  // main.tsx schon in der Sprache des Pfads vorbereitet, hier ändert sich dann nichts.
  const pfadSprache = spracheDesPfads(location.pathname, SPRACHEN);
  useEffect(() => {
    if (pfadSprache && i18n.resolvedLanguage !== pfadSprache) i18n.changeLanguage(pfadSprache);
  }, [pfadSprache, i18n]);

  // Herkunft (Buchseite, Kanal) beim ersten Besuch merken, damit /zugang/ sie später mitschicken kann
  useEffect(() => {
    rememberKampagne();
  }, []);

  return (
    <AppLayout showHeader={!isHome} fullWidth={isHome}>
      <ScrollToTop />
      <Outlet />
    </AppLayout>
  );
};

/** Kennung der Auffangroute: scripts/vorrendern.mjs bricht ab, wenn eine Seite aus seiten.ts hier landet. */
export const AUFFANG_ID = 'auffang';

// Seite (Schlüssel seo aus seiten.ts) -> Ansicht. Fehlt eine, bricht der Aufbau der Liste ab (unten).
const ANSICHT: Record<string, React.ReactElement> = {
  start: <HomePage />,
  zugang: <ZugangPage />,
  mitmachen: <MitmachenPage />,
  investieren: <InvestierenPage />,
  impressum: <ImpressumPage />,
  datenschutz: <DatenschutzPage />,
  urheberrecht: <UrheberrechtPage />,
  kontakt: <KontaktPage />,
};

// #609 Schritt 3: eine Route je Seite und Sprache (/zugang, /en/zugang …), aus derselben Liste wie Vorrendern und
// Sitemap. Je Sprache erzeugt statt einer optionalen Vorsilbe: /xx/zugang mit unbekannter Sprache landet in der
// Auffangroute und ist nicht still deutsch. /en/impressum gibt es nicht (nurDeutsch), auch das fängt die Auffangroute.
const seitenRouten: RouteObject[] = fassungen(SPRACHEN).map(({ pfad, seite }) => {
  const element = ANSICHT[seite.seo];
  if (!element) throw new Error(`routen.tsx: keine Ansicht für Seite "${seite.seo}" (${pfad})`);
  return { path: pfad === '/' ? '/' : pfad.replace(/\/$/, ''), element };
});

export const routen: RouteObject[] = [
  {
    element: <RootLayout />,
    children: [
      ...seitenRouten,
      { id: AUFFANG_ID, path: "*", element: <Navigate to="/" replace /> },
    ],
  },
];
