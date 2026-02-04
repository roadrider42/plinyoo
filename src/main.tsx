import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import 'modern-normalize/modern-normalize.css';
import './index.css';
import { router } from './routes/AppRoutes';
import './lib/i18n';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Suspense fallback="Lade Inhalte...">
        <RouterProvider router={router} future={{ v7_startTransition: true }} />
      </Suspense>
    </QueryClientProvider>
  </React.StrictMode>
);
