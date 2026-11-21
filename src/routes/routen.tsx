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

// Layout: Startseite ohne Header (Hero hat eigenen), andere Seiten mit Header
const RootLayout = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";

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

export const routen: RouteObject[] = [
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/zugang", element: <ZugangPage /> },
      { path: "/mitmachen", element: <MitmachenPage /> },
      { path: "/investieren", element: <InvestierenPage /> },
      { path: "/impressum", element: <ImpressumPage /> },
      { path: "/datenschutz", element: <DatenschutzPage /> },
      { path: "/urheberrecht", element: <UrheberrechtPage /> },
      { path: "/kontakt", element: <KontaktPage /> },
      { id: AUFFANG_ID, path: "*", element: <Navigate to="/" replace /> },
    ],
  },
];
