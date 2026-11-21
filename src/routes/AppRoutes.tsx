// src/routes/AppRoutes.tsx
// Der Router im Browser. #609 (spoonup, Heiko E-522 "A alle sieben"): echte Adressen (/zugang/) statt /#/zugang —
// Suchmaschinen und der Server sehen nie, was hinter '#' steht. Die Routenliste steht in ./routen.tsx, damit das
// Vorrendern sie ohne Browser benutzen kann. Alte #/-Adressen leitet index.html um (src/lib/alte-adressen.ts).
import { createBrowserRouter } from 'react-router-dom';
import { routen } from './routen';

export const router = createBrowserRouter(routen);
