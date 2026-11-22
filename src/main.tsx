import React, { Suspense } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
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
import i18n, { erkannteSprache } from './lib/i18n';
import { ladehinweisFuer } from './lib/ladehinweis';
import { spracheDesPfads } from './routes/seiten';
import { RUECKFALL_SPRACHE, SPRACHEN } from './lib/sprachen';

// Kein html.loading mehr (spoonup#532): Die Klasse machte den body unsichtbar, bis die Seite
// fertig war — und damit auch den Suspense-Rückfall unten, der genau für die Wartezeit auf
// translation.json da ist. Bei langsamer Leitung sah der Besucher eine leere Seite.
// Prüfung: tests/ladehinweis-532.mjs (npm run pruefung:ladehinweis).
const App = () => (
  <RouterProvider router={router} future={{ v7_startTransition: true }} />
);

const queryClient = new QueryClient();

// #609: Was nach dem Übernehmen geschehen soll (Sprachwechsel auf Impressum und Datenschutz, unten). hydrateRoot
// übernimmt nicht sofort, sondern in Häppchen; wechselte die Sprache schon nach dem Aufruf, kam die Übersetzung auf
// einem langsamen Rechner (CI) mitten im Übernehmen an, der Rest zeichnete englisch -> React-Fehler #425, #root neu
// gebaut. Ein Effekt läuft erst, wenn der ganze Baum übernommen ist. Rendert nichts eigenes: das HTML bleibt gleich.
// Prüfung: tests/hydration-609.mjs, Fälle "en /datenschutz/".
let nachDemUebernehmen: (() => void) | undefined;
const Uebernommen = ({ children }: { children: React.ReactNode }) => {
  React.useEffect(() => {
    const tun = nachDemUebernehmen;
    nachDemUebernehmen = undefined;
    tun?.();
  }, []);
  return <>{children}</>;
};

const seite = (
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
        <Uebernommen>
          <App />
        </Uebernommen>
      </Suspense>
    </QueryClientProvider>
  </React.StrictMode>
);

// #609 (spoonup, Heiko E-521 "B"): Die Seiten liegen vorgerendert in dist/ (scripts/vorrendern.mjs), je Sprache
// unter eigener Adresse (Schritt 3: /zugang/ deutsch, /en/zugang/ englisch …). Steht schon Inhalt in #root, wird er
// übernommen (hydrateRoot), nicht ersetzt: Der Besucher sieht die Seite sofort, und nichts flackert. Damit die erste
// Zeichnung genau dem HTML entspricht, wartet der Einstieg, bis die Übersetzung geladen ist, in der die Seite
// vorgerendert wurde (bis dahin steht das HTML schon da). Das ist die Sprache des Pfads (src/routes/seiten.ts).
// Impressum und Datenschutz legen keine fest: sie sind deutsch vorgerendert, und erst NACH dem Übernehmen wechselt
// i18next in die Sprache des Besuchers (Cookie, ?lng=, Browser) — wie bisher.
// Ohne Inhalt in #root (404.html, npm run dev) wird wie bisher gerendert, mit Ladehinweis (spoonup#532, #548); auf
// einer Sprachseite in der Sprache ihres Pfads (src/lib/i18n.ts, lng).
const wurzel = document.getElementById('root')!;
const pfadSprache = spracheDesPfads(location.pathname, SPRACHEN);
if (wurzel.firstElementChild) {
  const besucherSprache = erkannteSprache();
  const gerendert = pfadSprache ?? RUECKFALL_SPRACHE;
  i18n.changeLanguage(gerendert).then(() => {
    if (!pfadSprache && besucherSprache && besucherSprache !== gerendert) {
      nachDemUebernehmen = () => { i18n.changeLanguage(besucherSprache); };
    }
    hydrateRoot(wurzel, seite);
  });
} else {
  createRoot(wurzel).render(seite);
}
