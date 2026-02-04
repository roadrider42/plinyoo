/**
 * zod-wrapper.ts
 * 
 * Diese Datei dient als zentraler Einstiegspunkt für zod-Importe.
 * Sie stellt sicher, dass zod korrekt gebündelt wird und keine Probleme beim Build verursacht.
 */

import * as z from 'zod';

// Re-exportiere alle zod-Funktionen
export { z };

// Exportiere auch häufig verwendete Typen
export type {
  ZodType,
  ZodObject,
  ZodString,
  ZodNumber,
  ZodBoolean,
  ZodArray,
  ZodEnum,
  ZodUnion,
  ZodIntersection,
  ZodTuple,
  ZodRecord,
  ZodMap,
  ZodSet,
  ZodFunction,
  ZodPromise,
  ZodDate,
  ZodNullable,
  ZodOptional,
  ZodDefault,
  ZodEffects,
  ZodNativeEnum,
  ZodLiteral,
  ZodLazy,
  ZodNever,
  ZodAny,
  ZodUnknown,
  ZodVoid,
  ZodUndefined,
  ZodNull,
  ZodNaN,
  ZodBigInt,
  ZodSymbol,
  ZodBranded,
  ZodPipeline,
  ZodTypeAny,
} from 'zod';

// Exportiere auch häufig verwendete Hilfsfunktionen
export const {
  object,
  string,
  number,
  boolean,
  array,
  enum: zodEnum,
  union,
  intersection,
  tuple,
  record,
  map,
  set,
  function: zodFunction,
  lazy,
  literal,
  nativeEnum,
  date,
  promise,
  any,
  unknown,
  never,
  void: zodVoid,
  undefined: zodUndefined,
  null: zodNull,
  nan,
  bigint,
  symbol,
  branded,
  pipeline,
  infer,
  custom,
  coerce,
} = z;
