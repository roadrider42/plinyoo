// src/routes/AppRoutes.tsx
import React from 'react';
import { createHashRouter, Navigate, Outlet } from 'react-router-dom';
import ScrollToTop from '@/components/ScrollToTop';
import AppLayout from '@/components/layout/AppLayout';

// Import pages
import HomePage from '@/pages/Home/HomePage';
import MitmachenPage from '@/pages/Mitmachen/MitmachenPage';
import InvestierenPage from '@/pages/Investieren/InvestierenPage';
import ImpressumPage from '@/pages/Impressum/ImpressumPage';
import DatenschutzPage from '@/pages/Datenschutz/DatenschutzPage';
import UrheberrechtPage from '@/pages/Urheberrecht/UrheberrechtPage';
import KontaktPage from '@/pages/Contact/ContactPage';

const RootLayout = () => (
  <AppLayout>
    <ScrollToTop />
    <Outlet />
  </AppLayout>
);

export const router = createHashRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <HomePage /> },
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
