import React, { Suspense, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';

// CSS zuerst laden - FOUC Prevention
import './index.css';
import 'modern-normalize/modern-normalize.css';

import { router } from './routes/AppRoutes';
import './lib/i18n';

// FOUC Prevention - Add loading class initially
document.documentElement.classList.add('loading');

const AppWithLoading = () => {
  useEffect(() => {
    // Remove loading class when React is ready
    document.documentElement.classList.remove('loading');
    document.documentElement.classList.add('loaded');
  }, []);

  return (
    <RouterProvider router={router} future={{ v7_startTransition: true }} />
  );
};

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          backgroundColor: '#F4F5F7',
          color: '#141A1F',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          Lade Inhalte...
        </div>
      }>
        <AppWithLoading />
      </Suspense>
    </QueryClientProvider>
  </React.StrictMode>
);
