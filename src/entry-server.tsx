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

export { SEITEN, fassungen } from './routes/seiten';
export { SPRACHEN, RUECKFALL_SPRACHE, OG_LOCALE } from './lib/sprachen';

type Texte = Record<string, unknown>;

/**
 * Rendert den Inhalt von #root für einen Pfad in einer Sprache. Wirft, wenn der Pfad keine eigene Seite hat.
 * `rueckfall` sind die Texte der Rückfallsprache (de): Fehlt der Sprache ein Text, setzt i18next ihn ein, genau wie
 * im Browser (i18next-http-backend lädt die Rückfallsprache mit). Ohne sie wiche das HTML beim Übernehmen ab.
 * #609 Schritt 3, Heiko E-535 "a": Dass der Rückfall greift, macht tests/keine-deutschen-reste-609.mjs im Bau rot.
 */
export async function rendern(pfad: string, sprache: string, texte: Texte, rueckfall: Texte): Promise<string> {
  const i18n = createInstance();
  const als = (t: Texte) => ({ translation: t as Resource[string]['translation'] });
  const resources: Resource = { [RUECKFALL_SPRACHE]: als(rueckfall), [sprache]: als(texte) };
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
