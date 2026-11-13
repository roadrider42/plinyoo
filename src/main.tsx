import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';

// Schriftarten lokal ausliefern (npm-Pakete @fontsource): keine Verbindung zu Google-Servern beim Seitenaufruf
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/ibm-plex-sans/400.css';
import '@fontsource/ibm-plex-sans/500.css';
import '@fontsource/ibm-plex-sans/600.css';
import '@fontsource/ibm-plex-sans/700.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';

// CSS zuerst laden - FOUC Prevention
import './index.css';
import 'modern-normalize/modern-normalize.css';

import { router } from './routes/AppRoutes';
import { erkannteSprache } from './lib/i18n';
import { ladehinweisFuer } from './lib/ladehinweis';

// Kein html.loading mehr (spoonup#532): Die Klasse machte den body unsichtbar, bis die Seite
// fertig war — und damit auch den Suspense-Rückfall unten, der genau für die Wartezeit auf
// translation.json da ist. Bei langsamer Leitung sah der Besucher eine leere Seite.
// Prüfung: tests/ladehinweis-532.mjs (npm run pruefung:ladehinweis).
const App = () => (
  <RouterProvider router={router} future={{ v7_startTransition: true }} />
);

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
          {/* In der Sprache des Besuchers, gewählt wie i18next selbst wählt (spoonup#548) */}
          {ladehinweisFuer(erkannteSprache())}
        </div>
      }>
        <App />
      </Suspense>
    </QueryClientProvider>
  </React.StrictMode>
);
