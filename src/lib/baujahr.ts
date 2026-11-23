// src/lib/baujahr.ts — #609 (spoonup): das Jahr des Baus, für die Fußzeile (©).
//
// Nicht new Date() beim Rendern: Die Seiten werden beim Bau vorgerendert. Läse der Browser nach einem Jahreswechsel
// ein anderes Jahr als der Bau, wiche sein Text von der vorgerenderten Seite ab, und React verwürfe sie beim
// Übernehmen. vite.config.ts setzt __BAUJAHR__ (define), im Browserbau wie im Vorrenderbau.
// Nur wo Vite gar nicht baut (eine Prüfung bündelt mit esbuild), gilt das laufende Jahr.
declare const __BAUJAHR__: number | undefined;

export const BAUJAHR: number = typeof __BAUJAHR__ === 'number' ? __BAUJAHR__ : new Date().getFullYear();
