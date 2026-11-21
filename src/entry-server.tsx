// src/entry-server.tsx — #609 (spoonup, Heiko E-521 "B"): eine Seite der App auf dem Server rendern.
//
// Gebaut mit `vite build --ssr src/entry-server.tsx --outDir dist-server` (gleiche vite.config.ts, gleiche
// Bilder-Adressen und dasselbe __BAUJAHR__ wie im Browserbau), aufgerufen von scripts/vorrendern.mjs.
// Kein Browser: Die Routenliste kommt aus routes/routen.tsx (ohne Router-Erzeugung), die Texte werden
// direkt übergeben statt über http geladen.
//
// Der Baum hier muss dem in src/main.tsx entsprechen (StrictMode > QueryClientProvider > Suspense > Router),
// sonst weicht das HTML beim Übernehmen ab: Suspense schreibt eigene Markierungen (<!--$-->) ins HTML.
import React, { Suspense } from 'react';
import { renderToString } from 'react-dom/server';
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router-dom/server';
import { createInstance, type Resource } from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { QueryClient, QueryClientProvider } from 'react-query';
import { routen, AUFFANG_ID } from './routes/routen';
import { RUECKFALL_SPRACHE, SPRACHEN } from './lib/sprachen';

export { SEITEN, VORGERENDERT_SPRACHE } from './routes/seiten';

/** Rendert den Inhalt von #root für einen Pfad. Wirft, wenn der Pfad keine eigene Seite hat. */
export async function rendern(pfad: string, sprache: string, texte: Record<string, unknown>): Promise<string> {
  const i18n = createInstance();
  const resources: Resource = { [sprache]: { translation: texte as Resource[string]['translation'] } };
  await i18n.use(initReactI18next).init({
    lng: sprache,
    fallbackLng: RUECKFALL_SPRACHE,
    supportedLngs: [...SPRACHEN],
    resources,
    initAsync: false,
    react: { useSuspense: false },
    showSupportNotice: false,
  });

  const handler = createStaticHandler(routen);
  const ctx = await handler.query(new Request(`https://www.plinyoo.com${pfad}`));
  if (ctx instanceof Response) throw new Error(`${pfad}: Umleitung ${ctx.status} ${ctx.headers.get('location')}`);
  if (ctx.statusCode !== 200) throw new Error(`${pfad}: Status ${ctx.statusCode}`);
  if (ctx.matches.some((m) => m.route.id === AUFFANG_ID)) throw new Error(`${pfad}: keine eigene Route, landet in der Auffangroute`);
  const router = createStaticRouter(handler.dataRoutes, ctx);

  return renderToString(
    <React.StrictMode>
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={new QueryClient()}>
          <Suspense fallback={null}>
            <StaticRouterProvider router={router} context={ctx} hydrate={false} />
          </Suspense>
        </QueryClientProvider>
      </I18nextProvider>
    </React.StrictMode>,
  );
}
