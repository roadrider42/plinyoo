// src/routes/AppRoutes.tsx
import React, { useEffect } from 'react';
import { createHashRouter, Navigate, Outlet, useLocation } from 'react-router-dom';
import ScrollToTop from '@/components/ScrollToTop';
import { rememberKampagne } from '@/lib/kampagne';
import AppLayout from '@/components/layout/AppLayout';

// Import pages
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

  // Herkunft (Buchseite, Kanal) beim ersten Besuch merken, damit /zugang sie später mitschicken kann
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

export const router = createHashRouter([
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
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
